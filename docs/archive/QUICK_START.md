# 🚀 Quick Start Guide - Frontend Integration

## ⚡ 3 Steps to Get Running

### 1️⃣ Firebase Setup (2 minutes)

```bash
# 1. Go to: https://console.firebase.google.com/
# 2. Copy your config to: src/config/firebase.ts
# 3. Enable Phone Auth in Firebase Console
```

### 2️⃣ Replace Auth (30 seconds)

```bash
cd /Users/shishirsharma/Downloads/spurz-ai
mv src/context/AuthContext.tsx src/context/AuthContext.old.tsx
mv src/context/AuthContext.new.tsx src/context/AuthContext.tsx
```

### 3️⃣ Start Everything

**Terminal 1 - Backend:**
```bash
cd /Users/shishirsharma/Downloads/spurz-ai-backend
npx nodemon --exec "npx ts-node --transpile-only" src/server.ts
```

**Terminal 2 - Frontend:**
```bash
cd /Users/shishirsharma/Downloads/spurz-ai
npm start
```

---

## 📱 Update Your Screens

### HomeScreen - Replace Mock Data

```typescript
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';

const [dashboardData, setDashboardData] = useState(null);

useEffect(() => {
  const fetch = async () => {
    const data = await ApiClient.getHomeDashboard();
    setDashboardData(data);
  };
  fetch();
}, []);

// Use: dashboardData.hero.title
//      dashboardData.keyStats
//      dashboardData.insights
```

### Add Income Screen

```typescript
import ApiClient from '../services/api';

const handleSubmit = async () => {
  await ApiClient.addIncomeSource({
    source: 'Salary',
    amount: amount,
    frequency: 'monthly',
    isPrimary: true
  });
  navigation.navigate('NextScreen');
};
```

### Add Card Screen

```typescript
import ApiClient from '../services/api';

const handleSubmit = async () => {
  await ApiClient.addCreditCard({
    bankName: bank,
    cardName: name,
    last4Digits: last4,
    network: network,
    creditLimit: limit,
    currentBalance: balance,
    billingCycleDay: day
  });
  navigation.navigate('Home');
};
```

---

## 🔍 Test Backend

```bash
# Health check
curl http://localhost:4000/health

# Test auth (after login)
curl http://localhost:4000/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🐛 Common Fixes

**Issue:** Can't connect to backend from app

**Android Emulator:**
```typescript
// In src/services/api.ts
const API_BASE_URL = 'http://10.0.2.2:4000';
```

**Physical Device:**
```typescript
// Use your computer's IP
const API_BASE_URL = 'http://192.168.1.X:4000';
```

---

## 📚 Full Documentation

- **Complete Guide:** `/Users/shishirsharma/Downloads/spurz-ai/FRONTEND_INTEGRATION_GUIDE.md`
- **Backend Summary:** `/Users/shishirsharma/Downloads/spurz-ai-backend/COMPLETE_PROJECT_SUMMARY.md`
- **API Client:** `/Users/shishirsharma/Downloads/spurz-ai/src/services/api.ts`

---

## ✅ All Backend Endpoints Ready

**Auth:** /auth/exchange  
**Profile:** /profile (GET/PATCH), /profile/onboarding (POST)  
**Income:** /income (GET/POST/PUT/DELETE)  
**Cards:** /cards (GET/POST/PATCH/DELETE)  
**Home:** /home (GET), /home/refresh (POST)  
**Deals:** /deals (GET), /deals/:id (GET)  
**Recommendations:** /recommendations/cards (GET)  
**Market:** /market-cards (GET)

---

**Status:** ✅ Backend running | ⚠️ Frontend needs Firebase config | 📝 Integration guide ready
