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

export default function SetuVerificationScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { phone, isSignup, emailGranted } = route.params || {};
  const [aadhaarGranted, setAadhaarGranted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Continuous pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGrantAccess = () => {
    hapticFeedback.success();
    setAadhaarGranted(true);
    setTimeout(() => {
      hapticFeedback.light();
      navigation.navigate('ManualDataCollection', {
        phone,
        isSignup,
        emailGranted,
        aadhaarGranted: true,
      });
    }, 800);
  };

  const handleSkip = () => {
    hapticFeedback.light();
    navigation.navigate('ManualDataCollection', {
      phone,
      isSignup,
      emailGranted,
      aadhaarGranted: false,
    });
  };

  const features = [
    {
      icon: 'security',
      title: 'Government Approved',
      description: 'SETU is RBI-approved for secure financial data sharing',
    },
    {
      icon: 'lock',
      title: 'No Personal Data Fetched',
      description:
        'We only get your financial institutions & transaction summaries, never personal details',
    },
    {
      icon: 'trending-up',
      title: 'Instant Financial Profile',
      description: 'Auto-fill your salary, investments & loan information in seconds',
    },
    {
      icon: 'check-circle',
      title: 'You Control Access',
      description: 'Choose exactly which financial accounts to share data from',
    },
  ];

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
                styles.setuIcon,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Ionicons name="shield" size={40} color={COLORS.primaryGold} />
              </Animated.View>
            </Animated.View>
            <Text style={styles.title}>Financial Data Access</Text>
            <Text style={styles.subtitle}>
              Connect with SETU to fetch your salary, investments & financial data securely
            </Text>
          </Animated.View>

          {/* Badge Row */}
          <Animated.View
            style={[
              styles.badges,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.badgeText}>RBI Approved</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="shield" size={16} color={COLORS.success} />
              <Text style={styles.badgeText}>Encrypted</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="person" size={16} color={COLORS.success} />
              <Text style={styles.badgeText}>Your Control</Text>
            </View>
          </Animated.View>

          {/* Features Section */}
          <Animated.View
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Why SETU Access?</Text>

            {features.map((feature, index) => (
              <Animated.View
                key={feature.icon}
                style={[
                  styles.featureCard,
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
                <View style={styles.featureIcon}>
                  <MaterialIcons name={feature.icon as any} size={24} color={COLORS.primaryGold} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* What We Get Section */}
          <Animated.View
            style={[
              styles.whatWeGet,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.whatWeGetHeader}>
              <Text style={styles.whatWeGetTitle}>What We Can Access</Text>
              <View style={styles.accessBadge}>
                <Text style={styles.accessBadgeText}>Financial Data Only</Text>
              </View>
            </View>

            <View style={styles.accessList}>
              {['Bank Accounts', 'Investments', 'Loan Details', 'Insurance', 'Credit Score'].map(
                (item) => (
                  <View key={item} style={styles.accessItem}>
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={14} color={COLORS.success} />
                    </View>
                    <Text style={styles.accessItemText}>{item}</Text>
                  </View>
                )
              )}
            </View>

            <View style={styles.whatWeNotGet}>
              <Ionicons name="close-circle" size={18} color={COLORS.error} />
              <View style={styles.whatWeNotGetContent}>
                <Text style={styles.whatWeNotGetTitle}>We Never See</Text>
                <Text style={styles.whatWeNotGetText}>
                  Names, addresses, phone numbers, personal documents, or any PII
                </Text>
              </View>
            </View>
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
              <LinearGradient colors={GRADIENTS.premiumGold} style={styles.buttonGradient}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.primaryBackground} />
                <Text style={styles.primaryButtonText}>Connect with SETU</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSkip}
              onPressIn={() => hapticFeedback.selection()}
              style={styles.secondaryButton}
            >
              <Ionicons name="arrow-forward" size={20} color={COLORS.primaryGold} />
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Trust Statement */}
          <Animated.View
            style={[
              styles.trustStatement,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Ionicons name="information-circle" size={16} color={COLORS.primaryGold} />
            <Text style={styles.trustText}>
              By clicking Connect, you'll be redirected to SETU's secure portal. SPURZ.AI never
              sees your login credentials.
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
    marginBottom: SPACING.xl,
  },
  setuIcon: {
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
  badges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  badge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}10`,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.success,
  },
  featuresSection: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
    marginBottom: SPACING.lg,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primaryGold}05`,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primaryGold}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  whatWeGet: {
    backgroundColor: `${COLORS.primaryGold}05`,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  whatWeGetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  whatWeGetTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textAccentMuted,
  },
  accessBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: `${COLORS.primaryGold}20`,
    borderRadius: RADIUS.full,
  },
  accessBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold,
  },
  accessList: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  accessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessItemText: {
    fontSize: 13,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  whatWeNotGet: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.error}10`,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  whatWeNotGetContent: {
    flex: 1,
  },
  whatWeNotGetTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  whatWeNotGetText: {
    fontSize: 11,
    fontFamily: FONTS.sans.regular,
    color: COLORS.error,
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
  trustStatement: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primaryGold}05`,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  trustText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
