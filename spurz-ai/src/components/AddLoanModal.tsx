import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';
import ApiClient from '../services/api';

interface AddLoanModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LOAN_TYPES = [
  { id: 'home', name: 'Home Loan', icon: 'home' },
  { id: 'car', name: 'Car Loan', icon: 'car' },
  { id: 'personal', name: 'Personal Loan', icon: 'person' },
  { id: 'education', name: 'Education Loan', icon: 'school' },
  { id: 'business', name: 'Business Loan', icon: 'briefcase' },
  { id: 'credit-card', name: 'Credit Card EMI', icon: 'card' },
  { id: 'other', name: 'Other Loan', icon: 'cash' },
];

export const AddLoanModal: React.FC<AddLoanModalProps> = ({ visible, onClose, onSuccess }) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [customLoanName, setCustomLoanName] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedType) {
      Alert.alert('Required', 'Please select a loan type');
      return;
    }

    if (!emiAmount || parseFloat(emiAmount) <= 0) {
      Alert.alert('Required', 'Please enter a valid EMI amount');
      return;
    }

    const loanType = LOAN_TYPES.find(t => t.id === selectedType);
    const loanName = selectedType === 'other' && customLoanName 
      ? customLoanName 
      : loanType?.name || 'Loan';

    try {
      setIsLoading(true);
      hapticFeedback.medium();

      // Save as expense with loan metadata
      await ApiClient.addIncomeSource({
        source: `Expense: ${loanName} EMI`,
        name: `Expense: ${loanName} EMI`,
        amount: parseFloat(emiAmount),
        frequency: 'monthly',
        isPrimary: false,
        type: 'loan',
        metadata: {
          loanType: selectedType,
          principal: principal ? parseFloat(principal) : undefined,
          interestRate: interestRate ? parseFloat(interestRate) : undefined,
        },
      });

      hapticFeedback.success();
      Alert.alert('Success! 🎉', 'Loan EMI added successfully');
      
      // Reset form
      setSelectedType('');
      setCustomLoanName('');
      setEmiAmount('');
      setPrincipal('');
      setInterestRate('');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding loan:', error);
      hapticFeedback.error();
      Alert.alert('Error', error.message || 'Failed to add loan. Please try again.');
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
            <Text style={styles.title}>Add Loan / EMI</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {/* Loan Type Selection */}
            <Text style={styles.label}>Loan Type *</Text>
            <View style={styles.typesGrid}>
              {LOAN_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => {
                    hapticFeedback.light();
                    setSelectedType(type.id);
                  }}
                  style={[
                    styles.typeCard,
                    selectedType === type.id && styles.typeCardSelected,
                  ]}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={selectedType === type.id ? COLORS.primaryGold : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeName,
                      selectedType === type.id && styles.typeNameSelected,
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Loan Name (if Other is selected) */}
            {selectedType === 'other' && (
              <>
                <Text style={styles.label}>Custom Loan Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Gold Loan"
                  placeholderTextColor={COLORS.textTertiary}
                  value={customLoanName}
                  onChangeText={setCustomLoanName}
                />
              </>
            )}

            {/* EMI Amount */}
            <Text style={styles.label}>Monthly EMI Amount *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.inputWithSymbol}
                placeholder="10,000"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="numeric"
                value={emiAmount}
                onChangeText={setEmiAmount}
              />
            </View>

            {/* Principal Amount (Optional) */}
            <Text style={styles.label}>Principal Amount (Optional)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.inputWithSymbol}
                placeholder="5,00,000"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="numeric"
                value={principal}
                onChangeText={setPrincipal}
              />
            </View>

            {/* Interest Rate (Optional) */}
            <Text style={styles.label}>Interest Rate % (Optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputWithSymbol}
                placeholder="8.5"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="decimal-pad"
                value={interestRate}
                onChangeText={setInterestRate}
              />
              <Text style={styles.percentSymbol}>%</Text>
            </View>

            <Text style={styles.hint}>
              * Required fields. Optional fields help us provide better insights.
            </Text>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={styles.saveButton}
          >
            <LinearGradient
              colors={[COLORS.primaryGold, COLORS.secondaryGold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.primaryBackground} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primaryBackground} />
                  <Text style={styles.saveText}>Add Loan EMI</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}20`,
  },
  title: {
    fontFamily: FONTS.sans.bold,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    padding: SPACING.xl,
  },
  label: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    backgroundColor: `${COLORS.primaryGold}20`,
    borderColor: COLORS.primaryGold,
  },
  typeName: {
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  typeNameSelected: {
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
  },
  input: {
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontFamily: FONTS.sans.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}30`,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}30`,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 16,
    color: COLORS.primaryGold,
    marginRight: SPACING.xs,
  },
  percentSymbol: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 16,
    color: COLORS.primaryGold,
    marginLeft: SPACING.xs,
  },
  inputWithSymbol: {
    flex: 1,
    padding: SPACING.md,
    fontFamily: FONTS.sans.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  hint: {
    fontFamily: FONTS.sans.regular,
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: SPACING.lg,
    fontStyle: 'italic',
  },
  saveButton: {
    margin: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  saveText: {
    fontFamily: FONTS.sans.bold,
    fontSize: 17,
    color: COLORS.primaryBackground,
  },
});
