use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    AgentNotFound = 4,
    AgentInactive = 5,
    DailyLimitExceeded = 6,
    TotalLimitExceeded = 7,
    DuplicateNonce = 8,
    ServiceNotFound = 9,
    ServiceInactive = 10,
    InvalidAmount = 11,
    InvalidTrustScore = 12,
}
