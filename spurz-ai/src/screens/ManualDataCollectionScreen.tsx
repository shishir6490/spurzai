import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@context/AuthContext';

const incomeRanges = [
  '₹0 - ₹25,000',
  '₹25,001 - ₹50,000',
  '₹50,001 - ₹1,00,000',
  '₹1,00,001 - ₹2,50,000',
  '₹2,50,001 - ₹5,00,000',
  '₹5,00,001+',
];

const spendingCategories = [
  { name: 'Food', icon: 'restaurant-outline', color: COLORS.food },
  { name: 'Shopping', icon: 'bag-outline', color: COLORS.shopping },
  { name: 'Transport', icon: 'car-outline', color: COLORS.transport },
  { name: 'Travel', icon: 'airplane-outline', color: COLORS.travel },
  { name: 'Entertainment', icon: 'film-outline', color: COLORS.entertainment },
  { name: 'Utilities', icon: 'home-outline', color: '#4ECDC4' },
  { name: 'Healthcare', icon: 'heart-outline', color: '#FF6B6B' },
  { name: 'Education', icon: 'school-outline', color: '#95E1D3' },
];

const investmentCategories = [
  { name: 'Stocks', icon: 'bar-chart-outline', color: COLORS.travel },
  { name: 'Mutual Funds', icon: 'pie-chart-outline', color: COLORS.entertainment },
  { name: 'Crypto', icon: 'cash-outline', color: COLORS.shopping },
  { name: 'Real Estate', icon: 'home-outline', color: COLORS.food },
  { name: 'Insurance', icon: 'shield-outline', color: COLORS.transport },
  { name: 'Fixed Deposits', icon: 'lock-closed-outline', color: COLORS.warning },
];

const loanTypes = [
  { name: 'Home Loan', icon: 'home-outline', color: COLORS.food },
  { name: 'Car Loan', icon: 'car-outline', color: COLORS.transport },
  { name: 'Personal Loan', icon: 'person-outline', color: COLORS.travel },
  { name: 'Education Loan', icon: 'school-outline', color: '#95E1D3' },
];

const emiOptions = [
  { name: 'No EMI', icon: 'close-circle-outline', color: COLORS.success },
  { name: '1-2 EMIs', icon: 'arrow-down-outline', color: COLORS.warning },
  { name: '2-5 EMIs', icon: 'arrow-down-outline', color: COLORS.warning },
  { name: '5+ EMIs', icon: 'alert-circle-outline', color: COLORS.error },
];

export default function ManualDataCollectionScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, any>>({});
  const [amounts, setAmounts] = useState<Record<string, any>>({});
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amountModalData, setAmountModalData] = useState<{ category: string; type: string } | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const analysisProgressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  useEffect(() => {
    if (isAnalysing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(analysisProgressAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(analysisProgressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isAnalysing]);

  const steps = [
    { id: 'income', title: 'Monthly Income', icon: 'bar-chart-outline', optional: false },
    { id: 'spending', title: 'Monthly Spending', icon: 'card-outline', optional: true },
    { id: 'investments', title: 'Investments', icon: 'briefcase-outline', optional: true },
    { id: 'loans', title: 'Loans & EMIs', icon: 'document-text-outline', optional: true },
  ];

  const currentStepData = steps[currentStep];
  const stepProgress = currentStepData ? ((currentStep + 1) / steps.length) * 100 : 100;

  const handleSkipAll = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAnalysing(true);
    
    // Simulate analysis time (3 seconds), then complete onboarding
    setTimeout(async () => {
      await completeOnboarding();
    }, 3000);
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep === steps.length - 1) {
      // All data collected, start analysis
      setIsAnalysing(true);
      
      // Simulate analysis time (3 seconds), then complete onboarding
      setTimeout(async () => {
        await completeOnboarding();
      }, 3000);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkipStep = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(currentStep + 1);
  };

  const canProceed =
    !currentStepData || 
    currentStepData.optional ||
    (currentStepData.id === 'income' && selections.income);

  // Premium card component
  const PremiumCard = ({ item, isSelected, onPress, hasIcon = true, color }: any) => {
    const displayColor = color || COLORS.primaryGold;
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1 }}>
        <LinearGradient
          colors={isSelected ? (GRADIENTS.cardAccent as any) : [COLORS.secondaryBackground, COLORS.secondaryBackground]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: RADIUS.lg,
            borderWidth: 1.5,
            borderColor: isSelected ? COLORS.primaryGold : `rgba(212,175,55,0.2)`,
            padding: SPACING.lg,
            backgroundColor: isSelected ? undefined : COLORS.secondaryBackground,
            overflow: 'hidden',
          }}
        >
          {hasIcon && (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: RADIUS.md,
                backgroundColor: `${displayColor}20`,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: SPACING.md,
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={26}
                color={displayColor}
              />
            </View>
          )}
          <Text
            style={{
              fontFamily: FONTS.sans.semibold,
              fontSize: 14,
              color: isSelected ? COLORS.primaryGold : COLORS.textAccentMuted,
              marginBottom: SPACING.xs,
            }}
          >
            {item.name}
          </Text>
          {isSelected && (
            <View
              style={{
                position: 'absolute',
                top: SPACING.md,
                right: SPACING.md,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: COLORS.primaryGold,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="checkmark" size={16} color={COLORS.primaryBackground} />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Amount Modal Component
  const AmountInputModal = () => {
    const presetAmounts = amountModalData?.type === 'loans' 
      ? ['5000', '10000', '25000', '50000', '100000', '250000']
      : ['500', '1000', '2500', '5000', '10000', '25000'];

    const handlePresetAmount = (amount: string) => {
      if (amountModalData) {
        const key = `${amountModalData.type}_${amountModalData.category}`;
        setAmounts({ ...amounts, [key]: amount });
        setShowAmountModal(false);
        setAmountInput('');
      }
    };

    return (
      <Modal
        visible={showAmountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAmountModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <LinearGradient
            colors={GRADIENTS.background as any}
            style={{
              borderTopLeftRadius: RADIUS.xl,
              borderTopRightRadius: RADIUS.xl,
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.lg,
              paddingBottom: 40,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
              <Text style={{ fontFamily: FONTS.sans.semibold, fontSize: 18, color: COLORS.textPrimary }}>
                {amountModalData?.category}
              </Text>
              <TouchableOpacity onPress={() => setShowAmountModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Current Amount Display */}
            <View style={{
              backgroundColor: `${COLORS.primaryGold}15`,
              borderRadius: RADIUS.lg,
              paddingVertical: SPACING.lg,
              alignItems: 'center',
              marginBottom: SPACING.lg,
            }}>
              <Text style={{ fontFamily: FONTS.sans.regular, fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.xs }}>
                Selected Amount
              </Text>
              <Text style={{ fontFamily: FONTS.sans.bold, fontSize: 32, color: COLORS.primaryGold }}>
                ₹{amountInput || '0'}
              </Text>
            </View>

            {/* Quick Amount Buttons */}
            <Text style={{ fontFamily: FONTS.sans.regular, fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md }}>
              Quick Select
            </Text>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: SPACING.md,
              marginBottom: SPACING.lg,
            }}>
              {presetAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => {
                    setAmountInput(amount);
                  }}
                  style={{
                    flex: 1,
                    minWidth: '30%',
                  }}
                >
                  <LinearGradient
                    colors={amountInput === amount 
                      ? (GRADIENTS.goldButton as any)
                      : [`${COLORS.primaryGold}15`, `${COLORS.primaryGold}05`]
                    }
                    style={{
                      paddingVertical: SPACING.md,
                      borderRadius: RADIUS.md,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: amountInput === amount ? COLORS.primaryGold : `${COLORS.primaryGold}30`,
                    }}
                  >
                    <Text style={{
                      fontFamily: FONTS.sans.semibold,
                      fontSize: 14,
                      color: amountInput === amount ? COLORS.primaryBackground : COLORS.primaryGold,
                    }}>
                      ₹{amount}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Manual Input */}
            <Text style={{ fontFamily: FONTS.sans.regular, fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md }}>
              Or enter custom amount
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.md,
              borderBottomWidth: 1,
              borderBottomColor: `${COLORS.primaryGold}40`,
              paddingBottom: SPACING.md,
              marginBottom: SPACING.lg,
            }}>
              <Text style={{ fontFamily: FONTS.sans.bold, fontSize: 18, color: COLORS.primaryGold }}>₹</Text>
              <TextInput
                style={{
                  flex: 1,
                  fontFamily: FONTS.sans.regular,
                  fontSize: 16,
                  color: COLORS.textPrimary,
                  padding: SPACING.md,
                }}
                placeholder="Enter amount"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="decimal-pad"
                value={amountInput}
                onChangeText={setAmountInput}
              />
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <TouchableOpacity
                onPress={() => {
                  setShowAmountModal(false);
                  setAmountInput('');
                }}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={[`${COLORS.primaryGold}20`, `${COLORS.primaryGold}10`]}
                  style={{ padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: FONTS.sans.semibold, fontSize: 14, color: COLORS.primaryGold }}>Cancel</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePresetAmount(amountInput)}
                disabled={!amountInput}
                style={{ flex: 1, opacity: amountInput ? 1 : 0.5 }}
              >
                <LinearGradient
                  colors={GRADIENTS.goldButton as any}
                  style={{ padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: FONTS.sans.semibold, fontSize: 14, color: COLORS.primaryBackground }}>Add ₹{amountInput}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  };

  const openAmountModal = (category: string, type: string) => {
    setAmountModalData({ category, type });
    setAmountInput('');
    setShowAmountModal(true);
  };

  const getAmountDisplay = (category: string, type: string) => {
    const key = `${type}_${category}`;
    return amounts[key] ? `₹${amounts[key]}` : 'Add Amount';
  };

  // Income step
  const renderIncomeStep = () => (
    <View>
      <Text style={{ fontFamily: FONTS.sans.regular, fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg }}>
        Select your average monthly income range
      </Text>
      <View style={{ gap: SPACING.md }}>
        {incomeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelections({ ...selections, income: range });
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selections.income === range ? (GRADIENTS.cardAccent as any) : [COLORS.secondaryBackground, COLORS.secondaryBackground]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: RADIUS.lg,
                borderWidth: 1.5,
                borderColor:
                  selections.income === range
                    ? COLORS.primaryGold
                    : `rgba(212,175,55,0.2)`,
                padding: SPACING.lg,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor:
                  selections.income === range ? undefined : COLORS.secondaryBackground,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.sans.semibold,
                  fontSize: 15,
                  color:
                    selections.income === range
                      ? COLORS.primaryGold
                      : COLORS.textAccentMuted,
                }}
              >
                {range}
              </Text>
              {selections.income === range && (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: COLORS.primaryGold,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={COLORS.primaryBackground}
                  />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Spending step
  const renderSpendingStep = () => (
    <View>
      <Text style={{ fontFamily: FONTS.sans.regular, fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg }}>
        Select spending categories and add amounts
      </Text>
      <View style={{ gap: SPACING.md }}>
        {spendingCategories.map((category) => {
          const isSelected = selections.spending?.includes(category.name);
          const amountKey = `spending_${category.name}`;
          const amount = amounts[amountKey];

          return (
            <View key={category.name}>
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const current = selections.spending || [];
                  const updated = current.includes(category.name)
                    ? current.filter((c: string) => c !== category.name)
                    : [...current, category.name];
                  setSelections({ ...selections, spending: updated });
                }}
              >
                <LinearGradient
                  colors={isSelected ? (GRADIENTS.cardAccent as any) : [COLORS.secondaryBackground, COLORS.secondaryBackground]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: RADIUS.lg,
                    borderWidth: 1.5,
                    borderColor: isSelected ? COLORS.primaryGold : `rgba(212,175,55,0.2)`,
                    padding: SPACING.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                  }}
                >
                  <View
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: RADIUS.md,
                      backgroundColor: `${category.color}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name={category.icon as any} size={22} color={category.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.sans.semibold, fontSize: 14, color: isSelected ? COLORS.primaryGold : COLORS.textPrimary }}>
                      {category.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <TouchableOpacity
                      onPress={() => openAmountModal(category.name, 'spending')}
                      style={{
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.sm,
                        backgroundColor: `${COLORS.primaryGold}30`,
                        borderRadius: RADIUS.md,
                      }}
                    >
                      <Text style={{ fontFamily: FONTS.sans.semibold, fontSize: 12, color: COLORS.primaryGold }}>
                        {amount ? `₹${amount}` : '+ Amount'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {isSelected && (
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primaryGold, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="checkmark" size={14} color={COLORS.primaryBackground} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );

  // Investments step
  const renderInvestmentsStep = () => (
    <View>
      <Text style={{ fontFamily: FONTS.sans.regular, fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg }}>
        Select investments and add amounts
      </Text>
      <View style={{ gap: SPACING.md }}>
        {investmentCategories.map((inv) => {
          const isSelected = selections.investments?.includes(inv.name);
          const amountKey = `investments_${inv.name}`;
          const amount = amounts[amountKey];

          return (
            <View key={inv.name}>
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const current = selections.investments || [];
                  const updated = current.includes(inv.name)
                    ? current.filter((c: string) => c !== inv.name)
                    : [...current, inv.name];
                  setSelections({ ...selections, investments: updated });
                }}
              >
                <LinearGradient
                  colors={isSelected ? (GRADIENTS.cardAccent as any) : [COLORS.secondaryBackground, COLORS.secondaryBackground]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: RADIUS.lg,
                    borderWidth: 1.5,
                    borderColor: isSelected ? COLORS.primaryGold : `rgba(212,175,55,0.2)`,
                    padding: SPACING.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                  }}
                >
                  <View
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: RADIUS.md,
                      backgroundColor: `${inv.color}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name={inv.icon as any} size={22} color={inv.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.sans.semibold, fontSize: 14, color: isSelected ? COLORS.primaryGold : COLORS.textPrimary }}>
                      {inv.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <TouchableOpacity
                      onPress={() => openAmountModal(inv.name, 'investments')}
                      style={{
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.sm,
                        backgroundColor: `${COLORS.primaryGold}30`,
                        borderRadius: RADIUS.md,
                      }}
                    >
                      <Text style={{ fontFamily: FONTS.sans.semibold, fontSize: 12, color: COLORS.primaryGold }}>
                        {amount ? `₹${amount}` : '+ Amount'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {isSelected && (
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primaryGold, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="checkmark" size={14} color={COLORS.primaryBackground} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );

  // Loans & EMIs step
  const renderLoansStep = () => (
    <View>
      <Text style={{ fontFamily: FONTS.sans.regular, fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg }}>
        Do you have any active loans? Add EMI amounts
      </Text>
      <View style={{ gap: SPACING.md, marginBottom: SPACING.xxl }}>
        {loanTypes.map((loan) => {
          const isSelected = selections.loans?.includes(loan.name);
          const amountKey = `loans_${loan.name}`;
          const amount = amounts[amountKey];

          return (
            <View key={loan.name}>
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const current = selections.loans || [];
                  const updated = current.includes(loan.name)
                    ? current.filter((c: string) => c !== loan.name)
                    : [...current, loan.name];
                  setSelections({ ...selections, loans: updated });
                }}
              >
                <LinearGradient
                  colors={isSelected ? (GRADIENTS.cardAccent as any) : [COLORS.secondaryBackground, COLORS.secondaryBackground]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: RADIUS.lg,
                    borderWidth: 1.5,
                    borderColor: isSelected ? COLORS.primaryGold : `rgba(212,175,55,0.2)`,
                    padding: SPACING.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                  }}
                >
                  <View
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: RADIUS.md,
                      backgroundColor: `${loan.color}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name={loan.icon as any} size={22} color={loan.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.sans.semibold, fontSize: 14, color: isSelected ? COLORS.primaryGold : COLORS.textPrimary }}>
                      {loan.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <TouchableOpacity
                      onPress={() => openAmountModal(loan.name, 'loans')}
                      style={{
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.sm,
                        backgroundColor: `${COLORS.primaryGold}30`,
                        borderRadius: RADIUS.md,
                      }}
                    >
                      <Text style={{ fontFamily: FONTS.sans.semibold, fontSize: 12, color: COLORS.primaryGold }}>
                        {amount ? `₹${amount}` : '+ EMI'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {isSelected && (
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primaryGold, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="checkmark" size={14} color={COLORS.primaryBackground} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.background as any} style={{ flex: 1 }}>
      {isAnalysing ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: insets.top,
          }}
        >
          {/* Animated loading circles */}
          <View style={{ marginBottom: 60 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 3,
                borderColor: `${COLORS.primaryGold}30`,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Animated.View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  borderWidth: 3,
                  borderColor: COLORS.primaryGold,
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  transform: [
                    {
                      rotate: analysisProgressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              />
            </View>
          </View>

          {/* Text content */}
          <Text
            style={{
              fontFamily: FONTS.sans.semibold,
              fontSize: 22,
              color: COLORS.textPrimary,
              marginBottom: SPACING.md,
              textAlign: 'center',
            }}
          >
            Analysing Your Data
          </Text>
          <Text
            style={{
              fontFamily: FONTS.sans.regular,
              fontSize: 14,
              color: COLORS.textSecondary,
              textAlign: 'center',
              maxWidth: '80%',
            }}
          >
            We're processing your financial information to create personalized insights...
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingTop: insets.top }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.lg,
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (currentStep === 0) {
                  navigation.goBack();
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primaryGold} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkipAll}>
              <Text
                style={{
                  fontFamily: FONTS.sans.semibold,
                  fontSize: 12,
                  color: COLORS.textSecondary,
                }}
              >
                Skip All
              </Text>
            </TouchableOpacity>
          </View>

        {/* Progress bar */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <View
            style={{
              height: 4,
              backgroundColor: `${COLORS.primaryGold}20`,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                backgroundColor: COLORS.primaryGold,
                width: `${stepProgress}%`,
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: FONTS.sans.regular,
              fontSize: 11,
              color: COLORS.textSecondary,
              marginTop: SPACING.sm,
            }}
          >
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            paddingBottom: SPACING.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Step header */}
          {currentStepData && (
            <Animated.View style={{ opacity: fadeAnim, marginBottom: SPACING.xxl }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: `${COLORS.primaryGold}15`,
                  borderWidth: 1.5,
                  borderColor: `${COLORS.primaryGold}40`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: SPACING.lg,
                }}
              >
                <Ionicons
                  name={currentStepData.icon as any}
                  size={28}
                  color={COLORS.primaryGold}
                />
              </View>
              <Text
                style={{
                  fontFamily: FONTS.sans.bold,
                  fontSize: 22,
                  color: COLORS.textPrimary,
                  marginBottom: SPACING.sm,
                }}
              >
                {currentStepData.title}
              </Text>
              {currentStepData.optional && (
                <View
                  style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.xs,
                    backgroundColor: `${COLORS.primaryGold}20`,
                    borderRadius: RADIUS.full,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.sans.bold,
                      fontSize: 10,
                      color: COLORS.primaryGold,
                    }}
                  >
                    Optional
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Step content */}
          <Animated.View style={{ opacity: fadeAnim }}>
            {currentStepData && currentStepData.id === 'income' && renderIncomeStep()}
            {currentStepData && currentStepData.id === 'spending' && renderSpendingStep()}
            {currentStepData && currentStepData.id === 'investments' && renderInvestmentsStep()}
            {currentStepData && currentStepData.id === 'loans' && renderLoansStep()}
          </Animated.View>
        </ScrollView>

        {/* Bottom buttons */}
        <View
          style={{
            paddingHorizontal: SPACING.lg,
            paddingBottom: SPACING.xl,
            gap: SPACING.md,
          }}
        >
          {currentStepData && currentStepData.optional && (
            <TouchableOpacity onPress={handleSkipStep} activeOpacity={0.7}>
              <Text
                style={{
                  fontFamily: FONTS.sans.semibold,
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                  paddingVertical: SPACING.md,
                }}
              >
                Skip This Step
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            disabled={!canProceed}
            style={{ opacity: canProceed ? 1 : 0.5 }}
          >
            <LinearGradient
              colors={GRADIENTS.goldButton as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: SPACING.lg,
                borderRadius: RADIUS.full,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.md,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.sans.semibold,
                  fontSize: 14,
                  color: COLORS.primaryBackground,
                }}
              >
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={COLORS.primaryBackground}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        </View>
      )}
      <AmountInputModal />
    </LinearGradient>
  );
}
