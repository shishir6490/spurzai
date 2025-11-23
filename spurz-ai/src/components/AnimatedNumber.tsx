import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextProps } from 'react-native';

interface AnimatedNumberProps extends TextProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
}

export const AnimatedNumber = ({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  textColor = '#FFFFFF',
  fontSize = 24,
  fontWeight = '700',
  fontFamily = 'System',
  style,
  ...props
}: AnimatedNumberProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayNum, setDisplayNum] = useState('0');

  useEffect(() => {
    animatedValue.setValue(0);
    
    const listener = animatedValue.addListener(({ value: val }) => {
      setDisplayNum(Math.floor(val).toString());
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration: duration,
      useNativeDriver: false
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration]);

  return (
    <Text
      style={[
        {
          color: textColor,
          fontSize,
          fontWeight: fontWeight as any,
          fontFamily
        },
        style
      ]}
      {...props}
    >
      {prefix}
      {displayNum}
      {suffix}
    </Text>
  );
};
