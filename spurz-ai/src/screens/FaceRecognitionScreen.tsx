import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticFeedback } from '@utils/haptics';
import { useAuth } from '@context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function FaceRecognitionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // Scanning animation - horizontal line movement
  useEffect(() => {
    if (isScanning && !isComplete) {
      const scanningLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      scanningLoop.start();

      // Pulse effect
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => {
        scanningLoop.stop();
        pulseLoop.stop();
      };
    }
  }, [isScanning, isComplete]);

  // Success animation
  useEffect(() => {
    if (isComplete) {
      Animated.parallel([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-complete after 2 seconds
      const timeout = setTimeout(async () => {
        hapticFeedback.success();
        await completeOnboarding();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isComplete]);

  const handleStartScan = () => {
    hapticFeedback.medium();
    setIsScanning(true);

    // Simulate face scanning taking 3 seconds
    const scanTimeout = setTimeout(() => {
      setIsScanning(false);
      setIsComplete(true);
    }, 3000);

    return () => clearTimeout(scanTimeout);
  };

  const handleGoBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const scanLineTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });

  return (
    <LinearGradient colors={GRADIENTS.background as any} style={styles.container}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryGold} />
        </TouchableOpacity>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isComplete ? 'Face Verified' : 'Position Your Face'}
            </Text>
            <Text style={styles.subtitle}>
              {isComplete
                ? 'Welcome! Setting up your account...'
                : isScanning
                ? 'Hold steady, scanning in progress...'
                : 'Look directly at the camera'}
            </Text>
          </View>

          {/* Face Circle Container */}
          <View style={styles.faceContainerOuter}>
            <Animated.View
              style={[
                styles.faceContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              {/* Face Oval Background */}
              <LinearGradient
                colors={[
                  `${COLORS.primaryGold}20`,
                  `${COLORS.primaryGold}10`,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.faceOval}
              >
                {/* Corner markers */}
                {isScanning && !isComplete && (
                  <>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                  </>
                )}

                {/* Face Icon */}
                <View style={styles.iconWrapper}>
                  {isComplete ? (
                    <View style={styles.checkmarkCircle}>
                      <Ionicons
                        name="checkmark"
                        size={60}
                        color={COLORS.success}
                      />
                    </View>
                  ) : (
                    <Ionicons
                      name="person"
                      size={80}
                      color={COLORS.primaryGold}
                    />
                  )}
                </View>

                {/* Scanning Line */}
                {isScanning && !isComplete && (
                  <Animated.View
                    style={[
                      styles.scanLine,
                      {
                        transform: [{ translateY: scanLineTranslateY }],
                      },
                    ]}
                  />
                )}
              </LinearGradient>
            </Animated.View>

            {/* Status Dots */}
            {!isComplete && (
              <View style={styles.statusIndicators}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: COLORS.primaryGold },
                  ]}
                />
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isScanning
                        ? COLORS.primaryGold
                        : `${COLORS.primaryGold}40`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isScanning
                        ? COLORS.primaryGold
                        : `${COLORS.primaryGold}40`,
                    },
                  ]}
                />
              </View>
            )}
          </View>

          {/* Success Message */}
          {isComplete && (
            <Animated.View
              style={[
                styles.successMessage,
                {
                  opacity: successAnim,
                  transform: [
                    {
                      scale: successAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.successCheckmark}>
                <Ionicons
                  name="checkmark-done"
                  size={24}
                  color={COLORS.success}
                />
              </View>
              <Text style={styles.successText}>Face Recognition Complete</Text>
            </Animated.View>
          )}

          {/* Tips */}
          {!isScanning && !isComplete && (
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.success}
                />
                <Text style={styles.tipText}>Ensure good lighting</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.success}
                />
                <Text style={styles.tipText}>Face device at eye level</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.success}
                />
                <Text style={styles.tipText}>Remove sunglasses or hat</Text>
              </View>
            </View>
          )}

          {/* Action Button */}
          {!isScanning && !isComplete && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleStartScan}
              style={styles.startButton}
            >
              <LinearGradient
                colors={GRADIENTS.goldButton as any}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Start Face Recognition</Text>
                <MaterialIcons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.primaryBackground}
                  style={{ marginLeft: SPACING.md }}
                />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl * 2,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  faceContainerOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: SPACING.xl,
  },
  faceContainer: {
    width: 260,
    height: 320,
  },
  faceOval: {
    width: '100%',
    height: '100%',
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primaryGold}40`,
    overflow: 'hidden',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primaryGold,
    borderWidth: 2.5,
  },
  topLeft: {
    top: 15,
    left: 15,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 15,
    right: 15,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 15,
    left: 15,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 15,
    right: 15,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: COLORS.primaryGold,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  statusIndicators: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  successMessage: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  successCheckmark: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: 16,
    fontFamily: FONTS.sans.semibold,
    color: COLORS.success,
  },
  tipsContainer: {
    gap: SPACING.md,
    marginVertical: SPACING.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  tipText: {
    fontSize: 14,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  startButton: {
    marginTop: SPACING.lg,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.primaryBackground,
  },
});
