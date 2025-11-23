import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Text } from 'react-native';
import { COLORS, FONTS } from '@constants/theme';

interface AnimatedSpurzLogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  animationType?: 'rotate' | 'pulse' | 'float' | 'glow';
}

export const AnimatedSpurzLogo = ({ 
  size = 'medium', 
  style,
  animationType = 'glow'
}: AnimatedSpurzLogoProps) => {
  const sizes = {
    small: { iconSize: 32, textSize: 14, gap: 8 },
    medium: { iconSize: 56, textSize: 18, gap: 12 },
    large: { iconSize: 100, textSize: 32, gap: 16 }
  };

  const config = sizes[size];
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animationType === 'rotate') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: false
        })
      ).start();
    } else if (animationType === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: false
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false
          })
        ])
      ).start();
    } else if (animationType === 'float') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false
          })
        ])
      ).start();
    }

    // Glow animation always runs
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false
        })
      ])
    ).start();
  }, [animationType]);

  const iconRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8]
  });

  return (
    <View style={[styles.container, style]}>
      {/* Animated glow effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            width: config.iconSize + 60,
            height: config.iconSize + 60,
            borderRadius: (config.iconSize + 60) / 2,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.05, 0.2]
            })
          }
        ]}
      />

      {/* Animated S Icon */}
      <Animated.View
        style={[
          styles.sContainer,
          {
            width: config.iconSize,
            height: config.iconSize,
            borderRadius: config.iconSize * 0.12,
            transform: [
              { rotate: iconRotation },
              { scale: pulseAnim },
              { translateY: floatTranslate }
            ]
          }
        ]}
      >
        <Text
          style={[
            styles.sIcon,
            {
              fontSize: config.iconSize * 0.9,
              fontFamily: FONTS.sans.bold
            }
          ]}
        >
          S
        </Text>
      </Animated.View>

      {/* Brand Text: SPURZ.AI */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.brandText,
            {
              fontSize: config.textSize,
              fontFamily: FONTS.sans.bold
            }
          ]}
        >
          SPURZ.AI
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: COLORS.primaryGold,
    borderRadius: 999
  },
  sContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
    borderWidth: 2,
    borderColor: COLORS.primaryGold,
    backgroundColor: 'rgba(212,175,55,0.05)'
  },
  sIcon: {
    color: COLORS.primaryGold,
    fontWeight: '700',
    letterSpacing: -2
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandText: {
    color: '#E8E8E8',
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center'
  }
});
