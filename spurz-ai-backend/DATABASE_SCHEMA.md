# Spurz.ai Database Schema Documentation

Complete reference for all MongoDB collections and their schemas.

---

## 1. User

Maps Firebase users to MongoDB for backend operations.

```typescript
{
  firebaseUid: String (required, unique, indexed)
  phoneNumber: String (unique, sparse)
  email: String (unique, sparse)
  displayName: String
  photoURL: String
  isActive: Boolean (default: true)
  lastLoginAt: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `firebaseUid` (unique)
- `phoneNumber` (unique, sparse)
- `email` (unique, sparse)

---

## 2. UserProfile

User profile data and preferences.

```typescript
{
  userId: ObjectId (required, unique, ref: User)
  fullName: String
  dateOfBirth: Date
  occupation: String
  city: String
  
  preferences: {
    notifications: Boolean (default: true)
    emailUpdates: Boolean (default: true)
    language: String (default: 'en')
    currency: String (default: 'INR')
    theme: String (default: 'dark')
  }
  
  settings: {
    biometricEnabled: Boolean (default: false)
    autoSyncEnabled: Boolean (default: true)
    trackingEnabled: Boolean (default: true)
  }
  
  onboarding: {
    completed: Boolean (default: false)
    currentStep: Number (default: 0)
    completedAt: Date
  }
  
  metadata: {
    appVersion: String
    deviceType: String
    lastSyncAt: Date
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId` (unique)

---

## 3. IncomeSource

User's income sources (salary, business, investments).

```typescript
{
  userId: ObjectId (required, ref: User, indexed)
  
  source: String (enum: ['salary', 'business', 'freelance', 'investment', 'rental', 'pension', 'other'])
  name: String (required)
  type: String (enum: ['active', 'passive'])
  amount: Number (required, min: 0)
  frequency: String (required, enum: ['monthly', 'yearly', 'quarterly', 'weekly', 'one-time'])
  
  isPrimary: Boolean (default: false)
  isActive: Boolean (default: true)
  
  startDate: Date
  endDate: Date
  
  metadata: {
    employer: String
    accountNumber: String
    description: String
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId`
- `{ userId: 1, isPrimary: -1 }`

---

## 4. CreditCard

User's credit cards.

```typescript
{
  userId: ObjectId (required, ref: User, indexed)
  
  bankName: String (required)
  cardName: String (required)
  last4Digits: String (required, length: 4)
  network: String (required, enum: ['Visa', 'Mastercard', 'RuPay', 'Amex', 'Diners'])
  
  creditLimit: Number (required, min: 0)
  currentBalance: Number (default: 0, min: 0)
  availableCredit: Number (virtual: creditLimit - currentBalance)
  
  billingCycleDay: Number (required, min: 1, max: 31)
  dueDate: Number (min: 1, max: 31)
  
  annualFee: Number (default: 0)
  interestRate: Number (default: 0)
  
  rewardType: String (enum: ['cashback', 'points', 'miles', 'none'])
  rewardRate: Number (default: 0)
  
  features: [String]
  benefits: [String]
  
  isActive: Boolean (default: true)
  isPrimary: Boolean (default: false)
  
  metadata: {
    issueDate: Date
    expiryMonth: Number
    expiryYear: Number
    cardType: String
    category: String
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId`
- `{ userId: 1, isActive: 1 }`
- `{ userId: 1, isPrimary: -1 }`

---

## 5. FinancialSnapshot

Daily snapshot of user's financial state.

```typescript
{
  userId: ObjectId (required, ref: User, indexed)
  date: Date (required, indexed)
  
  totalIncome: Number (default: 0)
  totalExpenses: Number (default: 0)
  totalSavings: Number (default: 0)
  
  creditUtilization: Number (default: 0, min: 0, max: 100)
  availableCredit: Number (default: 0)
  
  categoryBreakdown: {
    food: Number
    transport: Number
    shopping: Number
    entertainment: Number
    bills: Number
    healthcare: Number
    education: Number
    other: Number
  }
  
  cardSpending: [{
    cardId: ObjectId (ref: CreditCard)
    amount: Number
    rewardsEarned: Number
  }]
  
  insights: [ObjectId] (ref: Insight)
  
  metadata: {
    dataSource: String
    confidence: Number
    lastUpdated: Date
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId`
- `{ userId: 1, date: -1 }` (compound, unique)

---

## 6. SpendingCategory

Categorized spending data.

```typescript
{
  userId: ObjectId (required, ref: User, indexed)
  
  category: String (required, enum: [
    'food', 'transport', 'shopping', 'entertainment', 
    'bills', 'healthcare', 'education', 'travel', 
    'groceries', 'fuel', 'insurance', 'other'
  ])
  
  amount: Number (required, min: 0)
  percentage: Number (min: 0, max: 100)
  
  transactions: Number (default: 0)
  averageTransaction: Number (default: 0)
  
  month: String (format: 'YYYY-MM')
  year: Number
  
  trend: String (enum: ['increasing', 'decreasing', 'stable'])
  
  topMerchants: [{
    name: String
    amount: Number
    transactions: Number
  }]
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId`
- `{ userId: 1, month: -1 }`

---

## 7. Insight

AI-generated financial insights.

```typescript
{
  userId: ObjectId (required, ref: User, indexed)
  
  type: String (required, enum: [
    'spending', 'saving', 'credit', 'card', 'goal', 
    'investment', 'alert', 'opportunity'
  ])
  
  title: String (required)
  description: String (required)
  
  priority: String (enum: ['low', 'medium', 'high', 'critical'], default: 'medium')
  category: String
  
  data: {
    amount: Number
    percentage: Number
    comparison: String
    trend: String
  }
  
  actionable: Boolean (default: false)
  actionId: ObjectId (ref: NextBestAction)
  
  status: String (enum: ['active', 'dismissed', 'acted', 'expired'], default: 'active')
  
  validUntil: Date
  viewedAt: Date
  dismissedAt: Date
  
  metadata: {
    confidence: Number
    source: String
    tags: [String]
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId`
- `{ userId: 1, status: 1, priority: -1 }`
- `{ userId: 1, createdAt: -1 }`

---

## 8. NextBestAction

Recommended actions for users.

```typescript
{
  userId: ObjectId (required, ref: User, indexed)
  insightId: ObjectId (ref: Insight)
  
  type: String (required, enum: [
    'link_card', 'set_budget', 'create_goal', 'optimize_card',
    'pay_bill', 'reduce_spending', 'increase_savings', 'apply_card'
  ])
  
  title: String (required)
  description: String (required)
  
  priority: Number (required, min: 1, max: 10)
  impact: String (enum: ['low', 'medium', 'high'])
  
  estimatedSavings: Number (default: 0)
  estimatedTime: String
  
  steps: [{
    order: Number
    title: String
    description: String
    completed: Boolean (default: false)
  }]
  
  status: String (enum: ['pending', 'in_progress', 'completed', 'dismissed'], default: 'pending')
  
  completedAt: Date
  dismissedAt: Date
  expiresAt: Date
  
  metadata: {
    category: String
    tags: [String]
    relatedCardId: ObjectId
    relatedGoalId: ObjectId
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId`
- `{ userId: 1, status: 1, priority: -1 }`

---

## 9. Goal

User's financial goals.

```typescript
{
  userId: ObjectId (required, ref: User, indexed)
  
  name: String (required)
  description: String
  
  type: String (enum: ['savings', 'debt_payoff', 'purchase', 'investment', 'emergency_fund', 'custom'])
  
  targetAmount: Number (required, min: 0)
  currentAmount: Number (default: 0, min: 0)
  
  startDate: Date (default: now)
  targetDate: Date (required)
  
  progress: Number (virtual: (currentAmount / targetAmount) * 100)
  
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium')
  status: String (enum: ['active', 'completed', 'paused', 'cancelled'], default: 'active')
  
  linkedCardIds: [ObjectId] (ref: CreditCard)
  linkedIncomeIds: [ObjectId] (ref: IncomeSource)
  
  autoContribute: Boolean (default: false)
  contributionAmount: Number
  contributionFrequency: String (enum: ['daily', 'weekly', 'monthly'])
  
  milestones: [{
    name: String
    targetAmount: Number
    achievedAt: Date
    completed: Boolean (default: false)
  }]
  
  completedAt: Date
  
  metadata: {
    category: String
    imageUrl: String
    notes: String
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId`
- `{ userId: 1, status: 1 }`
- `{ userId: 1, targetDate: 1 }`

---

## 10. Reward

Individual reward transactions.

```typescript
{
  userId: String (required, indexed)
  
  type: String (required, enum: [
    'TASK_COMPLETION', 'CARD_CASHBACK', 'REFERRAL', 
    'DAILY_LOGIN', 'PROFILE_COMPLETION', 'CARD_LINK', 
    'DEAL_REDEEM', 'MONTHLY_BONUS'
  ])
  
  coins: Number (required, min: 0)
  rupees: Number (auto-calculated: coins * 0.1)
  
  description: String (required)
  
  status: String (enum: ['PENDING', 'COMPLETED', 'CLAIMED', 'EXPIRED'], default: 'COMPLETED')
  
  taskId: String
  creditCardId: String
  
  claimedAt: Date
  expiresAt: Date
  
  metadata: Mixed (flexible object for additional data)
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId`
- `{ userId: 1, status: 1 }`
- `{ userId: 1, createdAt: -1 }`

---

## 11. UserWallet

User's total rewards balance.

```typescript
{
  userId: String (required, unique, indexed)
  
  totalCoins: Number (default: 0, min: 0)
  totalRupees: Number (default: 0, min: 0)
  
  lifetimeCoinsEarned: Number (default: 0, min: 0)
  
  cardCashbackTotal: Number (default: 0, min: 0)
  taskRewardsTotal: Number (default: 0, min: 0)
  referralRewardsTotal: Number (default: 0, min: 0)
  
  lastRewardAt: Date
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Methods:**
```typescript
// Add coins to wallet
addCoins(coins: number, source: 'card' | 'task' | 'referral'): Promise<void>

// Deduct coins (for redemptions)
deductCoins(coins: number): Promise<void>
```

**Indexes:**
- `userId` (unique)

---

## 12. Deal

Available deals and offers.

```typescript
{
  title: String (required)
  description: String (required)
  
  merchant: String (required)
  category: String (required, enum: [
    'food', 'shopping', 'travel', 'entertainment', 
    'services', 'electronics', 'fashion', 'other'
  ])
  
  discountType: String (enum: ['percentage', 'flat', 'cashback', 'bogo'])
  discountValue: Number (required)
  
  originalPrice: Number
  finalPrice: Number
  
  validFrom: Date (required)
  validUntil: Date (required)
  
  termsAndConditions: [String]
  
  imageUrl: String
  merchantLogo: String
  
  location: {
    city: String
    state: String
    country: String (default: 'India')
    coordinates: {
      latitude: Number
      longitude: Number
    }
  }
  
  eligibleCards: [{
    network: String
    bank: String
    cardType: String
  }]
  
  maxRedemptions: Number
  currentRedemptions: Number (default: 0)
  
  isFeatured: Boolean (default: false)
  isActive: Boolean (default: true)
  
  popularity: Number (default: 0)
  rating: Number (min: 0, max: 5)
  
  metadata: {
    dealCode: String
    websiteUrl: String
    phone: String
    tags: [String]
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `category`
- `{ isActive: 1, validUntil: -1 }`
- `{ isFeatured: -1, popularity: -1 }`

---

## 13. MarketCreditCard

Credit cards available in the market (catalog).

```typescript
{
  name: String (required, unique)
  bank: String (required, indexed)
  network: String (required, enum: ['Visa', 'Mastercard', 'RuPay', 'Amex', 'Diners'])
  
  category: String (required, enum: [
    'entry', 'premium', 'super_premium', 'lifestyle', 
    'travel', 'cashback', 'rewards', 'fuel', 'shopping'
  ])
  
  tier: String (enum: ['basic', 'silver', 'gold', 'platinum', 'signature'])
  
  annualFee: Number (required)
  joiningFee: Number (default: 0)
  
  rewardType: String (enum: ['cashback', 'points', 'miles', 'none'])
  rewardRate: Number
  
  features: [String]
  benefits: {
    loungeAccess: Boolean
    fuelSurcharge: Boolean
    movieDiscount: Boolean
    insuranceCover: Boolean
    concierge: Boolean
  }
  
  eligibility: {
    minIncome: Number
    minAge: Number (default: 18)
    maxAge: Number
    minCreditScore: Number
  }
  
  bestFor: [String]
  
  imageUrl: String
  
  welcomeOffer: String
  
  isActive: Boolean (default: true)
  popularity: Number (default: 0)
  rating: Number (min: 0, max: 5)
  
  metadata: {
    applyUrl: String
    termsUrl: String
    description: String
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `bank`
- `category`
- `{ isActive: 1, popularity: -1 }`
- `name` (unique)

---

## 14. CardRecommendation

AI-generated credit card recommendations for users.

```typescript
{
  userId: ObjectId (required, ref: User, indexed)
  marketCardId: ObjectId (required, ref: MarketCreditCard)
  
  type: String (enum: ['upgrade', 'new', 'alternative', 'savings'], default: 'new')
  
  score: Number (required, min: 0, max: 100)
  matchPercentage: Number (min: 0, max: 100)
  
  reasons: [String]
  benefits: [String]
  
  estimatedSavings: Number (default: 0)
  estimatedRewards: Number (default: 0)
  
  comparedWith: ObjectId (ref: CreditCard)
  
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium')
  
  status: String (enum: ['active', 'viewed', 'applied', 'dismissed'], default: 'active')
  
  viewedAt: Date
  appliedAt: Date
  dismissedAt: Date
  dismissReason: String
  
  expiresAt: Date
  
  metadata: {
    confidence: Number
    basedOn: [String]
    tags: [String]
  }
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId`
- `{ userId: 1, status: 1, score: -1 }`
- `{ userId: 1, createdAt: -1 }`

---

## Relationships

```
User (1) ──→ (N) UserProfile
User (1) ──→ (N) IncomeSource
User (1) ──→ (N) CreditCard
User (1) ──→ (N) FinancialSnapshot
User (1) ──→ (N) SpendingCategory
User (1) ──→ (N) Insight
User (1) ──→ (N) NextBestAction
User (1) ──→ (N) Goal
User (1) ──→ (N) Reward
User (1) ──→ (1) UserWallet
User (1) ──→ (N) CardRecommendation

MarketCreditCard (1) ──→ (N) CardRecommendation
CreditCard (1) ──→ (N) FinancialSnapshot.cardSpending
Insight (1) ──→ (1) NextBestAction
```

---

## Naming Conventions

- **Collections**: PascalCase singular (e.g., `User`, `CreditCard`)
- **Fields**: camelCase (e.g., `userId`, `createdAt`)
- **Enums**: snake_case lowercase (e.g., `'super_premium'`, `'debt_payoff'`)
- **References**: End with `Id` (e.g., `userId`, `cardId`)
- **Timestamps**: Always include `createdAt` and `updatedAt`

---

## Best Practices

1. **Always index foreign keys** for better query performance
2. **Use compound indexes** for frequently queried combinations
3. **Set sparse indexes** on optional unique fields
4. **Use virtual fields** for calculated values
5. **Add metadata objects** for flexible future data
6. **Include timestamps** on all documents
7. **Use enums** for fixed value sets
8. **Set default values** where appropriate
9. **Add validation** at schema level
10. **Document complex schemas** with comments
