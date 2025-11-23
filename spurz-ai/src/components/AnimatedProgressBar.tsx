import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedProgressBarProps {
  progress: number; // 0 to 100
  duration?: number;
  colors?: string[];
  height?: number;
  borderRadius?: number;
  containerStyle?: ViewStyle;
  backgroundColor?: string;
}

export const AnimatedProgressBar = ({
  progress,
  duration = 2000,
  colors = ['#D4AF37', '#EADFB4'],
  height = 8,
  borderRadius = 4,
  containerStyle,
  backgroundColor = 'rgba(255, 255, 255, 0.1)'
}: AnimatedProgressBarProps) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedProgress.setValue(0);
    
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: duration,
      useNativeDriver: false
    }).start();

    const listener = animatedProgress.addListener(({ value: val }) => {
      widthAnim.setValue((val / 100) * 100);
    });

    return () => {
      animatedProgress.removeListener(listener);
    };
  }, [progress, duration]);

  const widthInterpolation = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp'
  });

  return (
    <View
      style={[
        {
          height,
          borderRadius,
          backgroundColor,
          overflow: 'hidden'
        },
        containerStyle
      ]}
    >
      <Animated.View
        style={{
          width: widthInterpolation,
          height: '100%',
          borderRadius
        }}
      >
        <LinearGradient
          colors={colors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius
          }}
        />
      </Animated.View>
    </View>
  );
};
