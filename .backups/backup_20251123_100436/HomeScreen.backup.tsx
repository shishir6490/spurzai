import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Easing,
  Image,
  GestureResponderEvent,
  Platform,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SpurzLogo } from '@components/SpurzLogo';
import { Card3D } from '@components/Card3D';
import { AnimatedNumber } from '@components/AnimatedNumber';
import { PotentialSavingsNudge } from '@components/PotentialSavingsNudge';
import { AnimatedProgressBar } from '@components/AnimatedProgressBar';
import { ArrowFill } from '@components/ArrowFill';
import { hapticFeedback } from '@utils/haptics';
import { adaptiveShadow, getScrollPadding, getPlatformAdjustments } from '@utils/adaptive';
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';
import { AddCardModal } from '@components/AddCardModal';
import { CompleteBudgetSetupModal } from '@components/CompleteBudgetSetupModal';

const { width, height } = Dimensions.get('window');

// Generate random stars for background
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * (height * 0.8), // Keep stars in upper portion
    size: Math.random() * 2 + 0.5, // 0.5 to 2.5 size
    duration: Math.random() * 4000 + 6000, // 6-10s animation
    delay: Math.random() * 2000, // 0-2s stagger
    opacity: Math.random() * 0.6 + 0.3 // 0.3-0.9 opacity
  }));
};

// Animated Star Component
interface AnimatedStarProps {
  star: Star;
}

const AnimatedStar = ({ star }: AnimatedStarProps) => {
  const opacityAnim = useRef(new Animated.Value(star.opacity)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(star.delay),
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: star.opacity * 0.4,
              duration: star.duration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            }),
            Animated.timing(opacityAnim, {
              toValue: star.opacity,
              duration: star.duration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            })
          ]),
          Animated.sequence([
            Animated.timing(translateXAnim, {
              toValue: (Math.random() - 0.5) * 15,
              duration: star.duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            }),
            Animated.timing(translateXAnim, {
              toValue: 0,
              duration: star.duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            })
          ]),
          Animated.sequence([
            Animated.timing(translateYAnim, {
              toValue: (Math.random() - 0.5) * 10,
              duration: star.duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            }),
            Animated.timing(translateYAnim, {
              toValue: 0,
              duration: star.duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            })
          ])
        ])
      )
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: '#FFFFFF',
          opacity: opacityAnim,
          transform: [
            { translateX: translateXAnim },
            { translateY: translateYAnim }
          ],
          ...adaptiveShadow.light
        }
      ]}
    />
  );
};

// Falling Star Component with Trail
interface FallingStarProps {
  startX: number;
  startY: number;
  duration: number;
}

const FallingStar = ({ startX, startY, duration }: FallingStarProps) => {
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const trailOpacity1 = useRef(new Animated.Value(0.6)).current;
  const trailOpacity2 = useRef(new Animated.Value(0.4)).current;
  const trailOpacity3 = useRef(new Animated.Value(0.2)).current;

  React.useEffect(() => {
    Animated.parallel([
      // Main fall animation
      Animated.timing(translateYAnim, {
        toValue: height,
        duration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }),
      // Slight horizontal drift
      Animated.timing(translateXAnim, {
        toValue: (Math.random() - 0.5) * 40,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true
      }),
      // Fade out at end
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: duration * 0.2,
          useNativeDriver: true
        })
      ]),
      // Slight scale
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration,
          useNativeDriver: true
        })
      ])
    ]).start();

    // Trail animations
    Animated.timing(trailOpacity1, {
      toValue: 0,
      duration: duration * 0.7,
      useNativeDriver: true
    }).start();

    Animated.timing(trailOpacity2, {
      toValue: 0,
      duration: duration * 0.85,
      useNativeDriver: true
    }).start();

    Animated.timing(trailOpacity3, {
      toValue: 0,
      duration,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <View style={{ position: 'absolute', left: startX, top: startY }}>
      {/* Trail - Layer 3 (furthest back) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 1.5,
            height: 20,
            backgroundColor: COLORS.primaryGold,
            opacity: trailOpacity3,
            transform: [
              { translateY: translateYAnim },
              { translateX: translateXAnim }
            ]
          }
        ]}
      />
      
      {/* Trail - Layer 2 */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 1,
            height: 15,
            backgroundColor: COLORS.primaryGold,
            opacity: trailOpacity2,
            transform: [
              { translateY: Animated.add(translateYAnim, -10) },
              { translateX: translateXAnim }
            ]
          }
        ]}
      />
      
      {/* Trail - Layer 1 (closest) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 0.8,
            height: 10,
            backgroundColor: COLORS.primaryGold,
            opacity: trailOpacity1,
            transform: [
              { translateY: Animated.add(translateYAnim, -5) },
              { translateX: translateXAnim }
            ]
          }
        ]}
      />

      {/* Main star */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: COLORS.primaryGold,
            opacity: opacityAnim,
            transform: [
              { translateY: translateYAnim },
              { translateX: translateXAnim },
              { scale: scaleAnim }
            ],
            ...adaptiveShadow.glow
          }
        ]}
      />
    </View>
  );
};

// Premium Hook Cards with animations
interface HookCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index?: number;
}

const HookCard = ({ title, description, icon, index = 0 }: HookCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    // Entrance animation with stagger
    Animated.sequence([
      Animated.delay(300 + (index * 150)),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: false
      })
    ]).start(() => setIsVisible(true));

    // Continuous subtle glow pulse
    if (isVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false
          })
        ])
      ).start();
    }
  }, [isVisible]);

  const onPressIn = () => {
    hapticFeedback.light();
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: false
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.hookCard,
        {
          transform: [{ scale: scaleAnim }],
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7]
          })
        }
      ]}
    >
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={GRADIENTS.cardAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hookCardGradient}
        >
          <View style={styles.hookIconContainer}>
            {icon}
          </View>
          <Text style={styles.hookTitle}>{title}</Text>
          <Text style={styles.hookDescription}>{description}</Text>
          <View style={styles.hookArrow}>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primaryGold} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '' }: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  }, []);

  return (
    <Animated.Text
      style={{
        opacity: animatedValue,
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1]
            })
          }
        ]
      }}
    >
      {/* This will be replaced with actual counter logic in render */}
    </Animated.Text>
  );
};

// Savings Overview Card - Premium Component
const SavingsOverviewCard = ({ trigger, dashboardData }: { trigger: number; dashboardData: any }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconGlowAnim = useRef(new Animated.Value(0)).current;
  const shootingStarTranslateY = useRef(new Animated.Value(0)).current;
  const shootingStarOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animationSequence = Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false
        })
      ]),
      // Arrow fill + shooting star animation - continuous loop
      Animated.loop(
        Animated.sequence([
          // Step 1: Arrow fills from bottom to top
          Animated.timing(iconGlowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false
          }),
          // Step 2: After filled, star shoots upward
          Animated.parallel([
            Animated.timing(shootingStarOpacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true
            }),
            Animated.timing(shootingStarTranslateY, {
              toValue: -120,
              duration: 1200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true
            })
          ]),
          // Step 3: Reset animations
          Animated.parallel([
            Animated.timing(iconGlowAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false
            }),
            Animated.timing(shootingStarOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true
            }),
            Animated.timing(shootingStarTranslateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true
            })
          ]),
          // Pause before next cycle
          Animated.delay(800)
        ])
      )
    ]);

    animationSequence.start();

    return () => {
      animationSequence.reset();
    };
  }, [trigger]);

  // Use real data from backend - show zeros if user hasn't added data yet
  const currentSavings = dashboardData?.keyStats?.totalSavings ?? 0;
  const potentialSavings = dashboardData?.keyStats?.potentialSavings ?? 0;
  const currentPercentage = potentialSavings > 0 ? (currentSavings / potentialSavings) * 100 : 0;
  const thisMonthImprovement = dashboardData?.keyStats?.monthlyImprovement ?? 0;
  const hasNoData = currentSavings === 0 && potentialSavings === 0;

  return (
    <Card3D
      colors={['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.08)']}
      borderRadius={16}
      style={styles.savingsOverviewGradient}
    >
      <Animated.View
        style={[
          {
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Header with Icon - Arrow Fill + Shooting Star Animation */}
        <View style={styles.savingsHeader}>
          <View style={[styles.savingsIconBg, { position: 'relative', overflow: 'visible' }]}>
            <ArrowFill 
              fillProgress={iconGlowAnim} 
              shootingStarTranslateY={shootingStarTranslateY}
              shootingStarOpacity={shootingStarOpacity}
            />
          </View>
          <View>
            <Text style={styles.savingsTitle}>Savings Overview</Text>
            <Text style={styles.savingsSubtitle}>AI-Powered Financial Optimization</Text>
          </View>
        </View>

        {/* Savings Comparison */}
        {hasNoData ? (
          <View style={[styles.savingsComparisonRow, { paddingVertical: 20 }]}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Ionicons name="add-circle-outline" size={48} color={COLORS.primaryGold} style={{ marginBottom: 12 }} />
              <Text style={[styles.savingsLabel, { fontSize: 16, marginBottom: 8 }]}>No data yet</Text>
              <Text style={[styles.savingsAmount, { textAlign: 'center', paddingHorizontal: 20 }]}>
                Add your income and cards to see your savings potential
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.savingsComparisonRow}>
            <View style={[styles.savingsItem, { alignItems: 'center' }]}>
              <Text style={styles.savingsLabel}>Current Savings</Text>
              <View style={styles.savingsValueContainer}>
                <AnimatedNumber
                  key={`savings-current-${trigger}`}
                  value={currentPercentage}
                  duration={1800}
                  suffix="%"
                  textColor={COLORS.success}
                  fontSize={50}
                  fontWeight="700"
                  fontFamily={FONTS.serif.semibold}
                  style={styles.savingsValue}
                />
              </View>
              <Text style={styles.savingsAmount}>₹{(currentSavings / 1000).toFixed(1)}k saved</Text>
            </View>
            <View style={[styles.savingsItem, { alignItems: 'center' }]}>
              <Text style={styles.savingsLabel}>Potential Savings</Text>
              <View style={styles.savingsValueContainer}>
                <AnimatedNumber
                  key={`savings-potential-${trigger}`}
                  value={(potentialSavings / currentSavings) * 100}
                  duration={1800}
                  suffix="%"
                  textColor={COLORS.primaryGold}
                  fontSize={50}
                  fontWeight="700"
                  fontFamily={FONTS.serif.semibold}
                  style={[styles.savingsValue, { color: COLORS.primaryGold }]}
                />
              </View>
              <Text style={styles.savingsAmount}>₹{(potentialSavings / 1000).toFixed(1)}k possible</Text>
            </View>
          </View>
        )}

        {/* This Month's Improvement - only show if there's data */}
        {!hasNoData && (
          <View style={styles.improvementSection}>
            <View style={styles.improvementHeader}>
              <Text style={styles.improvementLabel}>This month's improvement</Text>
              <View style={styles.improvementBadge}>
                <Ionicons name="arrow-up" size={12} color={COLORS.success} />
                <Text style={styles.improvementPercent}>+{thisMonthImprovement.toFixed(1)}%</Text>
              </View>
            </View>
            <AnimatedProgressBar
              key={`progress-${trigger}`}
              progress={thisMonthImprovement * 10}
              duration={2000}
              colors={[COLORS.primaryGold, '#EADFB4']}
              height={6}
              borderRadius={3}
              backgroundColor="rgba(255, 255, 255, 0.1)"
            />
          </View>
        )}

        {/* CTA Section - Connected to Savings Card */}
        <View style={styles.savingsCTA}>
          <View style={styles.ctaHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaDescription}>
                You can save an additional
              </Text>
              <View style={styles.additionalSavingsRow}>
                <Text style={styles.additionalSavings}>₹10.4k</Text>
                <Text style={styles.additionalLabel}>per month</Text>
              </View>
            </View>
            <View style={styles.ctaIconBg}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.success} />
            </View>
          </View>
          <Text style={styles.ctaHint}>
            By optimizing your spending with AI-recommended credit cards
          </Text>
        </View>
      </Animated.View>
    </Card3D>
  );
};

// Top Spending Category Card Component
interface TopSpendingCardProps {
  category: string;
  icon: string;
  amount: number;
  percentage: number;
  savingPotential: number;
  savingPercentage: number;
  barColor: string;
  bgColor: string;
  index?: number;
  trigger?: number;
}

const TopSpendingCard = ({ 
  category, 
  icon, 
  amount, 
  percentage, 
  savingPotential, 
  savingPercentage,
  barColor,
  bgColor,
  index = 0,
  trigger = 0
}: TopSpendingCardProps) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(200 + (index * 150)), // Staggered entrance
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: false
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false
        })
      ])
    ]).start();
  }, [trigger]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim
      }}
    >
      <Card3D
        colors={[`${bgColor}20`, `${bgColor}05`]}
        borderRadius={16}
        style={styles.categoryCardContainer}
      >
        <View style={[styles.categoryGradient, { borderColor: `${bgColor}40` }]}>
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIconBg, { backgroundColor: `${bgColor}30` }]}>
            <Text style={{ fontSize: 32 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.categoryName}>{category}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={styles.categoryAmount}>₹{amount.toLocaleString()}</Text>
              <Text style={styles.categoryPercent}>{percentage}% of total</Text>
            </View>
          </View>
        </View>

        {/* Spending Progress Bar */}
        <View style={styles.spendingBarContainer}>
          <LinearGradient
            colors={[barColor, `${barColor}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.spendingBar, { width: `${percentage * 3}%` }]}
          />
        </View>

        {/* Potential Savings Box */}
        <View style={styles.potentialSavingsBox}>
          <Ionicons name="leaf" size={14} color={COLORS.success} style={styles.potentialSavingsIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.potentialSavingsText}>Potential savings</Text>
          </View>
          <Text style={styles.potentialSavingsAmount}>
            +₹{savingPotential.toLocaleString()} ({savingPercentage}%)
          </Text>
          <Ionicons name="arrow-up" size={14} color={COLORS.success} style={{ marginLeft: SPACING.xs }} />
        </View>
      </View>
    </Card3D>
    </Animated.View>
  );
};

// Deal Card Component with animations
interface DealCardProps {
  item: {
    id: string;
    title: string;
    savings: string;
    badge: string;
    category: string;
  };
  index: number;
}

const DealCard = ({ item, index }: DealCardProps) => {
  const dealScaleAnim = useRef(new Animated.Value(0.9)).current;
  const dealPressAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(100 + (index * 150)),
      Animated.timing(dealScaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: false
      })
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    hapticFeedback.light();
    Animated.spring(dealPressAnim, {
      toValue: 0.95,
      useNativeDriver: false
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(dealPressAnim, {
      toValue: 1,
      useNativeDriver: false
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: dealScaleAnim }] }}>
      <TouchableOpacity 
        style={styles.dealCard} 
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale: dealPressAnim }] }}>
          <LinearGradient
            colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dealGradient}
          >
            <View style={styles.dealHeader}>
              <View style={styles.dealBadge}>
                <Text style={styles.dealBadgeText}>{item.badge}</Text>
              </View>
            </View>
            <Text style={styles.dealTitle}>{item.title}</Text>
            <View style={styles.dealFooter}>
              <View>
                <Text style={styles.dealSavingLabel}>Save up to</Text>
                <Text style={styles.dealSaving}>{item.savings}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primaryGold} />
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main HomeScreen Component
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const [stars] = useState(() => generateStars(45)); // 45 stars for premium feel
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [fallingStars, setFallingStars] = useState<Array<{ id: number; x: number; y: number; duration: number }>>([]);
  const viewMoreScaleAnim = useRef(new Animated.Value(1)).current;
  const fallingStarIdRef = useRef(0);

  // Backend data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal state
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showBudgetSetupModal, setShowBudgetSetupModal] = useState(false);
  const [modalStartStep, setModalStartStep] = useState(0);

  useEffect(() => {
    console.log('🔄 Modal States:', { showAddCardModal, showBudgetSetupModal, modalStartStep });
  }, [showAddCardModal, showBudgetSetupModal, modalStartStep]);

  // Generate falling star at random intervals
  React.useEffect(() => {
    const interval = setInterval(() => {
      const randomInterval = Math.random() * 4000 + 3000; // 3-7 seconds between falls
      
      setTimeout(() => {
        const newStar = {
          id: fallingStarIdRef.current++,
          x: Math.random() * width,
          y: -20,
          duration: Math.random() * 2000 + 3000 // 3-5 second fall
        };
        
        setFallingStars(prev => [...prev, newStar]);
        
        // Remove star after animation completes
        setTimeout(() => {
          setFallingStars(prev => prev.filter(s => s.id !== newStar.id));
        }, newStar.duration);
      }, randomInterval);
    }, 8000); // Check every 8 seconds

    return () => clearInterval(interval);
  }, []);

  // View More Button animations
  const onViewMorePressIn = () => {
    hapticFeedback.light();
    Animated.spring(viewMoreScaleAnim, {
      toValue: 0.95,
      useNativeDriver: false
    }).start();
  };

  const onViewMorePressOut = () => {
    Animated.spring(viewMoreScaleAnim, {
      toValue: 1,
      useNativeDriver: false
    }).start();
  };

  // Fetch dashboard data from backend
  const fetchDashboardData = React.useCallback(async () => {
    console.log('🔍 fetchDashboardData called');
    console.log('🔒 isAuthenticated:', isAuthenticated);
    console.log('👤 user:', user);
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, skipping data fetch');
      setIsLoadingData(false);
      return;
    }

    try {
      console.log('📡 Fetching dashboard data from API...');
      setIsLoadingData(true);
      const data = await ApiClient.getHomeDashboard();
      console.log('✅ Dashboard data received:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setIsLoadingData(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user]);

  // Fetch data on mount and when authenticated
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Trigger animations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setAnimationTrigger(prev => prev + 1);
      fetchDashboardData(); // Refresh data when screen comes into focus
    }, [fetchDashboardData])
  );

  // Animated values for scroll-based transformations
  const logoScale = scrollAnim.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.5],
    extrapolate: 'clamp'
  });

  const logoOpacity = scrollAnim.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollAnim.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const titleTranslateY = scrollAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -30],
    extrapolate: 'clamp'
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollAnim.setValue(event.nativeEvent.contentOffset.y);
  };

  // Show loading screen on first load
  if (isLoadingData && !dashboardData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={GRADIENTS.background}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryGold} />
          <Text style={styles.loadingText}>Loading your financial insights...</Text>
        </View>
      </View>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={GRADIENTS.background}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <SpurzLogo size="large" />
          <Text style={styles.loadingText}>Please log in to view your dashboard</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={GRADIENTS.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Premium Starfield Background */}
      <View style={styles.starfieldContainer} pointerEvents="none">
        {stars.map(star => (
          <AnimatedStar key={star.id} star={star} />
        ))}
        {/* Falling stars with trails */}
        {fallingStars.map(fallingStar => (
          <FallingStar 
            key={fallingStar.id} 
            startX={fallingStar.x}
            startY={fallingStar.y}
            duration={fallingStar.duration}
          />
        ))}
      </View>

      {/* Animated Sticky Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            opacity: headerOpacity,
            paddingTop: insets.top
          }
        ]}
      >
        <BlurView tint="dark" intensity={90} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View style={styles.headerLogo}>
              <Text style={styles.headerSpurz}>Spurz</Text>
              <Text style={styles.headerAI}>.AI</Text>
            </View>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => hapticFeedback.light()}
            >
              <Ionicons name="notifications" size={22} color={COLORS.primaryGold} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      {/* Main ScrollView */}
      <ScrollView
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingBottom: getPlatformAdjustments().tabBarHeight }}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled={true}
        horizontal={false}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            tintColor={COLORS.primaryGold}
            colors={[COLORS.primaryGold]}
          />
        }
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: titleTranslateY }
              ]
            }
          ]}
        >
          <SpurzLogo size="large" />

          <View style={styles.heroDecorator}>
            <View style={styles.decoratorLine} />
            <Ionicons name="sparkles" size={24} color={COLORS.primaryGold} style={styles.decoratorIcon} />
            <View style={styles.decoratorLine} />
          </View>

          <Text style={styles.heroTagline}>
            {user?.fullName ? `Welcome back, ${user.fullName}!` : 'YOUR EARNING INTELLIGENCE'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {dashboardData?.hero?.subtitle || 'AI-Powered Financial Optimization'}
          </Text>
        </Animated.View>

        {/* Potential Savings Nudge - Show if data is incomplete OR show actual savings */}
        {(() => {
          const missingData: string[] = [];
          let startStep = 0;

          // Get financial metrics from backend
          const metrics = dashboardData?.snapshot?.metrics;
          const income = metrics?.monthlyIncome || 0;
          const expenses = metrics?.monthlyExpenses || 0;
          const investments = metrics?.monthlyInvestments || 0;
          const loans = metrics?.monthlyLoans || 0;
          
          // Check if has income - must be > 0 to count as having data
          const hasIncome = income > 0;
          
          // Check if has spending data (expenses OR investments OR loans)
          const hasSpending = (expenses + investments + loans) > 0;
          
          console.log('📊 Enhanced Data Check:', { 
            income, 
            expenses,
            investments,
            loans,
            hasIncome, 
            hasSpending,
            metrics
          });

          // Determine what's CRITICALLY missing (cards are optional)
          if (!hasIncome) {
            missingData.push('Monthly Income');
            startStep = 0; // Start at income step
          }
          if (!hasSpending) {
            missingData.push('Spending Categories');
            if (hasIncome) {
              startStep = 1; // Skip to spending if income exists
            }
          }
          
          // Cards are optional - don't add to missing data
          // Users can add cards later if they want

          // Calculate savings percentages
          let currentSavingsPercent = 0;
          let potentialSavingsPercent = 0;
          
          if (hasIncome && hasSpending) {
            // Total outflow = expenses + investments + loans
            const totalOutflow = expenses + investments + loans;
            const savings = income - totalOutflow;
            
            console.log('💰 Savings Calculation:', {
              income,
              expenses,
              investments,
              loans,
              totalOutflow,
              savings,
              savingsPercent: (savings / income) * 100
            });
            
            if (income > 0) {
              currentSavingsPercent = Math.round((savings / income) * 100 * 10) / 10;
              // Add random 1.0-10.0% for potential savings
              const randomBoost = Math.random() * 9 + 1; // 1.0 to 10.0
              potentialSavingsPercent = Math.round((currentSavingsPercent + randomBoost) * 10) / 10;
            }
          }

          // If essential data (income + spending) is complete, show savings achievement
          if (hasIncome && hasSpending) {
            return (
              <PotentialSavingsNudge
                missingData={[]}
                currentSavingsPercent={currentSavingsPercent}
                potentialSavingsPercent={potentialSavingsPercent}
                showSuccess={true}
                onTakAction={() => {
                  hapticFeedback.medium();
                  // Navigate to profile to edit/add more data
                  navigation.navigate('Profile');
                }}
              />
            );
          }

          // If missing essential data, show nudge
          if (missingData.length > 0) {
            return (
              <PotentialSavingsNudge
                missingData={missingData}
                currentSavingsPercent={currentSavingsPercent}
                potentialSavingsPercent={potentialSavingsPercent}
                showSuccess={false}
                onTakAction={() => {
                  console.log('🎯 Opening modal with startStep:', startStep);
                  setModalStartStep(startStep);
                  setShowBudgetSetupModal(true);
                }}
              />
            );
          }

          return null;
        })()}

        {/* Show simple text nudge if no locked cards appeared (shouldn't happen) */}
        {dashboardData?.dataCompleteness?.completionPercentage === 0 && 
         dashboardData?.dataCompleteness?.hasIncomeInfo && 
         dashboardData?.dataCompleteness?.hasCardInfo && (
          <View style={styles.noDataSection}>
            <Text style={styles.noDataTitle}>Get Started with Spurz</Text>
            <Text style={styles.noDataSubtitle}>
              Add your financial information to unlock personalized insights and savings recommendations
            </Text>

            {/* Action Cards */}
            <View style={styles.actionCardsContainer}>
              {dashboardData?.nextBestActions?.map((action: any, index: number) => (
                <TouchableOpacity
                  key={action.id || index}
                  style={styles.actionCard}
                  onPress={() => {
                    hapticFeedback.medium();
                    // Navigate based on action type or open modals
                    if (action.type === 'credit' || action.icon === 'card') {
                      setShowAddCardModal(true);
                    } else if (action.type === 'other' && action.icon === 'income') {
                      setShowBudgetSetupModal(true);
                    } else if (action.icon === 'email') {
                      // Email connection feature - could navigate to settings
                      navigation.navigate('Profile');
                    }
                  }}
                >
                  <View style={styles.actionCardHeader}>
                    <View style={[styles.actionCardIcon, { 
                      backgroundColor: action.estimatedImpact === 'high' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)' 
                    }]}>
                      <Ionicons 
                        name={action.icon === 'income' ? 'cash-outline' : action.icon === 'card' ? 'card-outline' : 'mail-outline'} 
                        size={24} 
                        color={action.estimatedImpact === 'high' ? COLORS.primaryGold : COLORS.secondaryGold} 
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.actionCardTitle}>{action.title}</Text>
                      <Text style={styles.actionCardDescription}>{action.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Features Showcase */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Smart Features</Text>
          <FlatList
            horizontal
            data={[
              {
                id: 'smart',
                title: 'Smart Recommendations',
                description: 'Personalized card suggestions based on your spending',
                icon: <Ionicons name="sparkles" size={36} color={COLORS.primaryGold} />
              },
              {
                id: 'track',
                title: 'Real-time Tracking',
                description: 'Monitor spending across all categories instantly',
                icon: <MaterialIcons name="trending-up" size={36} color={COLORS.primaryGold} />
              },
              {
                id: 'rewards',
                title: 'Maximize Rewards',
                description: 'Optimize spending to earn maximum cashback',
                icon: <Ionicons name="gift" size={36} color={COLORS.primaryGold} />
              }
            ]}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
            ItemSeparatorComponent={() => <View style={{ width: SPACING.md }} />}
            renderItem={({ item, index }) => (
              <HookCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                index={index}
              />
            )}
          />
        </View>

        {/* Trending Deals Section */}
        <View style={styles.dealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Opportunities</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => hapticFeedback.medium()}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primaryGold} />
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={[
              {
                id: 'deal1',
                title: 'Flights to Bangkok',
                savings: '₹8,000',
                badge: '50% OFF',
                category: 'Travel'
              },
              {
                id: 'deal2',
                title: '5-Star Hotel Packages',
                savings: '₹5,000',
                badge: '40% OFF',
                category: 'Hotels'
              }
            ]}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
            ItemSeparatorComponent={() => <View style={{ width: SPACING.md }} />}
            renderItem={({ item, index }) => <DealCard item={item} index={index} />}
          />
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <BlurView tint="dark" intensity={70} style={styles.ctaBlur}>
            <LinearGradient
              colors={GRADIENTS.premiumGold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <TouchableOpacity 
                style={styles.ctaButtonInner} 
                activeOpacity={0.8}
                onPress={() => hapticFeedback.medium()}
              >
                <Text style={styles.ctaButtonText}>Start Earning More</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.primaryBackground} />
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
          <Text style={styles.ctaSubtext}>Join 100K+ smart savers already using Spurz</Text>
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <AddCardModal
        visible={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

      {/* Complete Budget Setup Modal */}
      <CompleteBudgetSetupModal
        visible={showBudgetSetupModal}
        onClose={() => {
          setShowBudgetSetupModal(false);
          // Force refetch after a delay to allow backend to update
          setTimeout(() => {
            console.log('🔄 Refetching dashboard after modal close');
            fetchDashboardData();
          }, 500);
        }}
        onComplete={() => {
          console.log('✅ Budget setup complete, refetching dashboard');
          fetchDashboardData();
        }}
        startStep={modalStartStep}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground
  },
  starfieldContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.9,
    zIndex: 1,
    overflow: 'hidden'
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 0
  },
  headerBlur: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 0
  },
  headerSpurz: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8E8E8',
    fontFamily: FONTS.sans.bold,
    letterSpacing: 0.3,
    lineHeight: 16
  },
  headerAI: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold,
    letterSpacing: 0.8,
    marginLeft: SPACING.xs,
    lineHeight: 13
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.45
  },
  heroLogo: {
    marginBottom: SPACING.xl
  },
  heroDecorator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    width: '100%',
    justifyContent: 'center'
  },
  decoratorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.primaryGold,
    opacity: 0.3,
    maxWidth: 80
  },
  decoratorIcon: {
    marginHorizontal: SPACING.md
  },
  heroTagline: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textAccentMuted,
    fontFamily: FONTS.sans.bold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 2
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
    letterSpacing: 0.5
  },
  savingsOverviewSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg
  },
  insightsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg
  },
  savingsOverviewGradient: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 0,
    backgroundColor: 'rgba(26,29,41,0.95)'
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl
  },
  savingsIconBg: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(0,200,136,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textAccentMuted,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.xs
  },
  savingsSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    letterSpacing: 0.5
  },
  savingsComparisonRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md
  },
  savingsItem: {
    flex: 1,
    paddingHorizontal: SPACING.md
  },
  savingsLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5
  },
  savingsValue: {
    fontWeight: '700',
    color: COLORS.success,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.xs
  },
  savingsValueContainer: {
    marginBottom: SPACING.xs
  },
  savingsAmount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular
  },
  improvementSection: {
    marginBottom: SPACING.xl
  },
  improvementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  improvementLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    letterSpacing: 0.5
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(74,222,128,0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full
  },
  improvementPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.success,
    fontFamily: FONTS.sans.bold
  },
  savingsCTA: {
    marginTop: 0,
    paddingTop: SPACING.lg,
    backgroundColor: 'rgba(0,200,136,0.08)',
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    marginHorizontal: -16,
    marginBottom: -20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl
  },
  ctaDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginBottom: SPACING.sm
  },
  additionalSavingsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
    marginBottom: SPACING.md
  },
  additionalSavings: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.success,
    fontFamily: FONTS.sans.bold
  },
  additionalLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular
  },
  ctaHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    lineHeight: 18,
    marginTop: SPACING.sm
  },
  ctaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.lg,
    marginBottom: SPACING.md
  },
  ctaIconBg: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(0,200,136,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0
  },
  topSpendingSection: {
    paddingHorizontal: SPACING.lg
  },
  topSpendingHeader: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  topSpendingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textAccentMuted,
    fontFamily: FONTS.sans.bold
  },
  topSpendingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginTop: SPACING.xs
  },
  getInsightsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.primaryGold
  },
  getInsightsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold
  },
  cardsContainer: {
    paddingBottom: SPACING.lg
  },
  viewMoreButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryGold,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.semibold
  },
  categoryCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    overflow: 'visible'
  },
  categoryCardContainer: {
    marginBottom: SPACING.md
  },
  categoryGradient: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 0,
    backgroundColor: 'rgba(26,29,41,0.95)'
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg
  },
  categoryIconBg: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textAccentMuted,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.xs
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textAccent,
    fontFamily: FONTS.sans.bold
  },
  categoryPercent: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginLeft: SPACING.sm
  },
  spendingBarContainer: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: SPACING.lg
  },
  spendingBar: {
    height: '100%',
    borderRadius: RADIUS.full
  },
  potentialSavingsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0,200,136,0.15)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,200,136,0.3)'
  },
  potentialSavingsIcon: {
    marginRight: SPACING.xs
  },
  potentialSavingsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular
  },
  potentialSavingsAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
    fontFamily: FONTS.sans.bold
  },
  statsSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.md
  },
  statCard: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)'
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.sm
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(74,222,128,0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start'
  },
  trendText: {
    fontSize: 11,
    color: COLORS.success,
    fontFamily: FONTS.sans.semibold
  },
  featuresContainer: {
    paddingVertical: SPACING.xl
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textAccentMuted,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    letterSpacing: 0.3
  },
  hookCard: {
    width: 280,
    borderRadius: RADIUS.lg,
    overflow: 'hidden'
  },
  hookCardGradient: {
    flex: 1,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)'
  },
  hookIconContainer: {
    marginBottom: SPACING.lg,
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  hookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textAccentMuted,
    fontFamily: FONTS.sans.semibold,
    marginBottom: SPACING.sm
  },
  hookDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    lineHeight: 18,
    marginBottom: SPACING.lg
  },
  hookArrow: {
    alignSelf: 'flex-end'
  },
  dealsSection: {
    paddingVertical: SPACING.xl
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.semibold
  },
  dealCard: {
    width: 280,
    borderRadius: RADIUS.lg,
    overflow: 'hidden'
  },
  dealGradient: {
    flex: 1,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)'
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  dealBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(212,175,55,0.25)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryGold
  },
  dealBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold
  },
  dealTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textAccentMuted,
    fontFamily: FONTS.sans.semibold,
    marginBottom: SPACING.lg
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dealSavingLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginBottom: SPACING.xs
  },
  dealSaving: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold
  },
  ctaSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl
  },
  ctaBlur: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md
  },
  ctaGradient: {
    padding: 3
  },
  ctaButtonInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryBackground
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold
  },
  ctaSubtext: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontFamily: FONTS.sans.regular,
    textAlign: 'center',
    letterSpacing: 0.3
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginTop: SPACING.lg,
    textAlign: 'center'
  },
  loginButton: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primaryGold,
    borderRadius: RADIUS.md
  },
  loginButtonText: {
    fontSize: 16,
    color: COLORS.primaryBackground,
    fontFamily: FONTS.sans.semibold,
    textAlign: 'center'
  },
  noDataSection: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
    textAlign: 'center',
    marginBottom: SPACING.md
  },
  noDataSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl
  },
  actionCardsContainer: {
    gap: SPACING.md
  },
  actionCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.1)'
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.semibold,
    marginBottom: 4
  },
  actionCardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    lineHeight: 18
  }
});
