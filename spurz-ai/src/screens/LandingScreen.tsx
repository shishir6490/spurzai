import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS, GRADIENTS, SIZES } from '@constants/theme';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }: any) => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Starfield background component
  const StarField = () => {
    const stars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * width,
      top: Math.random() * (height * 0.4),
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      duration: Math.random() * 2000 + 2000,
    }));

    return (
      <>
        {stars.map((star) => (
          <TwinklingStar key={star.id} {...star} />
        ))}
      </>
    );
  };

  const TwinklingStar = ({ left, top, size, opacity, duration }: any) => {
    const twinkleAnim = useRef(new Animated.Value(opacity)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(twinkleAnim, {
            toValue: opacity * 2,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(twinkleAnim, {
            toValue: opacity,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    return (
      <Animated.View
        style={{
          position: 'absolute',
          left,
          top,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: COLORS.primaryGold,
          opacity: twinkleAnim,
        }}
      />
    );
  };

  // Hook card component with premium animations
  const HookCard = ({
    icon,
    title,
    subtitle,
    delay,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    delay: number;
  }) => {
    const cardScaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(cardScaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start();
    }, []);

    const handlePressIn = async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(cardScaleAnim, {
        toValue: 0.96,
        tension: 150,
        friction: 10,
        useNativeDriver: false,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }).start();
    };

    return (
      <Animated.View
        style={{
          transform: [{ scale: cardScaleAnim }],
          marginRight: SPACING.md,
          shadowColor: COLORS.primaryGold,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <LinearGradient
            colors={GRADIENTS.cardAccent as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: RADIUS.lg,
              borderWidth: 1,
              borderColor: `rgba(${parseInt(COLORS.primaryGold.slice(1, 3), 16)}, ${parseInt(COLORS.primaryGold.slice(3, 5), 16)}, ${parseInt(COLORS.primaryGold.slice(5, 7), 16)}, 0.2)`,
              padding: SPACING.lg,
              width: width * 0.4,
              overflow: 'hidden',
            }}
          >
            {/* Icon container */}
            <View
              style={{
                marginBottom: SPACING.lg,
                width: 50,
                height: 50,
                borderRadius: RADIUS.md,
                backgroundColor: `rgba(212,175,55,0.15)`,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: `rgba(212,175,55,0.3)`,
              }}
            >
              <Ionicons
                name={icon as any}
                size={28}
                color={COLORS.primaryGold}
              />
            </View>

            {/* Title */}
            <Text
              style={{
                fontFamily: FONTS.sans.semibold,
                fontSize: 15,
                color: COLORS.textAccentMuted,
                marginBottom: SPACING.sm,
                lineHeight: 18,
              }}
            >
              {title}
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontFamily: FONTS.sans.regular,
                fontSize: 12,
                color: COLORS.textSecondary,
                lineHeight: 16,
                marginBottom: SPACING.md,
              }}
            >
              {subtitle}
            </Text>

            {/* Arrow */}
            <View style={{ alignSelf: 'flex-end' }}>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={COLORS.primaryGold}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Stats card component with premium design
  const StatsCard = ({ icon, stat, description }: any) => {
    const statScaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(statScaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{
          transform: [{ scale: statScaleAnim }],
          shadowColor: COLORS.primaryGold,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={GRADIENTS.cardAccent as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: RADIUS.xl,
            borderWidth: 1,
            borderColor: `rgba(${parseInt(COLORS.primaryGold.slice(1, 3), 16)}, ${parseInt(COLORS.primaryGold.slice(3, 5), 16)}, ${parseInt(COLORS.primaryGold.slice(5, 7), 16)}, 0.2)`,
            padding: SPACING.lg,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: SPACING.lg,
          }}
        >
          {/* Icon container */}
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: RADIUS.md,
              backgroundColor: `rgba(212,175,55,0.15)`,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: `rgba(212,175,55,0.3)`,
              marginRight: SPACING.lg,
            }}
          >
            <Ionicons
              name={icon}
              size={32}
              color={COLORS.primaryGold}
            />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: FONTS.serif.light,
                fontSize: 36,
                color: COLORS.primaryGold,
                fontWeight: '300',
              }}
            >
              {stat}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.sans.regular,
                fontSize: 11,
                color: COLORS.textSecondary,
                marginTop: SPACING.xs,
                lineHeight: 16,
              }}
            >
              {description}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const handleGetStarted = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Signup');
  };

  const handleSignIn = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBackground} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Starfield */}
        <View style={{ position: 'absolute', width, height: height * 0.4, overflow: 'hidden' }}>
          <StarField />
        </View>

        <View style={{ flex: 1 }}>
          {/* Header */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              paddingHorizontal: SPACING.lg,
              paddingTop: SPACING.lg,
              paddingBottom: SPACING.sm,
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.sans.bold,
                fontSize: 32,
                color: COLORS.primaryGold,
                letterSpacing: 2,
              }}
            >
              SPURZ.AI
            </Text>
            <Text
              style={{
                fontFamily: FONTS.sans.regular,
                fontSize: 14,
                color: COLORS.textSecondary,
                marginTop: SPACING.xs,
              }}
            >
              Your Earning Intelligence
            </Text>
          </Animated.View>

          {/* Hero Section */}
          <Animated.View
            style={{
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.lg,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              zIndex: 5,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.sans.semibold,
                fontSize: 24,
                color: COLORS.textPrimary,
                lineHeight: 30,
                marginBottom: SPACING.sm,
                textAlign: 'center',
              }}
            >
              Earn More, Live Better
            </Text>
            <Text
              style={{
                fontFamily: FONTS.sans.regular,
                fontSize: 15,
                color: COLORS.textSecondary,
                lineHeight: 22,
                textAlign: 'center',
                maxWidth: '85%',
              }}
            >
              AI-powered insights to maximize your earnings and unlock exclusive rewards
            </Text>
          </Animated.View>

          {/* Feature Cards */}
          <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.md, gap: SPACING.sm }}>
            <View
              style={{
                backgroundColor: COLORS.secondaryBackground,
                borderRadius: RADIUS.xl,
                borderWidth: 1,
                borderColor: `${COLORS.primaryGold}20`,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.lg,
                  gap: SPACING.md,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: RADIUS.lg,
                    backgroundColor: `${COLORS.primaryGold}15`,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="sparkles" size={28} color={COLORS.primaryGold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.sans.semibold,
                      fontSize: 16,
                      color: COLORS.textPrimary,
                      marginBottom: 2,
                    }}
                  >
                    Smart Insights
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.sans.regular,
                      fontSize: 13,
                      color: COLORS.textSecondary,
                    }}
                  >
                    AI analyzes your spending patterns
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                backgroundColor: COLORS.secondaryBackground,
                borderRadius: RADIUS.xl,
                borderWidth: 1,
                borderColor: `${COLORS.primaryGold}20`,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.lg,
                  gap: SPACING.md,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: RADIUS.lg,
                    backgroundColor: `${COLORS.primaryGold}15`,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="wallet" size={28} color={COLORS.primaryGold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.sans.semibold,
                      fontSize: 16,
                      color: COLORS.textPrimary,
                      marginBottom: 2,
                    }}
                  >
                    Earn More
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.sans.regular,
                      fontSize: 13,
                      color: COLORS.textSecondary,
                    }}
                  >
                    Get cashback and rewards automatically
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                backgroundColor: COLORS.secondaryBackground,
                borderRadius: RADIUS.xl,
                borderWidth: 1,
                borderColor: `${COLORS.primaryGold}20`,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.lg,
                  gap: SPACING.md,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: RADIUS.lg,
                    backgroundColor: `${COLORS.primaryGold}15`,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="shield-checkmark" size={28} color={COLORS.primaryGold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.sans.semibold,
                      fontSize: 16,
                      color: COLORS.textPrimary,
                      marginBottom: 2,
                    }}
                  >
                    Bank-Level Security
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.sans.regular,
                      fontSize: 13,
                      color: COLORS.textSecondary,
                    }}
                  >
                    Your data is encrypted and secure
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Hook Cards - Deals Preview */}
          <View style={{ marginTop: SPACING.md }}>
            <Text
              style={{
                fontFamily: FONTS.sans.semibold,
                fontSize: 16,
                color: COLORS.textPrimary,
                paddingHorizontal: SPACING.lg,
                marginBottom: SPACING.xs,
              }}
            >
              Exclusive Deals
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: SPACING.lg,
                gap: SPACING.md,
              }}
            >
              <HookCard
                icon="airplane"
                title="Save 10%"
                subtitle="on travel bookings"
                delay={400}
              />
              <HookCard
                icon="home"
                title="Best hotel"
                subtitle="deals near you"
                delay={600}
              />
              <HookCard
                icon="pricetag"
                title="Custom"
                subtitle="offers for you"
                delay={800}
              />
              <HookCard
                icon="restaurant"
                title="Food"
                subtitle="discounts"
                delay={1000}
              />
            </ScrollView>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* CTA Section */}
          <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm }}>
            <TouchableOpacity
              onPress={handleGetStarted}
              activeOpacity={0.9}
              style={{
                width: '100%',
                borderRadius: RADIUS.lg,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={GRADIENTS.premiumGold as any}
                style={{
                  paddingVertical: SPACING.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.sans.semibold,
                    fontSize: 16,
                    color: COLORS.primaryBackground,
                  }}
                >
                  Get Started
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              activeOpacity={0.9}
              style={{
                width: '100%',
                paddingVertical: SPACING.md,
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                borderColor: `${COLORS.primaryGold}40`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.sans.semibold,
                  fontSize: 16,
                  color: COLORS.primaryGold,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LandingScreen;
