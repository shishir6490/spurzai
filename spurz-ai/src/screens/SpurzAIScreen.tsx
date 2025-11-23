import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, GRADIENTS, RADIUS } from '@constants/theme';
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { hapticFeedback } from '@utils/haptics';

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

const AnimatedStar = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const randomDelay = Math.random() * 2000;
    const animationDuration = 4000 + Math.random() * 3000;

    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          delay: randomDelay
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: Math.random() * 40 - 20,
          duration: animationDuration,
          useNativeDriver: true,
          delay: randomDelay
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: Math.random() * 40 - 20,
          duration: animationDuration + 1000,
          useNativeDriver: true,
          delay: randomDelay
        })
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          opacity,
          transform: [{ translateY }, { translateX }]
        }
      ]}
    >
      <View
        style={{
          width: 2,
          height: 2,
          borderRadius: 1,
          backgroundColor: COLORS.primaryGold,
          opacity: 0.8
        }}
      />
    </Animated.View>
  );
};

interface WalletData {
  totalCoins: number;
  totalRupees: number;
  lifetimeCoinsEarned: number;
  lifetimeRupeesEarned: number;
  cardCashback: number;
  taskRewards: number;
  referralRewards: number;
  thisMonthCoins: number;
  thisMonthRupees: number;
}

interface RewardItem {
  _id: string;
  type: string;
  coins: number;
  rupees: number;
  description: string;
  status: string;
  createdAt: string;
  metadata?: any;
}

export default function SpurzAIScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [recentRewards, setRecentRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const coinsAnim = useRef(new Animated.Value(0)).current;
  const rupeesAnim = useRef(new Animated.Value(0)).current;

  const logoScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

  const logoOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -30],
    extrapolate: 'clamp'
  });

  const fetchRewardsData = async () => {
    if (!user?.uid) {
      console.log('No user UID, setting default wallet data');
      // Set default empty wallet data
      setWalletData({
        totalCoins: 0,
        totalRupees: 0,
        lifetimeCoinsEarned: 0,
        lifetimeRupeesEarned: 0,
        cardCashback: 0,
        taskRewards: 0,
        referralRewards: 0,
        thisMonthCoins: 0,
        thisMonthRupees: 0
      });
      setRecentRewards([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const userId = user.uid;
      console.log('Fetching rewards for user:', userId);

      // Fetch wallet data
      const walletResponse = await ApiClient.get(`/rewards/wallet/${userId}`);
      console.log('Wallet response:', walletResponse);
      
      const statsResponse = await ApiClient.get(`/rewards/stats/${userId}`);
      console.log('Stats response:', statsResponse);

      if (walletResponse.success && statsResponse.success) {
        const stats = statsResponse.data;
        setWalletData({
          totalCoins: stats.totalCoins || 0,
          totalRupees: stats.totalRupees || 0,
          lifetimeCoinsEarned: stats.lifetimeCoinsEarned || 0,
          lifetimeRupeesEarned: stats.lifetimeRupeesEarned || 0,
          cardCashback: stats.breakdown?.cardCashback || 0,
          taskRewards: stats.breakdown?.taskRewards || 0,
          referralRewards: stats.breakdown?.referralRewards || 0,
          thisMonthCoins: stats.thisMonth?.coins || 0,
          thisMonthRupees: stats.thisMonth?.rupees || 0
        });

        setRecentRewards(walletResponse.data.recentRewards || []);

        // Animate numbers
        Animated.parallel([
          Animated.timing(coinsAnim, {
            toValue: stats.totalCoins || 0,
            duration: 1500,
            useNativeDriver: false
          }),
          Animated.timing(rupeesAnim, {
            toValue: stats.totalRupees || 0,
            duration: 1500,
            useNativeDriver: false
          })
        ]).start();
      } else {
        console.log('API returned unsuccessful response');
        // Set empty wallet on API error
        setWalletData({
          totalCoins: 0,
          totalRupees: 0,
          lifetimeCoinsEarned: 0,
          lifetimeRupeesEarned: 0,
          cardCashback: 0,
          taskRewards: 0,
          referralRewards: 0,
          thisMonthCoins: 0,
          thisMonthRupees: 0
        });
        setRecentRewards([]);
      }
    } catch (error: any) {
      console.error('Error fetching rewards data:', error);
      console.error('Error details:', error.message);
      // Set empty wallet on error
      setWalletData({
        totalCoins: 0,
        totalRupees: 0,
        lifetimeCoinsEarned: 0,
        lifetimeRupeesEarned: 0,
        cardCashback: 0,
        taskRewards: 0,
        referralRewards: 0,
        thisMonthCoins: 0,
        thisMonthRupees: 0
      });
      setRecentRewards([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRewardsData();
    }, [user?.uid])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRewardsData();
  };

  if (loading && !walletData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={GRADIENTS.background as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={COLORS.primaryGold} />
        <Text style={styles.loadingText}>Loading your rewards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background as [string, string, string]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Starfield background */}
      <View style={styles.starfieldContainer} pointerEvents="none">
        {STARS.map((star) => (
          <View
            key={star.id}
            style={[
              styles.staticStar,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                opacity: star.opacity
              }
            ]}
          />
        ))}
      </View>

      {/* Animated Sticky Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            opacity: headerOpacity,
            paddingTop: insets.top
          }
        ]}
      >
        <BlurView tint="dark" intensity={90} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View style={styles.headerLogo}>
              <Text style={styles.headerSpurz}>Spurz</Text>
              <Text style={styles.headerRewards}>Rewards</Text>
            </View>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => hapticFeedback.light()}
            >
              <Ionicons name="trophy" size={22} color={COLORS.primaryGold} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryGold}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Hero section with logo - matching HomeScreen design */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: titleTranslateY }
              ]
            }
          ]}
        >
          <Image
            source={require('../../assets/images/spurz-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <View style={styles.heroDecorator}>
            <View style={styles.decoratorLine} />
            <Ionicons name="sparkles" size={24} color={COLORS.primaryGold} style={styles.decoratorIcon} />
            <View style={styles.decoratorLine} />
          </View>

          <Text style={styles.heroTagline}>SPURZ REWARDS</Text>
          <Text style={styles.heroSubtitle}>Your Earning Intelligence Hub</Text>
          <Text style={styles.conversionRate}>💰 10 Spurz Coins = ₹1</Text>
        </Animated.View>

        {/* Main Wallet Card */}
        <View style={styles.walletCard}>
          <LinearGradient
            colors={['rgba(212,175,55,0.2)', 'rgba(212,175,55,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletGradient}
          >
            <View style={styles.walletHeader}>
              <Text style={styles.walletLabel}>Total Balance</Text>
              <Ionicons name="wallet" size={24} color={COLORS.primaryGold} />
            </View>

            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Animated.Text style={styles.balanceValue}>
                  {walletData ? Math.round(walletData.totalCoins) : 0}
                </Animated.Text>
                <Text style={styles.balanceLabel}>Spurz Coins</Text>
              </View>

              <View style={styles.balanceDivider} />

              <View style={styles.balanceItem}>
                <Animated.Text style={styles.balanceValue}>
                  ₹{walletData ? walletData.totalRupees.toFixed(2) : '0.00'}
                </Animated.Text>
                <Text style={styles.balanceLabel}>Cash Value</Text>
              </View>
            </View>

            <View style={styles.lifetimeStats}>
              <Text style={styles.lifetimeLabel}>Lifetime Earned</Text>
              <Text style={styles.lifetimeValue}>
                {walletData ? Math.round(walletData.lifetimeCoinsEarned) : 0} coins 
                (₹{walletData ? walletData.lifetimeRupeesEarned.toFixed(2) : '0.00'})
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* This Month Earnings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.thisMonthCard}>
            <LinearGradient
              colors={['rgba(45,212,191,0.15)', 'rgba(45,212,191,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.thisMonthGradient}
            >
              <Ionicons name="trending-up" size={32} color="#2DD4BF" />
              <View style={styles.thisMonthContent}>
                <Text style={styles.thisMonthValue}>
                  {walletData ? Math.round(walletData.thisMonthCoins) : 0} coins
                </Text>
                <Text style={styles.thisMonthLabel}>
                  ₹{walletData ? walletData.thisMonthRupees.toFixed(2) : '0.00'} earned
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownIcon}>
                <Ionicons name="card" size={24} color="#F59E0B" />
              </View>
              <View style={styles.breakdownContent}>
                <Text style={styles.breakdownLabel}>Card Cashback</Text>
                <Text style={styles.breakdownValue}>
                  ₹{walletData ? walletData.cardCashback.toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <View style={styles.breakdownContent}>
                <Text style={styles.breakdownLabel}>Task Rewards</Text>
                <Text style={styles.breakdownValue}>
                  ₹{walletData ? walletData.taskRewards.toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownIcon}>
                <Ionicons name="people" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.breakdownContent}>
                <Text style={styles.breakdownLabel}>Referral Bonuses</Text>
                <Text style={styles.breakdownValue}>
                  ₹{walletData ? walletData.referralRewards.toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Rewards */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Rewards</Text>
          
          {recentRewards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No rewards yet</Text>
              <Text style={styles.emptySubtext}>
                Complete tasks to earn your first Spurz coins!
              </Text>
            </View>
          ) : (
            <View style={styles.rewardsList}>
              {recentRewards.map((reward) => (
                <View key={reward._id} style={styles.rewardItem}>
                  <View style={styles.rewardIcon}>
                    <Ionicons
                      name={
                        reward.type.includes('CARD') ? 'card' :
                        reward.type.includes('TASK') ? 'checkmark-circle' :
                        reward.type.includes('REFERRAL') ? 'people' :
                        'gift'
                      }
                      size={20}
                      color={COLORS.primaryGold}
                    />
                  </View>
                  <View style={styles.rewardContent}>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                    <Text style={styles.rewardDate}>
                      {new Date(reward.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.rewardAmount}>
                    <Text style={styles.rewardCoins}>+{reward.coins}</Text>
                    <Text style={styles.rewardRupees}>₹{reward.rupees.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* How to Earn More */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How to Earn More</Text>
          
          <TouchableOpacity style={styles.earnCard} activeOpacity={0.8} onPress={() => hapticFeedback.light()}>
            <LinearGradient
              colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.earnCardGradient}
            >
              <Ionicons name="card-outline" size={28} color={COLORS.primaryGold} />
              <View style={styles.earnCardContent}>
                <Text style={styles.earnCardTitle}>Link Credit Cards</Text>
                <Text style={styles.earnCardDesc}>Get automatic cashback rewards</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.earnCard} activeOpacity={0.8} onPress={() => hapticFeedback.light()}>
            <LinearGradient
              colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.earnCardGradient}
            >
              <Ionicons name="checkmark-done" size={28} color={COLORS.primaryGold} />
              <View style={styles.earnCardContent}>
                <Text style={styles.earnCardTitle}>Complete Tasks</Text>
                <Text style={styles.earnCardDesc}>Daily challenges & milestones</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.earnCard} activeOpacity={0.8} onPress={() => hapticFeedback.light()}>
            <LinearGradient
              colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.earnCardGradient}
            >
              <Ionicons name="share-social" size={28} color={COLORS.primaryGold} />
              <View style={styles.earnCardContent}>
                <Text style={styles.earnCardTitle}>Invite Friends</Text>
                <Text style={styles.earnCardDesc}>Earn 500 coins per referral</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular
  },
  starfieldContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.9,
    zIndex: 1,
    overflow: 'hidden'
  },
  staticStar: {
    position: 'absolute',
    borderRadius: 1,
    backgroundColor: '#FFFFFF'
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg
  },
  logoImage: {
    width: 200,
    height: 200,
    marginBottom: -SPACING.xl
  },
  heroDecorator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md
  },
  decoratorLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.primaryGold,
    opacity: 0.5
  },
  decoratorIcon: {
    marginHorizontal: SPACING.md
  },
  heroTagline: {
    fontSize: 24,
    fontFamily: FONTS.serif.semibold,
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
    textAlign: 'center'
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
    letterSpacing: 1
  },
  conversionRate: {
    fontSize: 14,
    fontFamily: FONTS.sans.medium,
    color: COLORS.primaryGold,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderRadius: RADIUS.md,
    overflow: 'hidden'
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 0
  },
  headerBlur: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs
  },
  headerSpurz: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8E8E8',
    fontFamily: FONTS.sans.bold,
    letterSpacing: 0.3,
    lineHeight: 16
  },
  headerRewards: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryGold,
    fontFamily: FONTS.sans.bold,
    letterSpacing: 0.3,
    lineHeight: 16
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  walletCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.xl,
    overflow: 'hidden'
  },
  walletGradient: {
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}30`,
    borderRadius: RADIUS.xl
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  walletLabel: {
    fontSize: 14,
    fontFamily: FONTS.sans.medium,
    color: COLORS.textSecondary
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.primaryGold,
    opacity: 0.3
  },
  balanceValue: {
    fontSize: 32,
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold,
    marginBottom: SPACING.xs
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary
  },
  lifetimeStats: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.primaryGold}20`,
    alignItems: 'center'
  },
  lifetimeLabel: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  lifetimeValue: {
    fontSize: 14,
    fontFamily: FONTS.sans.medium,
    color: COLORS.textAccent
  },
  sectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.sans.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md
  },
  thisMonthCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden'
  },
  thisMonthGradient: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.3)',
    borderRadius: RADIUS.lg
  },
  thisMonthContent: {
    marginLeft: SPACING.md,
    flex: 1
  },
  thisMonthValue: {
    fontSize: 20,
    fontFamily: FONTS.sans.bold,
    color: '#2DD4BF',
    marginBottom: SPACING.xs
  },
  thisMonthLabel: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary
  },
  breakdownCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md
  },
  breakdownIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primaryGold}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  breakdownContent: {
    flex: 1
  },
  breakdownLabel: {
    fontSize: 14,
    fontFamily: FONTS.sans.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  breakdownValue: {
    fontSize: 16,
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.sans.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.md
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center'
  },
  rewardsList: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}20`
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primaryGold}10`
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: `${COLORS.primaryGold}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  rewardContent: {
    flex: 1
  },
  rewardDescription: {
    fontSize: 13,
    fontFamily: FONTS.sans.medium,
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  rewardDate: {
    fontSize: 11,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary
  },
  rewardAmount: {
    alignItems: 'flex-end'
  },
  rewardCoins: {
    fontSize: 15,
    fontFamily: FONTS.sans.bold,
    color: COLORS.primaryGold,
    marginBottom: 2
  },
  rewardRupees: {
    fontSize: 11,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary
  },
  earnCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden'
  },
  earnCardGradient: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.primaryGold}30`,
    borderRadius: RADIUS.lg
  },
  earnCardContent: {
    flex: 1,
    marginLeft: SPACING.md
  },
  earnCardTitle: {
    fontSize: 15,
    fontFamily: FONTS.sans.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  earnCardDesc: {
    fontSize: 12,
    fontFamily: FONTS.sans.regular,
    color: COLORS.textSecondary
  }
});
