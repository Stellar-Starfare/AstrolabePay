#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::Client as TokenClient,
    token::StellarAssetClient as AssetClient,
    Address, BytesN, Env, String, Symbol,
};

fn create_token_contract<'a>(e: &Env, admin: &Address) -> (TokenClient<'a>, AssetClient<'a>) {
    let sac = e.register_stellar_asset_contract_v2(admin.clone());
    (
        TokenClient::new(e, &sac.address()),
        AssetClient::new(e, &sac.address()),
    )
}

#[test]
fn test_initialization() {
    let env = Env::default();
    let contract_id = env.register_contract(None, AstrolabePayContract);
    let client = AstrolabePayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let sponsor = Address::generate(&env);

    client.initialize(&admin, &treasury, &sponsor);
    let stats = client.get_stats();
    assert_eq!(stats.total_agents, 0);
    assert_eq!(stats.total_settlements, 0);

    // Duplicate initialization must fail
    let duplicate = client.try_initialize(&admin, &treasury, &sponsor);
    assert!(duplicate.is_err());
}

#[test]
fn test_agent_registration_and_policy() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, AstrolabePayContract);
    let client = AstrolabePayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let sponsor = Address::generate(&env);
    client.initialize(&admin, &treasury, &sponsor);

    let master = Address::generate(&env);
    let agent = Address::generate(&env);
    let agent_name = Symbol::new(&env, "weather_bot");

    // 10 XLM daily (100,000,000 stroops), 100 XLM total (1,000,000,000 stroops)
    client.register_agent(&master, &agent, &100_000_000, &1_000_000_000, &agent_name);

    let record = client.get_agent(&agent);
    assert_eq!(record.master, master);
    assert_eq!(record.daily_limit_stroops, 100_000_000);
    assert_eq!(record.active, true);
    assert_eq!(record.spent_today_stroops, 0);

    // Allowance check
    assert_eq!(client.check_agent_allowance(&agent, &50_000_000), true);
    assert_eq!(client.check_agent_allowance(&agent, &150_000_000), false);

    // Duplicate registration should return AgentAlreadyRegistered
    let dup_res = client.try_register_agent(&master, &agent, &100_000_000, &1_000_000_000, &agent_name);
    assert!(dup_res.is_err());
}

#[test]
fn test_settle_payment_and_replay_protection() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, AstrolabePayContract);
    let client = AstrolabePayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let sponsor = Address::generate(&env);
    client.initialize(&admin, &treasury, &sponsor);

    let master = Address::generate(&env);
    let agent = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, asset) = create_token_contract(&env, &token_admin);

    // Mint 50 XLM (500,000,000 stroops) to agent
    asset.mint(&agent, &500_000_000);

    client.register_agent(
        &master,
        &agent,
        &10_000_000, // 1 XLM daily
        &100_000_000, // 10 XLM lifetime
        &Symbol::new(&env, "bot_1"),
    );

    let nonce = BytesN::from_array(&env, &[9u8; 32]);
    let service_id = Symbol::new(&env, "weather");

    // Settle 0.2 XLM (2,000,000 stroops)
    let receipt = client.settle_agent_payment(
        &agent,
        &recipient,
        &token.address,
        &2_000_000,
        &nonce,
        &service_id,
    );

    assert_eq!(receipt.amount_stroops, 2_000_000);
    assert_eq!(receipt.agent, agent);
    assert_eq!(token.balance(&recipient), 2_000_000);
    assert_eq!(token.balance(&agent), 498_000_000);

    // Stored receipt verification
    let stored = client.get_receipt(&nonce);
    assert_eq!(stored.nonce, nonce);

    // Replay attack with same nonce must be rejected
    let replay = client.try_settle_agent_payment(
        &agent,
        &recipient,
        &token.address,
        &2_000_000,
        &nonce,
        &service_id,
    );
    assert!(replay.is_err());

    // Daily limit check: spending 9 XLM more (total 11 XLM > 10 XLM limit) should fail
    let overspend = client.try_settle_agent_payment(
        &agent,
        &recipient,
        &token.address,
        &9_000_000,
        &BytesN::from_array(&env, &[10u8; 32]),
        &service_id,
    );
    assert!(overspend.is_err());

    // Non-existent receipt lookup should return ReceiptNotFound error
    let unknown_nonce = BytesN::from_array(&env, &[99u8; 32]);
    let missing_receipt = client.try_get_receipt(&unknown_nonce);
    assert!(missing_receipt.is_err());
}

#[test]
fn test_timestamp_daily_spend_rollover() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, AstrolabePayContract);
    let client = AstrolabePayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let sponsor = Address::generate(&env);
    client.initialize(&admin, &treasury, &sponsor);

    let master = Address::generate(&env);
    let agent = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, asset) = create_token_contract(&env, &token_admin);
    asset.mint(&agent, &500_000_000);

    // 5 XLM daily limit (50,000,000 stroops)
    client.register_agent(
        &master,
        &agent,
        &50_000_000,
        &500_000_000,
        &Symbol::new(&env, "agent_rollover"),
    );

    // Spend 4 XLM
    let nonce1 = BytesN::from_array(&env, &[1u8; 32]);
    client.settle_agent_payment(&agent, &recipient, &token.address, &40_000_000, &nonce1, &Symbol::new(&env, "svc"));

    // Attempting to spend 2 XLM now exceeds remaining 1 XLM daily limit
    let nonce2 = BytesN::from_array(&env, &[2u8; 32]);
    let fail_spend = client.try_settle_agent_payment(&agent, &recipient, &token.address, &20_000_000, &nonce2, &Symbol::new(&env, "svc"));
    assert!(fail_spend.is_err());

    // Advance ledger timestamp by 86,400 seconds (24 hours)
    env.ledger().set_timestamp(env.ledger().timestamp() + 86_400);

    // After 24-hour rollover, daily spend resets and 2 XLM spend succeeds
    let nonce3 = BytesN::from_array(&env, &[3u8; 32]);
    let ok_spend = client.settle_agent_payment(&agent, &recipient, &token.address, &20_000_000, &nonce3, &Symbol::new(&env, "svc"));
    assert_eq!(ok_spend.amount_stroops, 20_000_000);

    let updated_agent = client.get_agent(&agent);
    assert_eq!(updated_agent.spent_today_stroops, 20_000_000);
}

#[test]
fn test_service_registration_and_verified_trust_rating() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, AstrolabePayContract);
    let client = AstrolabePayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let sponsor = Address::generate(&env);
    client.initialize(&admin, &treasury, &sponsor);

    let provider = Address::generate(&env);
    let rater = Address::generate(&env);
    let unverified_user = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, asset) = create_token_contract(&env, &token_admin);
    let service_id = Symbol::new(&env, "satellite_api");

    // Register API Provider
    client.register_api_provider(
        &provider,
        &service_id,
        &String::from_str(&env, "High Res Satellite Imagery"),
        &50_000,
        &token.address,
        &BytesN::from_array(&env, &[3u8; 32]),
    );

    let svc = client.get_service(&service_id);
    assert_eq!(svc.price_stroops, 50_000);
    assert_eq!(svc.active, true);

    // Mint token and register rater as an agent
    asset.mint(&rater, &100_000_000);
    client.register_agent(
        &admin,
        &rater,
        &10_000_000,
        &100_000_000,
        &Symbol::new(&env, "rater_agent"),
    );

    // Unverified user attempting to rate without a receipt must be rejected
    let fake_nonce = BytesN::from_array(&env, &[88u8; 32]);
    let unverified_res = client.try_rate_service_trust(&unverified_user, &service_id, &90, &fake_nonce);
    assert!(unverified_res.is_err());

    // Settle a verified payment
    let valid_receipt_nonce = BytesN::from_array(&env, &[77u8; 32]);
    client.settle_agent_payment(
        &rater,
        &provider,
        &token.address,
        &50_000,
        &valid_receipt_nonce,
        &service_id,
    );

    // Rate service with valid settled receipt: initial 100, add 90 -> avg = (100 + 90) / 2 = 95
    let new_avg = client.rate_service_trust(&rater, &service_id, &90, &valid_receipt_nonce);
    assert_eq!(new_avg, 95);

    // Rating again with the same receipt nonce must be rejected (replay attack prevention)
    let dup_rate = client.try_rate_service_trust(&rater, &service_id, &85, &valid_receipt_nonce);
    assert!(dup_rate.is_err());
}

#[test]
fn test_admin_governance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, AstrolabePayContract);
    let client = AstrolabePayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let sponsor = Address::generate(&env);
    client.initialize(&admin, &treasury, &sponsor);

    let new_admin = Address::generate(&env);
    client.set_admin(&admin, &new_admin);

    // Old admin should now fail to change admin
    let unauthorized_res = client.try_set_admin(&admin, &Address::generate(&env));
    assert!(unauthorized_res.is_err());
}
