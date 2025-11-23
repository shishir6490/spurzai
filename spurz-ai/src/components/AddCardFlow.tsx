import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';
import ApiClient from '../services/api';

interface AddCardFlowProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CardInfo {
  cardNumber: string;
  bankName: string;
  cardType: string;
  network: string;
  bankColor: string;
}

// BIN (Bank Identification Number) mapping - first 6 digits
const BIN_DATABASE: Record<string, { bank: string; type: string; network: string; color: string }> = {
  // HDFC Bank
  '414709': { bank: 'HDFC Bank', type: 'Credit', network: 'Visa', color: '#004C8F' },
  '414720': { bank: 'HDFC Bank', type: 'Credit', network: 'Visa', color: '#004C8F' },
  '453267': { bank: 'HDFC Bank', type: 'Credit', network: 'Visa', color: '#004C8F' },
  '512645': { bank: 'HDFC Bank', type: 'Debit', network: 'Mastercard', color: '#004C8F' },
  
  // ICICI Bank
  '414783': { bank: 'ICICI Bank', type: 'Credit', network: 'Visa', color: '#F37021' },
  '491071': { bank: 'ICICI Bank', type: 'Credit', network: 'Visa', color: '#F37021' },
  '542596': { bank: 'ICICI Bank', type: 'Credit', network: 'Mastercard', color: '#F37021' },
  '607388': { bank: 'ICICI Bank', type: 'Debit', network: 'RuPay', color: '#F37021' },
  
  // SBI
  '453260': { bank: 'State Bank of India', type: 'Credit', network: 'Visa', color: '#1C4A93' },
  '453261': { bank: 'State Bank of India', type: 'Credit', network: 'Visa', color: '#1C4A93' },
  '508227': { bank: 'State Bank of India', type: 'Debit', network: 'Mastercard', color: '#1C4A93' },
  '606985': { bank: 'State Bank of India', type: 'Debit', network: 'RuPay', color: '#1C4A93' },
  
  // Axis Bank
  '414719': { bank: 'Axis Bank', type: 'Credit', network: 'Visa', color: '#97144D' },
  '512618': { bank: 'Axis Bank', type: 'Credit', network: 'Mastercard', color: '#97144D' },
  '412271': { bank: 'Axis Bank', type: 'Debit', network: 'Visa', color: '#97144D' },
  
  // Kotak Mahindra
  '431278': { bank: 'Kotak Mahindra', type: 'Credit', network: 'Visa', color: '#ED232A' },
  '521402': { bank: 'Kotak Mahindra', type: 'Credit', network: 'Mastercard', color: '#ED232A' },
  
  // American Express
  '370180': { bank: 'American Express', type: 'Credit', network: 'American Express', color: '#006FCF' },
  '374677': { bank: 'American Express', type: 'Credit', network: 'American Express', color: '#006FCF' },
  
  // Fallback for unrecognized cards
  'default': { bank: 'Unknown Bank', type: 'Credit', network: 'Visa', color: '#6B7280' },
};

export const AddCardFlow: React.FC<AddCardFlowProps> = ({ visible, onClose, onSuccess }) => {
  const [step, setStep] = useState<'input' | 'activate'>('input');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cardAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Reset state
      setStep('input');
      setCardNumber('');
      setCvv('');
      setExpiryDate('');
      setCardInfo(null);
      Animated.spring(cardAnimation, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const detectCardInfo = (cardNum: string): CardInfo | null => {
    const cleanedNumber = cardNum.replace(/\s/g, '');
    if (cleanedNumber.length < 6) return null;

    const bin = cleanedNumber.slice(0, 6);
    const cardData = BIN_DATABASE[bin] || BIN_DATABASE['default'];

    return {
      cardNumber: cleanedNumber,
      bankName: cardData.bank,
      cardType: cardData.type,
      network: cardData.network,
      bankColor: cardData.color,
    };
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);

    // Auto-detect card info when enough digits entered
    const cleanedNumber = text.replace(/\s/g, '');
    if (cleanedNumber.length >= 6) {
      const info = detectCardInfo(formatted);
      if (info) {
        setCardInfo(info);
        hapticFeedback.light();
      }
    }
  };

  const handleSaveCard = async () => {
    if (!cardInfo) {
      Alert.alert('Error', 'Unable to detect card information');
      return;
    }

    const cleanedNumber = cardNumber.replace(/\s/g, '');
    if (cleanedNumber.length < 13) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return;
    }

    try {
      setIsLoading(true);
      hapticFeedback.medium();

      // Save card without CVV and expiry (inactive state)
      await ApiClient.addCreditCard({
        bankName: cardInfo.bankName,
        cardName: `${cardInfo.bankName} ${cardInfo.cardType}`,
        last4Digits: cleanedNumber.slice(-4),
        network: cardInfo.network,
        creditLimit: 0,
        currentBalance: 0,
        billingCycleDay: 1,
      });

      hapticFeedback.success();
      
      // Animate card flip
      Animated.spring(cardAnimation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setStep('activate');
      }, 600);

    } catch (error: any) {
      console.error('Error saving card:', error);
      hapticFeedback.error();
      Alert.alert('Error', error.message || 'Failed to save card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateCard = async () => {
    if (!cvv || cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV');
      return;
    }

    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter expiry date (MM/YY)');
      return;
    }

    try {
      setIsLoading(true);
      hapticFeedback.medium();

      // TODO: Activate card with CVV and expiry, fetch statement
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      hapticFeedback.success();
      Alert.alert(
        'Card Activated! 🎉',
        'Your card has been added successfully. We will fetch your statement shortly.',
        [{ text: 'Great!', onPress: () => {
          onSuccess();
          onClose();
        }}]
      );

    } catch (error: any) {
      console.error('Error activating card:', error);
      hapticFeedback.error();
      Alert.alert('Error', error.message || 'Failed to activate card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipActivation = () => {
    Alert.alert(
      'Skip Activation?',
      'You can activate your card later to fetch statements and get personalized offers.',
      [
        { text: 'Go Back', style: 'cancel' },
        { 
          text: 'Skip for Now', 
          onPress: () => {
            hapticFeedback.light();
            onSuccess();
            onClose();
          }
        }
      ]
    );
  };

  const renderCardPreview = () => {
    const cardRotate = cardAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const cardScale = cardAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.1, 1],
    });

    return (
      <Animated.View 
        style={[
          styles.cardPreview,
          { 
            transform: [
              { rotateY: cardRotate },
              { scale: cardScale }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={cardInfo ? [cardInfo.bankColor, `${cardInfo.bankColor}DD`] : ['#6B7280', '#4B5563']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Card Network Logo */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardType}>{cardInfo?.cardType || 'Credit Card'}</Text>
            <View style={styles.networkBadge}>
              <Text style={styles.networkText}>{cardInfo?.network || 'Visa'}</Text>
            </View>
          </View>

          {/* Card Number */}
          <View style={styles.cardNumberContainer}>
            {cardNumber.length >= 4 ? (
              <Text style={styles.cardNumberText}>{cardNumber || '•••• •••• •••• ••••'}</Text>
            ) : (
              <Text style={styles.cardNumberPlaceholder}>Enter your card number</Text>
            )}
          </View>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>BANK</Text>
              <Text style={styles.cardValue}>{cardInfo?.bankName || 'Detecting...'}</Text>
            </View>
            {step === 'activate' && (
              <View style={styles.cardExpiryContainer}>
                <Text style={styles.cardLabel}>VALID THRU</Text>
                <Text style={styles.cardValue}>{expiryDate || 'MM/YY'}</Text>
              </View>
            )}
          </View>

          {/* Chip */}
          <View style={styles.cardChip}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.chipGradient}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <BlurView intensity={90} style={styles.blurContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
            >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.title}>
                  {step === 'input' ? 'Add Your Card' : 'Activate Card'}
                </Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Card Preview */}
                {renderCardPreview()}

                {/* Input Step */}
                {step === 'input' && (
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Card Details</Text>
                <Text style={styles.sectionSubtitle}>
                  We'll auto-detect your bank and card type
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color={COLORS.primaryGold} />
                  <TextInput
                    style={styles.input}
                    placeholder="Card Number"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="number-pad"
                    maxLength={19}
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    autoFocus
                  />
                </View>

                {cardInfo && (
                  <View style={styles.detectedInfo}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={styles.detectedText}>
                      {cardInfo.bankName} {cardInfo.cardType} Card Detected
                    </Text>
                  </View>
                )}

                <View style={styles.infoBox}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.primaryGold} />
                  <Text style={styles.infoText}>
                    Your card details are encrypted and secure
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSaveCard}
                  disabled={isLoading || !cardInfo}
                >
                  <LinearGradient
                    colors={[COLORS.primaryGold, COLORS.secondaryGold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={COLORS.primaryBackground} />
                    ) : (
                      <>
                        <Ionicons name="add-circle" size={20} color={COLORS.primaryBackground} />
                        <Text style={styles.buttonText}>Add Card</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Activation Step */}
            {step === 'activate' && (
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Activate Your Card</Text>
                <Text style={styles.sectionSubtitle}>
                  Add CVV & expiry to fetch statements and offers
                </Text>

                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Ionicons name="lock-closed" size={20} color={COLORS.primaryGold} />
                    <TextInput
                      style={styles.input}
                      placeholder="CVV"
                      placeholderTextColor={COLORS.textTertiary}
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                      value={cvv}
                      onChangeText={setCvv}
                    />
                  </View>

                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.primaryGold} />
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      placeholderTextColor={COLORS.textTertiary}
                      keyboardType="number-pad"
                      maxLength={5}
                      value={expiryDate}
                      onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    />
                  </View>
                </View>

                <View style={styles.benefitsBox}>
                  <Text style={styles.benefitsTitle}>✨ Activation Benefits:</Text>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>Automatic statement import</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>Personalized card offers</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>Smart spending insights</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleActivateCard}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons name="flash" size={20} color="white" />
                        <Text style={styles.buttonText}>Activate Now</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkipActivation}
                  disabled={isLoading}
                >
                  <Text style={styles.skipText}>Skip for Now</Text>
                </TouchableOpacity>
              </View>
            )}
              </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </BlurView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  content: {
    backgroundColor: COLORS.primaryBackground,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}20`,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.sans.bold,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  cardPreview: {
    margin: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardGradient: {
    padding: SPACING.xl,
    height: 200,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  networkBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  networkText: {
    fontFamily: FONTS.sans.bold,
    fontSize: 11,
    color: 'white',
  },
  cardChip: {
    position: 'absolute',
    top: 60,
    left: SPACING.xl,
    width: 45,
    height: 35,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  chipGradient: {
    flex: 1,
  },
  cardNumberContainer: {
    marginTop: 40,
  },
  cardNumberText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 22,
    color: 'white',
    letterSpacing: 2,
  },
  cardNumberPlaceholder: {
    fontFamily: FONTS.sans.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardExpiryContainer: {
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: FONTS.sans.bold,
    fontSize: 13,
    color: 'white',
  },
  inputSection: {
    padding: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.sans.bold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontFamily: FONTS.sans.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}30`,
    marginBottom: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.sans.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    padding: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  detectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  detectedText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: '#10B981',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  infoText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  benefitsBox: {
    padding: SPACING.md,
    backgroundColor: `${COLORS.primaryGold}08`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    marginBottom: SPACING.lg,
  },
  benefitsTitle: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  benefitText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  primaryButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  buttonText: {
    fontFamily: FONTS.sans.bold,
    fontSize: 16,
    color: COLORS.primaryBackground,
  },
  skipButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  skipText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
