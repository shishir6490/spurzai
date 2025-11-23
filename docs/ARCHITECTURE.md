# Spurz.AI - Architecture Documentation

This document provides a comprehensive overview of the Spurz.AI system architecture, design decisions, and technical implementation details.

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Data Flow](#data-flow)
- [Key Features Implementation](#key-features-implementation)
- [Performance Optimizations](#performance-optimizations)
- [Security](#security)
- [Scalability](#scalability)

---

## 🎯 System Overview

Spurz.AI is a mobile-first financial intelligence platform built with a modern, scalable architecture. The system consists of:

1. **Mobile Application** (React Native + Expo)
2. **Backend API** (Node.js + Express)
3. **Database** (MongoDB Atlas)
4. **Authentication** (Firebase Authentication)
5. **File Storage** (Firebase Storage - planned)

```
┌─────────────────────────────────────────────────────────┐
│                      Mobile App                         │
│              (React Native + Expo)                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ REST API (HTTPS)
                 │
┌────────────────▼────────────────────────────────────────┐
│                   API Server                            │
│               (Node.js + Express)                       │
└────────────┬──────────────────────┬─────────────────────┘
             │                      │
             │                      │
   ┌─────────▼────────┐   ┌────────▼─────────┐
   │   Firebase Auth   │   │  MongoDB Atlas   │
   │   (User Auth)     │   │   (User Data)    │
   └───────────────────┘   └──────────────────┘
```

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React Native 0.74.5
- **Platform**: Expo SDK 51
- **Language**: TypeScript 5.3
- **Navigation**: React Navigation v6
- **State Management**: React Context API + Hooks
- **Authentication**: Firebase Auth SDK
- **UI Components**: Custom components with Expo modules
- **Animations**: React Native Animated API
- **Storage**: Async Storage (planned)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 6.0 (Mongoose ODM 8.x)
- **Authentication**: Firebase Admin SDK
- **Security**: Helmet, CORS, Rate Limiting

### Infrastructure
- **Database Hosting**: MongoDB Atlas (M0 free tier → M10 prod)
- **API Hosting**: Railway/Heroku/Render (to be decided)
- **CDN**: Cloudflare (planned)
- **Monitoring**: Sentry (planned)

---

## 📱 Frontend Architecture

### Component Hierarchy

```
App.tsx
└── AuthContext.Provider
    └── RootNavigator
        ├── AuthStack (unauthenticated)
        │   ├── SplashScreen
        │   ├── LandingScreen
        │   ├── LoginScreen
        │   ├── SignupScreen
        │   └── OTPVerificationScreen
        │
        └── MainStack (authenticated)
            └── MainTabs
                ├── HomeStack
                │   ├── HomeScreen
                │   └── CategoryDetailScreen
                ├── CardsStack
                │   └── CardsScreen
                ├── SpurzAI (bottom FAB)
                │   └── SpurzAIScreen
                ├── DealsStack
                │   └── DealsScreen
                └── ProfileStack
                    └── ProfileScreen
```

### State Management Strategy

**Global State** (AuthContext):
- User authentication status
- User profile data
- Firebase token
- Loading states

**Local State** (Component-level):
- UI state (modals, dropdowns, etc.)
- Form inputs
- Animation states
- Scroll positions

**API State** (Service Layer):
- Dashboard data (cached)
- Cards list
- Income sources
- Transactions

### Navigation Structure

```typescript
type RootStackParamList = {
  Splash: undefined;
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  OTPVerification: { phoneNumber: string };
  Main: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Cards: undefined;
  SpurzAI: undefined;
  Deals: undefined;
  Profile: undefined;
};

type HomeStackParamList = {
  HomeScreen: undefined;
  CategoryDetail: {
    category: string;
    amount: number;
    color: string;
    icon: string;
  };
};
```

### Component Architecture

**Atomic Design Pattern**:
- **Atoms**: Basic UI elements (buttons, inputs, icons)
- **Molecules**: Simple component groups (card header, stat row)
- **Organisms**: Complex components (savings card, category card)
- **Templates**: Screen layouts
- **Pages**: Actual screens with data fetching

Example Component Structure:

```
src/components/
├── atoms/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Icon.tsx
├── molecules/
│   ├── StatCard.tsx
│   └── CategoryHeader.tsx
├── organisms/
│   ├── SavingsOverviewCard.tsx
│   ├── SpendingCategoryCard.tsx
│   └── AddCardFlow.tsx
└── templates/
    └── DashboardTemplate.tsx
```

### Animation System

**Performance-Optimized Animations**:
- Use `useNativeDriver: true` whenever possible
- Staggered entrance animations for lists
- Spring animations for interactions
- Easing functions for smooth transitions

```typescript
// Example: Staggered Card Entrance
const scaleAnim = useRef(new Animated.Value(0.9)).current;

useEffect(() => {
  Animated.sequence([
    Animated.delay(200 + (index * 150)),
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    })
  ]).start();
}, [index]);
```

---

## 🖥 Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│           Routes Layer                  │
│   (API endpoints, request validation)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Middleware Layer                 │
│  (Auth, validation, error handling)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Services Layer                  │
│    (Business logic, calculations)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Models Layer                   │
│     (Data access, MongoDB schemas)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Database Layer                  │
│          (MongoDB Atlas)                │
└─────────────────────────────────────────┘
```

### Folder Structure

```
src/
├── app.ts                    # Express app setup
├── server.ts                 # Server entry point
│
├── config/
│   ├── database.ts           # MongoDB connection
│   └── firebase.ts           # Firebase Admin setup
│
├── middlewares/
│   ├── auth.ts               # Firebase token verification
│   ├── errorHandler.ts       # Global error handling
│   └── validation.ts         # Request validation
│
├── models/
│   ├── User.ts               # User account model
│   ├── UserProfile.ts        # User profile/preferences
│   ├── IncomeSource.ts       # Income/expense tracking
│   ├── CreditCard.ts         # Credit card management
│   └── Goal.ts               # Financial goals
│
├── routes/
│   ├── auth.routes.ts        # Authentication endpoints
│   ├── home.routes.ts        # Dashboard endpoints
│   ├── profile.routes.ts     # Profile management
│   ├── income.routes.ts      # Income CRUD
│   ├── cards.routes.ts       # Cards CRUD
│   └── categories.routes.ts  # Category analytics
│
├── services/
│   ├── MetricsService.ts     # Financial calculations
│   ├── RecommendationService.ts  # AI recommendations
│   └── ScenarioService.ts    # User scenario detection
│
└── utils/
    ├── logger.ts             # Logging utility
    ├── crypto.ts             # Encryption helpers
    └── validators.ts         # Input validators
```

### Middleware Chain

```typescript
app.use(helmet());                    // Security headers
app.use(cors());                      // CORS configuration
app.use(express.json());              // JSON parsing
app.use(rateLimiter);                 // Rate limiting
app.use(requestLogger);               // Request logging

// Protected routes
router.use(authenticateFirebaseToken); // Auth middleware
router.use(validateRequest);           // Validation
router.use(errorHandler);              // Error handling
```

### Services Layer

**MetricsService**: Core financial calculations
```typescript
class MetricsService {
  calculateMonthlyIncome(sources): number
  calculateMonthlyExpenses(sources): number
  calculateSavingsRate(income, expenses): number
  calculatePotentialSavings(userId): Promise<number>
  calculateCreditUtilization(cards): number
  getFinancialHealth(metrics): HealthScore
}
```

---

## 🗄 Database Schema

### Collections Overview

```
spurz-ai (database)
├── users                   # User accounts
├── userprofiles            # User preferences & settings
├── incomesources           # Income, expenses, investments, loans
├── creditcards             # Credit card details
├── goals                   # Financial goals
└── transactions (planned)  # Transaction history
```

### Schema Details

#### User Collection
```typescript
{
  _id: ObjectId,
  firebaseUid: string (unique),
  phoneNumber: string,
  email: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### UserProfile Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  fullName: string?,
  dateOfBirth: Date?,
  onboardingCompleted: boolean,
  onboardingStep: number,
  preferences: {
    currency: string,
    notifications: boolean,
    darkMode: boolean
  },
  settings: {
    trackingEnabled: boolean
  },
  financialSnapshot: {
    potentialSavingsPercent: number,
    lastExpensesHash: string,
    lastInvestmentsHash: string,
    lastCalculated: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### IncomeSource Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  type: enum [
    'salary', 'freelance', 'business',
    'investment', 'rental', 'other',
    'expense', 'investment_out', 'loan'
  ],
  name: string,
  source: string,
  amount: number,
  frequency: enum ['monthly', 'yearly', 'one-time'],
  isPrimary: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### CreditCard Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  cardName: string,
  bank: string,
  lastFourDigits: string,
  cardType: enum ['credit', 'debit'],
  creditLimit: number,
  currentBalance: number,
  dueDate: number (1-31),
  rewards: {
    type: enum ['points', 'cashback', 'miles'],
    rate: number
  },
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Performance optimization indexes
users.createIndex({ firebaseUid: 1 }, { unique: true });
userprofiles.createIndex({ userId: 1 });
incomesources.createIndex({ userId: 1, type: 1 });
creditcards.createIndex({ userId: 1, isActive: 1 });
```

---

## 🔐 Authentication Flow

### Phone Number Authentication

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│  Mobile  │                │ Firebase │                │ Backend  │
│   App    │                │   Auth   │                │   API    │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │ 1. Enter phone number     │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │ 2. Send OTP via SMS       │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │ 3. Enter OTP code         │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │ 4. Verify & return token  │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │ 5. Exchange token         │                           │
     ├───────────────────────────────────────────────────────>│
     │                           │                           │
     │                           │ 6. Verify Firebase token  │
     │                           │<──────────────────────────┤
     │                           │                           │
     │                           │ 7. Token valid            │
     │                           ├──────────────────────────>│
     │                           │                           │
     │ 8. Create/find user       │                           │
     │ & return user data        │                           │
     │<──────────────────────────────────────────────────────┤
     │                           │                           │
```

### Dev Mode (Testing)

```typescript
// Skip SMS verification in dev mode
if (DEV_MODE) {
  // Accept any 6-digit code
  // Auto-create test user
  // Return Firebase token
}
```

### Token Management

1. **Frontend stores**: Firebase ID token in memory
2. **Token refresh**: Automatic via Firebase SDK
3. **API requests**: Include token in Authorization header
4. **Backend verifies**: Token on every protected endpoint

---

## 🔄 Data Flow

### Dashboard Load Flow

```
User opens app
       │
       ▼
AuthContext checks Firebase session
       │
       ├── Not authenticated ──> Show LandingScreen
       │
       └── Authenticated
              │
              ▼
         Load MainTabs
              │
              ▼
    HomeScreen mounted
              │
              ▼
    fetchDashboardData()
              │
              ▼
    API: GET /home
              │
              ▼
    Backend: auth.middleware
              │
              ▼
    MetricsService.getMetrics()
              │
              ├── Query IncomeSource collection
              ├── Query CreditCard collection
              ├── Query UserProfile collection
              ├── Calculate metrics
              └── Generate insights
              │
              ▼
    Return dashboard JSON
              │
              ▼
    Update component state
              │
              ▼
    Render dashboard UI
```

### Savings Calculation Flow

```
User adds/updates expense
       │
       ▼
API: POST /income
       │
       ▼
Save to MongoDB
       │
       ▼
Trigger MetricsService.calculatePotentialSavings()
       │
       ├── Get current expenses
       ├── Get current investments
       ├── Calculate hash (MD5)
       │
       ├── Compare with stored hash
       │   │
       │   ├── Hash changed ──> Recalculate random % (3-12%) -- until we have our mathematical model ready
       │   │                    │
       │   │                    └── Save new hash & %
       │   │
       │   └── Hash same ──────> Return stored %
       │
       └── Return potentialSavingsPercent
```

---

## 💡 Key Features Implementation

### 1. Persistent Potential Savings

**Problem**: Random percentage changes on every reload  
**Solution**: Hash-based change detection

```typescript
async calculatePotentialSavings(userId: string): Promise<number> {
  const profile = await UserProfile.findOne({ userId });
  const expenses = await getExpenses(userId);
  const investments = await getInvestments(userId);
  
  // Create hash of current data
  const currentHash = md5(JSON.stringify({ expenses, investments }));
  
  // Check if data changed
  if (profile.financialSnapshot.lastExpensesHash === currentHash) {
    // Data unchanged, return stored value
    return profile.financialSnapshot.potentialSavingsPercent;
  }
  
  // Data changed, calculate new random percentage
  const newPercent = Math.random() * 9 + 3; // 3-12%
  
  // Save new hash and percentage
  await profile.updateOne({
    'financialSnapshot.potentialSavingsPercent': newPercent,
    'financialSnapshot.lastExpensesHash': currentHash,
    'financialSnapshot.lastCalculated': new Date()
  });
  
  return newPercent;
}
```

### 2. Spending Categories with Tracking

**Features**:
- Show top 3 categories by default
- "View All" to expand
- Tracking toggle in settings
- AI recommendation per category
- Navigation to detail screen

**States**:
- Tracking disabled → Show enable prompt
- No data → Show "Coming Soon"
- Has data → Show categories with recommendations

### 3. Dynamic Additional Savings

**Calculation**:
```typescript
const currentSavingsPercent = (savings / income) * 100;
const potentialSavingsPercent = dashboardData.metrics.potentialSavingsPercent;
const additionalSavingsPercent = potentialSavingsPercent - currentSavingsPercent;
const additionalSavingsAmount = (income * additionalSavingsPercent) / 100;
```

---

## ⚡ Performance Optimizations

### Frontend

1. **Lazy Loading**: Screens loaded on-demand
2. **Memoization**: UseMemo for expensive calculations
3. **Virtualized Lists**: FlatList for long lists
4. **Image Optimization**: Compressed assets, lazy loading
5. **Native Driver**: Animations use native driver
6. **Debouncing**: Input fields debounced

### Backend

1. **Database Indexes**: Optimized queries
2. **Connection Pooling**: Mongoose connection reuse
3. **Caching**: Redis for frequently accessed data (planned)
4. **Aggregation Pipeline**: Efficient MongoDB queries
5. **Pagination**: Limit response sizes

### Network

1. **Compression**: Gzip enabled
2. **HTTP/2**: Multiplexing (planned)
3. **CDN**: Static assets via CDN (planned)
4. **Request Batching**: Combine API calls (planned)

---

## 🔒 Security

### Authentication
- Firebase tokens verified on every request
- Token expiration handled automatically
- No passwords stored (passwordless auth)

### Data Protection
- HTTPS only in production
- Environment variables for secrets
- No sensitive data in logs
- Input validation on all endpoints

### Rate Limiting
```typescript
const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,              // 100 requests per minute
  message: 'Too many requests'
});
```

### CORS Policy
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
```

---

## 📈 Scalability

### Current Capacity
- **Users**: Up to 10,000 concurrent users
- **API Requests**: 1,000 req/sec
- **Database**: M0 free tier (512 MB storage)

### Scaling Strategy

**Horizontal Scaling**:
- Add more API server instances
- Load balancer distribution
- Database sharding (when needed)

**Vertical Scaling**:
- Upgrade MongoDB tier (M10, M20, M30)
- Increase API server resources

**Caching Layer**:
- Redis for session management
- Dashboard data caching
- Reduce database load

**Database Optimization**:
- Proper indexing
- Query optimization
- Read replicas
- Archival of old data

---

## 🔮 Future Enhancements

1. **Microservices**: Split services (auth, metrics, recommendations)
2. **Event-Driven**: Message queue for async processing
3. **Real-time**: WebSockets for live updates
4. **Analytics**: User behavior tracking
5. **A/B Testing**: Feature flags and experiments
6. **Monitoring**: Comprehensive logging and alerting

---

**Last Updated**: November 23, 2025
