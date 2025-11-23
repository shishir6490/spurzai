import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';
import ApiClient from '../services/api';

const { width } = Dimensions.get('window');

interface CompleteBudgetSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialStep?: 'income' | 'spending' | 'investments';
  startStep?: number; // 0 = income, 1 = spending, 2 = investments
}

const INCOME_RANGES = [
  { label: '₹0 - ₹25,000', value: 12500, icon: 'trending-up' },
  { label: '₹25,001 - ₹50,000', value: 37500, icon: 'trending-up' },
  { label: '₹50,001 - ₹1,00,000', value: 75000, icon: 'trending-up' },
  { label: '₹1,00,001 - ₹2,50,000', value: 175000, icon: 'trending-up' },
  { label: '₹2,50,001 - ₹5,00,000', value: 375000, icon: 'rocket' },
  { label: '₹5,00,001+', value: 600000, icon: 'rocket' },
];

const SPENDING_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'restaurant', color: '#FF6B6B', ranges: ['₹2K', '₹5K', '₹10K', '₹15K', '₹20K+'] },
  { id: 'transport', name: 'Transportation', icon: 'car', color: '#4ECDC4', ranges: ['₹1K', '₹3K', '₹5K', '₹8K', '₹10K+'] },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#95E1D3', ranges: ['₹3K', '₹7K', '₹12K', '₹20K', '₹30K+'] },
  { id: 'utilities', name: 'Utilities & Bills', icon: 'receipt', color: '#F59E0B', ranges: ['₹2K', '₹4K', '₹6K', '₹8K', '₹10K+'] },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller', color: '#EC4899', ranges: ['₹1K', '₹3K', '₹5K', '₹8K', '₹12K+'] },
  { id: 'healthcare', name: 'Healthcare', icon: 'medical', color: '#10B981', ranges: ['₹1K', '₹3K', '₹5K', '₹10K', '₹15K+'] },
  { id: 'education', name: 'Education', icon: 'school', color: '#8B5CF6', ranges: ['₹2K', '₹5K', '₹10K', '₹20K', '₹30K+'] },
  { id: 'others', name: 'Other Expenses', icon: 'ellipsis-horizontal', color: '#6B7280', ranges: ['₹1K', '₹3K', '₹5K', '₹8K', '₹12K+'], allowCustom: true },
];

const INVESTMENT_TYPES = [
  { id: 'stocks', name: 'Stocks & Equity', icon: 'trending-up', color: '#10B981' },
  { id: 'mutualfunds', name: 'Mutual Funds', icon: 'pie-chart', color: '#3B82F6' },
  { id: 'crypto', name: 'Cryptocurrency', icon: 'logo-bitcoin', color: '#F59E0B' },
  { id: 'realestate', name: 'Real Estate', icon: 'home', color: '#EC4899' },
  { id: 'gold', name: 'Gold & Precious Metals', icon: 'star', color: '#EAB308' },
  { id: 'fixeddeposit', name: 'Fixed Deposits', icon: 'lock-closed', color: '#8B5CF6' },
  { id: 'ppf', name: 'PPF/EPF', icon: 'shield', color: '#059669' },
  { id: 'other', name: 'Other Investments', icon: 'ellipsis-horizontal', color: '#6B7280', allowCustom: true },
];

const INVESTMENT_RANGES = ['₹5K', '₹10K', '₹25K', '₹50K', '₹1L', '₹2L+'];

export const CompleteBudgetSetupModal: React.FC<CompleteBudgetSetupModalProps> = ({
  visible,
  onClose,
  onComplete,
  initialStep = 'income',
  startStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(startStep);

  useEffect(() => {
    if (visible) {
      setCurrentStep(startStep); // Reset to startStep when modal opens
    }
  }, [visible, startStep]);
  const [selectedIncome, setSelectedIncome] = useState<number | null>(null);
  const [spendingData, setSpendingData] = useState<Record<string, string>>({});
  const [investmentData, setInvestmentData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [customCategoryNames, setCustomCategoryNames] = useState<Record<string, string>>({});
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    { id: 'income', title: 'Monthly Income', subtitle: 'Select your income range', icon: 'cash' },
    { id: 'spending', title: 'Monthly Spending', subtitle: 'Tap categories you spend on', icon: 'card' },
    { id: 'investments', title: 'Investments', subtitle: 'Optional - Track your wealth', icon: 'trending-up' },
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [currentStep, visible, progress]);

  const parseAmount = (rangeStr: string): number => {
    const numStr = rangeStr.replace(/[₹K+L]/g, '');
    const num = parseFloat(numStr);
    if (rangeStr.includes('L')) return num * 100000;
    if (rangeStr.includes('K')) return num * 1000;
    return num;
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedIncome) {
      Alert.alert('Income Required', 'Please select your monthly income range');
      return;
    }

    if (currentStep < totalSteps - 1) {
      hapticFeedback.medium();
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep === totalSteps - 1) {
      handleComplete();
    } else {
      hapticFeedback.light();
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    hapticFeedback.medium();

    try {
      // Add income source (only if selected)
      if (selectedIncome && currentStep >= 0) {
        await ApiClient.addIncomeSource({
          source: 'Salary',
          name: 'Monthly Salary',
          amount: selectedIncome,
          frequency: 'monthly',
          isPrimary: true,
        });
      }

      // Add spending categories as expenses (positive amounts, backend will handle)
      const spendingPromises = Object.entries(spendingData).map(([categoryId, range]) => {
        const category = SPENDING_CATEGORIES.find(c => c.id === categoryId);
        if (!category) return null;
        
        const customName = customCategoryNames[categoryId];
        const categoryName = customName || category.name;
        
        return ApiClient.addIncomeSource({
          source: `Expense: ${categoryName}`,
          name: `Expense: ${categoryName}`,
          amount: parseAmount(range),
          frequency: 'monthly',
          isPrimary: false,
        });
      }).filter(Boolean);

      await Promise.all(spendingPromises);

      // Add investments as expenses (they are outgoing money)
      const investmentPromises = Object.entries(investmentData).map(([investmentId, range]) => {
        const investment = INVESTMENT_TYPES.find(i => i.id === investmentId);
        if (!investment) return null;
        
        const customName = customCategoryNames[investmentId];
        const categoryName = customName || investment.name;
        
        return ApiClient.addIncomeSource({
          source: `Expense: ${categoryName}`,
          name: `Expense: ${categoryName}`,
          amount: parseAmount(range),
          frequency: 'monthly',
          isPrimary: false,
        });
      }).filter(Boolean);

      await Promise.all(investmentPromises);

      hapticFeedback.success();
      Alert.alert('Success! 🎉', 'Your financial profile is now complete!');
      onComplete();
      onClose();
      
      // Reset state
      setCurrentStep(0);
      setSelectedIncome(null);
      setSpendingData({});
      setInvestmentData({});
    } catch (error: any) {
      console.error('Error completing setup:', error);
      hapticFeedback.error();
      Alert.alert('Error', error.message || 'Failed to save data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderIncomeStep = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      <Text style={styles.stepDescription}>
        Select the range that best matches your monthly income
      </Text>
      <View style={styles.optionsGrid}>
        {INCOME_RANGES.map((range, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              hapticFeedback.light();
              setSelectedIncome(range.value);
            }}
            style={[
              styles.incomeOption,
              selectedIncome === range.value && styles.selectedOption,
            ]}
          >
            <LinearGradient
              colors={
                selectedIncome === range.value
                  ? [COLORS.primaryGold, COLORS.secondaryGold]
                  : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
              }
              style={styles.optionGradient}
            >
              <Ionicons
                name={range.icon as any}
                size={24}
                color={selectedIncome === range.value ? COLORS.primaryBackground : COLORS.primaryGold}
              />
              <Text
                style={[
                  styles.optionLabel,
                  selectedIncome === range.value && styles.selectedOptionLabel,
                ]}
              >
                {range.label}
              </Text>
              {selectedIncome === range.value && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={16} color={COLORS.primaryBackground} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderSpendingStep = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      <Text style={styles.stepDescription}>
        Tap on categories and select your average monthly spending
      </Text>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.categoryScroll}>
        {SPENDING_CATEGORIES.map((category) => {
          const isExpanded = spendingData[category.id] !== undefined;
          return (
            <View key={category.id} style={styles.categoryContainer}>
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.light();
                  if (isExpanded) {
                    const newData = { ...spendingData };
                    delete newData[category.id];
                    setSpendingData(newData);
                  } else {
                    setSpendingData({ ...spendingData, [category.id]: category.ranges[1] });
                  }
                }}
                style={[
                  styles.categoryHeader,
                  isExpanded && styles.categoryHeaderActive,
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <Ionicons name={category.icon as any} size={20} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                {isExpanded && (
                  <View style={[styles.selectedBadge, { backgroundColor: category.color }]}>
                    <Text style={styles.selectedBadgeText}>
                      {spendingData[category.id]}
                    </Text>
                  </View>
                )}
                <Ionicons
                  name={isExpanded ? 'checkmark-circle' : 'add-circle-outline'}
                  size={24}
                  color={isExpanded ? category.color : COLORS.textTertiary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.rangeSelector}>
                  {category.ranges.map((range, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        hapticFeedback.light();
                        setSpendingData({ ...spendingData, [category.id]: range });
                      }}
                      style={[
                        styles.rangeChip,
                        spendingData[category.id] === range && styles.rangeChipSelected,
                        { borderColor: category.color },
                        spendingData[category.id] === range && { backgroundColor: `${category.color}30` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rangeChipText,
                          spendingData[category.id] === range && { color: category.color },
                        ]}
                      >
                        {range}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {category.allowCustom && (
                    <View style={styles.customInputContainer}>
                      <Text style={styles.customInputLabel}>
                        💡 What type of expense? (Optional)
                      </Text>
                      <TextInput
                        style={styles.customInput}
                        placeholder="e.g., Pet Care, Subscriptions, Gym"
                        placeholderTextColor={COLORS.textTertiary}
                        value={customCategoryNames[category.id] || ''}
                        onChangeText={(text) => {
                          setCustomCategoryNames({ ...customCategoryNames, [category.id]: text });
                        }}
                      />
                      <Text style={styles.customInputHint}>
                        Help us discover new expense categories!
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );

  const renderInvestmentsStep = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      <Text style={styles.stepDescription}>
        Select investment types and your monthly contribution
      </Text>
      <View style={styles.skipHint}>
        <Ionicons name="information-circle" size={16} color={COLORS.primaryGold} />
        <Text style={styles.skipHintText}>Optional - You can skip this step</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.categoryScroll}>
        {INVESTMENT_TYPES.map((investment) => {
          const isExpanded = investmentData[investment.id] !== undefined;
          return (
            <View key={investment.id} style={styles.categoryContainer}>
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.light();
                  if (isExpanded) {
                    const newData = { ...investmentData };
                    delete newData[investment.id];
                    setInvestmentData(newData);
                  } else {
                    setInvestmentData({ ...investmentData, [investment.id]: INVESTMENT_RANGES[2] });
                  }
                }}
                style={[
                  styles.categoryHeader,
                  isExpanded && styles.categoryHeaderActive,
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${investment.color}20` }]}>
                  <Ionicons name={investment.icon as any} size={20} color={investment.color} />
                </View>
                <Text style={styles.categoryName}>{investment.name}</Text>
                {isExpanded && (
                  <View style={[styles.selectedBadge, { backgroundColor: investment.color }]}>
                    <Text style={styles.selectedBadgeText}>
                      {investmentData[investment.id]}
                    </Text>
                  </View>
                )}
                <Ionicons
                  name={isExpanded ? 'checkmark-circle' : 'add-circle-outline'}
                  size={24}
                  color={isExpanded ? investment.color : COLORS.textTertiary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.rangeSelector}>
                  {INVESTMENT_RANGES.map((range, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        hapticFeedback.light();
                        setInvestmentData({ ...investmentData, [investment.id]: range });
                      }}
                      style={[
                        styles.rangeChip,
                        investmentData[investment.id] === range && styles.rangeChipSelected,
                        { borderColor: investment.color },
                        investmentData[investment.id] === range && { backgroundColor: `${investment.color}30` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rangeChipText,
                          investmentData[investment.id] === range && { color: investment.color },
                        ]}
                      >
                        {range}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {investment.allowCustom && (
                    <View style={styles.customInputContainer}>
                      <Text style={styles.customInputLabel}>
                        💡 What type of investment? (Optional)
                      </Text>
                      <TextInput
                        style={styles.customInput}
                        placeholder="e.g., NPS, Bonds, Insurance, Land"
                        placeholderTextColor={COLORS.textTertiary}
                        value={customCategoryNames[investment.id] || ''}
                        onChangeText={(text) => {
                          setCustomCategoryNames({ ...customCategoryNames, [investment.id]: text });
                        }}
                      />
                      <Text style={styles.customInputHint}>
                        Help us discover new investment categories!
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.container}>
          {/* Progress Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.light();
                  if (currentStep > 0) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    onClose();
                  }
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                <Text style={styles.stepCounter}>
                  Step {currentStep + 1} of {totalSteps}
                </Text>
                <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={[COLORS.primaryGold, COLORS.secondaryGold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>
          </View>

          {/* Step Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.stepIcon}>
              <LinearGradient
                colors={['rgba(234, 179, 8, 0.2)', 'rgba(234, 179, 8, 0.05)']}
                style={styles.stepIconGradient}
              >
                <Ionicons name={steps[currentStep].icon as any} size={32} color={COLORS.primaryGold} />
              </LinearGradient>
            </View>
            <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>

            {currentStep === 0 && renderIncomeStep()}
            {currentStep === 1 && renderSpendingStep()}
            {currentStep === 2 && renderInvestmentsStep()}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {currentStep === 2 && (
              <TouchableOpacity
                onPress={handleSkip}
                disabled={isLoading}
                style={styles.skipButton}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleNext}
              disabled={isLoading}
              style={[
                styles.nextButton,
                isLoading && styles.nextButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={[COLORS.primaryGold, COLORS.secondaryGold]}
                style={styles.nextGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === totalSteps - 1 ? 'Complete Setup' : 'Continue'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.primaryBackground} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}20`,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  stepCounter: {
    fontFamily: FONTS.sans.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  stepTitle: {
    fontFamily: FONTS.sans.bold,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: `${COLORS.primaryGold}20`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
  },
  content: {
    maxHeight: '60%',
  },
  contentContainer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  stepIcon: {
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  stepIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primaryGold}30`,
  },
  stepSubtitle: {
    fontFamily: FONTS.sans.regular,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontFamily: FONTS.sans.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  optionsGrid: {
    gap: SPACING.md,
  },
  incomeOption: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: RADIUS.lg,
  },
  selectedOption: {
    transform: [{ scale: 1.02 }],
  },
  optionLabel: {
    flex: 1,
    fontFamily: FONTS.sans.semibold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  selectedOptionLabel: {
    color: COLORS.primaryBackground,
    fontFamily: FONTS.sans.bold,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScroll: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    gap: SPACING.md,
  },
  categoryHeaderActive: {
    backgroundColor: `${COLORS.primaryGold}10`,
    borderColor: COLORS.primaryGold,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  selectedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  selectedBadgeText: {
    fontFamily: FONTS.sans.bold,
    fontSize: 12,
    color: COLORS.primaryBackground,
  },
  rangeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  rangeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    backgroundColor: COLORS.secondaryBackground,
  },
  rangeChipSelected: {
    borderWidth: 2,
  },
  rangeChipText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  customInputContainer: {
    width: '100%',
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: `${COLORS.primaryGold}08`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`,
    borderStyle: 'dashed',
  },
  customInputLabel: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  customInput: {
    backgroundColor: COLORS.primaryBackground,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontFamily: FONTS.sans.regular,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}30`,
  },
  customInputHint: {
    fontFamily: FONTS.sans.regular,
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  skipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.sm,
    backgroundColor: `${COLORS.primaryGold}10`,
    borderRadius: RADIUS.md,
  },
  skipHintText: {
    fontFamily: FONTS.sans.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actions: {
    padding: SPACING.xl,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.primaryGold}20`,
  },
  skipButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: FONTS.sans.semibold,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  nextButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  nextButtonText: {
    fontFamily: FONTS.sans.bold,
    fontSize: 16,
    color: COLORS.primaryBackground,
  },
});
