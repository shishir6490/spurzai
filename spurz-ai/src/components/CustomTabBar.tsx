import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, RADIUS, GRADIENTS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';
import { adaptiveShadow } from '@utils/adaptive';

const { width } = Dimensions.get('window');

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

// Premium Enhanced Glow Effect for Center Button
const EnhancedGlowEffect = ({ isActive }: { isActive: boolean }) => {
  const glowScale1 = useRef(new Animated.Value(0.8)).current;
  const glowOpacity1 = useRef(new Animated.Value(0.4)).current;
  const glowScale2 = useRef(new Animated.Value(0.9)).current;
  const glowOpacity2 = useRef(new Animated.Value(0.3)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Glow pulse layer 1 - subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale1, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(glowScale1, {
          toValue: 0.9,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();

    // Glow pulse layer 2 (offset) - subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(glowScale2, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(glowScale2, {
          toValue: 1.0,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();

    // Continuous pulse when active - minimal pulse
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [isActive]);

  return (
    <>
      {/* Outer glow layer 1 */}
      <Animated.View
        style={[
          styles.glowLayer,
          {
            transform: [{ scale: glowScale1 }],
            opacity: glowOpacity1,
            backgroundColor: COLORS.primaryGold
          }
        ]}
      />
      {/* Outer glow layer 2 */}
      <Animated.View
        style={[
          styles.glowLayer2,
          {
            transform: [{ scale: glowScale2 }],
            opacity: glowOpacity2,
            backgroundColor: COLORS.primaryGold
          }
        ]}
      />
      {/* Inner pulse */}
      {isActive && (
        <Animated.View
          style={[
            styles.innerPulse,
            {
              transform: [{ scale: pulseScale }]
            }
          ]}
        />
      )}
    </>
  );
};

// Animated starlight component for center button
const AnimatedStarlight = () => {
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Continuous rotation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true
      })
    ).start();

    // Pulsing opacity for starlight effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View
      style={[
        styles.starlightRing,
        {
          opacity,
          transform: [{ rotate: rotateInterpolate }]
        }
      ]}
    >
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.starlight,
            {
              transform: [
                { rotate: `${(i * 90)}deg` },
                { translateY: -28 }
              ]
            }
          ]}
        >
          <View style={styles.starDot} />
        </View>
      ))}
    </Animated.View>
  );
};

export const CustomTabBar = ({ state, descriptors, navigation }: CustomTabBarProps) => {
  const tabScaleAnim = useRef(new Animated.Value(1)).current;

  // Animate center button on focus
  useEffect(() => {
    const centerRoute = state.routes[2]; // SPURZ.AI is at index 2
    const isCentered = state.index === 2;

    Animated.spring(tabScaleAnim, {
      toValue: isCentered ? 1.1 : 1,
      friction: 8,
      tension: 60,
      useNativeDriver: false
    }).start();
  }, [state.index]);

  const getIcon = (routeName: string, focused: boolean) => {
    const iconColor = focused ? COLORS.primaryGold : COLORS.textSecondary;
    const iconSize = focused ? 24 : 20;

    switch (routeName) {
      case 'Home':
        return <Ionicons name={focused ? 'home' : 'home-outline'} size={iconSize} color={iconColor} />;
      case 'Deals':
        return <Ionicons name={focused ? 'pricetags' : 'pricetags-outline'} size={iconSize} color={iconColor} />;
      case 'SPURZ':
        return <Ionicons name="sparkles" size={28} color={COLORS.primaryGold} />;
      case 'Cards':
        return <MaterialIcons name="credit-card" size={iconSize} color={iconColor} />;
      case 'Profile':
        return <Ionicons name={focused ? 'person' : 'person-outline'} size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  const renderTabButton = (route: any, index: number, isFocused: boolean) => {
    const { options } = descriptors[route.key];
    const onPress = () => {
      hapticFeedback.light();
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        preventDefault: () => {}
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const isCenterTab = index === 2;

    if (isCenterTab) {
      // Center SPURZ.AI button with enhanced glow and animations
      return (
        <Animated.View
          key={route.key}
          style={[
            styles.centerTabContainer,
            {
              transform: [{ scale: tabScaleAnim }]
            }
          ]}
        >
          <View style={styles.centerButtonWrapper}>
            {/* Enhanced Glow Layers */}
            <EnhancedGlowEffect isActive={isFocused} />
            
            {/* Starlight Effect */}
            <AnimatedStarlight />
            
            {/* Main Button */}
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.medium();
                onPress();
              }}
              style={styles.centerButton}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={GRADIENTS.goldButton as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.centerGradient}
              >
                {getIcon(route.name, true)}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.centerLabel}>SPURZ.AI</Text>
        </Animated.View>
      );
    }

    // Side tabs
    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={[styles.tabButton, isFocused && styles.tabButtonFocused]}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {getIcon(route.name, isFocused)}
        </View>
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
          {route.name}
        </Text>
        {isFocused && (
          <View style={styles.focusIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      {/* Blur background */}
      <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />

      {/* Tab bar content - 5 equal sections */}
      <View style={styles.tabBar}>
        {/* Section 1: Home */}
        <View style={styles.tabSection}>
          {state.routes[0] && renderTabButton(state.routes[0], 0, state.index === 0)}
        </View>

        {/* Section 2: Deals */}
        <View style={styles.tabSection}>
          {state.routes[1] && renderTabButton(state.routes[1], 1, state.index === 1)}
        </View>

        {/* Section 3: SPURZ (Center) */}
        <View style={styles.tabSection}>
          {state.routes[2] && renderTabButton(state.routes[2], 2, state.index === 2)}
        </View>

        {/* Section 4: Cards */}
        <View style={styles.tabSection}>
          {state.routes[3] && renderTabButton(state.routes[3], 3, state.index === 3)}
        </View>

        {/* Section 5: Profile */}
        <View style={styles.tabSection}>
          {state.routes[4] && renderTabButton(state.routes[4], 4, state.index === 4)}
        </View>
      </View>

      {/* Safety area padding */}
      <View style={styles.safeAreaPadding} />
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    height: 70
  },
  tabSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    position: 'relative'
  },
  tabButton: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.md
  },
  tabButtonFocused: {
    backgroundColor: 'rgba(212,175,55,0.1)'
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs
  },
  tabLabelFocused: {
    color: COLORS.primaryGold
  },
  focusIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryGold,
    marginTop: SPACING.xs
  },
  centerTabContainer: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -30,
    alignItems: 'center',
    zIndex: 100
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...adaptiveShadow.glow
  },
  centerGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30
  },
  centerLabel: {
    fontSize: 9,
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
    marginTop: SPACING.sm,
    textAlign: 'center'
  },
  centerButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  glowLayer: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.25
  },
  glowLayer2: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    opacity: 0.15
  },
  innerPulse: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.primaryGold,
    opacity: 0.1
  },
  starlightRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  starlight: {
    position: 'absolute',
    width: 6,
    height: 6
  },
  starDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryGold,
    opacity: 0.8
  },
  safeAreaPadding: {
    height: 20
  }
});
