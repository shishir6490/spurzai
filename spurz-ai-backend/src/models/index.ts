// Model exports for easy importing

// User Models
export { default as User, IUser } from './User';
export { default as UserProfile, IUserProfile } from './UserProfile';

// Financial Models
export { default as IncomeSource, IIncomeSource, IncomeFrequency, IncomeType } from './IncomeSource';
export { default as CreditCard, ICreditCard, CardNetwork } from './CreditCard';
export { default as FinancialSnapshot, IFinancialSnapshot, FinancialHealthStatus } from './FinancialSnapshot';

// Insight & Action Models
export { default as Insight, IInsight, InsightCategory, InsightPriority } from './Insight';
export { default as NextBestAction, INextBestAction, ActionType, ActionStatus } from './NextBestAction';
export { default as Goal, IGoal, GoalCategory, GoalStatus } from './Goal';

// Market & Deals Models
export { default as MarketCreditCard, IMarketCreditCard, CardTier, RewardType, IRewardCategory, IPartnerMerchant } from './MarketCreditCard';
export { default as Deal, IDeal, DealCategory, DealType, DealStatus, ICardOffer } from './Deal';

// Spending & Recommendations Models
export { default as SpendingCategory, ISpendingCategory, SpendingCategoryType, IMonthlyBreakdown, IRecommendedCard } from './SpendingCategory';
export { default as CardRecommendation, ICardRecommendation, RecommendationType, RecommendationReason } from './CardRecommendation';

// Rewards Models
export { default as Reward, IReward, RewardType, RewardStatus } from './Reward';
export { default as UserWallet, IUserWallet } from './UserWallet';
