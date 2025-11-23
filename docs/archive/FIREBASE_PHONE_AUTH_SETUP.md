# 🔥 Firebase Phone Authentication Setup for Expo

## ⚠️ Issue: Firebase Phone Auth + Expo

Firebase Web SDK phone authentication requires **reCAPTCHA verification**, which doesn't work in React Native/Expo Go environment.

## 🎯 Solutions (Choose One)

### Option 1: Use Test Phone Numbers (Development) ⭐ RECOMMENDED FOR NOW

This is the **easiest way** to test your app immediately:

#### Step 1: Enable Test Phone Numbers in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **spurz-ai**
3. Go to **Authentication** → **Sign-in method**
4. Scroll to **Phone** → Click **Edit**
5. Scroll to **Phone numbers for testing**
6. Add test numbers (no SMS will be sent):

```
Phone Number: +911234567890
Verification Code: 123456

Phone Number: +919876543210  
Verification Code: 123456
```

#### Step 2: Use in Your App

```typescript
// In LoginScreen, enter: +911234567890
// In OTPVerificationScreen, enter: 123456
// ✅ Works instantly without SMS!
```

**Pros:**
- ✅ Works immediately in Expo Go
- ✅ No SMS costs
- ✅ No reCAPTCHA needed
- ✅ Perfect for development

**Cons:**
- ❌ Only works with pre-configured numbers
- ❌ Can't test with real phone numbers

---

### Option 2: Build with EAS (Production-Ready)

For **real phone numbers** with actual SMS:

#### Step 1: Create Development Build

```bash
cd /Users/shishirsharma/Downloads/spurz-ai

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Create development build for Android (faster)
eas build --profile development --platform android

# Or for iOS
eas build --profile development --platform ios
```

#### Step 2: Install the Development Build

After build completes (~15 mins):
- Download the APK (Android) or install via TestFlight (iOS)
- Install on your physical device
- Run: `npx expo start --dev-client`
- Real SMS will work!

**Pros:**
- ✅ Real SMS to any phone number
- ✅ No test numbers needed
- ✅ Production-ready

**Cons:**
- ❌ Takes 15-20 mins to build
- ❌ Need to rebuild after certain changes

---

### Option 3: Use Backend OTP Service (Alternative)

Skip Firebase phone auth, use Twilio/AWS SNS directly from your backend:

#### Backend Implementation:
```typescript
// In spurz-ai-backend/src/services/otp.service.ts
import twilio from 'twilio';

const client = twilio(TWILIO_SID, TWILIO_TOKEN);

export async function sendOTP(phone: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  await client.messages.create({
    body: `Your Spurz.ai OTP is: ${otp}`,
    from: TWILIO_PHONE,
    to: phone
  });
  
  // Store OTP in Redis/MongoDB with expiry
  await storeOTP(phone, otp, 5 * 60); // 5 min expiry
  
  return otp;
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  const storedOTP = await getOTP(phone);
  return storedOTP === code;
}
```

#### Frontend Changes:
```typescript
// In AuthContext.tsx - replace Firebase with backend
const sendOTP = async (phoneNumber: string) => {
  const response = await ApiClient.post('/auth/send-otp', { phoneNumber });
  return response.sessionId;
};

const verifyOTP = async (sessionId: string, code: string) => {
  const response = await ApiClient.post('/auth/verify-otp', { 
    sessionId, 
    code 
  });
  return response.token; // Backend returns JWT directly
};
```

**Pros:**
- ✅ Works in Expo Go
- ✅ Full control over OTP flow
- ✅ Can customize SMS message
- ✅ No Firebase phone auth needed

**Cons:**
- ❌ Additional cost (Twilio/AWS SNS)
- ❌ Need to implement OTP storage/expiry
- ❌ More backend code

---

## 🚀 Quick Start: Test Phone Numbers (Recommended Now)

### 1. Configure Firebase Test Numbers

Go to Firebase Console:
```
Authentication → Sign-in method → Phone → Phone numbers for testing
```

Add:
- `+911234567890` → `123456`
- `+919876543210` → `654321`

### 2. Test in Your App

```bash
# Start your app
cd /Users/shishirsharma/Downloads/spurz-ai
npx expo start
```

Open in Expo Go and:
1. Enter phone: `+911234567890`
2. Tap "Send OTP"
3. Enter OTP: `123456`
4. ✅ Should verify and login!

### 3. Check Logs

You should see in terminal:
```
🔵 Sending OTP to: +911234567890
✅ OTP sent successfully
🔵 Verifying OTP code
✅ OTP verified successfully
```

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/missing-app-credential)"

This means reCAPTCHA is required. **Use test phone numbers** instead.

### "Firebase: Error (auth/invalid-verification-code)"

The OTP you entered doesn't match. For test numbers:
- Phone: `+911234567890` → OTP: `123456`

### "No logs in terminal when sending OTP"

Check:
1. Is backend server running on port 4000?
   ```bash
   curl http://localhost:4000/health
   ```

2. Check for errors in Metro bundler terminal

3. Enable debug logs in AuthContext:
   ```typescript
   console.log('🔵 Sending OTP to:', formattedPhone);
   ```

### "SMS not received on real phone"

Firebase Web SDK in Expo Go **cannot send real SMS**. You need:
- Option 1: Use test phone numbers
- Option 2: Build with EAS dev client
- Option 3: Use backend OTP service

---

## 📱 Current Limitations with Expo Go

Firebase Web SDK in Expo Go:
- ❌ Cannot send real SMS
- ❌ reCAPTCHA doesn't render properly
- ✅ Test phone numbers work perfectly
- ✅ All other Firebase features work (auth state, tokens, etc.)

---

## 🎯 Recommended Path

### Phase 1: Development (Now)
**Use Firebase Test Phone Numbers**
- Fast iteration
- No SMS costs
- Works in Expo Go
- Perfect for UI/UX testing

### Phase 2: Beta Testing (Later)
**Build with EAS Development Client**
- Real SMS to any number
- Test with beta users
- Production-like environment

### Phase 3: Production (Final)
**Production EAS Build**
- Submit to app stores
- Real SMS verification
- Full Firebase features

---

## 🔧 Next Steps

1. **Add test phone numbers to Firebase** (2 minutes)
2. **Test login flow** with test numbers (5 minutes)
3. **Continue building features** (use test numbers)
4. **Build with EAS** when ready for real testing (15 minutes)

---

## 📞 Test Phone Numbers Cheat Sheet

Add these to Firebase Console → Authentication → Phone for testing:

```
+911234567890 → 123456 (Primary test number)
+919876543210 → 654321 (Secondary test number)
+911111111111 → 111111 (Alternative)
+919999999999 → 999999 (Alternative)
```

Then use in app - no real SMS needed! 🎉
