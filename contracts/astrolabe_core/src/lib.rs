#![no_std]

mod errors;
mod events;
pub mod types;

#[cfg(test)]
mod test;

use errors::ContractError;
use types::{
    AgentRecord, DataKey, ReceiptRecord, ServiceRecord, SystemStats,
};

use soroban_sdk::{
    contract, contractimpl, token, Address, BytesN, Env, String, Symbol,
};

// 86,400 seconds represents a 24-hour rolling spend window on Stellar consensus
const SECONDS_PER_DAY: u64 = 86_400;

#[contract]
pub struct AstrolabePayContract;

#[contractimpl]
impl AstrolabePayContract {
    /// Initialize the AstrolabePay protocol with an admin, protocol treasury, and fee-sponsor
    pub fn initialize(
        env: Env,
        admin: Address,
        treasury: Address,
        sponsor: Address,
    ) -> Result<(), ContractError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ContractError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::FeeSponsor, &sponsor);
        env.storage()
            .instance()
            .set(&DataKey::Stats, &SystemStats::default());
        env.storage().instance().set(&DataKey::AgentCount, &0u32);
        env.storage().instance().set(&DataKey::ServiceCount, &0u32);
        env.storage().instance().extend_ttl(100_000, 500_000);

        Ok(())
    }

    /// Register a delegated autonomous AI agent wallet with daily and lifetime budget caps
    pub fn register_agent(
        env: Env,
        master: Address,
        agent: Address,
        daily_limit_stroops: i128,
        total_limit_stroops: i128,
        name: Symbol,
    ) -> Result<(), ContractError> {
        master.require_auth();

        if daily_limit_stroops <= 0 || total_limit_stroops <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        let agent_key = DataKey::Agent(agent.clone());
        if env.storage().persistent().has(&agent_key) {
            return Err(ContractError::AgentAlreadyRegistered);
        }

        let current_ledger = env.ledger().sequence();
        let timestamp = env.ledger().timestamp();

        let record = AgentRecord {
            master: master.clone(),
            agent: agent.clone(),
            name,
            daily_limit_stroops,
            total_limit_stroops,
            spent_today_stroops: 0,
            spent_total_stroops: 0,
            last_spend_ledger: current_ledger,
            last_spend_timestamp: timestamp,
            active: true,
            created_at: timestamp,
        };

        env.storage().persistent().set(&agent_key, &record);
        env.storage().persistent().extend_ttl(&agent_key, 100_000, 500_000);

        let mut stats: SystemStats = env
            .storage()
            .instance()
            .get(&DataKey::Stats)
            .unwrap_or_default();
        stats.total_agents += 1;
        env.storage().instance().set(&DataKey::Stats, &stats);

        events::emit_agent_registered(&env, &master, &agent, daily_limit_stroops);
        Ok(())
    }

    /// Update an agent's policy limits or pause an agent
    pub fn update_agent_policy(
        env: Env,
        master: Address,
        agent: Address,
        daily_limit_stroops: i128,
        total_limit_stroops: i128,
        active: bool,
    ) -> Result<(), ContractError> {
        master.require_auth();

        let agent_key = DataKey::Agent(agent.clone());
        let mut record: AgentRecord = env
            .storage()
            .persistent()
            .get(&agent_key)
            .ok_or(ContractError::AgentNotFound)?;

        if record.master != master {
            return Err(ContractError::Unauthorized);
        }

        if daily_limit_stroops <= 0 || total_limit_stroops <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        record.daily_limit_stroops = daily_limit_stroops;
        record.total_limit_stroops = total_limit_stroops;
        record.active = active;

        env.storage().persistent().set(&agent_key, &record);
        Ok(())
    }

    /// Settle a fee-sponsored micropayment on Stellar with on-chain policy verification
    pub fn settle_agent_payment(
        env: Env,
        agent: Address,
        recipient: Address,
        token: Address,
        amount_stroops: i128,
        nonce: BytesN<32>,
        service_id: Symbol,
    ) -> Result<ReceiptRecord, ContractError> {
        agent.require_auth();

        if amount_stroops <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        // 1. Replay attack verification
        let receipt_key = DataKey::Receipt(nonce.clone());
        if env.storage().persistent().has(&receipt_key) {
            return Err(ContractError::DuplicateNonce);
        }

        // 2. Load and verify agent spend policy
        let agent_key = DataKey::Agent(agent.clone());
        let mut agent_record: AgentRecord = env
            .storage()
            .persistent()
            .get(&agent_key)
            .ok_or(ContractError::AgentNotFound)?;

        if !agent_record.active {
            return Err(ContractError::AgentInactive);
        }

        let current_ledger = env.ledger().sequence();
        let current_time = env.ledger().timestamp();
        // Reset daily spend if a full 24-hour window (86,400 seconds) has elapsed
        if current_time.saturating_sub(agent_record.last_spend_timestamp) >= SECONDS_PER_DAY {
            agent_record.spent_today_stroops = 0;
            agent_record.last_spend_timestamp = current_time;
        }
        agent_record.last_spend_ledger = current_ledger;

        // Enforce daily policy limit
        if agent_record.spent_today_stroops + amount_stroops > agent_record.daily_limit_stroops {
            return Err(ContractError::DailyLimitExceeded);
        }

        // Enforce total lifetime policy limit
        if agent_record.spent_total_stroops + amount_stroops > agent_record.total_limit_stroops {
            return Err(ContractError::TotalLimitExceeded);
        }

        // 3. Execute atomic token transfer
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&agent, &recipient, &amount_stroops);

        // 4. Update agent spend tracking
        agent_record.spent_today_stroops += amount_stroops;
        agent_record.spent_total_stroops += amount_stroops;
        env.storage().persistent().set(&agent_key, &agent_record);

        // 5. Update service stats if service exists
        let svc_key = DataKey::Service(service_id.clone());
        if let Some(mut svc) = env.storage().persistent().get::<DataKey, ServiceRecord>(&svc_key) {
            svc.total_calls += 1;
            env.storage().persistent().set(&svc_key, &svc);
        }

        // 6. Record on-chain receipt for verifiable audit
        let timestamp = env.ledger().timestamp();
        let receipt = ReceiptRecord {
            agent: agent.clone(),
            recipient: recipient.clone(),
            service_id: service_id.clone(),
            token,
            amount_stroops,
            nonce: nonce.clone(),
            timestamp,
            ledger: current_ledger,
        };

        env.storage().persistent().set(&receipt_key, &receipt);
        env.storage().persistent().extend_ttl(&receipt_key, 100_000, 500_000);

        // 7. Update protocol stats
        let mut stats: SystemStats = env
            .storage()
            .instance()
            .get(&DataKey::Stats)
            .unwrap_or_default();
        stats.total_settlements += 1;
        stats.total_volume_stroops += amount_stroops;
        env.storage().instance().set(&DataKey::Stats, &stats);
        env.storage().instance().extend_ttl(100_000, 500_000);

        events::emit_payment_settled(&env, &agent, &recipient, &service_id, amount_stroops, &nonce);
        Ok(receipt)
    }

    /// Register an API service endpoint for discovery by autonomous agents
    pub fn register_api_provider(
        env: Env,
        provider: Address,
        service_id: Symbol,
        name: String,
        price_stroops: i128,
        token: Address,
        origin_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        provider.require_auth();

        if price_stroops <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        let key = DataKey::Service(service_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(ContractError::ServiceAlreadyRegistered);
        }

        let service = ServiceRecord {
            provider: provider.clone(),
            service_id: service_id.clone(),
            name,
            price_stroops,
            token,
            origin_hash,
            active: true,
            total_calls: 0,
            trust_score_accum: 100, // Initial 100% score
            trust_score_count: 1,
        };

        env.storage().persistent().set(&key, &service);
        env.storage().persistent().extend_ttl(&key, 100_000, 500_000);

        let mut stats: SystemStats = env
            .storage()
            .instance()
            .get(&DataKey::Stats)
            .unwrap_or_default();
        stats.total_services += 1;
        env.storage().instance().set(&DataKey::Stats, &stats);

        events::emit_service_registered(&env, &service_id, &provider, price_stroops);
        Ok(())
    }

    /// Rate an API provider's reliability (1 to 100) with cryptographic proof of settled payment
    pub fn rate_service_trust(
        env: Env,
        rater: Address,
        service_id: Symbol,
        score: u32,
        receipt_nonce: BytesN<32>,
    ) -> Result<u32, ContractError> {
        rater.require_auth();

        if !(1..=100).contains(&score) {
            return Err(ContractError::InvalidTrustScore);
        }

        // 1. Verify receipt existence
        let receipt_key = DataKey::Receipt(receipt_nonce.clone());
        let receipt: ReceiptRecord = env
            .storage()
            .persistent()
            .get(&receipt_key)
            .ok_or(ContractError::ReceiptNotFound)?;

        // 2. Verify receipt matches target service
        if receipt.service_id != service_id {
            return Err(ContractError::Unauthorized);
        }

        // 3. Verify rater is the paying agent on the receipt
        if receipt.agent != rater {
            return Err(ContractError::UnverifiedRater);
        }

        // 4. Verify single rating per settled payment receipt
        let rated_key = DataKey::Rated(receipt_nonce.clone());
        if env.storage().persistent().has(&rated_key) {
            return Err(ContractError::DuplicateNonce);
        }

        // 5. Update service trust score
        let key = DataKey::Service(service_id.clone());
        let mut service: ServiceRecord = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(ContractError::ServiceNotFound)?;

        service.trust_score_accum += score as u64;
        service.trust_score_count += 1;

        env.storage().persistent().set(&key, &service);
        env.storage().persistent().set(&rated_key, &true);
        env.storage().persistent().extend_ttl(&rated_key, 100_000, 500_000);

        events::emit_trust_rated(&env, &service_id, &rater, score);

        let average = (service.trust_score_accum / service.trust_score_count as u64) as u32;
        Ok(average)
    }

    // --- Query Methods ---

    pub fn get_agent(env: Env, agent: Address) -> Result<AgentRecord, ContractError> {
        let key = DataKey::Agent(agent);
        env.storage()
            .persistent()
            .get(&key)
            .ok_or(ContractError::AgentNotFound)
    }

    pub fn get_service(env: Env, service_id: Symbol) -> Result<ServiceRecord, ContractError> {
        let key = DataKey::Service(service_id);
        env.storage()
            .persistent()
            .get(&key)
            .ok_or(ContractError::ServiceNotFound)
    }

    pub fn get_receipt(env: Env, nonce: BytesN<32>) -> Result<ReceiptRecord, ContractError> {
        let key = DataKey::Receipt(nonce);
        env.storage()
            .persistent()
            .get(&key)
            .ok_or(ContractError::ReceiptNotFound)
    }

    pub fn get_stats(env: Env) -> SystemStats {
        env.storage()
            .instance()
            .get(&DataKey::Stats)
            .unwrap_or_default()
    }

    pub fn check_agent_allowance(env: Env, agent: Address, amount_stroops: i128) -> bool {
        let key = DataKey::Agent(agent);
        if let Some(record) = env.storage().persistent().get::<DataKey, AgentRecord>(&key) {
            if !record.active {
                return false;
            }
            let current_time = env.ledger().timestamp();
            let mut spent_today = record.spent_today_stroops;
            if current_time.saturating_sub(record.last_spend_timestamp) >= SECONDS_PER_DAY {
                spent_today = 0;
            }
            (spent_today + amount_stroops <= record.daily_limit_stroops)
                && (record.spent_total_stroops + amount_stroops <= record.total_limit_stroops)
        } else {
            false
        }
    }

    /// Upgrade contract WASM executable (admin only)
    pub fn upgrade(env: Env, admin: Address, new_wasm_hash: BytesN<32>) -> Result<(), ContractError> {
        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(ContractError::NotInitialized)?;

        if stored_admin != admin {
            return Err(ContractError::Unauthorized);
        }

        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }

    /// Update admin address (current admin only)
    pub fn set_admin(env: Env, current_admin: Address, new_admin: Address) -> Result<(), ContractError> {
        current_admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(ContractError::NotInitialized)?;

        if stored_admin != current_admin {
            return Err(ContractError::Unauthorized);
        }

        env.storage().instance().set(&DataKey::Admin, &new_admin);
        env.storage().instance().extend_ttl(100_000, 500_000);
        Ok(())
    }
}