# Frontend-Backend Integration Guide

## Overview
This guide helps you complete the integration between your React Native frontend and the Node.js backend.

## ✅ Already Completed

### Backend (100% Complete)
- ✅ All 8 core models (User, UserProfile, IncomeSource, CreditCard, etc.)
- ✅ All 8 services (Metrics, Scenario, CardRecommendation, etc.)
- ✅ Authentication with Firebase Admin SDK
- ✅ All 7 API route files created and integrated
- ✅ 0 TypeScript errors, clean build
- ✅ Server running on localhost:4000

### Frontend (Partial - Foundation Ready)
- ✅ API Client service created (`src/services/api.ts`)
- ✅ Firebase SDK installed
- ✅ AsyncStorage installed
- ✅ New AuthContext created (`AuthContext.new.tsx`)
- ✅ HomeScreen backend example created

## 🔧 Setup Required

### Step 1: Firebase Configuration

**File:** `/Users/shishirsharma/Downloads/spurz-ai/src/config/firebase.ts`

Replace the placeholder config with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**How to get credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new)
3. Go to Project Settings → General
4. Scroll to "Your apps" section
5. Click on your web app (or add one)
6. Copy the config object

**Enable Phone Authentication:**
1. In Firebase Console → Authentication
2. Click "Sign-in method" tab
3. Enable "Phone" provider
4. Add test phone numbers if needed

### Step 2: Replace AuthContext

**Current file:** `src/context/AuthContext.tsx` (using mock data)  
**New file:** `src/context/AuthContext.new.tsx` (real backend)

**Action:** Rename/replace the old AuthContext:

```bash
cd /Users/shishirsharma/Downloads/spurz-ai
mv src/context/AuthContext.tsx src/context/AuthContext.old.tsx
mv src/context/AuthContext.new.tsx src/context/AuthContext.tsx
```

### Step 3: Update HomeScreen

**Current file:** `src/screens/HomeScreen.tsx` (1794 lines, uses mock data)  
**Example file:** `src/screens/HomeScreen.backend-example.tsx` (simplified)

**Two approaches:**

**Option A - Gradual Migration:**
Keep your existing UI/animations, just replace data fetching:

```typescript
// In your existing HomeScreen.tsx
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';

// Add state for backend data
const [dashboardData, setDashboardData] = useState(null);
const [isLoading, setIsLoading] = useState(true);

// Fetch on mount
useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const data = await ApiClient.getHomeDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isAuthenticated) {
    fetchDashboard();
  }
}, [isAuthenticated]);

// Use dashboardData.hero.title, dashboardData.keyStats, etc.
```

**Option B - Complete Replacement:**
Use the simplified example and add back your animations gradually.

### Step 4: Update Onboarding Screens

**AddIncomeScreen:**
```typescript
import ApiClient from '../services/api';

const handleAddIncome = async () => {
  try {
    await ApiClient.addIncomeSource({
      source: 'Salary',
      amount: salaryAmount,
      frequency: 'monthly',
      isPrimary: true
    });
    
    // Navigate to next screen
    navigation.navigate('AddCards');
  } catch (error) {
    console.error('Error adding income:', error);
  }
};
```

**AddCardsScreen:**
```typescript
import ApiClient from '../services/api';

const handleAddCard = async () => {
  try {
    await ApiClient.addCreditCard({
      bankName: selectedBank,
      cardName: cardName,
      last4Digits: last4,
      network: cardNetwork,
      creditLimit: limit,
      currentBalance: balance,
      billingCycleDay: billingDay,
      annualFee: fee,
      rewardType: rewardType,
      rewardRate: rewardRate
    });
    
    // Update onboarding progress
    await ApiClient.updateOnboardingStep(3, 'completed');
    
    navigation.navigate('Home');
  } catch (error) {
    console.error('Error adding card:', error);
  }
};
```

### Step 5: Remove Mock Data (When Ready)

Once everything is working with real backend:

```bash
rm src/utils/mockData.ts
rm src/utils/scenarioDetector.ts
rm src/context/AuthContext.old.tsx
rm src/screens/HomeScreen.backend-example.tsx
```

## 📡 API Endpoints Available

All implemented in `src/services/api.ts`:

### Authentication
- `exchangeFirebaseToken(firebaseToken)` - Exchange Firebase token for JWT

### Profile
- `getProfile()` - Get user profile
- `updateProfile(data)` - Update profile
- `updateOnboardingStep(step, status)` - Track onboarding

### Income
- `getIncomeSources()` - List all income
- `addIncomeSource(data)` - Add new income
- `updateIncomeSource(id, data)` - Update income
- `deleteIncomeSource(id)` - Delete income

### Credit Cards
- `getCreditCards()` - List all cards
- `getCreditCard(id)` - Get single card
- `addCreditCard(data)` - Add new card
- `updateCreditCard(id, data)` - Update card
- `deleteCreditCard(id)` - Delete card

### Home Dashboard
- `getHomeDashboard()` - Get complete dashboard
- `refreshHomeDashboard()` - Force refresh

### Deals
- `getDeals(params)` - Browse deals
- `getDeal(id)` - Get deal details
- `getBestCardForDeal(dealId)` - Best card match
- `trackDealClick(dealId)` - Track clicks
- `trackDealRedemption(dealId)` - Track redemptions

### Recommendations
- `getCardRecommendations(params)` - Get recommendations
- `getCardRecommendation(id)` - Single recommendation
- `dismissRecommendation(id, reason)` - Dismiss
- `applyForRecommendation(id)` - Track application
- `refreshRecommendations()` - Generate fresh

### Market Cards
- `getMarketCards(params)` - Browse available cards
- `getMarketCard(id)` - Card details
- `compareMarketCards(cardIds)` - Compare cards

## 🧪 Testing the Integration

### 1. Start Backend Server
```bash
cd /Users/shishirsharma/Downloads/spurz-ai-backend
npx nodemon --exec "npx ts-node --transpile-only" src/server.ts
```

### 2. Test Backend Health
```bash
curl http://localhost:4000/health
```

### 3. Start React Native App
```bash
cd /Users/shishirsharma/Downloads/spurz-ai
npm start
```

### 4. Test Phone Auth Flow
1. Open app
2. Enter phone number
3. Receive OTP (check Firebase Console for test codes)
4. Verify OTP
5. Should exchange token with backend
6. Should load dashboard data

## 🐛 Common Issues

### Issue: "Firebase not initialized"
**Solution:** Check that firebase.ts config has real credentials

### Issue: "Network request failed"
**Solution:** 
- Ensure backend is running on port 4000
- For iOS simulator: Use `http://localhost:4000`
- For Android emulator: Use `http://10.0.2.2:4000`
- For physical device: Use your computer's IP (e.g., `http://192.168.1.x:4000`)

Update in `src/services/api.ts`:
```typescript
const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:4000'  // Android emulator
    : 'http://localhost:4000'  // iOS simulator
  : 'https://api.spurz.ai';
```

### Issue: "401 Unauthorized"
**Solution:** Token not set. Check that AuthContext successfully exchanges Firebase token.

### Issue: TypeScript errors in screens
**Solution:** Update type imports:
```typescript
// Remove old mock types
import { User, FinancialData } from '../types';

// Use backend response types (add to types/ folder)
```

## 📝 Next Steps

1. ✅ Set up Firebase credentials
2. ✅ Replace AuthContext
3. ✅ Test phone authentication
4. ✅ Update HomeScreen data fetching
5. ✅ Update onboarding screens
6. ✅ Test complete user flow
7. ✅ Remove mock data files
8. ✅ Deploy backend to production
9. ✅ Update API_BASE_URL for production

## 🚀 Deployment

### Backend
- Deploy to Railway, Render, or AWS
- Set environment variables
- Update Firebase allowed domains
- Update MongoDB IP whitelist

### Frontend
- Update API_BASE_URL in api.ts
- Build and submit to App Store/Play Store

## 📞 Support

If you encounter issues:
1. Check backend logs: Server should log all requests
2. Check frontend console: Look for API errors
3. Verify Firebase Console: Check authentication logs
4. Test API with curl/Postman first

---

**Status:** Backend 100% ready, Frontend foundation ready, Integration in progress
