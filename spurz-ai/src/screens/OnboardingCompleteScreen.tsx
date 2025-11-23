import React, { useRef, useEffect } from 'react';
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

export default function OnboardingCompleteScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { selections, phone, isSignup } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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

    // Haptic on complete
    hapticFeedback.success();
  }, []);

  const handleContinue = () => {
    hapticFeedback.medium();
    // Navigate to home/main app
    navigation.navigate('Main');
  };

  const completionItems = [
    {
      icon: 'call',
      title: 'Phone Verified',
      status: 'Done',
      statusColor: COLORS.success,
    },
    {
      icon: 'mail',
      title: 'Email Permission',
      status: selections?.emailGranted ? 'Done' : 'Skip',
      statusColor: selections?.emailGranted ? COLORS.success : COLORS.textTertiary,
    },
    {
      icon: 'shield',
      title: 'SETU Connected',
      status: selections?.aadhaarGranted ? 'Done' : 'Skip',
      statusColor: selections?.aadhaarGranted ? COLORS.success : COLORS.textTertiary,
    },
  ];

  return (
    <LinearGradient colors={GRADIENTS.background as any} style={styles.container}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.successIcon,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={60} color={COLORS.success} />
            </View>
          </Animated.View>

          {/* Success Message */}
          <Animated.View
            style={[
              styles.successMessage,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.successTitle}>Welcome to SPURZ.AI!</Text>
            <Text style={styles.successSubtitle}>
              Your account is all set up. Let's start your financial journey.
            </Text>
          </Animated.View>

          {/* Completion Status */}
          <Animated.View
            style={[
              styles.completionSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.completionTitle}>Setup Complete</Text>
            <View style={styles.completionItems}>
              {completionItems.map((item, index) => (
                <View key={item.title} style={styles.completionItem}>
                  <View style={styles.completionItemLeft}>
                    <View style={styles.itemIcon}>
                      <MaterialIcons name={item.icon as any} size={20} color={COLORS.primaryGold} />
                    </View>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                  </View>
                  <Text style={[styles.itemStatus, { color: item.statusColor }]}>
                    {item.status}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Data Summary */}
          {selections && (
            <Animated.View
              style={[
                styles.dataSummary,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.summaryTitle}>Your Profile</Text>

              {selections.income && (
                <View style={styles.summaryItem}>
                  <Ionicons name="trending-up" size={18} color={COLORS.primaryGold} />
                  <Text style={styles.summaryLabel}>Monthly Income</Text>
                  <Text style={styles.summaryValue}>{selections.income}</Text>
                </View>
              )}

              {selections.spending && (
                <View style={styles.summaryItem}>
                  <Ionicons name="card" size={18} color={COLORS.primaryGold} />
                  <Text style={styles.summaryLabel}>Monthly Spending</Text>
                  <Text style={styles.summaryValue}>{selections.spending}</Text>
                </View>
              )}

              {selections.investments?.length > 0 && (
                <View style={styles.summaryItem}>
                  <Ionicons name="briefcase" size={18} color={COLORS.primaryGold} />
                  <Text style={styles.summaryLabel}>Investments ({selections.investments.length})</Text>
                  <Text style={styles.summaryValue}>{selections.investments.join(', ')}</Text>
                </View>
              )}

              {selections.goals?.length > 0 && (
                <View style={styles.summaryItem}>
                  <Ionicons name="flag" size={18} color={COLORS.primaryGold} />
                  <Text style={styles.summaryLabel}>Goals ({selections.goals.length})</Text>
                  <Text style={styles.summaryValue}>{selections.goals.join(', ')}</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Benefits */}
          <Animated.View
            style={[
              styles.benefitsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.benefitsTitle}>What's Next?</Text>

            {[
              {
                icon: 'sparkles',
                title: 'AI Insights',
                desc: 'Get personalized financial recommendations',
              },
              {
                icon: 'trending-up',
                title: 'Track Progress',
                desc: 'Monitor your income and spending trends',
              },
              {
                icon: 'target',
                title: 'Achieve Goals',
                desc: 'Create and track your financial milestones',
              },
            ].map((benefit) => (
              <View key={benefit.icon} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon as any} size={24} color={COLORS.primaryGold} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        </ScrollView>

        {/* Action Button */}
        <Animated.View
          style={[
            styles.actionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleContinue}
            style={styles.continueButton}
          >
            <LinearGradient colors={GRADIENTS.premiumGold as any} style={styles.buttonGradient}>
              <Text style={styles.continueButtonText}>Start Exploring</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primaryBackground} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  contentContainer: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl * 2,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.success}15`,
    borderWidth: 3,
    borderColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successMessage: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  completionSection: {
    backgroundColor: `${COLORS.primaryGold}05`,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  completionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
    marginBottom: SPACING.lg,
  },
  completionItems: {
    gap: SPACING.md,
  },
  completionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}15`,
  },
  completionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primaryGold}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
  },
  itemStatus: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
  },
  dataSummary: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
    marginBottom: SPACING.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}10`,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
    textAlign: 'right',
  },
  benefitsSection: {
    marginBottom: SPACING.xl,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
    marginBottom: SPACING.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primaryGold}05`,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}15`,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primaryGold}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
    marginBottom: SPACING.xs,
  },
  benefitDesc: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.primaryBackground,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.primaryGold}20`,
  },
  continueButton: {
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
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryBackground,
  },
});
