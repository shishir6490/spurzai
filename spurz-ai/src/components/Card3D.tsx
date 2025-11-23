import React, { useRef, useEffect } from 'react';
import {
  View,
  ViewStyle,
  Animated,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { adaptiveShadow } from '@utils/adaptive';

interface Card3DProps {
  children: React.ReactNode;
  colors: string[];
  style?: ViewStyle;
  borderRadius?: number;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
}

export const Card3D = ({
  children,
  colors,
  style,
  borderRadius = 16,
  onPress,
  onPressIn,
  onPressOut
}: Card3DProps) => {
  const translateY = useRef(new Animated.Value(-2)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Start with default floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -6,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: -2,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    onPressIn?.();
    // Lift effect on press - stop floating animation temporarily
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -12,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  };

  const handlePressOut = () => {
    onPressOut?.();
    // Return to floating animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -2,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          {
            borderRadius,
            marginBottom: 12,
            ...adaptiveShadow.heavy
          },
          {
            transform: [
              { translateY },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={colors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            {
              borderRadius,
              overflow: 'hidden',
              backgroundColor: '#1A1D29'
            },
            style
          ]}
        >
          {children}
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
