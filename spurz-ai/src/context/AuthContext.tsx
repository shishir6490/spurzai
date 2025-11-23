/**
 * Auth Context - Real Backend Integration
 * Connects to Firebase Authentication and Spurz.ai Backend
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import ApiClient from '../services/api';
import { devSendOTP, devVerifyOTP } from '../config/devPhoneAuth';

interface User {
  id: string;
  firebaseUid: string;
  phoneNumber: string;
  email?: string;
  fullName?: string;
  onboardingStatus: string;
  onboardingStep: number;
  createdAt: string;
}

interface AuthContextType {
  // User state
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
  
  // Store confirmation result in ref to avoid navigation serialization issues
  const confirmationRef = React.useRef<any>(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          console.log('🔵 Firebase user authenticated:', fbUser.uid);
          console.log('📱 Display name (phone):', fbUser.displayName);
          console.log('📧 Email:', fbUser.email);
          
          // Get Firebase ID token
          const idToken = await fbUser.getIdToken();
          
          console.log('🔑 Exchanging Firebase token with backend...');
          
          // Set Firebase token as auth token for API calls
          ApiClient.setAuthToken(idToken);
          setJwtToken(idToken);
          
          // Exchange token with backend (creates/updates user in MongoDB)
          try {
            const response = await ApiClient.exchangeFirebaseToken(idToken, fbUser);
            
            console.log('✅ Backend user created/verified');
            console.log('👤 User:', response.user);
            console.log('📋 Profile:', response.profile);
            
            // Merge backend user data with Firebase user
            const userData = {
              ...response.user,
              ...response.profile,
            };
            
            // Set user from backend response
            setUser(userData);
          } catch (backendError) {
            console.error('❌ Error exchanging Firebase token:', backendError);
            console.log('⚠️ Using Firebase user data as fallback');
            
            // Use Firebase user as fallback if backend fails
            const fallbackUser = {
              uid: fbUser.uid,
              phoneNumber: fbUser.phoneNumber || fbUser.displayName || '',
              email: fbUser.email || '',
              displayName: fbUser.displayName || '',
              fullName: fbUser.displayName || '',
              isNewUser: fbUser.metadata?.creationTime === fbUser.metadata?.lastSignInTime,
            };
            
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error('❌ Critical auth error:', error);
          setUser(null);
          setJwtToken(null);
        }
      } else {
        setUser(null);
        setJwtToken(null);
        ApiClient.setAuthToken(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Send OTP to phone number
   * Development mode: Uses email/password auth behind the scenes
   */
  const sendOTP = useCallback(async (phoneNumber: string): Promise<void> => {
    // Don't set global isLoading to avoid navigation issues
    try {
      // Format phone number for Firebase (ensure it starts with +)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Store phone number for verification (both in state and ref)
      setPendingPhoneNumber(formattedPhone);
      confirmationRef.current = { phoneNumber: formattedPhone };
      
      // Use development helper
      await devSendOTP(formattedPhone);
      
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      throw error;
    }
  }, []);

  /**
   * Verify OTP code
   * Development mode: Uses email/password auth behind the scenes
   */
  const verifyOTP = useCallback(
    async (code: string): Promise<boolean> => {
      // Don't set global isLoading to avoid navigation issues
      try {
        // Get phone number from ref or state (fallback to state if ref is lost)
        const phoneNumber = confirmationRef.current?.phoneNumber || pendingPhoneNumber;
        
        if (!phoneNumber) {
          throw new Error('No phone number found. Please send OTP first.');
        }
        
        // Use development helper (it will log internally)
        await devVerifyOTP(phoneNumber, code);
        
        // Clear stored phone number
        confirmationRef.current = null;
        setPendingPhoneNumber(null);
        
        // Firebase auth state listener will handle token exchange
        return true;
      } catch (error: any) {
        console.error('❌ Error verifying OTP:', error);
        throw error;
      }
    },
    [pendingPhoneNumber]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
      setUser(null);
      setFirebaseUser(null);
      setJwtToken(null);
      ApiClient.setAuthToken(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh user profile from backend
   */
  const refreshUser = useCallback(async () => {
    if (!jwtToken) return;
    
    try {
      const profile = await ApiClient.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [jwtToken]);

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!user && !!firebaseUser,
    sendOTP,
    verifyOTP,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
