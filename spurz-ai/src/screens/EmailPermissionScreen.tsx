import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticFeedback } from '@utils/haptics';

export default function EmailPermissionScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { phone, isSignup } = route.params || {};
  const [emailGranted, setEmailGranted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGrantAccess = () => {
    hapticFeedback.medium();
    setEmailGranted(true);
    setTimeout(() => {
      navigation.navigate('SetuVerification', { phone, isSignup, emailGranted: true });
    }, 800);
  };

  const handleSkip = () => {
    hapticFeedback.light();
    navigation.navigate('SetuVerification', { phone, isSignup, emailGranted: false });
  };

  const benefits = [
    {
      icon: 'receipt-outline',
      title: 'Auto-extract from Emails',
      description: 'Automatically detect salary, invoices & receipts from your emails',
    },
    {
      icon: 'arrow-up-outline',
      title: 'Smart Categorization',
      description: 'Categorize expenses & income directly from email threads',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Zero Personal Data',
      description:
        'We never see personal info - only financial patterns & amounts',
    },
    {
      icon: 'time-outline',
      title: 'Save Your Time',
      description: 'No manual entry needed - we do the boring stuff for you',
    },
  ];

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
            <Animated.View
              style={[
                styles.emailIcon,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Ionicons name="mail" size={40} color={COLORS.primaryGold} />
            </Animated.View>
            <Text style={styles.title}>Email Access</Text>
            <Text style={styles.subtitle}>
              Let SPURZ.AI analyze your emails to auto-extract financial data
            </Text>
          </Animated.View>

          {/* Why Section */}
          <Animated.View
            style={[
              styles.whySection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Why Email Access?</Text>
              <View style={styles.badgeNew}>
                <Text style={styles.badgeNewText}>Optional</Text>
              </View>
            </View>

            {benefits.map((benefit, index) => (
              <Animated.View
                key={benefit.icon}
                style={[
                  styles.benefitCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [50 - index * 10, index * 10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon as any} size={24} color={COLORS.primaryGold} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Privacy Notice */}
          <Animated.View
            style={[
              styles.privacyNotice,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.privacyHeader}>
              <Ionicons name="eye-off" size={18} color={COLORS.success} />
              <Text style={styles.privacyTitle}>Your Privacy is Protected</Text>
            </View>
            <Text style={styles.privacyText}>
              We use industry-standard encryption. Your emails are processed locally on your device
              or via encrypted connections only. We never store or share your emails.
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.actions,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={handleGrantAccess}
              onPressIn={() => hapticFeedback.light()}
              style={styles.primaryButton}
            >
              <LinearGradient colors={GRADIENTS.premiumGold as any} style={styles.buttonGradient}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primaryBackground} />
                <Text style={styles.primaryButtonText}>Grant Email Access</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSkip}
              onPressIn={() => hapticFeedback.selection()}
              style={styles.secondaryButton}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.primaryGold} />
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Trust Badge */}
          <Animated.View
            style={[
              styles.trustBadge,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
            <Text style={styles.trustText}>
              You can revoke email access anytime from Settings
            </Text>
          </Animated.View>
        </ScrollView>
      </View>
    </LinearGradient>
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  emailIcon: {
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
  whySection: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
  },
  badgeNew: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: `${COLORS.primaryGold}20`,
    borderRadius: RADIUS.full,
  },
  badgeNewText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primaryGold}05`,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primaryGold}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
    marginBottom: SPACING.xs,
  },
  benefitDescription: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  privacyNotice: {
    backgroundColor: `${COLORS.success}10`,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.success,
  },
  privacyText: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actions: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryBackground,
  },
  secondaryButton: {
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}40`,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: `${COLORS.success}05`,
    borderRadius: RADIUS.md,
  },
  trustText: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
