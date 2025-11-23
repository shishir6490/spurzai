import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';

interface PermissionModalProps {
  visible: boolean;
  type: 'email' | 'aadhaar' | 'tracking';
  onAllow: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  type,
  onAllow,
  onDecline,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = Dimensions.get('window');
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleAllow = () => {
    hapticFeedback.medium();
    onAllow();
  };

  const handleDecline = () => {
    hapticFeedback.light();
    onDecline();
  };

  const emailContent = {
    title: 'Connect Your Email',
    subtitle: 'Auto-fill your finances instantly',
    icon: 'mail',
    description:
      'With secure email access, Spurz identifies your income, expenses, card spends, EMIs, and monthly statements.\n\nNo human ever reads your emails. You\'re in full control.',
    benefits: [
      'Auto-detect your monthly income',
      'Categorize your expenses automatically',
      'Extract EMI and loan details',
      'Identify credit card spends',
    ],
    allowLabel: 'Connect Gmail',
    declineLabel: 'Continue without email',
  };

  const aadhaarContent = {
    title: 'Verify with Aadhaar',
    subtitle: 'Instant identity verification',
    icon: 'verified-user',
    description:
      'Verify your identity securely via Setu, a government-approved service.\n\nThis helps us personalize your financial profile and improves your insight accuracy.',
    benefits: [
      'Instant identity verification',
      'Faster onboarding process',
      'Access to financial metadata',
      'Improved personalization',
    ],
    allowLabel: 'Verify with Aadhaar',
    declineLabel: 'Skip for now',
  };

  const trackingContent = {
    title: 'Enable Spending Tracking',
    subtitle: 'Smart insights for your spending',
    icon: 'analytics',
    description:
      'Track your spending patterns to get personalized insights and AI recommendations.\n\nSee detailed breakdowns of where your money goes and discover opportunities to save.',
    benefits: [
      'Track spending by category',
      'Get AI-powered recommendations',
      'Identify saving opportunities',
      'Monitor spending trends',
    ],
    allowLabel: 'Enable Tracking',
    declineLabel: 'Maybe later',
  };

  const content = type === 'email' ? emailContent : type === 'aadhaar' ? aadhaarContent : trackingContent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <BlurView intensity={80} style={styles.blurContainer}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header Handle */}
          <View style={styles.handle} />

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[COLORS.primaryGold, `${COLORS.primaryGold}80`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <MaterialIcons
                  name={content.icon as any}
                  size={40}
                  color={COLORS.primaryBackground}
                />
              </LinearGradient>
            </View>

            {/* Title and Subtitle */}
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.subtitle}>{content.subtitle}</Text>

            {/* Description */}
            <Text style={styles.description}>{content.description}</Text>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              {content.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitCheckmark}>
                    <MaterialIcons
                      name="check"
                      size={14}
                      color={COLORS.success}
                    />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <MaterialIcons name="lock" size={16} color={COLORS.success} />
              <Text style={styles.securityText}>
                Your data is encrypted and secure
              </Text>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.declineButton, isLoading && styles.disabled]}
              onPress={handleDecline}
              disabled={isLoading}
            >
              <Text style={styles.declineText}>{content.declineLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.allowButton, isLoading && styles.disabled]}
              onPress={handleAllow}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.allowText}>Processing...</Text>
              ) : (
                <>
                  <MaterialIcons
                    name="arrow-forward"
                    size={16}
                    color={COLORS.primaryBackground}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.allowText}>{content.allowLabel}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.secondaryBackground,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: `${COLORS.textSecondary}40`,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  scrollView: {
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.sans.bold,
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  benefitsContainer: {
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  benefitCheckmark: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  benefitText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textPrimary,
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}10`,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  securityText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 12,
    color: COLORS.success,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: SPACING.md,
  },
  declineButton: {
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  declineText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  allowButton: {
    backgroundColor: COLORS.primaryGold,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  allowText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.primaryBackground,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});
