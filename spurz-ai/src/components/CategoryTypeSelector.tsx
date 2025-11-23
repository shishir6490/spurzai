import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';

interface CategoryTypeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: 'income' | 'expense' | 'investment') => void;
  hasIncome?: boolean;
  hasExpenses?: boolean;
  hasInvestments?: boolean;
}

export const CategoryTypeSelector: React.FC<CategoryTypeSelectorProps> = ({
  visible,
  onClose,
  onSelectType,
  hasIncome = false,
  hasExpenses = false,
  hasInvestments = false,
}) => {
  const options = [
    {
      type: 'income' as const,
      title: hasIncome ? 'Edit Income' : 'Add Income',
      description: 'Salary, freelance, or other income sources',
      icon: 'cash',
      gradient: ['#10B981', '#059669'],
    },
    {
      type: 'expense' as const,
      title: hasExpenses ? 'Edit Expenses' : 'Add Expenses',
      description: 'Monthly spending categories',
      icon: 'card',
      gradient: ['#F59E0B', '#D97706'],
    },
    {
      type: 'investment' as const,
      title: hasInvestments ? 'Edit Investments' : 'Add Investments',
      description: 'Stocks, mutual funds, crypto, etc.',
      icon: 'trending-up',
      gradient: ['#3B82F6', '#2563EB'],
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>What would you like to add?</Text>
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

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.type}
                onPress={() => {
                  hapticFeedback.medium();
                  onSelectType(option.type);
                  onClose();
                }}
                style={styles.optionButton}
              >
                <LinearGradient
                  colors={option.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionGradient}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={option.icon as any} size={32} color={COLORS.primaryBackground} />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.6)" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.light();
              onClose();
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.primaryBackground,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}30`,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.sans.bold,
    fontSize: 20,
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  optionsContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  optionButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  optionGradient: {
    padding: SPACING.lg,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FONTS.sans.bold,
    fontSize: 17,
    color: COLORS.primaryBackground,
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontFamily: FONTS.sans.regular,
    fontSize: 13,
    color: 'rgba(11, 12, 16, 0.8)',
    lineHeight: 18,
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
