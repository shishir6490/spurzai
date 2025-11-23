import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { Card3D } from './Card3D';
import { hapticFeedback } from '@utils/haptics';

interface PotentialSavingsNudgeProps {
  missingData: string[];
  onTakAction: () => void;
  currentSavingsPercent?: number;
  potentialSavingsPercent?: number;
  showSuccess?: boolean;
}

export const PotentialSavingsNudge: React.FC<PotentialSavingsNudgeProps> = ({
  missingData,
  onTakAction,
  currentSavingsPercent = 0,
  potentialSavingsPercent = 0,
  showSuccess = false,
}) => {
  return (
    <View style={styles.container}>
      <Card3D
        colors={showSuccess 
          ? ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']
          : ['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)']}
        borderRadius={20}
      >
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={showSuccess 
                ? ['#10B981', '#059669'] 
                : [COLORS.primaryGold, COLORS.secondaryGold]}
              style={styles.iconGradient}
            >
              <Ionicons 
                name={showSuccess ? "checkmark-circle" : "sparkles"} 
                size={32} 
                color={COLORS.primaryBackground} 
              />
            </LinearGradient>
          </View>

          {/* Headline */}
          {showSuccess ? (
            <>
              <Text style={styles.headline}>Great Job! 🎉</Text>
              <Text style={styles.subheadline}>
                Your profile is complete. Here are your savings insights:
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.headline}>Unlock Your Savings Potential</Text>
              <Text style={styles.subheadline}>
                Complete your financial profile to discover personalized insights
              </Text>
            </>
          )}

          {/* Savings Percentages */}
          {showSuccess && currentSavingsPercent > 0 ? (
            <View style={styles.savingsBox}>
              <View style={styles.savingsRow}>
                <View style={styles.savingsItem}>
                  <Text style={styles.savingsLabel}>Current Savings</Text>
                  <Text style={[styles.savingsAmount, { color: '#10B981' }]}>
                    {currentSavingsPercent}%
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color={COLORS.textTertiary} />
                <View style={styles.savingsItem}>
                  <Text style={styles.savingsLabel}>Potential</Text>
                  <Text style={[styles.savingsAmount, { color: COLORS.primaryGold }]}>
                    {potentialSavingsPercent}%
                  </Text>
                </View>
              </View>
              <Text style={styles.savingsSubtext}>
                +{(potentialSavingsPercent - currentSavingsPercent).toFixed(1)}% potential increase
              </Text>
            </View>
          ) : (
            <View style={styles.savingsBox}>
              <Text style={styles.savingsLabel}>Potential Monthly Savings</Text>
              <Text style={styles.savingsAmount}>
                {potentialSavingsPercent > 0 ? `${potentialSavingsPercent}%` : '₹XX,XXX'}
              </Text>
              <Text style={styles.savingsSubtext}>
                {currentSavingsPercent > 0 
                  ? `Currently saving ${currentSavingsPercent}%` 
                  : 'Calculated based on your profile'}
              </Text>
            </View>
          )}

          {/* Missing Data Chips or Success Message */}
          {missingData.length > 0 ? (
            <View style={styles.missingDataSection}>
              <Text style={styles.missingDataLabel}>We need:</Text>
              <View style={styles.chipsContainer}>
                {missingData.map((item, index) => (
                  <View key={index} style={styles.chip}>
                    <Ionicons name="add-circle" size={14} color={COLORS.primaryGold} />
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : showSuccess && (
            <View style={styles.successSection}>
              <Text style={styles.successText}>
                ✨ Keep tracking to optimize your savings further
              </Text>
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.medium();
              onTakAction();
            }}
            style={styles.ctaButton}
          >
            <LinearGradient
              colors={showSuccess 
                ? ['#10B981', '#059669']
                : [COLORS.primaryGold, COLORS.secondaryGold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>
                {showSuccess ? 'View Details' : 'Complete Profile'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primaryBackground} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Trust Indicator */}
          <View style={styles.trustIndicator}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
            <Text style={styles.trustText}>Your data is secure & encrypted</Text>
          </View>
        </View>
      </Card3D>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headline: {
    fontFamily: FONTS.sans.bold,
    fontSize: 24,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subheadline: {
    fontFamily: FONTS.sans.regular,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  savingsBox: {
    width: '100%',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  savingsLabel: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  savingsAmount: {
    fontFamily: FONTS.sans.bold,
    fontSize: 36,
    color: COLORS.primaryGold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  savingsSubtext: {
    fontFamily: FONTS.sans.regular,
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  savingsItem: {
    alignItems: 'center',
    flex: 1,
  },
  successSection: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  missingDataSection: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  missingDataLabel: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  chipText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  ctaText: {
    fontFamily: FONTS.sans.bold,
    fontSize: 17,
    color: COLORS.primaryBackground,
  },
  trustIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  trustText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
});
