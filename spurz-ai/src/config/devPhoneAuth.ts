/**
 * Development Phone Auth Helper
 * Works with Firebase test phone numbers in Expo Go
 */

import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// Map of test phone numbers to email equivalents (for development only)
const TEST_PHONE_NUMBERS: { [key: string]: { email: string; password: string } } = {
  '+917503337817': { email: 'test7503337817@spurz.dev', password: 'test123456' },
  '+911234567890': { email: 'test1234567890@spurz.dev', password: 'test123456' },
  '+919876543210': { email: 'test9876543210@spurz.dev', password: 'test123456' },
};

/**
 * Send OTP - For development, just stores the phone number
 */
export async function devSendOTP(phoneNumber: string): Promise<void> {
  console.log('🔵 [DEV MODE] Sending OTP to:', phoneNumber);
  
  if (!TEST_PHONE_NUMBERS[phoneNumber]) {
    throw new Error(`Phone number ${phoneNumber} not configured as test number. Add it to TEST_PHONE_NUMBERS in devPhoneAuth.ts`);
  }
  
  console.log('✅ [DEV MODE] Ready for OTP. Use any 6-digit code (e.g., 123456)');
}

/**
 * Verify OTP - For development, signs in with email/password
 */
export async function devVerifyOTP(phoneNumber: string, code: string): Promise<boolean> {
  console.log('🔵 [DEV MODE] Verifying OTP for:', phoneNumber);
  console.log('Code:', code);
  
  if (code.length !== 6) {
    throw new Error('OTP must be 6 digits');
  }
  
  const testAccount = TEST_PHONE_NUMBERS[phoneNumber];
  if (!testAccount) {
    throw new Error('Phone number not configured as test number');
  }
  
  try {
    // Try to sign in with existing account
    const userCredential = await signInWithEmailAndPassword(auth, testAccount.email, testAccount.password);
    console.log('✅ [DEV MODE] Signed in with existing account');
    
    // Update display name to phone number if not set
    if (userCredential.user && !userCredential.user.displayName) {
      await updateProfile(userCredential.user, {
        displayName: phoneNumber
      });
      await userCredential.user.reload();
      console.log('📝 [DEV MODE] Updated profile with phone number');
    }
    
    return true;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      // Create new account
      try {
        console.log('📝 [DEV MODE] Creating new account...');
        const userCredential = await createUserWithEmailAndPassword(auth, testAccount.email, testAccount.password);
        
        // Set display name to phone number BEFORE resolving
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: phoneNumber
          });
          console.log('📝 [DEV MODE] Set phone number as display name');
          
          // Force token refresh to include updated profile
          await userCredential.user.reload();
        }
        
        console.log('✅ [DEV MODE] Account created and signed in');
        return true;
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          // Account exists but wrong password, try signing in again
          console.log('🔄 [DEV MODE] Account exists, attempting sign in...');
          const userCredential = await signInWithEmailAndPassword(auth, testAccount.email, testAccount.password);
          
          // Update display name to phone number if not set
          if (userCredential.user && !userCredential.user.displayName) {
            await updateProfile(userCredential.user, {
              displayName: phoneNumber
            });
            await userCredential.user.reload();
            console.log('📝 [DEV MODE] Updated profile with phone number');
          }
          
          console.log('✅ [DEV MODE] Signed in successfully');
          return true;
        }
        throw createError;
      }
    }
    
    // For wrong password or other errors
    if (error.code === 'auth/wrong-password') {
      throw new Error('Account exists with different credentials. Please contact support.');
    }
    
    throw error;
  }
}

/**
 * Check if phone number is a test number
 */
export function isTestPhoneNumber(phoneNumber: string): boolean {
  return phoneNumber in TEST_PHONE_NUMBERS;
}
