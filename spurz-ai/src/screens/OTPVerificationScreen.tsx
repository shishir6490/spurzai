import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticFeedback } from '@utils/haptics';
import { useAuth } from '@context/AuthContext';

export default function OTPVerificationScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { phone, isSignup, autoBiometric, autoOTP } = route.params || {};
  const { verifyOTP, sendOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [otpSent, setOtpSent] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && otpSent) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, otpSent]);

  // Entrance animation
  useEffect(() => {
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

  // Shake animation for error
  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleVerifyOTP = async () => {
    hapticFeedback.medium();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      shake();
      hapticFeedback.error();
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔵 Starting OTP verification...');
      // Verify OTP with Firebase (uses stored confirmation from AuthContext)
      const success = await verifyOTP(otp);
      console.log('✅ OTP verification result:', success);
      
      if (success) {
        hapticFeedback.success();
        console.log('🎉 OTP verified successfully, waiting for auth state update...');
        
        // If it's a new signup, navigate to onboarding
        if (isSignup) {
          console.log('📝 Navigating to onboarding...');
          navigation.replace('ManualDataCollection', { phone });
        } else {
          console.log('🏠 Login successful, RootNavigator will handle navigation automatically');
          // For login, don't navigate manually
          // The RootNavigator will detect auth state change and show Main screen automatically
          // Just wait a moment for the auth context to update
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        setError('Invalid OTP. Please try again.');
        shake();
        hapticFeedback.error();
      }
    } catch (err: any) {
      console.error('❌ OTP verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
      shake();
      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    hapticFeedback.light();
    setError('');
    setLoading(true);
    
    try {
      // Resend OTP via Firebase (stored in AuthContext)
      await sendOTP(phone);
      setOtp('');
      setTimer(60);
      setOtpSent(true);
      hapticFeedback.success();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify OTP if coming from biometric login
  useEffect(() => {
    if (autoBiometric && autoOTP) {
      console.log('🔐 Auto-verifying OTP from biometric login...');
      setOtp(autoOTP);
      // Auto-verify after a short delay
      setTimeout(() => {
        handleVerifyOTP();
      }, 1000);
    }
  }, [autoBiometric, autoOTP]);

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
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryGold} />
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
              <View style={styles.phoneIcon}>
                <Ionicons name="phone-portrait" size={32} color={COLORS.primaryGold} />
              </View>
              <Text style={styles.title}>Verify Your Number</Text>
              <Text style={styles.subtitle}>
                We've sent a verification code to{'\n'}
                <Text style={styles.phoneNumber}>+91 {phone}</Text>
              </Text>
            </Animated.View>

            {/* OTP Input */}
            <Animated.View
              style={[
                styles.otpContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { translateX: shakeAnim },
                  ],
                },
              ]}
            >
              <Text style={styles.otpLabel}>Enter OTP</Text>
              <View style={[styles.otpInputWrapper, error && styles.otpInputError]}>
                <TextInput
                  autoFocus
                  style={styles.otpInput}
                  placeholder="000000"
                  placeholderTextColor={COLORS.textTertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    setError('');
                    if (text.length > otp.length) {
                      hapticFeedback.selection();
                    }
                    if (text.length === 6) {
                      hapticFeedback.light();
                    }
                  }}
                  editable={!loading}
                />
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Info Box */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={16} color={COLORS.primaryGold} />
                <Text style={styles.infoText}>
                  Enter the 6-digit code sent to your phone via SMS
                </Text>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View
              style={[
                styles.actionsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={handleVerifyOTP}
                onPressIn={() => otp.length === 6 && !loading && hapticFeedback.light()}
                disabled={otp.length !== 6 || loading}
                style={[styles.primaryButton, (otp.length !== 6 || loading) && styles.primaryButtonDisabled]}
              >
                <LinearGradient
                  colors={
                    otp.length === 6 && !loading
                      ? (GRADIENTS.premiumGold as any)
                      : (['rgba(212,175,55,0.3)', 'rgba(212,175,55,0.1)'] as any)
                  }
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive code?</Text>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  onPressIn={() => timer === 0 && !loading && hapticFeedback.selection()}
                  disabled={timer > 0 || loading}
                  style={styles.resendButton}
                >
                  <Text
                    style={[
                      styles.resendButtonText,
                      (timer > 0 || loading) && styles.resendButtonTextDisabled,
                    ]}
                  >
                    {loading ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Change Number */}
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.light();
                  navigation.goBack();
                }}
                style={styles.secondaryButton}
              >
                <Ionicons name="call" size={18} color={COLORS.primaryGold} />
                <Text style={styles.secondaryButtonText}>Change Phone Number</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Security Info */}
            <Animated.View
              style={[
                styles.securityInfo,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
              <Text style={styles.securityText}>
                Your phone number is verified securely and not shared with anyone
              </Text>
            </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  contentContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  phoneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primaryGold}15`,
    borderWidth: 2,
    borderColor: `${COLORS.primaryGold}40`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  phoneNumber: {
    color: COLORS.primaryGold,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
  },
  otpContainer: {
    marginBottom: SPACING.xxl,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  otpInputWrapper: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: `${COLORS.primaryGold}40`,
    paddingHorizontal: SPACING.lg,
    height: 64,
    marginBottom: SPACING.lg,
  },
  otpInputError: {
    borderColor: COLORS.error,
  },
  otpInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
    textAlign: 'center',
    letterSpacing: 12,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.error}15`,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.error,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    marginBottom: SPACING.xxl,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  resendText: {
    fontSize: 13,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  resendButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  resendButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
  },
  resendButtonTextDisabled: {
    color: `${COLORS.primaryGold}60`,
  },
  secondaryButton: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}40`,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
  },
  securityInfo: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.success}15`,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.success,
    lineHeight: 18,
  },
});
