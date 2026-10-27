use soroban_sdk::{symbol_short, Address, BytesN, Env, Symbol};

pub fn emit_agent_registered(
    env: &Env,
    master: &Address,
    agent: &Address,
    daily_limit: i128,
) {
    let topics = (symbol_short!("ag_reg"), master.clone(), agent.clone());
    env.events().publish(topics, daily_limit);
}

pub fn emit_payment_settled(
    env: &Env,
    agent: &Address,
    recipient: &Address,
    service_id: &Symbol,
    amount: i128,
    nonce: &BytesN<32>,
) {
    let topics = (symbol_short!("pay_set"), agent.clone(), recipient.clone());
    env.events().publish(topics, (service_id.clone(), amount, nonce.clone()));
}

pub fn emit_service_registered(
    env: &Env,
    service_id: &Symbol,
    provider: &Address,
    price_stroops: i128,
) {
    let topics = (symbol_short!("svc_reg"), service_id.clone(), provider.clone());
    env.events().publish(topics, price_stroops);
}

pub fn emit_trust_rated(
    env: &Env,
    service_id: &Symbol,
    rater: &Address,
    score: u32,
) {
    let topics = (symbol_short!("trust_rt"), service_id.clone(), rater.clone());
    env.events().publish(topics, score);
}
