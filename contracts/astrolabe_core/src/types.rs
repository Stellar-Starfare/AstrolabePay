use soroban_sdk::{contracttype, Address, BytesN, String, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Treasury,
    FeeSponsor,
    Agent(Address),
    AgentCount,
    Service(Symbol),
    ServiceCount,
    Receipt(BytesN<32>),
    Stats,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct AgentRecord {
    pub master: Address,
    pub agent: Address,
    pub name: Symbol,
    pub daily_limit_stroops: i128,
    pub total_limit_stroops: i128,
    pub spent_today_stroops: i128,
    pub spent_total_stroops: i128,
    pub last_spend_ledger: u32,
    pub active: bool,
    pub created_at: u64,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct ReceiptRecord {
    pub agent: Address,
    pub recipient: Address,
    pub service_id: Symbol,
    pub token: Address,
    pub amount_stroops: i128,
    pub nonce: BytesN<32>,
    pub timestamp: u64,
    pub ledger: u32,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct ServiceRecord {
    pub provider: Address,
    pub service_id: Symbol,
    pub name: String,
    pub price_stroops: i128,
    pub token: Address,
    pub origin_hash: BytesN<32>,
    pub active: bool,
    pub total_calls: u64,
    pub trust_score_accum: u64,
    pub trust_score_count: u32,
}

#[derive(Clone, Debug, PartialEq, Default)]
#[contracttype]
pub struct SystemStats {
    pub total_agents: u32,
    pub total_services: u32,
    pub total_settlements: u64,
    pub total_volume_stroops: i128,
}
