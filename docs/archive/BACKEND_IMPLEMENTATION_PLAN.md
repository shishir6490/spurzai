# Spurz.ai Backend Implementation Plan

## Executive Summary
This document outlines the complete plan for building a Node.js + TypeScript + MongoDB backend for Spurz.ai and refactoring the frontend to eliminate mock data and connect to real APIs.

---

## Frontend Analysis Summary

### Current State
1. **Auth System**: Currently uses mock auth with scenario-based login (A/B/C/D)
2. **Data Flow**: All data comes from `mockData.ts` and `scenarioDetector.ts`
3. **Context**: `AuthContext` manages user state, financial data, permissions, onboarding flow
4. **Screens**:
   - HomeScreen: Shows hero, stats, insights (all hardcoded)
   - Profile, Cards, Deals, Goals, SpurzAI screens
   - Onboarding flow: Landing → Login → OTP → Email → SETU → Manual → Complete
5. **Firebase**: **NOT CURRENTLY INTEGRATED** - needs to be added
6. **Navigation**: React Navigation with bottom tabs + stack navigator

### Files to Modify/Remove
- ❌ **Remove**: `src/utils/scenarioDetector.ts` (entire file)
- ❌ **Remove**: `src/utils/mockData.ts` (entire file)
- 🔄 **Refactor**: `src/context/AuthContext.tsx` (remove mock logic, add Firebase + API)
- 🔄 **Refactor**: `src/screens/HomeScreen.tsx` (fetch from `/home` API)
- 🔄 **Refactor**: All onboarding screens to call backend
- ➕ **Add**: Firebase SDK (`@react-native-firebase/app`, `@react-native-firebase/auth`)
- ➕ **Add**: API client layer (`src/services/api.ts`)
- ➕ **Add**: Backend types (`src/types/backend.ts`)

---

## Backend Architecture

### Folder Structure
```
spurz-ai-backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # MongoDB connection
│   │   ├── firebase.ts         # Firebase Admin SDK init
│   │   └── env.ts              # Environment variables
│   │
│   ├── models/
│   │   ├── User.ts             # User model
│   │   ├── UserProfile.ts      # User profile demographics
│   │   ├── IncomeSource.ts     # Income sources
│   │   ├── CreditCard.ts       # Credit cards
│   │   ├── FinancialSnapshot.ts # Snapshots
│   │   ├── Insight.ts          # Insights
│   │   ├── NextBestAction.ts   # Actions/nudges
│   │   └── Goal.ts             # Financial goals
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # Firebase token verification
│   │   └── error.middleware.ts # Global error handler
│   │
│   ├── services/
│   │   ├── HomeEngineService.ts    # Core home logic
│   │   ├── InsightEngineService.ts # Insight generation
│   │   ├── NextBestActionService.ts # Action generation
│   │   ├── MetricsService.ts       # Financial metrics calculation
│   │   └── ScenarioService.ts      # Scenario/health band logic
│   │
│   ├── routes/
│   │   ├── auth.routes.ts      # /auth endpoints
│   │   ├── profile.routes.ts   # /profile endpoints
│   │   ├── income.routes.ts    # /income endpoints
│   │   ├── cards.routes.ts     # /cards endpoints
│   │   └── home.routes.ts      # /home endpoint
│   │
│   ├── types/
│   │   ├── express.d.ts        # Express request extensions
│   │   └── enums.ts            # Shared enums
│   │
│   ├── utils/
│   │   ├── logger.ts           # Winston logger
│   │   └── validators.ts       # Input validation
│   │
│   └── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Implementation Phases

### Phase 1: Backend Bootstrap (Day 1)
**Goal**: Create backend structure with minimal working endpoints

#### Steps:
1. Create backend folder structure
2. Initialize npm project with TypeScript
3. Install dependencies:
   ```json
   {
     "express": "^4.18.2",
     "mongoose": "^8.0.0",
     "firebase-admin": "^12.0.0",
     "dotenv": "^16.3.1",
     "cors": "^2.8.5",
     "helmet": "^7.1.0",
     "express-validator": "^7.0.1",
     "winston": "^3.11.0"
   }
   ```
4. Set up TypeScript config
5. Create MongoDB connection config
6. Create Firebase Admin config
7. Create basic Express app with middleware
8. Add health check endpoint: `GET /health`

**Deliverable**: Backend runs on `http://localhost:4000`, connects to MongoDB

---

### Phase 2: Database Models (Day 1-2)
**Goal**: Implement all Mongoose schemas

#### Models to Create:

**1. User Model** (`models/User.ts`)
```typescript
{
  firebaseUid: string (unique, required)
  phone: string
  email: string
  name: string
  
  onboardingStatus: {
    hasBasicProfile: boolean
    hasSalaryInfo: boolean
    hasCardInfo: boolean
    hasExpenseInfo: boolean
    hasBankLinkage: boolean
    hasEmailLinkage: boolean
  }
  
  scenarioCode: enum [
    ONBOARDING_NO_SALARY,
    ONBOARDING_NO_CARDS,
    ONBOARDING_PARTIAL,
    READY_NO_HEALTH,
    CRITICAL_RED,
    STRESSED_AMBER,
    BALANCED_GREEN,
    OPTIMIZER_BLUE
  ]
  
  healthBand: enum [UNKNOWN, CRITICAL, STRESSED, BALANCED, OPTIMIZER]
  
  flags: {
    isEarlyAccess: boolean
    isInternalTestUser: boolean
  }
  
  lastLoginAt: Date
  createdAt: Date
  updatedAt: Date
}
```

**2. UserProfile Model**
```typescript
{
  userId: ObjectId (ref: User)
  dob: Date
  gender: string
  city: string
  country: string
  employmentType: enum [SALARIED, SELF_EMPLOYED, FREELANCE, BUSINESS, RETIRED, STUDENT]
  occupation: string
  maritalStatus: enum [SINGLE, MARRIED, DIVORCED, WIDOWED]
  dependentsCount: number
  riskAppetite: enum [CONSERVATIVE, MODERATE, AGGRESSIVE]
}
```

**3. IncomeSource Model**
```typescript
{
  userId: ObjectId (ref: User)
  type: enum [SALARY, FREELANCE, BONUS, RENT, OTHER]
  employerName: string
  description: string
  amount: number
  currency: string (default: INR)
  frequency: enum [MONTHLY, WEEKLY, ANNUAL, ADHOC]
  isPrimary: boolean
  startDate: Date
  endDate: Date (optional)
}
```

**4. CreditCard Model**
```typescript
{
  userId: ObjectId (ref: User)
  issuer: string (HDFC, ICICI, AXIS, SBI, etc.)
  brand: enum [VISA, MASTERCARD, RUPAY, AMEX]
  nickName: string
  last4: string
  creditLimit: number
  
  billingCycle: {
    billGenerationDay: number (1-31)
    dueDayOffset: number (days after bill generation)
  }
  
  rewardStyle: string (CASHBACK, POINTS, MILES)
  isActive: boolean
  addedAt: Date
}
```

**5. FinancialSnapshot Model**
```typescript
{
  userId: ObjectId (ref: User)
  snapshotDate: Date
  
  dataCompleteness: {
    hasBasicProfile: boolean
    hasSalaryInfo: boolean
    hasCardInfo: boolean
    hasExpenseInfo: boolean
    hasBankLinkage: boolean
    hasEmailLinkage: boolean
  }
  
  metrics: {
    monthlyIncome: number
    monthlyExpenses: number
    monthlySavings: number
    savingsRate: number (0-1)
    cardUtilization: number (0-1)
    debtToIncome: number (0-1)
    onTimePaymentRatio: number (0-1)
  }
  
  healthBand: enum
  scenarioCode: enum
  
  createdAt: Date
  updatedAt: Date
}
```

**6. Insight Model**
```typescript
{
  userId: ObjectId (ref: User)
  snapshotId: ObjectId (ref: FinancialSnapshot)
  type: enum [SPEND_PATTERN, CARD_USAGE, SAVING_OPPORTUNITY, RISK_ALERT]
  title: string
  message: string
  severity: enum [low, medium, high]
  priority: number
  tags: string[]
  data: Mixed (JSON)
  createdAt: Date
}
```

**7. NextBestAction Model**
```typescript
{
  userId: ObjectId (ref: User)
  snapshotId: ObjectId (ref: FinancialSnapshot)
  title: string
  description: string
  estimatedImpact: enum [low, medium, high]
  ctaLabel: string
  ctaTargetScreen: string
  status: enum [PENDING, COMPLETED, SKIPPED]
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

**8. Goal Model**
```typescript
{
  userId: ObjectId (ref: User)
  name: string
  type: enum [TRAVEL, HOUSE, CAR, EMERGENCY, GENERIC]
  targetAmount: number
  currentAmount: number
  currency: string (default: INR)
  targetDate: Date
  priority: enum [LOW, MEDIUM, HIGH]
  status: enum [ACTIVE, PAUSED, ACHIEVED, CANCELLED]
}
```

**Deliverable**: All models created with proper TypeScript types

---

### Phase 3: Authentication & Middleware (Day 2)
**Goal**: Implement Firebase auth verification

#### Tasks:
1. **Create auth middleware** (`middlewares/auth.middleware.ts`):
   ```typescript
   - Extract `Authorization: Bearer <token>` header
   - Verify token with Firebase Admin SDK
   - Extract firebaseUid, email, phone from token
   - Upsert User in MongoDB (findOneAndUpdate with firebaseUid)
   - Attach req.user = { userId, firebaseUid, email, phone }
   - Handle errors gracefully
   ```

2. **Create auth routes** (`routes/auth.routes.ts`):
   ```typescript
   POST /auth/exchange
   - Body: { firebaseIdToken: string }
   - Verify token
   - Upsert user
   - Return: { user, scenarioCode, onboardingStatus, healthBand }
   
   GET /auth/me
   - Protected route (requires auth middleware)
   - Return current user + latest snapshot
   ```

**Deliverable**: Auth middleware works, `/auth/exchange` and `/auth/me` functional

---

### Phase 4: Core Services (Day 2-3)
**Goal**: Implement business logic services

#### 4.1 MetricsService (`services/MetricsService.ts`)
```typescript
class MetricsService {
  async calculateMonthlyIncome(userId): Promise<number>
  async calculateMonthlyExpenses(userId): Promise<number>
  async calculateMonthlySavings(userId): Promise<number>
  async calculateSavingsRate(userId): Promise<number>
  async calculateCardUtilization(userId): Promise<number>
  // TODO: Add more sophisticated metrics later
}
```

#### 4.2 ScenarioService (`services/ScenarioService.ts`)
```typescript
class ScenarioService {
  deriveScenarioCode(completeness, healthBand): ScenarioCode
  deriveHealthBand(metrics): HealthBand
  
  // Rules:
  // - If no salary → ONBOARDING_NO_SALARY
  // - If no cards → ONBOARDING_NO_CARDS
  // - If partial data → ONBOARDING_PARTIAL
  // - If complete data:
  //   - savingsRate < 0.1 → CRITICAL_RED
  //   - savingsRate < 0.2 → STRESSED_AMBER
  //   - savingsRate < 0.3 → BALANCED_GREEN
  //   - savingsRate >= 0.3 → OPTIMIZER_BLUE
}
```

#### 4.3 SpendingAnalysisService (`services/SpendingAnalysisService.ts`) **[NEW]**
```typescript
class SpendingAnalysisService {
  // Analyze user's spending patterns and categorize
  async analyzeSpendingPatterns(userId): Promise<SpendingCategory[]>
  async updateCategorySpending(userId, category, amount): Promise<void>
  async getTopSpendingCategories(userId, limit = 3): Promise<SpendingCategory[]>
  async calculatePotentialSavings(userId, category): Promise<number>
  
  // Calculate best cards for each spending category
  async recommendCardsForCategory(userId, category): Promise<IRecommendedCard[]>
}
```

#### 4.4 CardRecommendationService (`services/CardRecommendationService.ts`) **[NEW]**
```typescript
class CardRecommendationService {
  // Generate personalized card recommendations
  async generateRecommendations(userId): Promise<CardRecommendation[]>
  
  // Match user's spending with market cards
  async findBestCardForCategory(category, monthlySpending): Promise<MarketCreditCard>
  
  // Calculate reward potential
  async calculateRewardPotential(card, spendingCategories): Promise<number>
  
  // Compare user's cards with market cards
  async identifyUpgradeOpportunities(userId): Promise<CardRecommendation[]>
  
  // Recommend existing card for specific transaction
  async recommendCardForTransaction(userId, category, amount): Promise<CreditCard>
}
```

#### 4.5 DealMatchingService (`services/DealMatchingService.ts`) **[NEW]**
```typescript
class DealMatchingService {
  // Find best deals for user
  async getPersonalizedDeals(userId, category?): Promise<Deal[]>
  
  // Match deals with user's cards
  async matchDealsWithUserCards(userId, dealId): Promise<{
    deal: Deal,
    bestUserCard?: CreditCard,
    bestMarketCard?: MarketCreditCard,
    estimatedSavings: number
  }>
  
  // Find best card-deal combinations
  async findOptimalCardDealCombos(userId, category): Promise<Array<{
    deal: Deal,
    card: MarketCreditCard | CreditCard,
    totalDiscount: number,
    savings: number
  }>>
  
  // Track deal engagement
  async trackDealView(userId, dealId): Promise<void>
  async trackDealClick(userId, dealId): Promise<void>
  async trackDealRedemption(userId, dealId): Promise<void>
}
```

#### 4.6 HomeEngineService (`services/HomeEngineService.ts`)
```typescript
class HomeEngineService {
  async computeDataCompleteness(userId): Promise<DataCompleteness>
  async computeMetrics(userId): Promise<Metrics>
  async generateSnapshot(userId): Promise<FinancialSnapshot>
  async getHeroContent(scenarioCode, userName): Promise<HeroContent>
  async getKeyStats(userId, metrics): Promise<KeyStat[]>
  async getBestCardsForCategories(userId): Promise<CategoryCardRecommendation[]> // NEW
  // TODO: This will be replaced by state machine later
}
```

#### 4.7 InsightEngineService (`services/InsightEngineService.ts`)
```typescript
class InsightEngineService {
  async generateInsights(snapshotId, metrics): Promise<Insight[]>
  
  // Simple rules for MVP:
  // - savingsRate < 0.1 → SAVING_OPPORTUNITY
  // - cardUtilization > 0.8 → RISK_ALERT
  // - expenses > income → RISK_ALERT
  // - Using suboptimal card for category → CARD_OPTIMIZATION (NEW)
  // - Missing out on deals → DEAL_OPPORTUNITY (NEW)
  // TODO: Replace with ML/AI-driven insights later
}
```

#### 4.8 NextBestActionService (`services/NextBestActionService.ts`)
```typescript
class NextBestActionService {
  async generateActions(userId, completeness): Promise<NextBestAction[]>
  
  // Rules:
  // - !hasSalaryInfo → "Add your salary" (HIGH priority)
  // - !hasCardInfo → "Add your credit cards" (MEDIUM)
  // - !hasExpenseInfo → "Track your expenses" (MEDIUM)
  // - !hasEmailLinkage → "Connect your email" (LOW)
  // - High spending category + better card available → "Get better card" (MEDIUM) (NEW)
  // - Featured deal matching user's interest → "Check this deal" (LOW) (NEW)
  // TODO: Replace with state machine logic later
}
```

**Deliverable**: All services implemented with deal matching and card recommendation logic

---

### Phase 5: API Endpoints (Day 3-4)
**Goal**: Create all REST endpoints

#### 5.1 Profile Routes (`routes/profile.routes.ts`)
```typescript
GET /profile
- Return UserProfile for authenticated user

PATCH /profile
- Update UserProfile
- Body: { dob?, gender?, city?, occupation?, etc. }
- Regenerate snapshot after update
```

#### 5.2 Income Routes (`routes/income.routes.ts`)
```typescript
POST /income/salary
- Body: { amount, frequency, employerName, startDate }
- Create/update primary salary income source
- Mark onboardingStatus.hasSalaryInfo = true
- Regenerate snapshot + actions

GET /income
- List all income sources for user
- Include totals and breakdown
```

#### 5.3 Cards Routes (`routes/cards.routes.ts`)
```typescript
POST /cards
- Body: { issuer, brand, nickName, last4, creditLimit, billingCycle, rewardStyle }
- Create new card
- Mark onboardingStatus.hasCardInfo = true
- Regenerate snapshot + actions

GET /cards
- List all cards for user
- Include utilization stats

PATCH /cards/:id
- Update card details

DELETE /cards/:id
- Soft delete (isActive = false)
```

#### 5.4 Home Route (`routes/home.routes.ts`)
```typescript
GET /home
- Protected route
- Steps:
  1. Get/generate latest snapshot
  2. Compute hero content based on scenarioCode
  3. Fetch key stats from metrics
  4. Fetch latest insights
  5. Fetch pending next best actions
  6. Get best cards for top spending categories (NEW)
  7. Return HomeResponse:

type HomeResponse = {
  meta: {
    userId: string
    name: string
    scenarioCode: string
    healthBand: string
  }
  dataCompleteness: DataCompleteness
  hero: {
    title: string
    subtitle: string
    pillText?: string
  }
  keyStats: KeyStat[]
  nudges: Nudge[]
  insights: InsightItem[]
  nextBestActions: ActionItem[]
  bestCardsForCategories: CategoryCardRecommendation[] // NEW
}
```

#### 5.5 Deals Routes (`routes/deals.routes.ts`) **[NEW]**
```typescript
GET /deals
- Query params: ?category=dining&city=bangalore&limit=20
- Return personalized deals based on user's cards and spending
- Sorted by relevance + popularity

GET /deals/:id
- Get deal details
- Include best card recommendations from user's cards
- Track view event

GET /deals/:id/best-card
- Return optimal card (user's or market) for this deal
- Show estimated savings breakdown

POST /deals/:id/click
- Track click event for analytics

POST /deals/:id/redeem
- Track redemption event
```

#### 5.6 Card Recommendations Routes (`routes/recommendations.routes.ts`) **[NEW]**
```typescript
GET /recommendations/cards
- Get personalized card recommendations for user
- Based on spending patterns and potential savings
- Filter: ?type=new_card|existing_card|upgrade

GET /recommendations/cards/:id/dismiss
- Dismiss a recommendation

POST /recommendations/cards/:id/apply
- Mark recommendation as applied (user clicked apply)
```

#### 5.7 Market Cards Routes (`routes/market-cards.routes.ts`) **[NEW]**
```typescript
GET /market-cards
- Query: ?category=dining&tier=platinum&bank=hdfc
- Browse all available credit cards in market
- Filter by rewards, fees, features

GET /market-cards/:id
- Get detailed card information
- Include reward structure, partner merchants, fees
```

**Deliverable**: All endpoints functional with deals and recommendations

---

### Phase 6: Frontend Integration (Day 4-5)
**Goal**: Remove mocks and connect to backend

#### 6.1 Add Firebase to Frontend
```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

Create `src/config/firebase.ts`:
```typescript
import auth from '@react-native-firebase/auth';

export const firebaseAuth = auth();

export const signInWithPhone = async (phoneNumber: string) => {
  const confirmation = await firebaseAuth.signInWithPhoneNumber(phoneNumber);
  return confirmation;
};

export const getCurrentUser = () => firebaseAuth.currentUser;

export const getIdToken = async () => {
  const user = firebaseAuth.currentUser;
  return user ? await user.getIdToken() : null;
};
```

#### 6.2 Create API Client
Create `src/services/api.ts`:
```typescript
import { getIdToken } from '@config/firebase';

const BASE_URL = __DEV__ 
  ? 'http://localhost:4000' 
  : 'https://api.spurz.ai';

class ApiClient {
  private async getHeaders() {
    const token = await getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async get<T>(endpoint: string): Promise<T> { ... }
  async post<T>(endpoint: string, body: any): Promise<T> { ... }
  async patch<T>(endpoint: string, body: any): Promise<T> { ... }
  async delete<T>(endpoint: string): Promise<T> { ... }
}

export const api = new ApiClient();
```

#### 6.3 Refactor AuthContext
**Remove**:
- `loginAsScenario` (mock function)
- `mockUsers`, `mockFinancialData` imports
- `detectUserScenario` import
- All mock data logic

**Add**:
```typescript
import { firebaseAuth, signInWithPhone, getIdToken } from '@config/firebase';
import { api } from '@services/api';

// New methods:
const initializeAuth = useCallback(async () => {
  const firebaseUser = firebaseAuth.currentUser;
  if (firebaseUser) {
    const token = await getIdToken();
    const response = await api.post('/auth/exchange', { firebaseIdToken: token });
    setUser(response.user);
    setScenarioCode(response.scenarioCode);
    setOnboardingStatus(response.onboardingStatus);
  }
}, []);

const loginWithPhone = async (phone: string) => {
  const confirmation = await signInWithPhone(phone);
  setPhoneConfirmation(confirmation);
  setOnboardingStep('otp');
};

const verifyOTP = async (code: string) => {
  await phoneConfirmation.confirm(code);
  await initializeAuth(); // Sync with backend
  setOnboardingStep('email');
};
```

#### 6.4 Refactor HomeScreen
**Remove**:
- All hardcoded hero text
- Hardcoded stats, insights, nudges

**Add**:
```typescript
const [homeData, setHomeData] = useState<HomeResponse | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchHomeData();
}, []);

const fetchHomeData = async () => {
  try {
    setLoading(true);
    const data = await api.get<HomeResponse>('/home');
    setHomeData(data);
  } catch (error) {
    console.error('Failed to fetch home data:', error);
  } finally {
    setLoading(false);
  }
};

// Render using homeData.hero, homeData.keyStats, etc.
```

#### 6.5 Update Other Screens
- **ManualDataCollectionScreen**: Call `/income/salary` when submitting
- **Add Card flow**: Call `/cards` endpoint
- **ProfileScreen**: Call `/profile` endpoints
- **EmailPermissionScreen**: Update onboarding status via backend
- **SetuVerificationScreen**: Update onboarding status via backend

**Deliverable**: Frontend fully integrated with backend, no mocks remaining

---

### Phase 7: Testing & Validation (Day 5)
**Goal**: Ensure everything works end-to-end

#### Tasks:
1. Test complete onboarding flow:
   - Phone login → OTP → Email → SETU → Manual data → Home
2. Test Home screen rendering for different scenarios:
   - No data → shows "Add salary" nudge
   - Partial data → shows completion nudges
   - Complete data → shows insights
3. Test API error handling:
   - Invalid token → 401
   - Missing data → 400
   - Server errors → 500
4. Test data persistence:
   - Add salary → snapshot regenerates
   - Add card → metrics update
5. Load testing with basic scenarios

**Deliverable**: All flows working, no critical bugs

---

## Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=4000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/spurz-ai

# Firebase Admin SDK
FIREBASE_PROJECT_ID=spurz-ai-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@spurz-ai-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19006

# Logging
LOG_LEVEL=debug
```

### Frontend `.env`
```env
API_BASE_URL=http://localhost:4000
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=spurz-ai-prod.firebaseapp.com
FIREBASE_PROJECT_ID=spurz-ai-prod
```

---

## Future State Machine Integration

### Integration Hooks
All hero text, insights, and actions are currently generated in services with clear markers:

```typescript
// services/HomeEngineService.ts
async getHeroContent(scenarioCode: string): Promise<HeroContent> {
  // TODO: Replace with state machine-driven engine once spec is available
  // Current: Simple rule-based mapping
  switch (scenarioCode) {
    case 'ONBOARDING_NO_SALARY':
      return { title: 'Welcome!', subtitle: 'Let\'s start with your salary' };
    // ... more rules
  }
}
```

### When State Machine is Ready:
1. Replace `ScenarioService.deriveScenarioCode()` with state machine
2. Replace `HomeEngineService.getHeroContent()` with state machine
3. Replace `InsightEngineService.generateInsights()` with state machine
4. Replace `NextBestActionService.generateActions()` with state machine
5. Keep data models and API endpoints unchanged

---

## Success Criteria

### Backend
- ✅ All models created and tested
- ✅ All endpoints return proper responses
- ✅ Firebase auth works correctly
- ✅ Snapshots generate on data changes
- ✅ Insights and actions populate correctly

### Frontend
- ✅ No mock data remaining
- ✅ All screens fetch from backend
- ✅ Firebase auth integrated
- ✅ Onboarding flow works end-to-end
- ✅ Home screen renders from API data
- ✅ Error handling works properly

### Integration
- ✅ Phone login → backend sync works
- ✅ Add salary → snapshot regenerates → home updates
- ✅ Add card → metrics update → insights refresh
- ✅ Navigation flows remain intact
- ✅ No breaking changes to UI/UX

---

## Timeline Estimate

- **Day 1**: Backend bootstrap + database models (6-8 hours)
- **Day 2**: Auth + core services (6-8 hours)
- **Day 3**: API endpoints (6-8 hours)
- **Day 4**: Frontend integration (6-8 hours)
- **Day 5**: Testing & bug fixes (4-6 hours)

**Total**: ~30-40 hours of development work

---

## Next Steps

After approval of this plan, I will:
1. Create backend folder structure
2. Implement models
3. Build services and routes
4. Refactor frontend
5. Test end-to-end

**Ready to proceed? I'll start with Phase 1: Backend Bootstrap.**
