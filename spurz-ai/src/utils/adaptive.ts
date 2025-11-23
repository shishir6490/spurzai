import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Adaptive shadow properties that work consistently across iOS and Android
 * Android uses elevation, iOS uses shadow properties
 */
export const adaptiveShadow = {
  // Light shadow for subtle elements
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.1,
    shadowRadius: 2,
    elevation: 2
  },

  // Medium shadow for cards
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.15,
    shadowRadius: 8,
    elevation: 8
  },

  // Heavy shadow for prominent elements
  heavy: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.2,
    shadowRadius: 12,
    elevation: 12
  },

  // Glow shadow for glowing effects (like center button)
  glow: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.2,
    shadowRadius: 8,
    elevation: 8
  }
};

/**
 * Responsive padding/margin values based on device dimensions
 */
export const getResponsivePadding = () => {
  if (width < 360) {
    return { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
  } else if (width < 480) {
    return { xs: 6, sm: 10, md: 14, lg: 18, xl: 28 };
  } else {
    return { xs: 8, sm: 12, md: 16, lg: 20, xl: 32 };
  }
};

/**
 * Adaptive border radius based on device
 */
export const getAdaptiveRadius = () => {
  return {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999
  };
};

/**
 * Platform-specific safe area adjustments
 */
export const getPlatformAdjustments = () => {
  return {
    statusBarHeight: Platform.OS === 'ios' ? 44 : 24,
    tabBarHeight: Platform.OS === 'ios' ? 90 : 100,
    // Android has slightly larger touch targets
    touchableMinHeight: Platform.OS === 'android' ? 48 : 44,
    // Android buttons often need more padding
    buttonPaddingVertical: Platform.OS === 'android' ? 14 : 12,
    buttonPaddingHorizontal: Platform.OS === 'android' ? 18 : 16
  };
};

/**
 * Adaptive font sizes based on screen width
 */
export const getAdaptiveFontSizes = () => {
  if (width < 360) {
    return {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 24
    };
  } else if (width < 480) {
    return {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 19,
      xxl: 26
    };
  } else {
    return {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 28
    };
  }
};

/**
 * Get safe area bottom padding (for notches, home indicators, etc)
 */
export const getBottomSafeArea = () => {
  // This should be replaced with actual safe area context in real usage
  // but as a fallback for different devices
  if (Platform.OS === 'ios') {
    // iPhone with notch/dynamic island
    return height > 812 ? 34 : 20;
  } else {
    // Android typically has less safe area at bottom
    return Platform.OS === 'android' ? 16 : 0;
  }
};

/**
 * Adaptive scroll content padding
 */
export const getScrollPadding = () => {
  return {
    paddingBottom: Platform.OS === 'ios' ? 140 : 160, // Extra padding on Android for better visibility above nav
    paddingHorizontal: getResponsivePadding().lg
  };
};

/**
 * Platform-specific overlay styles
 */
export const getOverlayStyle = () => {
  return {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.4)', // Android needs stronger overlay
    borderRadius: getAdaptiveRadius().lg
  };
};

/**
 * Get device type info
 */
export const getDeviceInfo = () => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 480;
  const isLargeDevice = width >= 480;
  const isPortrait = height > width;

  return {
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isPortrait,
    screenWidth: width,
    screenHeight: height,
    aspectRatio: width / height
  };
};
