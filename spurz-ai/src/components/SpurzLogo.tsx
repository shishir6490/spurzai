import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS } from '@constants/theme';

interface SpurzLogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const SpurzLogo = ({ size = 'medium', style }: SpurzLogoProps) => {
  const sizes = {
    small: { iconSize: 32, textSize: 14, gap: 8 },
    medium: { iconSize: 56, textSize: 18, gap: 12 },
    large: { iconSize: 100, textSize: 32, gap: 16 }
  };

  const config = sizes[size];

  return (
    <View style={[styles.container, style]}>
      {/* Stylized "S" Logo */}
      <View style={[styles.sContainer, { width: config.iconSize, height: config.iconSize }]}>
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
      </View>

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
  sContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: COLORS.primaryGold,
    borderRadius: 12,
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


