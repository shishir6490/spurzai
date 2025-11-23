import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticFeedback } from '@utils/haptics';
import { useAuth } from '@context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

// Complete WebBrowser auth session
WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { loginWithPhone } = useAuth();
  const [signupMethod, setSignupMethod] = useState<'phone' | 'email' | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Google OAuth configuration - using clientId for Expo
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '366879447090-bn1mt2b7hm589t7cfoqodfo9iucsn2em.apps.googleusercontent.com',
  });
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePhoneSignup = async () => {
    hapticFeedback.medium();
    if (phone.length >= 10) {
      setLoading(true);
      // Simulate phone signup delay
      await new Promise(resolve => setTimeout(resolve, 800));
      // Navigate to OTP screen for signup
      navigation.navigate('OTPVerification', { phone, isSignup: true });
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    hapticFeedback.medium();
    if (email.includes('@')) {
      setLoading(true);
      // Simulate email signup delay
      await new Promise(resolve => setTimeout(resolve, 800));
      // Navigate to OTP screen for signup with email notification
      navigation.navigate('OTPVerification', { 
        phone: email, 
        isSignup: true,
        email: email, // Pass email so EmailPermissionScreen can skip
        signupMethod: 'email'
      });
      setLoading(false);
    }
  };

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        handleGoogleLogin(authentication.idToken);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      
      // Create Firebase credential from Google ID token
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in with credential
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
      
      console.log('Google Sign-In Success:', user.email);
      
      // Navigate to home or complete profile
      // Check if user is new (result.additionalUserInfo?.isNewUser)
      if (result.additionalUserInfo?.isNewUser) {
        // New user - collect additional info
        navigation.navigate('EmailPermission', {
          userId: user.uid,
          email: user.email,
          signupMethod: 'google'
        });
      } else {
        // Existing user - go to home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert(
        'Authentication Failed',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    hapticFeedback.medium();
    
    // For Expo Go, show alert about OAuth limitations
    Alert.alert(
      'Google Sign-In Setup Required',
      'Google OAuth requires additional configuration in Google Cloud Console.\n\n' +
      'Please add this redirect URI:\n' +
      'https://auth.expo.io/@shishir6490/spurz-ai\n\n' +
      'Or use Phone/Email signup for now.',
      [
        { text: 'Use Phone Signup', onPress: () => setSignupMethod('phone') },
        { 
          text: 'Try Google Anyway', 
          onPress: async () => {
            try {
              await promptAsync();
            } catch (error) {
              console.error('Google OAuth Error:', error);
              Alert.alert('Error', 'Failed to open Google sign-in. Please try again.');
            }
          }
        },
      ]
    );
  };

  if (!signupMethod) {
    return (
      <LinearGradient colors={GRADIENTS.background as any} style={styles.container}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.light();
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.primaryGold}
            />
          </TouchableOpacity>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.logo}>SPURZ.AI</Text>
              <Text style={styles.tagline}>Your Earning Intelligence</Text>
            </Animated.View>

            {/* Hero Message */}
            <Animated.View
              style={[
                styles.heroSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.heroTitle}>Choose how to sign up</Text>
              <Text style={styles.heroSubtitle}>
                Select your preferred signup method
              </Text>
            </Animated.View>

            {/* Signup Method Selection */}
            <Animated.View
              style={[
                styles.methodsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => {
                  hapticFeedback.light();
                  setSignupMethod('phone');
                }}
                style={styles.methodCard}
              >
                <View style={styles.methodContent}>
                  <View style={styles.methodIconLarge}>
                    <Ionicons name="call" size={40} color={COLORS.primaryGold} />
                  </View>
                  <View style={styles.methodTextContainer}>
                    <Text style={styles.methodTitle}>Continue with Phone</Text>
                    <Text style={styles.methodDesc}>OTP verification</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => {
                  hapticFeedback.light();
                  setSignupMethod('email');
                }}
                style={styles.methodCard}
              >
                <View style={styles.methodContent}>
                  <View style={styles.methodIconLarge}>
                    <Ionicons name="mail" size={40} color={COLORS.primaryGold} />
                  </View>
                  <View style={styles.methodTextContainer}>
                    <Text style={styles.methodTitle}>Continue with Email</Text>
                    <Text style={styles.methodDesc}>Email verification</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              {/* Google Signup */}
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={handleGoogleSignup}
                disabled={loading}
                style={[styles.methodCard, loading && { opacity: 0.6 }]}
              >
                <View style={styles.methodContent}>
                  <View style={styles.methodIconLarge}>
                    <FontAwesome name="google" size={36} color="#4285F4" />
                  </View>
                  <View style={styles.methodTextContainer}>
                    <Text style={styles.methodTitle}>
                      {loading ? 'Connecting...' : 'Continue with Google'}
                    </Text>
                    <Text style={styles.methodDesc}>Quick signup</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Security Badge */}
            <Animated.View
              style={[
                styles.securityBadge,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
              <Text style={styles.securityText}>Bank-level security & privacy</Text>
            </Animated.View>

            {/* Already have account */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: SPACING.xs,
                marginTop: SPACING.xl,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.sans.regular,
                  fontSize: 14,
                  color: COLORS.textSecondary,
                }}
              >
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.light();
                  navigation.navigate('Login');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontFamily: FONTS.sans.semibold,
                    fontSize: 14,
                    color: COLORS.primaryGold,
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    );
  }

  // Phone signup form
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={GRADIENTS.background as any} style={styles.container}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.light();
              setSignupMethod(null);
            }}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.primaryGold}
            />
          </TouchableOpacity>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {signupMethod === 'phone' ? 'Mobile Number' : 'Email Address'}
              </Text>
              <Text style={styles.formSubtitle}>
                {signupMethod === 'phone'
                  ? 'Enter your 10-digit mobile number'
                  : 'Enter your email address'}
              </Text>
            </View>

            {/* Phone Input */}
            {signupMethod === 'phone' && (
              <Animated.View
                style={[
                  styles.inputContainer,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.phoneInputWrapper}>
                  <Text style={styles.phonePrefix}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePhoneSignup}
                  disabled={phone.length < 10 || loading}
                  style={[
                    styles.primaryButton,
                    (phone.length < 10 || loading) && styles.primaryButtonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={
                      phone.length >= 10 && !loading
                        ? (GRADIENTS.premiumGold as any)
                        : (['rgba(212,175,55,0.3)', 'rgba(212,175,55,0.1)'] as any)
                    }
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>{loading ? 'Creating Account...' : 'Continue'}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={18} color={COLORS.primaryGold} />
                  <Text style={styles.infoText}>
                    We'll send a verification code to your number
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Email Input */}
            {signupMethod === 'email' && (
              <Animated.View
                style={[
                  styles.inputContainer,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.emailInputWrapper}>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="your@email.com"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleEmailSignup}
                  disabled={!email.includes('@') || loading}
                  style={[
                    styles.primaryButton,
                    (!email.includes('@') || loading) && styles.primaryButtonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={
                      email.includes('@') && !loading
                        ? (GRADIENTS.premiumGold as any)
                        : (['rgba(212,175,55,0.3)', 'rgba(212,175,55,0.1)'] as any)
                    }
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>{loading ? 'Creating Account...' : 'Continue'}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={18} color={COLORS.primaryGold} />
                  <Text style={styles.infoText}>
                    We'll send a verification link to your email
                  </Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  contentContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  heroSection: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  methodsContainer: {
    marginBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  methodCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  methodIconLarge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: `${COLORS.primaryGold}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 13,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: `${COLORS.success}15`,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    alignSelf: 'center',
  },
  securityText: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.success,
  },
  formHeader: {
    marginBottom: SPACING.xxl,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    marginBottom: SPACING.xxl,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}40`,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  phonePrefix: {
    fontSize: 16,
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
    marginRight: SPACING.md,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textPrimary,
  },
  emailInputWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}40`,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  emailInput: {
    fontSize: 16,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textPrimary,
  },
  primaryButton: {
    marginBottom: SPACING.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryBackground,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
});
