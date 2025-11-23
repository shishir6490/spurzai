import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Switch,
  Modal,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';
import { Card3D } from '@components/Card3D';
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';
import { CompleteBudgetSetupModal } from '@components/CompleteBudgetSetupModal';
import { CategoryTypeSelector } from '@components/CategoryTypeSelector';
import { AddLoanModal } from '@components/AddLoanModal';
import { EditProfileModal, ProfileData } from '@components/EditProfileModal';

const { width, height } = Dimensions.get('window');

// Generate random stars for background
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * (height * 0.8),
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 3000 + 2000,
    delay: Math.random() * 2000,
    opacity: Math.random() * 0.5 + 0.3,
  }));
};

const STARS = generateStars(50);

// Starfield Component
const StarField = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      {STARS.map((star) => {
        const StarComponent = () => {
          const animatedOpacity = useRef(new Animated.Value(star.opacity)).current;
          
          useEffect(() => {
            const animation = Animated.loop(
              Animated.sequence([
                Animated.timing(animatedOpacity, {
                  toValue: star.opacity * 0.3,
                  duration: star.duration,
                  useNativeDriver: true,
                  delay: star.delay,
                }),
                Animated.timing(animatedOpacity, {
                  toValue: star.opacity,
                  duration: star.duration,
                  useNativeDriver: true,
                }),
              ])
            );
            animation.start();
            return () => animation.stop();
          }, []);

          return (
            <Animated.View
              style={{
                position: 'absolute',
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: COLORS.primaryGold,
                opacity: animatedOpacity,
              }}
            />
          );
        };
        return <StarComponent key={star.id} />;
      })}
    </View>
  );
};

const MENU_ITEMS = [
  { icon: 'shield-check-outline', label: 'Security & Privacy', subtitle: 'Manage your security' },
  { icon: 'bell-outline', label: 'Notifications', subtitle: 'Notification preferences' },
  { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'Contact our team' },
  { icon: 'file-document-outline', label: 'Terms & Policy', subtitle: 'Read our policies' },
];

interface FinancialCategory {
  id: string;
  name: string;
  amount: number;
  icon: string;
  color: string;
  isExpense: boolean;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [scrollAnim] = useState(new Animated.Value(0));
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [editAmount, setEditAmount] = useState('');
  const [editName, setEditName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [showBudgetSetupModal, setShowBudgetSetupModal] = useState(false);
  const [showCategoryTypeSelector, setShowCategoryTypeSelector] = useState(false);
  const [budgetModalStartStep, setBudgetModalStartStep] = useState(0);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const headerOpacity = scrollAnim.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' });

  // Fetch profile data from backend
  const fetchProfileData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const profile = await ApiClient.getProfile();
      setProfileData(profile);
      
      // Fetch income sources to populate categories
      const income = await ApiClient.getIncomeSources();
      console.log('📊 Raw income sources:', JSON.stringify(income.incomeSources, null, 2));
      
      if (income.incomeSources && income.incomeSources.length > 0) {
        // Group income sources by type (Salary/Monthly Income are same)
        const incomeMap = new Map<string, FinancialCategory>();
        
        income.incomeSources.forEach((source: any, index: number) => {
          // Check both 'source' and 'name' fields for "Expense: " prefix to determine if it's an expense
          const sourceField = source.source || source.name || '';
          const isExpense = sourceField.toLowerCase().includes('expense:');
          
          console.log(`🔍 Processing source: ${sourceField}, isExpense: ${isExpense}`);
          
          // For display name, remove the "Expense: " prefix if present
          const displayName = (source.name || source.source || 'Income').replace(/^Expense:\s*/i, '');
          const amount = Math.abs(source.amount || 0);
          
          // Treat "Monthly Income", "Salary", "Monthly Salary" as the same
          let normalizedName = displayName;
          if (displayName.toLowerCase().includes('salary') || displayName.toLowerCase().includes('monthly income')) {
            normalizedName = 'Salary';
          }
          
          // If we already have this category, keep the one with larger amount (more recent)
          const existing = incomeMap.get(normalizedName);
          if (!existing || amount > existing.amount) {
            incomeMap.set(normalizedName, {
              id: source._id || source.id || index.toString(),
              name: normalizedName,
              amount: amount,
              icon: isExpense ? 'wallet' : 'cash',
              color: isExpense ? '#F59E0B' : '#10B981',
              isExpense: isExpense,
            });
            
            console.log(`📝 Mapped category: ${normalizedName}, isExpense: ${isExpense}, amount: ${amount}`);
          }
        });
        
        const mappedCategories = Array.from(incomeMap.values());
        console.log('💰 Final categories:', mappedCategories);
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleEditCategory = (category: FinancialCategory) => {
    setEditingCategory(category);
    setEditAmount(category.amount.toString());
    setEditName(category.name);
    setShowEditModal(true);
    hapticFeedback.light();
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;

    try {
      const newAmount = parseFloat(editAmount) || 0;
      
      // Update in backend
      await ApiClient.updateIncomeSource(editingCategory.id, {
        name: editName,
        amount: newAmount,
      });

      // Update local state
      setCategories(prev =>
        prev.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, name: editName, amount: newAmount }
            : cat
        )
      );

      setShowEditModal(false);
      hapticFeedback.success();
      
      // Refresh data from backend
      setTimeout(() => {
        fetchProfileData();
      }, 300);
    } catch (error) {
      console.error('Error updating category:', error);
      hapticFeedback.error();
      Alert.alert('Error', 'Failed to update category. Please try again.');
    }
  };

  const handleAddCategory = () => {
    const newCategory: FinancialCategory = {
      id: Date.now().toString(),
      name: editName,
      amount: parseFloat(editAmount) || 0,
      icon: 'cash-outline',
      color: '#6366F1',
    };
    setCategories(prev => [...prev, newCategory]);
    setShowAddCategory(false);
    setEditName('');
    setEditAmount('');
    hapticFeedback.medium();
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      // Delete from backend
      await ApiClient.deleteIncomeSource(id);

      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== id));
      setShowEditModal(false);
      hapticFeedback.success();
      
      // Refresh data from backend
      setTimeout(() => {
        fetchProfileData();
      }, 300);
    } catch (error) {
      console.error('Error deleting category:', error);
      hapticFeedback.error();
      Alert.alert('Error', 'Failed to delete category. Please try again.');
    }
  };

  const handleUpdateProfile = async (data: ProfileData) => {
    try {
      await ApiClient.updateProfile(data);
      setProfileData({ ...profileData, ...data });
      hapticFeedback.success();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Calculate income vs expenses using isExpense flag
  // Income: Items where isExpense is false (e.g., Salary)
  const incomeCategories = categories.filter(c => 
    !c.isExpense && 
    c.amount > 0
  );
  
  // All expense items (isExpense = true)
  const allExpenses = categories.filter(c => 
    c.isExpense && 
    c.amount > 0
  );
  
  // Investment keywords to identify investment categories
  const investmentKeywords = ['stock', 'mutual', 'sip', 'investment', 'crypto', 'gold', 'fd', 'deposit', 'bond'];
  
  // Investments: Items with investment-related keywords
  const investmentCategories = allExpenses.filter(c =>
    investmentKeywords.some(keyword => c.name.toLowerCase().includes(keyword))
  );
  
  // Loans: Items with loan/emi keywords
  const loanCategories = allExpenses.filter(c => 
    (c.name.toLowerCase().includes('loan') || c.name.toLowerCase().includes('emi')) &&
    !investmentKeywords.some(keyword => c.name.toLowerCase().includes(keyword))
  );
  
  // Regular expenses: Exclude loans and investments
  const expenseCategories = allExpenses.filter(c =>
    !investmentKeywords.some(keyword => c.name.toLowerCase().includes(keyword)) &&
    !c.name.toLowerCase().includes('loan') && 
    !c.name.toLowerCase().includes('emi')
  );
  
  const monthlyIncome = incomeCategories.reduce((sum, c) => sum + c.amount, 0);
  const totalExpenses = expenseCategories.reduce((sum, c) => sum + c.amount, 0); // Regular expenses only
  const totalInvestments = investmentCategories.reduce((sum, c) => sum + c.amount, 0);
  const totalLoans = loanCategories.reduce((sum, c) => sum + c.amount, 0);
  const monthlySavings = monthlyIncome - totalExpenses - totalInvestments - totalLoans;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Starfield Background */}
      <StarField />

      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
        <BlurView tint="dark" intensity={90} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => hapticFeedback.light()}
            >
              <Ionicons name="settings" size={22} color={COLORS.primaryGold} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      <ScrollView onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollAnim } } }], { useNativeDriver: false })} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false} directionalLockEnabled={true} horizontal={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient colors={[COLORS.primaryGold, '#EADFB4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>
              {(profileData?.fullName || user?.fullName || user?.phoneNumber || 'U').charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {profileData?.fullName || user?.fullName || user?.phoneNumber || 'User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.phoneNumber || user?.email || ''}
            </Text>
            {(profileData?.occupation || profileData?.city) && (
              <View style={styles.userLocation}>
                {profileData?.occupation && (
                  <>
                    <Ionicons name="briefcase" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.userLocationText}>{profileData.occupation}</Text>
                  </>
                )}
                {profileData?.occupation && profileData?.city && (
                  <Text style={styles.userLocationText}> • </Text>
                )}
                {profileData?.city && (
                  <>
                    <Ionicons name="location" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.userLocationText}>{profileData.city}</Text>
                  </>
                )}
              </View>
            )}
            <View style={styles.memberBadge}>
              <Ionicons name="star" size={12} color={COLORS.primaryGold} />
              <Text style={styles.memberText}>Premium Member</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              hapticFeedback.light();
              setShowEditProfileModal(true);
            }}
          >
            <Ionicons name="pencil" size={18} color={COLORS.primaryGold} />
          </TouchableOpacity>
        </View>

        {/* Financial Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <Card3D colors={['rgba(30,30,30,0.4)', 'rgba(20,20,20,0.2)']} borderRadius={16} style={styles.overviewContainer}>
            <View style={styles.overviewItem}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
              <Text style={styles.overviewLabel}>Monthly Income</Text>
              <Text style={styles.overviewValue}>₹{monthlyIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Ionicons name="trending-down" size={20} color="#EF4444" />
              <Text style={styles.overviewLabel}>Monthly Expenses</Text>
              <Text style={styles.overviewValue}>₹{totalExpenses.toLocaleString()}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Ionicons name="stats-chart" size={20} color="#3B82F6" />
              <Text style={styles.overviewLabel}>Total Investments</Text>
              <Text style={styles.overviewValue}>₹{totalInvestments.toLocaleString()}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Ionicons name="card" size={20} color="#F97316" />
              <Text style={styles.overviewLabel}>Loan EMIs</Text>
              <Text style={styles.overviewValue}>₹{totalLoans.toLocaleString()}</Text>
            </View>
          </Card3D>
          
          <Card3D colors={['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)']} borderRadius={16} style={styles.savingsCard}>
            <View style={styles.savingsHeader}>
              <View>
                <Text style={styles.savingsLabel}>Monthly Savings</Text>
                <Text style={styles.savingsValue}>₹{monthlySavings.toLocaleString()}</Text>
              </View>
              <View style={styles.savingsPercentBadge}>
                <Text style={styles.savingsPercent}>
                  {monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(0) : 0}%
                </Text>
              </View>
            </View>
          </Card3D>
        </View>

        {/* MoM Trends */}
        {monthData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Month on Month Trends</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.momScroll}>
              {monthData.map((data, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.momCard, selectedMonth === index && styles.momCardActive]}
                  onPress={() => {
                    setSelectedMonth(index);
                    hapticFeedback.light();
                  }}
                >
                  <Text style={styles.momMonth}>{data.month}</Text>
                  <View style={styles.momStats}>
                    <View style={styles.momStat}>
                      <Ionicons name="arrow-down" size={14} color="#EF4444" />
                    <Text style={[styles.momStatValue, { color: '#EF4444' }]}>
                      ₹{(data.expenses / 1000).toFixed(0)}K
                    </Text>
                  </View>
                  <View style={styles.momStat}>
                    <Ionicons name="arrow-up" size={14} color="#10B981" />
                    <Text style={[styles.momStatValue, { color: '#10B981' }]}>
                      ₹{(data.savings / 1000).toFixed(0)}K
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          </View>
        )}

        {/* Financial Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Financial Categories</Text>
            <TouchableOpacity
              style={styles.addCategoryBtn}
              onPress={() => {
                hapticFeedback.light();
                setShowCategoryTypeSelector(true);
              }}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.primaryGold} />
            </TouchableOpacity>
          </View>
          {/* Show income + regular expenses (excluding loans and investments) */}
          {[...incomeCategories, ...expenseCategories].map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleEditCategory(category)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <Ionicons name={category.icon as any} size={22} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={styles.categoryAmount}>₹{category.amount.toLocaleString()}</Text>
                <Ionicons name="pencil" size={16} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loans & EMIs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Loans & EMIs</Text>
            <TouchableOpacity
              style={styles.addCategoryBtn}
              onPress={() => {
                hapticFeedback.light();
                setShowLoanModal(true);
              }}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.primaryGold} />
            </TouchableOpacity>
          </View>
          {loanCategories.length > 0 ? (
            loanCategories.map((loan) => (
              <TouchableOpacity
                key={loan.id}
                style={styles.categoryItem}
                onPress={() => handleEditCategory(loan)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: `${COLORS.error}20` }]}>
                    <Ionicons name="card" size={22} color={COLORS.error} />
                  </View>
                  <Text style={styles.categoryName}>{loan.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>₹{loan.amount.toLocaleString()}/mo</Text>
                  <Ionicons name="pencil" size={16} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyStateText}>No loans added yet</Text>
              <Text style={styles.emptyStateSubtext}>Track your EMIs and loan payments</Text>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {/* Spending Tracking Toggle */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBg}>
                <MaterialCommunityIcons name="chart-line" size={22} color={COLORS.primaryGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>Spending Tracking</Text>
                <Text style={styles.menuSubtitle}>
                  {trackingEnabled ? 'Track spending across categories' : 'Tracking paused'}
                </Text>
              </View>
            </View>
            <Switch
              value={trackingEnabled}
              onValueChange={(value) => {
                setTrackingEnabled(value);
                hapticFeedback.medium();
                // TODO: Update backend settings
                console.log('Tracking toggled:', value);
              }}
              trackColor={{ false: '#3e3e3e', true: COLORS.primaryGold }}
              thumbColor={trackingEnabled ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuItem} activeOpacity={0.7} onPress={() => hapticFeedback.light()}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconBg}>
                  <MaterialCommunityIcons name={item.icon as any} size={22} color={COLORS.primaryGold} />
                </View>
                <View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => {
              hapticFeedback.heavy();
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => hapticFeedback.light()
                  },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      hapticFeedback.heavy();
                      await logout();
                    }
                  }
                ]
              );
            }}
          >
            <LinearGradient colors={['rgba(255,107,107,0.2)', 'rgba(255,107,107,0.05)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoutGradient}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Category Modal */}
      <Modal visible={showEditModal || showAddCategory} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => {
          setShowEditModal(false);
          setShowAddCategory(false);
        }}>
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardView}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {showAddCategory ? 'Add Category' : 'Edit Category'}
                    </Text>
                    <TouchableOpacity onPress={() => {
                      setShowEditModal(false);
                      setShowAddCategory(false);
                    }}>
                      <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Category Name</Text>
                      <TextInput
                        style={styles.input}
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="Enter category name"
                        placeholderTextColor={COLORS.textSecondary}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Amount (₹)</Text>
                      <TextInput
                        style={styles.input}
                        value={editAmount}
                        onChangeText={setEditAmount}
                        keyboardType="numeric"
                        placeholder="Enter amount"
                        placeholderTextColor={COLORS.textSecondary}
                      />
                    </View>

                    <View style={styles.modalActions}>
                      {!showAddCategory && editingCategory?.id !== '1' && (
                        <TouchableOpacity
                          style={[styles.modalButton, styles.deleteButton]}
                          onPress={() => editingCategory && handleDeleteCategory(editingCategory.id)}
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.modalButton, styles.saveButton]}
                        onPress={showAddCategory ? handleAddCategory : handleSaveCategory}
                      >
                        <Text style={styles.saveButtonText}>
                          {showAddCategory ? 'Add' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Category Type Selector */}
      <CategoryTypeSelector
        visible={showCategoryTypeSelector}
        onClose={() => setShowCategoryTypeSelector(false)}
        hasIncome={incomeCategories.length > 0}
        hasExpenses={expenseCategories.length > 0}
        hasInvestments={false}
        onSelectType={(type) => {
          console.log('📝 Selected category type:', type);
          if (type === 'income') {
            setBudgetModalStartStep(0); // Income step
          } else if (type === 'expense') {
            setBudgetModalStartStep(1); // Spending step
          } else if (type === 'investment') {
            setBudgetModalStartStep(2); // Investment step
          }
          setShowBudgetSetupModal(true);
        }}
      />

      {/* Complete Budget Setup Modal */}
      <CompleteBudgetSetupModal
        visible={showBudgetSetupModal}
        onClose={() => setShowBudgetSetupModal(false)}
        onComplete={() => {
          fetchProfileData();
        }}
        startStep={budgetModalStartStep}
      />

      {/* Add Loan Modal */}
      <AddLoanModal
        visible={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        onSuccess={() => {
          fetchProfileData();
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSave={handleUpdateProfile}
        initialData={{
          fullName: profileData?.fullName || user?.fullName,
          dateOfBirth: profileData?.dateOfBirth,
          occupation: profileData?.occupation,
          city: profileData?.city,
          phoneNumber: user?.phoneNumber,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBackground },
  stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)' },
  headerBlur: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold },
  headerIcon: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center' },
  profileHeader: { paddingHorizontal: SPACING.lg, paddingTop: 100, paddingBottom: SPACING.xl, flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  avatarGradient: { width: 80, height: 80, borderRadius: RADIUS.full, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 36, fontWeight: '700', color: COLORS.primaryBackground, fontFamily: FONTS.sans.bold },
  profileInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold, marginBottom: SPACING.xs },
  userEmail: { fontSize: 13, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular, marginBottom: SPACING.xs },
  userLocation: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm },
  userLocationText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  memberText: { fontSize: 11, fontWeight: '600', color: COLORS.primaryGold, fontFamily: FONTS.sans.semibold },
  editButton: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: { flex: 1, padding: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.primaryGold, fontFamily: FONTS.sans.bold, marginBottom: SPACING.xs },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular },
  section: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.1)' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold, marginBottom: SPACING.lg },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  settingIconBg: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, fontFamily: FONTS.sans.semibold },
  settingSubtitle: { fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular, marginTop: 2 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  menuIconBg: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, fontFamily: FONTS.sans.semibold },
  menuSubtitle: { fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular, marginTop: 2 },
  logoutButton: { marginTop: SPACING.lg },
  logoutGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.error, fontFamily: FONTS.sans.bold },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  overviewContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  overviewLabel: { 
    fontSize: 12, 
    color: COLORS.textSecondary, 
    fontFamily: FONTS.sans.regular,
    flex: 1,
    marginLeft: SPACING.xs,
  },
  overviewValue: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: COLORS.textPrimary, 
    fontFamily: FONTS.sans.bold,
  },
  savingsCard: { padding: SPACING.lg },
  savingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savingsLabel: { fontSize: 13, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular, marginBottom: SPACING.xs },
  savingsValue: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold },
  savingsPercentBadge: { backgroundColor: 'rgba(139,92,246,0.2)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  savingsPercent: { fontSize: 16, fontWeight: '700', color: '#8B5CF6', fontFamily: FONTS.sans.bold },
  momScroll: { marginHorizontal: -SPACING.lg, paddingHorizontal: SPACING.lg },
  momCard: { width: 100, padding: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', marginRight: SPACING.md },
  momCardActive: { backgroundColor: 'rgba(212,175,55,0.2)', borderColor: COLORS.primaryGold },
  momMonth: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold, marginBottom: SPACING.sm },
  momStats: { gap: SPACING.xs },
  momStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  momStatValue: { fontSize: 12, fontWeight: '600', fontFamily: FONTS.sans.semibold },
  addCategoryBtn: { padding: SPACING.xs },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)' },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  categoryIcon: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  categoryName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, fontFamily: FONTS.sans.semibold },
  categoryRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  categoryAmount: { fontSize: 16, fontWeight: '700', color: COLORS.primaryGold, fontFamily: FONTS.sans.bold },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  emptyStateText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary, fontFamily: FONTS.sans.semibold },
  emptyStateSubtext: { fontSize: 13, color: COLORS.textTertiary, fontFamily: FONTS.sans.regular },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalKeyboardView: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.secondaryBackground, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold },
  inputGroup: { marginBottom: SPACING.lg },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, fontFamily: FONTS.sans.semibold, marginBottom: SPACING.sm },
  input: { backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: 16, color: COLORS.textPrimary, fontFamily: FONTS.sans.regular },
  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  modalButton: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center' },
  deleteButton: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  deleteButtonText: { fontSize: 16, fontWeight: '700', color: '#EF4444', fontFamily: FONTS.sans.bold },
  saveButton: { backgroundColor: COLORS.primaryGold },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.primaryBackground, fontFamily: FONTS.sans.bold },
});
