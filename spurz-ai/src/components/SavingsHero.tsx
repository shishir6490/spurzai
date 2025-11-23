import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { Card3D } from './Card3D';
import { AnimatedNumber } from './AnimatedNumber';

interface SavingsHeroProps {
  currentSavingsPercent: number;
  potentialSavingsPercent: number;
  monthlyIncome: number;
  monthlySavings: number;
}

export const SavingsHero: React.FC<SavingsHeroProps> = ({
  currentSavingsPercent,
  potentialSavingsPercent,
  monthlyIncome,
  monthlySavings,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow and arrow animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const arrowTranslateX = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const currentSavingsAmount = (monthlyIncome * currentSavingsPercent) / 100;
  const potentialSavingsAmount = (monthlyIncome * potentialSavingsPercent) / 100;
  const additionalSavings = potentialSavingsAmount - currentSavingsAmount;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Card3D
        colors={['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.1)']}
        borderRadius={24}
        style={styles.card}
      >
        <LinearGradient
          colors={['rgba(59,130,246,0.15)', 'rgba(139,92,246,0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Header Label */}
          <View style={styles.header}>
            <View style={styles.labelContainer}>
              <Ionicons name="trending-up" size={16} color="#3B82F6" />
              <Text style={styles.label}>YOUR SAVINGS</Text>
            </View>
          </View>

          {/* Main Savings Display */}
          <View style={styles.savingsContainer}>
            {/* Current Savings */}
            <View style={styles.savingsColumn}>
              <Text style={styles.savingsLabel}>Current</Text>
              <View style={styles.percentContainer}>
                <AnimatedNumber
                  value={currentSavingsPercent}
                  fontSize={48}
                  color={COLORS.textPrimary}
                  fontFamily={FONTS.sans.bold}
                  decimalPlaces={0}
                />
                <Text style={styles.percentSymbol}>%</Text>
              </View>
              <Text style={styles.amountText}>
                ₹{Math.round(currentSavingsAmount).toLocaleString()}
              </Text>
            </View>

            {/* Arrow */}
            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  transform: [{ translateX: arrowTranslateX }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.arrowGlow,
                  {
                    opacity: glowOpacity,
                  },
                ]}
              />
              <Ionicons name="arrow-forward" size={32} color={COLORS.primaryGold} />
            </Animated.View>

            {/* Potential Savings */}
            <View style={styles.savingsColumn}>
              <Text style={[styles.savingsLabel, { color: COLORS.primaryGold }]}>Potential</Text>
              <View style={styles.percentContainer}>
                <AnimatedNumber
                  value={potentialSavingsPercent}
                  fontSize={48}
                  color={COLORS.primaryGold}
                  fontFamily={FONTS.sans.bold}
                  decimalPlaces={0}
                />
                <Text style={[styles.percentSymbol, { color: COLORS.primaryGold }]}>%</Text>
              </View>
              <Text style={[styles.amountText, { color: COLORS.primaryGold }]}>
                ₹{Math.round(potentialSavingsAmount).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Improvement Badge */}
          <View style={styles.improvementBadge}>
            <Ionicons name="add-circle" size={16} color="#10B981" />
            <Text style={styles.improvementText}>
              +₹{Math.round(additionalSavings).toLocaleString()} potential increase
            </Text>
          </View>
        </LinearGradient>
      </Card3D>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  card: {
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    fontFamily: FONTS.sans.bold,
    letterSpacing: 1.5,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  savingsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  percentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  percentSymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
    marginTop: 6,
    marginLeft: 2,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.semibold,
  },
  arrowContainer: {
    position: 'relative',
    paddingHorizontal: SPACING.md,
  },
  arrowGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGold,
    alignSelf: 'center',
    top: '50%',
    marginTop: -30,
    left: '50%',
    marginLeft: -30,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    alignSelf: 'center',
  },
  improvementText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: FONTS.sans.bold,
  },
});
