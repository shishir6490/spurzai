import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticFeedback } from '@utils/haptics';
import { useAuth } from '@context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { sendOTP, isAuthenticated } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'phone' | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
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

  const handlePhoneLogin = async () => {
    hapticFeedback.medium();
    if (phone.length >= 10) {
      setLoading(true);
      setError('');
      try {
        // Send OTP via Firebase (stored in AuthContext)
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        await sendOTP(formattedPhone);
        
        // Navigate to OTP screen (confirmation stored in AuthContext)
        navigation.navigate('OTPVerification', { 
          phone: formattedPhone,
          isSignup: false 
        });
      } catch (err: any) {
        setError(err.message || 'Failed to send OTP');
        hapticFeedback.error();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFaceLogin = async () => {
    try {
      hapticFeedback.medium();
      setLoading(true);
      setError('');
      
      // Check if device supports biometric authentication
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setError('Biometric authentication is not available on this device');
        setLoading(false);
        return;
      }

      // Check if biometric data is enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setError('No biometric data found. Please set up Face ID/Touch ID in your device settings');
        setLoading(false);
        return;
      }

      // Get available biometric types
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasFaceID = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      const hasFingerprint = supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
      const hasIris = supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS);
      
      let promptMessage = 'Authenticate to login';
      let biometricType = 'biometric';
      
      if (hasFaceID) {
        promptMessage = 'Look at your device to login';
        biometricType = 'Face ID';
      } else if (hasFingerprint) {
        promptMessage = 'Touch the fingerprint sensor to login';
        biometricType = 'Touch ID';
      } else if (hasIris) {
        promptMessage = 'Look at your device to login';
        biometricType = 'Iris scan';
      }

      console.log('🔐 Starting biometric authentication with', biometricType);
      console.log('📱 Supported types:', supportedTypes);

      // Authenticate with biometric - prefer biometric over device passcode
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: true, // This forces biometric only, no PIN fallback
        requireConfirmation: false,
      });

      console.log('🔐 Biometric auth result:', result);

      if (result.success) {
        hapticFeedback.success();
        
        // Biometric authentication successful!
        // For demo purposes, auto-login with test credentials
        // In production, you would retrieve stored credentials from secure storage
        
        console.log('✅ Biometric authentication successful!');
        console.log('📱 Auto-logging in with saved credentials...');
        
        // Use the test phone number (in production, retrieve from secure storage)
        const savedPhone = '+917503337817';
        const savedOTP = '123456';
        
        // Send OTP
        await sendOTP(savedPhone);
        
        // Auto-verify with saved OTP
        // In production, you'd have the user's session token stored securely
        // For now, navigate to OTP screen which will auto-fill
        navigation.navigate('OTPVerification', {
          phone: savedPhone,
          isSignup: false,
          autoBiometric: true,
          autoOTP: savedOTP,
        });
        
      } else {
        hapticFeedback.error();
        setError(`${biometricType} authentication failed. Please try again.`);
      }
    } catch (error: any) {
      console.error('❌ Biometric auth error:', error);
      setError('Failed to authenticate. Please try again.');
      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  const handleSignupPhone = async () => {
    hapticFeedback.medium();
    if (phone.length >= 10) {
      setLoading(true);
      setError('');
      try {
        // Send OTP via Firebase (stored in AuthContext)
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        await sendOTP(formattedPhone);
        
        // Navigate to OTP screen (confirmation stored in AuthContext)
        navigation.navigate('OTPVerification', { 
          phone: formattedPhone,
          isSignup: true 
        });
      } catch (err: any) {
        setError(err.message || 'Failed to send OTP');
        hapticFeedback.error();
      } finally {
        setLoading(false);
      }
    }
  };

  if (!loginMethod) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
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

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
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
              <Text style={styles.heroTitle}>Choose how to continue</Text>
              <Text style={styles.heroSubtitle}>
                Select your preferred login method
              </Text>
            </Animated.View>

            {/* Login Method Selection */}
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
                  hapticFeedback.medium();
                  setLoginMethod('phone');
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
                onPress={handleFaceLogin}
                style={styles.methodCard}
              >
                <View style={styles.methodContent}>
                  <View style={styles.methodIconLarge}>
                    <Ionicons name="finger-print" size={40} color={COLORS.primaryGold} />
                  </View>
                  <View style={styles.methodTextContainer}>
                    <Text style={styles.methodTitle}>Continue with Biometrics</Text>
                    <Text style={styles.methodDesc}>Face ID / Touch ID</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Error Message */}
            {error ? (
              <Animated.View
                style={[
                  styles.errorBox,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

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
          </ScrollView>
        </View>
      </LinearGradient>
    );
  }

  // Phone login form
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.light();
              setLoginMethod(null);
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
                {loginMethod === 'phone' ? 'Mobile Number' : 'Face Recognition'}
              </Text>
              <Text style={styles.formSubtitle}>
                {loginMethod === 'phone'
                  ? 'Enter your 10-digit mobile number'
                  : 'Scan your face to continue'}
              </Text>
            </View>

            {/* Phone Input */}
            {loginMethod === 'phone' && (
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

                {/* Action Buttons */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePhoneLogin}
                  disabled={phone.length < 10 || loading}
                  style={[
                    styles.primaryButton,
                    (phone.length < 10 || loading) && styles.primaryButtonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={
                      phone.length >= 10 && !loading
                        ? GRADIENTS.premiumGold
                        : ['rgba(212,175,55,0.3)', 'rgba(212,175,55,0.1)']
                    }
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>{loading ? 'Sending OTP...' : 'Login'}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Signup Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSignupPhone}
                  disabled={phone.length < 10}
                  style={[
                    styles.secondaryButton,
                    phone.length < 10 && styles.secondaryButtonDisabled,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Create New Account</Text>
                </TouchableOpacity>

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={18} color={COLORS.primaryGold} />
                  <Text style={styles.infoText}>
                    New or existing users can login with their mobile number
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 14,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  contentContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  heroSection: {
    marginBottom: SPACING.xl,
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
  methodArrow: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primaryGold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
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
  backButton: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  formHeader: {
    marginBottom: SPACING.xxl,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}40`,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    height: 56,
  },
  phonePrefix: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
    marginRight: SPACING.md,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textPrimary,
  },
  primaryButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryBackground,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${COLORS.textTertiary}40`,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textTertiary,
  },
  secondaryButton: {
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}40`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.error}10`,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.error,
  },

});
