import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Modal,
  StatusBar,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import ApiClient from '../services/api';
import { hapticFeedback } from '@utils/haptics';
import { Card3D } from '@components/Card3D';
import { AddCardFlow } from '@components/AddCardFlow';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 200;
const CARD_WIDTH = width - 60;
const STACK_OFFSET_Y = 12;
const STACK_OFFSET_X = 6;
const ROTATION_DEGREES = 5;

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
    duration: Math.random() * 4000 + 6000,
    delay: Math.random() * 2000,
    opacity: Math.random() * 0.6 + 0.3
  }));
};

// Animated Star Component
const AnimatedStar = ({ star }: { star: Star }) => {
  const opacityAnim = useRef(new Animated.Value(star.opacity)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(star.delay),
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: star.opacity * 0.4,
              duration: star.duration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            }),
            Animated.timing(opacityAnim, {
              toValue: star.opacity,
              duration: star.duration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            })
          ]),
          Animated.sequence([
            Animated.timing(translateXAnim, {
              toValue: (Math.random() - 0.5) * 15,
              duration: star.duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            }),
            Animated.timing(translateXAnim, {
              toValue: 0,
              duration: star.duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            })
          ]),
          Animated.sequence([
            Animated.timing(translateYAnim, {
              toValue: (Math.random() - 0.5) * 10,
              duration: star.duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            }),
            Animated.timing(translateYAnim, {
              toValue: 0,
              duration: star.duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false
            })
          ])
        ])
      )
    ]).start();
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
        backgroundColor: '#FFFFFF',
        opacity: opacityAnim,
        transform: [
          { translateX: translateXAnim },
          { translateY: translateYAnim }
        ],
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
      }}
    />
  );
};

const MOCK_CARDS = [
  {
    id: '1',
    name: 'Infinia Metal Edition',
    bank: 'HDFC Bank',
    type: 'Credit Card',
    cardNumber: '4567 8901 2345 6789',
    cvv: '123',
    expiry: '12/26',
    balance: 45200,
    limit: 500000,
    spent: 54800,
    gradient: ['#0f1419', '#1a1f2e'] as [string, string],
    accentColor: '#D4AF37',
    logo: 'credit-card',
    network: 'VISA',
  },
  {
    id: '2',
    name: 'Platinum Card',
    bank: 'American Express',
    type: 'Premium Card',
    cardNumber: '3782 822463 10005',
    cvv: '456',
    expiry: '03/27',
    balance: 2150,
    limit: 1000000,
    spent: 97850,
    gradient: ['#1a1a1a', '#2d2d2d'] as [string, string],
    accentColor: '#c0c0c0',
    logo: 'credit-card-outline',
    network: 'AMEX',
  },
  {
    id: '3',
    name: 'Sapphiro Signature',
    bank: 'ICICI Bank',
    type: 'Rewards Card',
    cardNumber: '5105 1051 0510 5100',
    cvv: '789',
    expiry: '09/25',
    balance: 12500,
    limit: 200000,
    spent: 87500,
    gradient: ['#1e3a8a', '#2563eb'] as [string, string],
    accentColor: '#60a5fa',
    logo: 'credit-card-check',
    network: 'Mastercard',
  },
  {
    id: '4',
    name: 'Reserve Premium',
    bank: 'Axis Bank',
    type: 'Travel Card',
    cardNumber: '6011 1111 1111 1117',
    cvv: '321',
    expiry: '11/26',
    balance: 8900,
    limit: 300000,
    spent: 91100,
    gradient: ['#7c2d12', '#991b1b'] as [string, string],
    accentColor: '#fca5a5',
    logo: 'credit-card-fast',
    network: 'RuPay',
  },
];

const MOCK_TRANSACTIONS = [
  { id: '1', name: 'Starbucks', category: 'Food', amount: 450, date: '2024-11-20', icon: 'coffee' },
  { id: '2', name: 'Uber', category: 'Transport', amount: 280, date: '2024-11-20', icon: 'car' },
  { id: '3', name: 'Amazon', category: 'Shopping', amount: 2450, date: '2024-11-19', icon: 'cart' },
  { id: '4', name: 'Netflix', category: 'Entertainment', amount: 799, date: '2024-11-18', icon: 'play-circle' },
  { id: '5', name: 'Zomato', category: 'Food', amount: 680, date: '2024-11-18', icon: 'restaurant' },
  { id: '6', name: 'BookMyShow', category: 'Entertainment', amount: 450, date: '2024-11-17', icon: 'film' },
  { id: '7', name: 'Swiggy', category: 'Food', amount: 520, date: '2024-11-17', icon: 'fast-food' },
  { id: '8', name: 'Myntra', category: 'Shopping', amount: 1899, date: '2024-11-16', icon: 'shirt' },
];

const MOCK_REWARDS = [
  { id: '1', title: 'Welcome Bonus', points: 5000, reason: 'First purchase above ₹5,000', icon: 'gift', color: '#10B981' },
  { id: '2', title: 'Monthly Spend', points: 2500, reason: 'Spent ₹50,000 this month', icon: 'trending-up', color: '#8B5CF6' },
  { id: '3', title: 'Travel Reward', points: 1200, reason: 'Flight booking cashback', icon: 'airplane', color: '#F59E0B' },
  { id: '4', title: 'Dining Delight', points: 800, reason: '10x points on food orders', icon: 'restaurant', color: '#EC4899' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4',
  Shopping: '#95E1D3',
  Entertainment: '#EC4899',
};

export default function CardsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  // Backend state
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'transactions' | 'rewards'>('transactions');
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [stars] = useState(() => generateStars(35));
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);
  
  // Fetch cards from backend
  const fetchCards = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ApiClient.getCreditCards();
      setCards(response.cards || []);
      
      if (response.cards && response.cards.length > 0) {
        setCurrentIndex(response.cards.length);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      // For now, use mock data as fallback
      setCards(MOCK_CARDS);
      setCurrentIndex(MOCK_CARDS.length);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Create circular data by triplicating the array
  const displayCards = cards.length > 0 ? cards : MOCK_CARDS;
  const circularData = [...displayCards, ...displayCards, ...displayCards];
  const activeCard = displayCards[currentIndex % displayCards.length];

  useFocusEffect(
    React.useCallback(() => {
      setAnimationTrigger(prev => prev + 1);
      fetchCards();
      
      // Start at the middle set
      setTimeout(() => {
        if (displayCards.length > 0) {
          flatListRef.current?.scrollToIndex({
            index: displayCards.length,
            animated: false,
          });
        }
      }, 50);
    }, [fetchCards])
  );

  const handleCardPress = (card: typeof MOCK_CARDS[0], index: number) => {
    if (index === 0) {
      hapticFeedback.medium();
      setSelectedCard(card);
      setShowCardDetails(true);
      setShowCVV(false);
      setShowFullNumber(false);
    }
  };

  const getCategorySpending = () => {
    if (!activeCard || !activeCard.transactions) return [];
    const categoryTotals: Record<string, number> = {};
    activeCard.transactions.forEach((tx: any) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getTotalRewards = () => {
    if (!activeCard || !activeCard.rewards) return 0;
    return activeCard.rewards.reduce((sum: number, reward: any) => sum + reward.points, 0);
  };

  const getTotalBalance = () => {
    return cards.reduce((sum, c) => sum + (c.balance || 0), 0);
  };
  
  const hasCards = cards.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={GRADIENTS.background as [string, string, string]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Premium Starfield Background */}
      <View style={styles.starfieldContainer} pointerEvents="none">
        {stars.map(star => (
          <AnimatedStar key={star.id} star={star} />
        ))}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>Loading cards...</Text>
        </View>
      ) : !hasCards ? (
        /* Empty State - No Cards */
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyStateIconContainer}>
              <Ionicons name="card-outline" size={64} color={COLORS.primaryGold} />
            </View>
            <Text style={styles.emptyStateTitle}>No Cards Added Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Add your credit cards to track spending, maximize rewards, and get personalized recommendations
            </Text>
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => {
                hapticFeedback.medium();
                setShowAddCardModal(true);
              }}
            >
              <LinearGradient
                colors={[COLORS.primaryGold, COLORS.secondaryGold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addCardButtonGradient}
              >
                <Ionicons name="add-circle-outline" size={24} color={COLORS.primaryBackground} />
                <Text style={styles.addCardButtonText}>Add Your First Card</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Benefits List */}
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.benefitText}>Track all spending in one place</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.benefitText}>Get personalized card recommendations</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.benefitText}>Maximize cashback and rewards</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          directionalLockEnabled={true}
          horizontal={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>My Cards</Text>
              <Text style={styles.headerSubtitle}>{cards.length} active cards</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                hapticFeedback.light();
                setShowAddCardModal(true);
              }}
            >
              <LinearGradient
                colors={GRADIENTS.premiumGold as any}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={24} color={COLORS.primaryBackground} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

        {/* Horizontal Carousel Cards */}
        <Animated.FlatList
          ref={flatListRef}
          data={circularData}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={width}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
            hapticFeedback.medium();
            
            // Reset to middle set when reaching edges
            if (index <= 0) {
              flatListRef.current?.scrollToIndex({
                index: MOCK_CARDS.length,
                animated: false,
              });
              setCurrentIndex(MOCK_CARDS.length);
            } else if (index >= circularData.length - 1) {
              flatListRef.current?.scrollToIndex({
                index: MOCK_CARDS.length - 1,
                animated: false,
              });
              setCurrentIndex(MOCK_CARDS.length - 1);
            }
          }}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={({ item: card, index }) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.85, 1, 0.85],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.5, 1, 0.5],
              extrapolate: 'clamp',
            });

            const rotateY = scrollX.interpolate({
              inputRange,
              outputRange: ['45deg', '0deg', '-45deg'],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                style={{
                  width,
                  paddingHorizontal: 30,
                  transform: [{ scale }, { perspective: 1000 }, { rotateY }],
                  opacity,
                }}
              >
                <View>
                  <LinearGradient
                    colors={card.gradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    {/* Card Pattern Overlay */}
                    <View style={styles.cardPattern}>
                      {Array.from({ length: 20 }).map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.patternDot,
                            {
                              left: `${(i % 5) * 20 + 10}%`,
                              top: `${Math.floor(i / 5) * 25 + 10}%`,
                            },
                          ]}
                        />
                      ))}
                    </View>

                    {/* Card Content */}
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cardBank}>{card.bank}</Text>
                        <Text style={styles.cardName}>{card.name}</Text>
                      </View>
                      <MaterialCommunityIcons
                        name={card.logo as any}
                        size={36}
                        color="rgba(255,255,255,0.9)"
                      />
                    </View>

                    {/* Chip */}
                    <View style={styles.cardChip}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                        style={styles.chipGradient}
                      >
                        <View style={styles.chipLine} />
                        <View style={[styles.chipLine, { marginTop: 4 }]} />
                      </LinearGradient>
                    </View>

                    {/* Card Number */}
                    <View style={styles.cardNumberSection}>
                      <View style={styles.cardNumberDisplay}>
                        {[0, 1, 2, 3].map((group) => (
                          <View key={group} style={styles.numberGroup}>
                            {group < 3 ? (
                              <>
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                              </>
                            ) : (
                              <Text style={styles.cardNumber}>
                                {card.cardNumber.slice(-4)}
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Card Network Logo */}
                    <View style={styles.cardNetworkLogo}>
                      <Text style={styles.cardNetworkText}>{card.network}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>
            );
          }}
          contentContainerStyle={{
            paddingTop: 20,
          }}
          style={{
            height: CARD_HEIGHT + 60,
            marginTop: 10,
            marginBottom: 0,
          }}
        />

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {MOCK_CARDS.map((_, index) => {
            const actualIndex = currentIndex % MOCK_CARDS.length;
            return (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    width: actualIndex === index ? 24 : 8,
                    opacity: actualIndex === index ? 1 : 0.3,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Active Card Details */}
        <View style={styles.activeCardSection}>
          <Card3D
            colors={['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)']}
            borderRadius={20}
            style={styles.activeCardDetails}
          >
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => {
                hapticFeedback.medium();
                setSelectedCard(activeCard);
                setShowCardDetails(true);
                setShowCVV(false);
                setShowFullNumber(false);
              }}
            >
              <View style={styles.activeCardHeader}>
                <View style={styles.activeCardTitle}>
                  <MaterialCommunityIcons
                    name={activeCard.logo as any}
                    size={28}
                    color="#8B5CF6"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.activeCardBank}>{activeCard.bank}</Text>
                    <Text style={styles.activeCardName}>{activeCard.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
                </View>
              </View>

              <View style={styles.activeCardStats}>
                <View style={styles.activeCardStat}>
                  <Text style={styles.activeCardStatLabel}>Available Credit</Text>
                  <Text style={styles.activeCardStatValue}>
                    ₹{(activeCard.limit - activeCard.spent).toLocaleString()}
                  </Text>
                  <View style={styles.activeCardProgress}>
                    <View 
                      style={[
                        styles.activeCardProgressBar, 
                        { width: `${(activeCard.spent / activeCard.limit) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.activeCardStatHint}>
                    {((activeCard.spent / activeCard.limit) * 100).toFixed(0)}% utilized
                  </Text>
                </View>

                <View style={styles.activeCardDivider} />

                <View style={styles.activeCardStat}>
                  <Text style={styles.activeCardStatLabel}>Outstanding</Text>
                  <Text style={styles.activeCardStatValue}>
                    ₹{activeCard.spent.toLocaleString()}
                  </Text>
                  <Text style={styles.activeCardStatHint}>
                    Due: 5 days left
                  </Text>
                </View>
              </View>

              <View style={styles.activeCardActions}>
                <View style={styles.activeCardAction}>
                  <Ionicons name="refresh" size={20} color="#10B981" />
                  <Text style={styles.activeCardActionText}>Pay Bill</Text>
                </View>
                <View style={styles.activeCardAction}>
                  <Ionicons name="trending-up" size={20} color="#3B82F6" />
                  <Text style={styles.activeCardActionText}>Transactions</Text>
                </View>
                <View style={styles.activeCardAction}>
                  <Ionicons name="gift" size={20} color="#F59E0B" />
                  <Text style={styles.activeCardActionText}>Rewards</Text>
                </View>
              </View>

              <View style={styles.tapHintContainer}>
                <Ionicons name="finger-print" size={16} color="rgba(255,255,255,0.4)" />
                <Text style={styles.tapHint}>Tap for full details</Text>
              </View>
            </TouchableOpacity>
          </Card3D>
        </View>

        {/* Quick Stats - Premium Style */}
        <View style={styles.statsSection}>
          <Card3D
            colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.05)']}
            borderRadius={16}
            style={styles.statCard}
          >
            <View style={styles.statContent}>
              <View style={styles.statIconBg}>
                <Ionicons name="card" size={24} color={COLORS.primaryGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>Total Credit Available</Text>
                <Text style={styles.statValue}>₹{getTotalBalance().toLocaleString()}</Text>
                <View style={styles.statBadge}>
                  <Ionicons name="trending-up" size={12} color={COLORS.success} />
                  <Text style={styles.statBadgeText}>Healthy credit usage</Text>
                </View>
              </View>
            </View>
          </Card3D>

          <Card3D
            colors={['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.05)']}
            borderRadius={16}
            style={styles.statCard}
          >
            <View style={styles.statContent}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                <Ionicons name="gift" size={24} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>Total Reward Points</Text>
                <Text style={styles.statValue}>{getTotalRewards()}</Text>
                <View style={[styles.statBadge, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                  <Ionicons name="arrow-up" size={12} color="#10B981" />
                  <Text style={[styles.statBadgeText, { color: '#10B981' }]}>+1,200 this month</Text>
                </View>
              </View>
            </View>
          </Card3D>
        </View>

        {/* Card insights will be shown once we have enough transaction data */}
        </ScrollView>
      )}

      {/* Card Detail Modal */}
      <Modal
        visible={showCardDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCardDetails(false)}
      >
        {selectedCard && (
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={GRADIENTS.background as [string, string, string]}
              style={StyleSheet.absoluteFill}
            />

            {/* Starfield in modal */}
            <View style={styles.starfieldContainer} pointerEvents="none">
              {stars.map(star => (
                <AnimatedStar key={star.id} star={star} />
              ))}
            </View>

            {/* Modal Header */}
            <View style={[styles.modalHeader, { paddingTop: insets.top }]}>
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.light();
                  setShowCardDetails(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedCard.name}</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Card Preview */}
              <View style={styles.cardPreview}>
                <Card3D
                  colors={selectedCard.gradient as any}
                  borderRadius={20}
                  style={styles.previewCard}
                >
                  <View style={styles.previewHeader}>
                    <View>
                      <Text style={styles.previewBank}>{selectedCard.bank}</Text>
                      <Text style={styles.previewType}>{selectedCard.type}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name={selectedCard.logo as any}
                      size={32}
                      color="rgba(255,255,255,0.9)"
                    />
                  </View>

                  {/* Card Details Section */}
                  <View style={styles.cardDetailsSection}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Card Number</Text>
                      <TouchableOpacity
                        onPress={() => {
                          hapticFeedback.selection();
                          setShowFullNumber(!showFullNumber);
                        }}
                        style={styles.revealButton}
                      >
                        <Ionicons
                          name={showFullNumber ? 'eye-off' : 'eye'}
                          size={18}
                          color="rgba(255,255,255,0.8)"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.detailValue}>
                      {showFullNumber ? selectedCard.cardNumber : `•••• •••• •••• ${selectedCard.cardNumber.slice(-4)}`}
                    </Text>
                  </View>

                  <View style={styles.cardDetailsRow}>
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>CVV</Text>
                      <TouchableOpacity
                        onPress={() => {
                          hapticFeedback.selection();
                          setShowCVV(!showCVV);
                        }}
                        style={styles.cvvContainer}
                      >
                        <Text style={styles.detailValue}>
                          {showCVV ? selectedCard.cvv : '•••'}
                        </Text>
                        <Ionicons
                          name={showCVV ? 'eye-off' : 'eye'}
                          size={16}
                          color="rgba(255,255,255,0.8)"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>Expires</Text>
                      <Text style={styles.detailValue}>{selectedCard.expiry}</Text>
                    </View>

                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>Limit</Text>
                      <Text style={styles.detailValue}>₹{(selectedCard.limit / 1000)}K</Text>
                    </View>
                  </View>
                </Card3D>
              </View>

              {/* Spending Progress */}
              <View style={styles.spendingSection}>
                <Text style={styles.sectionTitle}>Spending Overview</Text>
                <Card3D
                  colors={['rgba(26,29,41,0.95)', 'rgba(26,29,41,0.8)']}
                  borderRadius={16}
                  style={styles.spendingCard}
                >
                  <View style={styles.spendingHeader}>
                    <View>
                      <Text style={styles.spendingLabel}>Spent this month</Text>
                      <Text style={styles.spendingAmount}>₹{selectedCard.spent.toLocaleString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.spendingLabel}>Available</Text>
                      <Text style={styles.spendingAvailable}>₹{(selectedCard.limit - selectedCard.spent).toLocaleString()}</Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={selectedCard.gradient as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${(selectedCard.spent / selectedCard.limit) * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {((selectedCard.spent / selectedCard.limit) * 100).toFixed(1)}% of credit limit used
                  </Text>
                </Card3D>
              </View>

              {/* Tabs */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tab, selectedTab === 'transactions' && styles.tabActive]}
                  onPress={() => {
                    hapticFeedback.selection();
                    setSelectedTab('transactions');
                  }}
                >
                  <Text style={[styles.tabText, selectedTab === 'transactions' && styles.tabTextActive]}>
                    Transactions
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, selectedTab === 'rewards' && styles.tabActive]}
                  onPress={() => {
                    hapticFeedback.selection();
                    setSelectedTab('rewards');
                  }}
                >
                  <Text style={[styles.tabText, selectedTab === 'rewards' && styles.tabTextActive]}>
                    Rewards
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Transactions Tab */}
              {selectedTab === 'transactions' && (
                <>
                  {/* Time Filter */}
                  <View style={styles.filterContainer}>
                    {(['daily', 'weekly', 'monthly'] as const).map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        style={[styles.filterButton, timeFilter === filter && styles.filterButtonActive]}
                        onPress={() => {
                          hapticFeedback.selection();
                          setTimeFilter(filter);
                        }}
                      >
                        <Text style={[styles.filterText, timeFilter === filter && styles.filterTextActive]}>
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Spending by Category */}
                  <View style={styles.section}>
                    <Text style={styles.sectionSubtitle}>Spending by Category</Text>
                    {getCategorySpending().map((item) => (
                      <Card3D
                        key={item.category}
                        colors={['rgba(26,29,41,0.95)', 'rgba(26,29,41,0.8)']}
                        borderRadius={12}
                        style={styles.categoryItem}
                      >
                        <View style={styles.categoryLeft}>
                          <View
                            style={[
                              styles.categoryDot,
                              { backgroundColor: CATEGORY_COLORS[item.category] },
                            ]}
                          />
                          <Text style={styles.categoryName}>{item.category}</Text>
                        </View>
                        <Text style={styles.categoryAmount}>₹{item.amount.toLocaleString()}</Text>
                      </Card3D>
                    ))}
                  </View>

                  {/* Transactions List */}
                  <View style={styles.section}>
                    <Text style={styles.sectionSubtitle}>Recent Transactions</Text>
                    {MOCK_TRANSACTIONS.map((tx) => (
                      <TouchableOpacity
                        key={tx.id}
                        style={styles.transactionItem}
                        onPress={() => hapticFeedback.light()}
                      >
                        <View
                          style={[
                            styles.transactionIcon,
                            { backgroundColor: `${CATEGORY_COLORS[tx.category]}20` },
                          ]}
                        >
                          <Ionicons
                            name={tx.icon as any}
                            size={20}
                            color={CATEGORY_COLORS[tx.category]}
                          />
                        </View>
                        <View style={styles.transactionDetails}>
                          <Text style={styles.transactionName}>{tx.name}</Text>
                          <Text style={styles.transactionDate}>{tx.date}</Text>
                        </View>
                        <Text style={styles.transactionAmount}>-₹{tx.amount}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Rewards Tab */}
              {selectedTab === 'rewards' && (
                <>
                  {/* Total Rewards */}
                  <View style={styles.rewardsHeader}>
                    <Card3D
                      colors={['rgba(212,175,55,0.2)', 'rgba(212,175,55,0.05)']}
                      borderRadius={16}
                      style={styles.rewardsTotal}
                    >
                      <Ionicons name="star" size={32} color={COLORS.primaryGold} />
                      <Text style={styles.rewardsTotalValue}>{getTotalRewards()}</Text>
                      <Text style={styles.rewardsTotalLabel}>Total Points</Text>
                    </Card3D>
                  </View>

                  {/* Rewards List */}
                  <View style={styles.section}>
                    <Text style={styles.sectionSubtitle}>Earned Rewards</Text>
                    {MOCK_REWARDS.map((reward) => (
                      <Card3D
                        key={reward.id}
                        colors={['rgba(26,29,41,0.95)', 'rgba(26,29,41,0.8)']}
                        borderRadius={12}
                        style={styles.rewardItem}
                      >
                        <View
                          style={[
                            styles.rewardIcon,
                            { backgroundColor: `${reward.color}20` },
                          ]}
                        >
                          <Ionicons name={reward.icon as any} size={24} color={reward.color} />
                        </View>
                        <View style={styles.rewardDetails}>
                          <Text style={styles.rewardTitle}>{reward.title}</Text>
                          <Text style={styles.rewardReason}>{reward.reason}</Text>
                        </View>
                        <View style={styles.rewardPointsBadge}>
                          <Text style={styles.rewardPoints}>+{reward.points}</Text>
                        </View>
                      </Card3D>
                    ))}
                  </View>

                  {/* Redeem Section */}
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.redeemButton}
                      onPress={() => hapticFeedback.light()}
                    >
                      <LinearGradient
                        colors={GRADIENTS.premiumGold as any}
                        style={styles.redeemGradient}
                      >
                        <Ionicons name="gift" size={20} color={COLORS.primaryBackground} />
                        <Text style={styles.redeemText}>Redeem Rewards</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Add Card Modal */}
      <AddCardFlow
        visible={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onSuccess={() => {
          fetchCards();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  starfieldContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 1,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  addButton: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsStack: {
    height: height * 0.4,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    alignSelf: 'center',
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
  },
  patternDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardBank: {
    fontSize: 11,
    fontFamily: FONTS.sans.regular,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: '#FFFFFF',
  },
  cardChip: {
    width: 44,
    height: 34,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  chipGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  chipLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  cardNumberSection: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumberDisplay: {
    flexDirection: 'row',
    gap: 12,
  },
  numberGroup: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: FONTS.sans.regular,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBalance: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: '#FFFFFF',
  },
  cardExpiry: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: '#FFFFFF',
  },
  swipeIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swipeText: {
    fontSize: 11,
    fontFamily: FONTS.sans.regular,
    color: 'rgba(255,255,255,0.6)',
  },
  statsSection: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    zIndex: 10,
  },
  statCard: {
    padding: SPACING.lg,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statIconBg: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.xs,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(74,222,128,0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  statBadgeText: {
    fontSize: 11,
    color: COLORS.success,
    fontFamily: FONTS.sans.semibold,
  },
  insightsSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    zIndex: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textAccentMuted,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.lg,
    letterSpacing: 0.3,
  },
  insightCard: {
    padding: SPACING.lg,
  },
  insightContent: {},
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  insightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    alignSelf: 'flex-start',
  },
  insightButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: FONTS.sans.semibold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
  },
  modalContent: {
    flex: 1,
    zIndex: 10,
  },
  cardPreview: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  previewCard: {
    padding: SPACING.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  previewBank: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  previewType: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  cardDetailsSection: {
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: FONTS.sans.regular,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  revealButton: {
    padding: SPACING.xs,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  detailColumn: {
    flex: 1,
  },
  cvvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  spendingSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  spendingCard: {
    padding: SPACING.lg,
  },
  spendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  spendingLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    marginBottom: SPACING.xs,
  },
  spendingAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
  },
  spendingAvailable: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
    fontFamily: FONTS.sans.semibold,
  },
  progressBar: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderColor: COLORS.primaryGold,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryGold,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.1)',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primaryGold,
    borderColor: COLORS.primaryGold,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.primaryBackground,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textPrimary,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.05)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
  },
  rewardsHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  rewardsTotal: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  rewardsTotalValue: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold,
    marginTop: SPACING.md,
  },
  rewardsTotalLabel: {
    fontSize: 13,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rewardDetails: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  rewardReason: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
  },
  rewardPointsBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(212,175,55,0.15)',
  },
  rewardPoints: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold,
  },
  redeemButton: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  redeemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  redeemText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryBackground,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryGold,
  },
  activeCardSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  activeCardDetails: {
    padding: SPACING.lg,
  },
  activeCardHeader: {
    marginBottom: SPACING.md,
  },
  activeCardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeCardBank: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeCardName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  activeCardStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  activeCardStat: {
    flex: 1,
  },
  activeCardStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  activeCardStatValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  activeCardProgress: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  activeCardProgressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  activeCardStatHint: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: FONTS.sans.regular,
    color: 'rgba(255,255,255,0.4)',
  },
  activeCardDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: SPACING.xs,
  },
  activeCardActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  activeCardAction: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  activeCardActionText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONTS.sans.semibold,
    color: 'rgba(255,255,255,0.7)',
  },
  tapHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.sans.regular,
    color: 'rgba(255,255,255,0.4)',
  },
  cardNetworkLogo: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  cardNetworkText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.sans.bold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
  },
  emptyStateCard: {
    width: '100%',
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.1)',
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  addCardButton: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  addCardButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryBackground,
    fontFamily: FONTS.sans.semibold,
  },
  benefitsList: {
    width: '100%',
    gap: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    flex: 1,
  },
});
