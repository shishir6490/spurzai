import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, FONTS } from '@constants/theme';

const { width, height } = Dimensions.get('window');

// Data stream lines
interface DataLine {
  id: number;
  startX: number;
  delay: number;
  speed: number;
  opacity: number;
}

const generateDataLines = (count: number): DataLine[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    startX: (width / count) * i + Math.random() * 50,
    delay: Math.random() * 2000,
    speed: Math.random() * 3000 + 2000,
    opacity: Math.random() * 0.3 + 0.2
  }));
};

// Animated Data Stream Component
interface AnimatedDataLineProps {
  line: DataLine;
}

const AnimatedDataLine = ({ line }: AnimatedDataLineProps) => {
  const translateYAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(line.delay),
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: line.opacity,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
              toValue: line.opacity,
              duration: line.speed - 600,
              useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 300,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true
            })
          ]),
          Animated.timing(translateYAnim, {
            toValue: height + 100,
            duration: line.speed,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ])
      )
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: line.startX,
        top: 0,
        width: 2,
        height: 80,
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }]
      }}
    >
      <LinearGradient
        colors={[`${COLORS.primaryGold}00`, COLORS.primaryGold, `${COLORS.primaryGold}00`]}
        style={{ flex: 1, width: 2 }}
      />
    </Animated.View>
  );
};

export default function SplashScreen() {
  const [dataLines] = useState(() => generateDataLines(12));
  
  // Logo animations
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const logoYAnim = useRef(new Animated.Value(30)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const textYAnim = useRef(new Animated.Value(20)).current;
  const taglineOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Border animations
  const borderTopAnim = useRef(new Animated.Value(0)).current;
  const borderRightAnim = useRef(new Animated.Value(0)).current;
  const borderBottomAnim = useRef(new Animated.Value(0)).current;
  const borderLeftAnim = useRef(new Animated.Value(0)).current;
  
  // Scan line
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Border draw animation
    Animated.sequence([
      Animated.timing(borderTopAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false
      }),
      Animated.timing(borderRightAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false
      }),
      Animated.timing(borderBottomAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false
      }),
      Animated.timing(borderLeftAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false
      })
    ]).start();

    // Main content animation
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(logoYAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true
        })
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(textYAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        })
      ]),
      Animated.delay(100),
      Animated.timing(taglineOpacityAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      Animated.delay(1500),
      // Fade out
      Animated.parallel([
        Animated.timing(logoOpacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(taglineOpacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        })
      ])
    ]).start();

    // Continuous scan line
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#000000', '#0B0C10', '#1F2833']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Matrix-style data streams */}
      <View style={styles.dataStreamContainer} pointerEvents="none">
        {dataLines.map(line => (
          <AnimatedDataLine key={line.id} line={line} />
        ))}
      </View>

      {/* Scan line effect */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{
              translateY: scanLineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, height + 100]
              })
            }]
          }
        ]}
      />

      {/* Holographic frame */}
      <View style={styles.frameContainer}>
        {/* Top border */}
        <Animated.View
          style={[
            styles.borderTop,
            {
              width: borderTopAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
        
        {/* Right border */}
        <Animated.View
          style={[
            styles.borderRight,
            {
              height: borderRightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
        
        {/* Bottom border */}
        <Animated.View
          style={[
            styles.borderBottom,
            {
              width: borderBottomAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
        
        {/* Left border */}
        <Animated.View
          style={[
            styles.borderLeft,
            {
              height: borderLeftAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />

        {/* Corner accents */}
        <View style={[styles.cornerAccent, styles.topLeft]} />
        <View style={[styles.cornerAccent, styles.topRight]} />
        <View style={[styles.cornerAccent, styles.bottomLeft]} />
        <View style={[styles.cornerAccent, styles.bottomRight]} />
      </View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: logoOpacityAnim,
            transform: [{ translateY: logoYAnim }]
          }
        ]}
      >
        {/* Actual logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/spurz-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* Brand text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacityAnim,
            transform: [{ translateY: textYAnim }]
          }
        ]}
      >
        <Text style={styles.brandText}>SPURZ</Text>
        <Text style={styles.dotText}>.</Text>
        <Text style={styles.aiText}>AI</Text>
      </Animated.View>

      {/* Tagline with glitch effect */}
      <Animated.View
        style={[
          styles.taglineContainer,
          { opacity: taglineOpacityAnim }
        ]}
      >
        <View style={styles.taglineBar} />
        <Text style={styles.tagline}>EARNING INTELLIGENCE</Text>
        <View style={styles.taglineBar} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000'
  },
  dataStreamContainer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 1
  },
  scanLine: {
    position: 'absolute',
    width: width,
    height: 2,
    backgroundColor: COLORS.primaryGold,
    opacity: 0.3,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    zIndex: 5
  },
  frameContainer: {
    position: 'absolute',
    width: width * 0.75,
    height: height * 0.4,
    zIndex: 8
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: COLORS.primaryGold,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8
  },
  borderRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 2,
    backgroundColor: COLORS.primaryGold,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8
  },
  borderBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primaryGold,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8
  },
  borderLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 2,
    backgroundColor: COLORS.primaryGold,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8
  },
  cornerAccent: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: COLORS.primaryGold,
    borderWidth: 2
  },
  topLeft: {
    top: -10,
    left: -10,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  topRight: {
    top: -10,
    right: -10,
    borderLeftWidth: 0,
    borderBottomWidth: 0
  },
  bottomLeft: {
    bottom: -10,
    left: -10,
    borderRightWidth: 0,
    borderTopWidth: 0
  },
  bottomRight: {
    bottom: -10,
    right: -10,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  content: {
    alignItems: 'center',
    zIndex: 10
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoImage: {
    width: 180,
    height: 180,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 40,
    zIndex: 10
  },
  brandText: {
    fontSize: 48,
    fontFamily: FONTS.sans.bold,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 8,
    textShadowColor: COLORS.primaryGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15
  },
  dotText: {
    fontSize: 48,
    color: COLORS.primaryGold,
    fontWeight: '900',
    marginHorizontal: -2
  },
  aiText: {
    fontSize: 48,
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold,
    fontWeight: '900',
    letterSpacing: 6,
    textShadowColor: COLORS.primaryGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
    zIndex: 10
  },
  taglineBar: {
    width: 30,
    height: 1,
    backgroundColor: COLORS.primaryGold,
    opacity: 0.6
  },
  tagline: {
    fontSize: 11,
    fontFamily: FONTS.sans.regular,
    color: COLORS.primaryGold,
    letterSpacing: 3,
    fontWeight: '600',
    opacity: 0.8
  }
});