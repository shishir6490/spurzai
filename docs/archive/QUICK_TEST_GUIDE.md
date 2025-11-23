# 📱 Quick Test Guide - Firebase Phone Auth

## 🎯 Current Status

✅ AuthContext using Firebase Web SDK  
✅ Backend server running on port 4000  
⚠️ **Firebase Phone Auth requires test numbers for Expo Go**

---

## 🚀 Quick Test Steps (5 Minutes)

### Step 1: Add Test Phone Number to Firebase

1. Open: https://console.firebase.google.com/u/0/project/spurz-ai/authentication/providers
2. Click **Phone** provider
3. Scroll to **"Phone numbers for testing"**
4. Click **Add phone number**
5. Add:
   - Phone number: `+911234567890`
   - Test code: `123456`
6. Click **Save**

### Step 2: Start Backend (if not running)

```bash
cd /Users/shishirsharma/Downloads/spurz-ai-backend
npm run dev
```

Wait for: `✅ Server running on port 4000`

### Step 3: Start Frontend

```bash
cd /Users/shishirsharma/Downloads/spurz-ai
npx expo start
```

### Step 4: Test Login Flow

1. **Open in Expo Go** (scan QR code)
2. **Tap "Get Started"** or "Login"
3. **Enter phone: `+911234567890`**
4. **Tap "Send OTP"** or "Create Account"
5. Watch terminal for logs:
   ```
   🔵 Sending OTP to: +911234567890
   ```
6. **Enter OTP: `123456`**
7. Watch terminal for:
   ```
   🔵 Verifying OTP code
   ✅ OTP verified successfully
   ```
8. **Should navigate to HomeScreen!** 🎉

---

## 📝 What to Check

### ✅ Success Indicators:

**In Terminal:**
```
🔵 Sending OTP to: +911234567890
✅ OTP sent successfully
🔵 Verifying OTP code
✅ OTP verified successfully
```

**In App:**
- OTP screen appears
- Enter 123456
- Navigates to ManualDataCollection (signup) or HomeScreen (login)
- Shows your phone number in profile

### ❌ Error Indicators:

**"auth/missing-app-credential"**
- Cause: reCAPTCHA required
- Fix: Use test phone number (+911234567890)

**"auth/invalid-phone-number"**
- Cause: Wrong format
- Fix: Must start with `+91`

**"auth/invalid-verification-code"**
- Cause: Wrong OTP
- Fix: For test number +911234567890, OTP is **123456**

**"Cannot connect to backend"**
- Cause: Backend not running
- Fix: Start backend on port 4000

---

## 🧪 Test Scenarios

### Scenario 1: New User Signup

```
1. Enter: +911234567890
2. Tap: "Create New Account"
3. Enter OTP: 123456
4. → Should go to ManualDataCollectionScreen
5. Add income and cards
6. → Should go to HomeScreen with YOUR data
```

### Scenario 2: Existing User Login

```
1. Enter: +911234567890
2. Tap: "Login" (if already signed up before)
3. Enter OTP: 123456
4. → Should go directly to HomeScreen
```

### Scenario 3: Invalid OTP

```
1. Enter: +911234567890
2. Tap: Send OTP
3. Enter OTP: 111111 (wrong)
4. → Should show error: "Invalid OTP code"
```

### Scenario 4: Resend OTP

```
1. Enter: +911234567890
2. Tap: Send OTP
3. Wait for timer (60 seconds)
4. Tap: "Resend OTP"
5. Enter OTP: 123456
6. → Should work
```

---

## 🔍 Debug Checklist

If OTP not working, check:

### 1. Firebase Console
- [ ] Phone authentication enabled
- [ ] Test phone number added (+911234567890 → 123456)
- [ ] Project ID matches: `spurz-ai`

### 2. Backend Server
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Firebase Config
Check `src/config/firebase.ts`:
```typescript
projectId: "spurz-ai"  // ✅ Must match Firebase project
apiKey: "AIzaSyCThNe8EX33Rh9ZNoP7LKh3K0hfKKsjjow"  // ✅ Correct
```

### 4. Metro Bundler
- [ ] No red errors in terminal
- [ ] Bundle loaded successfully
- [ ] Console logs visible

### 5. App Logs
Press **`Cmd + D`** (iOS) or **`Cmd + M`** (Android) in Expo Go:
- Open Chrome DevTools
- Check Console for errors
- Look for 🔵 and ✅ log messages

---

## 🎯 Expected Logs

### Successful Flow:

```
[Frontend] 🔵 Sending OTP to: +911234567890
[Frontend] ✅ OTP sent successfully
[User enters 123456]
[Frontend] 🔵 Verifying OTP code
[Frontend] ✅ OTP verified successfully
[Frontend] Exchanging Firebase token...
[Backend] POST /auth/exchange 200
[Frontend] ✅ User authenticated
[Frontend] Navigating to HomeScreen
```

### Failed Flow (Wrong OTP):

```
[Frontend] 🔵 Sending OTP to: +911234567890
[Frontend] ✅ OTP sent successfully
[User enters 111111]
[Frontend] 🔵 Verifying OTP code
[Frontend] ❌ Error verifying OTP: [auth/invalid-verification-code] Invalid OTP code
```

---

## 🐛 Common Issues

### Issue 1: "No logs appearing"

**Problem:** Console.log not showing  
**Solution:**
1. Open Expo DevTools in browser
2. Or shake device → "Show Performance Monitor"
3. Or use React Native Debugger

### Issue 2: "Stuck on sending OTP"

**Problem:** Firebase request hanging  
**Causes:**
- Internet connection issue
- Firebase project misconfigured
- Wrong phone format

**Solution:**
```typescript
// Check phone format
console.log('Phone:', phoneNumber);  
// Must be: +911234567890 (with + and country code)
```

### Issue 3: "Backend not responding"

**Problem:** API calls failing  
**Solution:**
```bash
# Check backend is running
curl http://localhost:4000/health

# Check API base URL
# In src/services/api.ts:
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:4000'  // ✅ For iOS simulator
  : 'http://10.0.2.2:4000';  // For Android emulator
```

**For physical device:**
```typescript
// Find your computer's IP:
ipconfig getifaddr en0  // macOS
// Update API_BASE_URL to: http://YOUR_IP:4000
```

---

## 📞 Test Phone Numbers

Add more test numbers if needed:

| Phone | OTP | Purpose |
|-------|-----|---------|
| +911234567890 | 123456 | Primary test |
| +919876543210 | 654321 | Secondary test |
| +911111111111 | 111111 | Alt test 1 |
| +919999999999 | 999999 | Alt test 2 |

Add in Firebase: https://console.firebase.google.com/u/0/project/spurz-ai/authentication/providers

---

## ✅ Success Criteria

Your login flow is working when:

1. ✅ Enter test phone number
2. ✅ See "OTP sent successfully" log
3. ✅ Enter test OTP (123456)
4. ✅ See "OTP verified successfully" log
5. ✅ Backend creates user profile
6. ✅ Navigate to HomeScreen
7. ✅ See your name and real data

---

## 🎉 Next Steps After Testing

Once test numbers work:

### For Real Phone Numbers:
1. Build with EAS development client
2. Install on physical device
3. Real SMS will work!

### Continue Development:
1. Keep using test numbers
2. Integrate other screens (Cards, Deals, Profile)
3. Test all features with test account
4. Build for production when ready

---

## 📚 More Info

- Full setup guide: `FIREBASE_PHONE_AUTH_SETUP.md`
- Integration docs: `INTEGRATION_COMPLETE.md`
- Backend docs: `BACKEND_INTEGRATION_STEPS.md`
