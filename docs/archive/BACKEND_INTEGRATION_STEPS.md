# Backend Integration Complete - Next Steps

## ✅ Completed

1. **Firebase Configuration** - Added real credentials to `src/config/firebase.ts`
2. **AuthContext** - Replaced mock auth with real Firebase authentication
3. **Backend Server** - Running on `localhost:4000` with all API endpoints

## 🔄 Next Steps for Full Integration

### Step 1: Update Home Screen (Gradual Approach)

Your current `HomeScreen.tsx` is 1794 lines with complex animations. Here's how to integrate without breaking it:

**Option A: Keep UI, Replace Data Source**

Find this section in `HomeScreen.tsx` (around line 300-400):
```typescript
// Replace mock data imports with:
import ApiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

// In your component:
const { user, isAuthenticated } = useAuth();
const [dashboardData, setDashboardData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const data = await ApiClient.getHomeDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    fetchDashboard();
  }
}, [isAuthenticated]);
```

**Option B: Use Simple Backend Example**

We created `src/screens/HomeScreen.backend-example.tsx` - you can:
1. Rename current HomeScreen to `HomeScreen.animated.tsx`
2. Use the example temporarily
3. Gradually port animations back

### Step 2: Update Onboarding Screens

**AddIncomeScreen.tsx:**
```typescript
import ApiClient from '../services/api';

// When user submits income:
const handleAddIncome = async () => {
  try {
    await ApiClient.addIncomeSource({
      source: incomeName,
      amount: incomeAmount,
      frequency: 'monthly',
      type: 'salary'
    });
    navigation.navigate('AddCards');
  } catch (error) {
    Alert.alert('Error', 'Failed to add income');
  }
};
```

**AddCardsScreen.tsx:**
```typescript
import ApiClient from '../services/api';

// When user adds card:
const handleAddCard = async () => {
  try {
    await ApiClient.addCreditCard({
      bankName,
      cardName,
      last4Digits,
      network: 'visa',
      creditLimit,
      currentBalance: 0,
      billingCycleDay: 1
    });
    navigation.navigate('Home');
  } catch (error) {
    Alert.alert('Error', 'Failed to add card');
  }
};
```

### Step 3: Start Backend Server

**IMPORTANT:** You must keep the backend server running

```bash
# Open a NEW terminal (not in VS Code)
cd /Users/shishirsharma/Downloads/spurz-ai-backend
npm run dev
```

Keep that terminal open. Server logs will show:
```
✅ Server running on port 4000
✅ MongoDB connected successfully
```

### Step 4: Test Authentication Flow

1. **Run the app:** `npx expo start`
2. **Login Screen:** Enter phone number (use real number for testing)
3. **Enter OTP:** Check your SMS for Firebase verification code
4. **Backend creates profile:** Automatically happens after OTP verification
5. **Onboarding:** Add income → Add cards → Dashboard

### Step 5: Remove Mock Data (When Ready)

Once everything works:
```bash
rm src/utils/mockData.ts
rm src/utils/scenarioDetector.ts
rm src/context/AuthContext.old.backup
```

## 🐛 Common Issues

**Issue:** "Cannot connect to localhost:4000"
**Fix:** Make sure backend server is running in separate terminal

**Issue:** "Firebase phone auth not working"
**Fix:** Enable Phone Authentication in Firebase Console

**Issue:** "Token expired"
**Fix:** Firebase tokens expire after 1 hour. Logout and login again.

## 📱 Testing Network Config

- **iOS Simulator:** `http://localhost:4000` ✅
- **Android Emulator:** `http://10.0.2.2:4000`
- **Physical Device:** `http://YOUR_COMPUTER_IP:4000`

Update in `src/services/api.ts` if needed.

## 🚀 Ready for Production

When ready to deploy:
1. Deploy backend to Railway/Render/AWS
2. Update `API_BASE_URL` in `src/services/api.ts`
3. Build app with `eas build`
4. Submit to app stores

---

**Current Status:**
- ✅ Backend: 100% Complete
- ✅ API Client: Ready
- ✅ Auth: Integrated
- ⚠️ HomeScreen: Needs data source update
- ⚠️ Onboarding: Needs API calls added

**Next Action:** Start backend server, then decide on HomeScreen integration approach (gradual vs complete replacement).
