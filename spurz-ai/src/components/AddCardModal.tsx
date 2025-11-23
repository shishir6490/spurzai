import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';
import ApiClient from '../services/api';

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CARD_NETWORKS = ['Visa', 'Mastercard', 'RuPay', 'American Express'];

const BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'SBI',
  'Axis Bank',
  'Kotak Mahindra',
  'Standard Chartered',
  'Citibank',
  'HSBC',
  'IndusInd Bank',
  'Yes Bank',
  'Other',
];

export const AddCardModal: React.FC<AddCardModalProps> = ({ visible, onClose, onSuccess }) => {
  const [bankName, setBankName] = useState('');
  const [cardName, setCardName] = useState('');
  const [last4Digits, setLast4Digits] = useState('');
  const [network, setNetwork] = useState('Visa');
  const [creditLimit, setCreditLimit] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [billingCycleDay, setBillingCycleDay] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!bankName || !cardName || !last4Digits || !creditLimit) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (last4Digits.length !== 4 || !/^\d+$/.test(last4Digits)) {
      Alert.alert('Invalid Card Number', 'Please enter the last 4 digits of your card');
      return;
    }

    const limit = parseFloat(creditLimit);
    const balance = parseFloat(currentBalance || '0');

    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Invalid Credit Limit', 'Please enter a valid credit limit');
      return;
    }

    setIsLoading(true);
    hapticFeedback.light();

    try {
      await ApiClient.addCreditCard({
        bankName,
        cardName,
        last4Digits,
        network,
        creditLimit: limit,
        currentBalance: balance,
        billingCycleDay: parseInt(billingCycleDay),
      });

      hapticFeedback.success();
      Alert.alert('Success', 'Credit card added successfully!');
      
      // Reset form
      setBankName('');
      setCardName('');
      setLast4Digits('');
      setCreditLimit('');
      setCurrentBalance('');
      setBillingCycleDay('1');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding card:', error);
      hapticFeedback.error();
      Alert.alert('Error', error.message || 'Failed to add credit card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add Credit Card</Text>
              <Text style={styles.subtitle}>Enter your card details</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.light();
                onClose();
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Bank Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Bank Name *</Text>
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.light();
                  setShowBankDropdown(!showBankDropdown);
                }}
                style={styles.input}
              >
                <Text style={bankName ? styles.inputText : styles.placeholderText}>
                  {bankName || 'Select your bank'}
                </Text>
                <Ionicons
                  name={showBankDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>

              {showBankDropdown && (
                <View style={styles.dropdown}>
                  {BANKS.map((bank) => (
                    <TouchableOpacity
                      key={bank}
                      onPress={() => {
                        hapticFeedback.light();
                        setBankName(bank);
                        setShowBankDropdown(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownText}>{bank}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Card Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Card Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Regalia Gold, Platinum Rewards"
                placeholderTextColor={COLORS.textTertiary}
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            {/* Last 4 Digits */}
            <View style={styles.field}>
              <Text style={styles.label}>Last 4 Digits *</Text>
              <TextInput
                style={styles.input}
                placeholder="1234"
                placeholderTextColor={COLORS.textTertiary}
                value={last4Digits}
                onChangeText={setLast4Digits}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            {/* Card Network */}
            <View style={styles.field}>
              <Text style={styles.label}>Card Network</Text>
              <View style={styles.networkGrid}>
                {CARD_NETWORKS.map((net) => (
                  <TouchableOpacity
                    key={net}
                    onPress={() => {
                      hapticFeedback.light();
                      setNetwork(net);
                    }}
                    style={[
                      styles.networkButton,
                      network === net && styles.networkButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.networkText,
                        network === net && styles.networkTextActive,
                      ]}
                    >
                      {net}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Credit Limit */}
            <View style={styles.field}>
              <Text style={styles.label}>Credit Limit *</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountField}
                  placeholder="100000"
                  placeholderTextColor={COLORS.textTertiary}
                  value={creditLimit}
                  onChangeText={setCreditLimit}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Current Balance */}
            <View style={styles.field}>
              <Text style={styles.label}>Current Outstanding</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountField}
                  placeholder="0"
                  placeholderTextColor={COLORS.textTertiary}
                  value={currentBalance}
                  onChangeText={setCurrentBalance}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Billing Cycle Day */}
            <View style={styles.field}>
              <Text style={styles.label}>Billing Cycle Day</Text>
              <TextInput
                style={styles.input}
                placeholder="1-31"
                placeholderTextColor={COLORS.textTertiary}
                value={billingCycleDay}
                onChangeText={setBillingCycleDay}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.helpText}>Day of the month when your bill is generated</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            >
              <LinearGradient
                colors={[COLORS.primaryGold, COLORS.secondaryGold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.primaryBackground} />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={20} color={COLORS.primaryBackground} />
                    <Text style={styles.submitText}>Add Card</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.primaryBackground,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}20`,
  },
  title: {
    fontFamily: FONTS.sans.bold,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.sans.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  form: {
    padding: SPACING.xl,
  },
  field: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontFamily: FONTS.sans.regular,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  placeholderText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 15,
    color: COLORS.textTertiary,
    flex: 1,
  },
  dropdown: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}10`,
  },
  dropdownText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  networkButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondaryBackground,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
  },
  networkButtonActive: {
    backgroundColor: `${COLORS.primaryGold}20`,
    borderColor: COLORS.primaryGold,
  },
  networkText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  networkTextActive: {
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 16,
    color: COLORS.primaryGold,
    marginRight: SPACING.sm,
  },
  amountField: {
    flex: 1,
    padding: SPACING.md,
    fontFamily: FONTS.sans.regular,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  helpText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  submitText: {
    fontFamily: FONTS.sans.bold,
    fontSize: 16,
    color: COLORS.primaryBackground,
  },
});
