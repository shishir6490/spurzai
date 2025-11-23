# Quick Steps to Get Google Client ID

## Step 1: Go to Firebase Console
Visit: https://console.firebase.google.com/project/spurz-ai/authentication/providers

## Step 2: Enable Google Sign-In
1. Click on **Google** in the provider list
2. Toggle the **Enable** switch
3. Add your support email: `shishirsharma@example.com` (or your email)
4. Click **Save**

## Step 3: Get Web Client ID
After enabling, you'll see a section called **Web SDK configuration**. 

Click to expand it, and you'll see:
```
Web client ID: 366879447090-XXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

Copy the entire string.

## Step 4: Update SignupScreen.tsx

Find this section in `/src/screens/SignupScreen.tsx` (around line 40):

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: '366879447090-YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: '366879447090-YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: '366879447090-5rkqe8c5r5q5q5q5q5q5q5q5q5q5.apps.googleusercontent.com',
});
```

Replace it with:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: 'PASTE_YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com',
});
```

**Note:** For basic implementation, you only need the `webClientId`. The iOS and Android client IDs are optional and only needed for standalone apps.

## Step 5: Test

```bash
cd /Users/shishirsharma/Downloads/spurz/spurz-ai
npx expo start
```

1. Open the app
2. Tap **Get Started**
3. Tap **Continue with Google**
4. Select your Google account
5. Should redirect back to app and log you in!

## Quick Test Script

```bash
# If you want to test in development build:
npx expo run:ios
```

---

**That's it!** Just get the Web Client ID from Firebase and paste it in the code. Everything else is already configured.
