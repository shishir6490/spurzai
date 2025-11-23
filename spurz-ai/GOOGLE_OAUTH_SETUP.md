# Google OAuth Setup Guide for Spurz AI

## Overview
This guide will help you configure Google Sign-In for your Spurz AI app using Firebase Authentication.

## Prerequisites
- Firebase project already created (spurz-ai)
- Firebase Authentication enabled
- Expo project configured

## Step 1: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **spurz-ai**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Toggle **Enable** switch
6. Add your support email (required)
7. Click **Save**

## Step 2: Get OAuth Client IDs

### For Web Client ID (Required for iOS/Android)

1. In Firebase Console, under **Authentication** → **Sign-in method** → **Google**
2. Expand the **Web SDK configuration** section
3. Copy the **Web client ID** (looks like: `366879447090-xxxxxxxxxxxxx.apps.googleusercontent.com`)

### For iOS Client ID (Optional - for standalone app)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Credentials**
4. Look for **iOS client** (if exists) or create a new one:
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Choose **iOS** as application type
   - Enter bundle identifier: `com.spurzai.app` (or your bundle ID from app.json)
   - Click **Create**
5. Copy the **Client ID**

### For Android Client ID (Optional - for standalone app)

1. In the same **Credentials** page
2. Look for **Android client** or create new:
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Choose **Android** as application type
   - Enter package name: `com.spurzai.app`
   - Get SHA-1 fingerprint:
     ```bash
     # For development
     keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android | grep SHA1
     
     # For production
     keytool -keystore path/to/your/keystore -list -v | grep SHA1
     ```
   - Enter SHA-1 certificate fingerprint
   - Click **Create**
3. Copy the **Client ID**

## Step 3: Configure Expo App

### Update SignupScreen.tsx with your Client IDs

Open `/src/screens/SignupScreen.tsx` and replace the placeholder client IDs:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // This is required!
});
```

**Important:** The `webClientId` is **required** even for mobile apps. This is the Web client ID from Firebase.

### Current Configuration
Your Firebase project details:
- **Project ID:** spurz-ai
- **App ID:** 1:366879447090:web:5db4f6eb123eb3744e842b
- **Messaging Sender ID:** 366879447090

You need to get the Web Client ID from Firebase Console and update the code.

## Step 4: Add URL Scheme (Required for iOS)

### Update app.json

Add the URL scheme for Google OAuth callback:

```json
{
  "expo": {
    "scheme": "spurzai",
    "ios": {
      "bundleIdentifier": "com.spurzai.app",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID"]
          }
        ]
      }
    }
  }
}
```

The reversed client ID format: If your iOS client ID is `123456-abc.apps.googleusercontent.com`, 
the reversed scheme is `com.googleusercontent.apps.123456-abc`

## Step 5: Test Google Sign-In

### For Development (Expo Go)

```bash
cd /Users/shishirsharma/Downloads/spurz/spurz-ai
npx expo start
```

**Note:** Google OAuth in Expo Go has limitations. For full testing, use a development build.

### For Development Build (Recommended)

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Step 6: Verify Implementation

1. Launch the app
2. Tap **Get Started** on the landing screen
3. Tap **Continue with Google**
4. Should open Google sign-in web browser
5. Select your Google account
6. Should redirect back to app
7. Should see "Google Sign-In Success" in console
8. Should navigate to EmailPermission screen (new user) or Home (existing user)

## Troubleshooting

### Error: "Invalid client ID"
- Make sure you copied the correct Web Client ID from Firebase
- Verify the client ID includes `.apps.googleusercontent.com` suffix

### Error: "redirect_uri_mismatch"
- Add the correct redirect URI in Google Cloud Console
- For Expo: `https://auth.expo.io/@your-username/spurz-ai`
- For standalone app: Use the custom scheme

### Error: "Unable to open browser"
- Make sure `expo-web-browser` is installed
- Run `npm install expo-web-browser`

### Google sign-in web page doesn't open
- Check if `WebBrowser.maybeCompleteAuthSession()` is called
- Verify URL scheme is configured correctly

### Authentication succeeds but doesn't navigate
- Check Firebase Auth rules
- Verify user object is returned correctly
- Check console logs for errors

## Firebase Authentication Flow

1. User taps "Continue with Google"
2. `promptAsync()` opens Google OAuth in web browser
3. User selects Google account and grants permissions
4. Browser redirects back to app with authorization code
5. `expo-auth-session` captures the response
6. App receives `idToken` from Google
7. Create Firebase credential with `GoogleAuthProvider.credential(idToken)`
8. Sign in to Firebase with `signInWithCredential(auth, credential)`
9. Firebase returns user object
10. Navigate based on whether user is new or existing

## Next Steps

1. **Get your Web Client ID** from Firebase Console
2. **Update SignupScreen.tsx** with the correct client IDs
3. **Test on a real device** or development build
4. **Set up custom domain** for production (optional)
5. **Configure OAuth consent screen** in Google Cloud Console

## Production Checklist

- [ ] Enable Google Sign-In in Firebase Console
- [ ] Get all client IDs (Web, iOS, Android)
- [ ] Update app.json with correct URL schemes
- [ ] Configure OAuth consent screen in Google Cloud Console
- [ ] Add authorized domains in Firebase Console
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Verify user data is saved correctly
- [ ] Test existing user sign-in flow
- [ ] Test new user sign-up flow

## Resources

- [Firebase Authentication - Google](https://firebase.google.com/docs/auth/web/google-signin)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Expo Google Sign-In](https://docs.expo.dev/guides/google-authentication/)

---

**Note:** This implementation uses Firebase Authentication with Google OAuth. The flow is production-ready but requires proper client ID configuration.
