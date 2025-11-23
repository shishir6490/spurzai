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

interface AddIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INCOME_SOURCES = [
  { id: 'salary', name: 'Salary', icon: 'briefcase' },
  { id: 'business', name: 'Business Income', icon: 'business' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop' },
  { id: 'rental', name: 'Rental Income', icon: 'home' },
  { id: 'investment', name: 'Investment Returns', icon: 'trending-up' },
  { id: 'other', name: 'Other', icon: 'cash' },
];

const FREQUENCIES = ['monthly', 'annual'];

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({ visible, onClose, onSuccess }) => {
  const [selectedSource, setSelectedSource] = useState('salary');
  const [customSource, setCustomSource] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    const sourceName = selectedSource === 'other' ? customSource : 
      INCOME_SOURCES.find(s => s.id === selectedSource)?.name || '';

    if (!sourceName || !amount) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    hapticFeedback.light();

    try {
      await ApiClient.addIncomeSource({
        source: sourceName,
        amount: amountValue,
        frequency,
        isPrimary: selectedSource === 'salary',
      });

      hapticFeedback.success();
      Alert.alert('Success', 'Income source added successfully!');
      
      // Reset form
      setSelectedSource('salary');
      setCustomSource('');
      setAmount('');
      setFrequency('monthly');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding income:', error);
      hapticFeedback.error();
      Alert.alert('Error', error.message || 'Failed to add income source. Please try again.');
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
              <Text style={styles.title}>Add Income Source</Text>
              <Text style={styles.subtitle}>Track your earnings</Text>
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
            {/* Income Source */}
            <View style={styles.field}>
              <Text style={styles.label}>Income Source *</Text>
              <View style={styles.sourceGrid}>
                {INCOME_SOURCES.map((source) => (
                  <TouchableOpacity
                    key={source.id}
                    onPress={() => {
                      hapticFeedback.light();
                      setSelectedSource(source.id);
                    }}
                    style={[
                      styles.sourceButton,
                      selectedSource === source.id && styles.sourceButtonActive,
                    ]}
                  >
                    <Ionicons
                      name={source.icon as any}
                      size={20}
                      color={selectedSource === source.id ? COLORS.primaryGold : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.sourceText,
                        selectedSource === source.id && styles.sourceTextActive,
                      ]}
                    >
                      {source.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Source Name (if Other selected) */}
            {selectedSource === 'other' && (
              <View style={styles.field}>
                <Text style={styles.label}>Source Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Part-time job"
                  placeholderTextColor={COLORS.textTertiary}
                  value={customSource}
                  onChangeText={setCustomSource}
                />
              </View>
            )}

            {/* Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>Amount *</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountField}
                  placeholder="50000"
                  placeholderTextColor={COLORS.textTertiary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Frequency */}
            <View style={styles.field}>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyRow}>
                {FREQUENCIES.map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    onPress={() => {
                      hapticFeedback.light();
                      setFrequency(freq as 'monthly' | 'annual');
                    }}
                    style={[
                      styles.frequencyButton,
                      frequency === freq && styles.frequencyButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        frequency === freq && styles.frequencyTextActive,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helpText}>
                {frequency === 'monthly' ? 'Enter your monthly income' : 'Enter your annual income'}
              </Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.primaryGold} />
              <Text style={styles.infoText}>
                Adding your income helps us provide better savings recommendations
              </Text>
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
                    <Text style={styles.submitText}>Add Income</Text>
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
    maxHeight: '85%',
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
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondaryBackground,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
  },
  sourceButtonActive: {
    backgroundColor: `${COLORS.primaryGold}20`,
    borderColor: COLORS.primaryGold,
  },
  sourceText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sourceTextActive: {
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
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
  frequencyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondaryBackground,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: `${COLORS.primaryGold}20`,
    borderColor: COLORS.primaryGold,
  },
  frequencyText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  frequencyTextActive: {
    fontFamily: FONTS.sans.semibold,
    color: COLORS.primaryGold,
  },
  helpText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  infoBox: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    marginBottom: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
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
