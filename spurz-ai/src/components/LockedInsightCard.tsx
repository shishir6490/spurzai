import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { Card3D } from './Card3D';
import { hapticFeedback } from '@utils/haptics';

interface LockedInsightCardProps {
  title: string;
  description: string;
  icon: string;
  requiredData: string;
  onUnlock: () => void;
  color?: string;
  benefit?: string;
}

export const LockedInsightCard: React.FC<LockedInsightCardProps> = ({
  title,
  description,
  icon,
  requiredData,
  onUnlock,
  color = COLORS.primaryGold,
  benefit,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePress = () => {
    if (isPressed) {
      console.log('🔓 Card tapped - unlocking!');
      hapticFeedback.medium();
      onUnlock();
      setIsPressed(false);
    }
  };

  return (
    <View style={styles.cardWrapper}>
      <Card3D
        colors={[`${color}15`, `${color}05`]}
        borderRadius={16}
        style={styles.card}
        onPressIn={() => setIsPressed(true)}
        onPressOut={handlePress}
      >
        <View style={styles.content}>
          {/* Locked Overlay */}
          <BlurView intensity={20} tint="dark" style={styles.lockedOverlay}>
            <View style={styles.lockIconContainer}>
              <View style={[styles.lockIconBg, { backgroundColor: `${color}30` }]}>
                <Ionicons name="lock-closed" size={32} color={color} />
              </View>
            </View>
          </BlurView>

        {/* Card Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={12} color={COLORS.textSecondary} />
            <Text style={styles.lockBadgeText}>Locked</Text>
          </View>
        </View>

        {/* Blurred Content Preview */}
        <View style={styles.previewContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          
          {benefit && (
            <View style={styles.benefitPreview}>
              <Ionicons name="trending-up" size={16} color={color} />
              <Text style={[styles.benefitText, { color }]}>{benefit}</Text>
            </View>
          )}
        </View>

        {/* Unlock CTA */}
        <View style={styles.unlockSection}>
          <View style={styles.requiredDataBox}>
            <Ionicons name="information-circle" size={16} color={COLORS.textSecondary} />
            <Text style={styles.requiredDataText}>
              Add <Text style={styles.requiredDataBold}>{requiredData}</Text> to unlock
            </Text>
          </View>
          
          <View style={styles.unlockButton}>
            <LinearGradient
              colors={[color, `${color}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.unlockGradient}
            >
              <Ionicons name="lock-open" size={16} color={COLORS.primaryBackground} />
              <Text style={styles.unlockButtonText}>Tap to Unlock</Text>
            </LinearGradient>
          </View>
        </View>
        </View>
      </Card3D>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  card: {
    overflow: 'hidden',
  },
  content: {
    padding: SPACING.lg,
    position: 'relative',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    pointerEvents: 'none',
  },
  lockIconContainer: {
    marginTop: -40,
  },
  lockIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockBadgeText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewContent: {
    marginBottom: SPACING.lg,
    opacity: 0.6,
  },
  title: {
    fontFamily: FONTS.sans.bold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontFamily: FONTS.sans.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  benefitPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  benefitText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 13,
  },
  unlockSection: {
    gap: SPACING.md,
  },
  requiredDataBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  requiredDataText: {
    flex: 1,
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  requiredDataBold: {
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
  },
  unlockButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  unlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  unlockButtonText: {
    fontFamily: FONTS.sans.bold,
    fontSize: 15,
    color: COLORS.primaryBackground,
  },
});
