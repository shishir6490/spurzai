import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { Card3D } from './Card3D';
import { hapticFeedback } from '@utils/haptics';

interface SpendingCategoryCardProps {
  category: string;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  recommendation?: string;
  isLocked?: boolean;
  onPress: () => void;
  delay?: number;
}

export const SpendingCategoryCard: React.FC<SpendingCategoryCardProps> = ({
  category,
  amount,
  icon,
  color,
  recommendation,
  isLocked = false,
  onPress,
  delay = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        delay,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        delay,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          hapticFeedback.light();
          onPress();
        }}
      >
        <Card3D
          colors={
            isLocked
              ? ['rgba(50,50,50,0.3)', 'rgba(30,30,30,0.2)']
              : [`${color}15`, `${color}05`]
          }
          borderRadius={16}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon} size={24} color={color} />
              {isLocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={12} color={COLORS.textSecondary} />
                </View>
              )}
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={[styles.amount, isLocked && styles.lockedText]}>
                {isLocked ? 'Enable tracking' : `₹${amount.toLocaleString()}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </View>

          {!isLocked && recommendation && (
            <View style={styles.recommendationContainer}>
              <View style={styles.recommendationBadge}>
                <Ionicons name="sparkles" size={12} color={COLORS.primaryGold} />
                <Text style={styles.recommendationLabel}>AI Recommendation</Text>
              </View>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          )}

          {isLocked && (
            <View style={styles.lockedInfo}>
              <Ionicons name="information-circle-outline" size={14} color={COLORS.textTertiary} />
              <Text style={styles.lockedInfoText}>
                Enable payment tracking in settings to unlock detailed insights
              </Text>
            </View>
          )}
        </Card3D>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.semibold,
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold,
  },
  lockedText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  recommendationContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.1)',
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  recommendationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    lineHeight: 18,
  },
  lockedInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  lockedInfoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textTertiary,
    fontFamily: FONTS.sans.regular,
    lineHeight: 16,
  },
});
