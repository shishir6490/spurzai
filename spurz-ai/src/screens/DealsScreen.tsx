import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  ImageBackground
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';
import { Card3D } from '@components/Card3D';

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

// Hero Featured Deals (Netflix-style)
const HERO_DEALS = [
  {
    id: 'h1',
    title: 'Dubai Getaway',
    subtitle: 'All-inclusive luxury package',
    price: '₹45,999',
    originalPrice: '₹89,999',
    discount: '49%',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    gradient: ['#1e3a8a', '#3b82f6'],
    tag: 'FLASH SALE',
    expiresIn: '12h 34m'
  },
  {
    id: 'h2',
    title: 'Luxury Dining',
    subtitle: 'Michelin-star restaurants',
    price: '₹2,499',
    originalPrice: '₹4,999',
    discount: '50%',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    gradient: ['#7c2d12', '#dc2626'],
    tag: 'LIMITED',
    expiresIn: '6h 12m'
  },
  {
    id: 'h3',
    title: 'Maldives Paradise',
    subtitle: 'Overwater villa experience',
    price: '₹1,24,999',
    originalPrice: '₹2,49,999',
    discount: '50%',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    gradient: ['#0c4a6e', '#0284c7'],
    tag: 'EXCLUSIVE',
    expiresIn: '24h'
  }
];

// Category-wise deals
const CATEGORY_DEALS = {
  trending: [
    { id: '1', title: 'Singapore Airlines', subtitle: 'Business Class Upgrade', price: '₹18,999', discount: '40%', icon: 'airplane', color: '#8B5CF6', cardType: 'HDFC Infinia' },
    { id: '2', title: 'Taj Hotel Mumbai', subtitle: 'Weekend Staycation', price: '₹12,999', discount: '35%', icon: 'bed', color: '#10B981', cardType: 'Amex Platinum' },
    { id: '3', title: 'Louis Vuitton', subtitle: 'Exclusive Sale', price: '₹45,999', discount: '25%', icon: 'shopping-bag', color: '#F59E0B', cardType: 'ICICI Sapphiro' },
    { id: '4', title: 'Apple Store', subtitle: 'MacBook Pro M3', price: '₹1,79,999', discount: '15%', icon: 'laptop', color: '#3B82F6', cardType: 'All Cards' },
  ],
  travel: [
    { id: '5', title: 'Bali Indonesia', subtitle: '5N/6D Package', price: '₹35,999', discount: '45%', icon: 'beach', color: '#EC4899', cardType: 'Axis Reserve' },
    { id: '6', title: 'Kerala Backwaters', subtitle: 'Houseboat Stay', price: '₹15,999', discount: '30%', icon: 'boat', color: '#14B8A6', cardType: 'HDFC Infinia' },
    { id: '7', title: 'Goa Beach Resort', subtitle: 'All-inclusive', price: '₹22,999', discount: '40%', icon: 'sunny', color: '#F97316', cardType: 'Amex Platinum' },
  ],
  dining: [
    { id: '8', title: 'Indian Accent', subtitle: 'Fine Dining Experience', price: '₹3,999', discount: '35%', icon: 'restaurant', color: '#EF4444', cardType: 'HDFC Infinia' },
    { id: '9', title: 'Olive Bar & Kitchen', subtitle: 'Mediterranean Cuisine', price: '₹2,499', discount: '30%', icon: 'pizza', color: '#10B981', cardType: 'ICICI Sapphiro' },
    { id: '10', title: 'Smoke House Deli', subtitle: 'Continental Favorites', price: '₹1,899', discount: '25%', icon: 'fast-food', color: '#8B5CF6', cardType: 'All Cards' },
  ],
  shopping: [
    { id: '11', title: 'Amazon Sale', subtitle: 'Electronics & More', price: '₹49,999', discount: '60%', icon: 'cart', color: '#F59E0B', cardType: 'All Cards' },
    { id: '12', title: 'Myntra Fashion', subtitle: 'Premium Brands', price: '₹8,999', discount: '50%', icon: 'shirt', color: '#EC4899', cardType: 'ICICI Sapphiro' },
    { id: '13', title: 'Nykaa Beauty', subtitle: 'Luxury Cosmetics', price: '₹5,999', discount: '40%', icon: 'sparkles', color: '#F472B6', cardType: 'All Cards' },
  ]
};

const QUICK_CATEGORIES = [
  { id: 'trending', label: 'Trending Now', icon: 'flame', color: '#EF4444' },
  { id: 'travel', label: 'Travel', icon: 'airplane', color: '#3B82F6' },
  { id: 'dining', label: 'Dining', icon: 'restaurant', color: '#10B981' },
  { id: 'shopping', label: 'Shopping', icon: 'cart', color: '#8B5CF6' },
  { id: 'entertainment', label: 'Entertainment', icon: 'game-controller', color: '#EC4899' },
];

// Hero Carousel Item
const HeroCarouselItem = ({ deal, isActive }: any) => {
  return (
    <View style={styles.heroCard}>
      <ImageBackground
        source={{ uri: deal.image }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', ...deal.gradient.map((c: string) => c + '99'), '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroGradient}
        >
        <View style={styles.heroContent}>
          <View style={styles.heroTag}>
            <Ionicons name="flash" size={12} color="#FFD700" />
            <Text style={styles.heroTagText}>{deal.tag}</Text>
          </View>

          <Text style={styles.heroTitle}>{deal.title}</Text>
          <Text style={styles.heroSubtitle}>{deal.subtitle}</Text>

          <View style={styles.heroPricing}>
            <View>
              <Text style={styles.heroPrice}>{deal.price}</Text>
              <Text style={styles.heroOriginalPrice}>{deal.originalPrice}</Text>
            </View>
            <View style={styles.heroDiscountBadge}>
              <Text style={styles.heroDiscountText}>{deal.discount} OFF</Text>
            </View>
          </View>

          <View style={styles.heroTimer}>
            <Ionicons name="time" size={14} color="#FFD700" />
            <Text style={styles.heroTimerText}>Ends in {deal.expiresIn}</Text>
          </View>

          <TouchableOpacity
            style={styles.heroCta}
            onPress={() => hapticFeedback.medium()}
          >
            <LinearGradient
              colors={[COLORS.primaryGold, '#EADFB4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroCtaGradient}
            >
              <Text style={styles.heroCtaText}>Grab Deal</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primaryBackground} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      </ImageBackground>
    </View>
  );
};

// Compact Deal Card for categories
const CompactDealCard = ({ deal }: any) => {
  return (
    <TouchableOpacity
      style={styles.compactCard}
      activeOpacity={0.9}
      onPress={() => hapticFeedback.light()}
    >
      <Card3D
        colors={[`${deal.color}20`, `${deal.color}05`]}
        borderRadius={16}
        style={styles.compactCardInner}
      >
        <View style={[styles.compactIcon, { backgroundColor: `${deal.color}20` }]}>
          <Ionicons name={deal.icon} size={28} color={deal.color} />
        </View>
        
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{deal.title}</Text>
          <Text style={styles.compactSubtitle} numberOfLines={1}>{deal.subtitle}</Text>
          
          <View style={styles.compactPricing}>
            <Text style={styles.compactPrice}>{deal.price}</Text>
            <View style={[styles.compactDiscountBadge, { backgroundColor: deal.color }]}>
              <Text style={styles.compactDiscount}>{deal.discount}</Text>
            </View>
          </View>

          <View style={styles.compactCardBadge}>
            <Ionicons name="card" size={12} color={COLORS.textSecondary} />
            <Text style={styles.compactCardText}>{deal.cardType}</Text>
          </View>
        </View>
      </Card3D>
    </TouchableOpacity>
  );
};

export default function DealsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [scrollAnim] = useState(new Animated.Value(0));
  const [heroIndex, setHeroIndex] = useState(0);
  const heroScrollRef = useRef<any>(null);

  const headerOpacity = scrollAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  // Auto-scroll hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % HERO_DEALS.length;
        heroScrollRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View 
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Starfield Background */}
      <StarField />

      {/* Sticky Header */}
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
              <Text style={styles.headerSpurz}>Deals</Text>
            </View>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => hapticFeedback.light()}
            >
              <Ionicons name="search" size={22} color={COLORS.primaryGold} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled={true}
        horizontal={false}
      >
        {/* Welcome Hero Section */}
        <View style={styles.welcomeHero}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Exclusive Deals</Text>
            <Text style={styles.welcomeSubtitle}>Unlock premium rewards with your SPURZ cards</Text>
            <View style={styles.welcomeStats}>
              <View style={styles.statBadge}>
                <Ionicons name="flash" size={16} color={COLORS.primaryGold} />
                <Text style={styles.statText}>24 Active</Text>
              </View>
              <View style={styles.statBadge}>
                <Ionicons name="time" size={16} color={COLORS.primaryGold} />
                <Text style={styles.statText}>Ending Soon</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hero Carousel */}
        <View style={styles.heroCarousel}>
          <FlatList
            ref={heroScrollRef}
            data={HERO_DEALS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setHeroIndex(index);
            }}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <HeroCarouselItem deal={item} isActive={index === heroIndex} />
            )}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index
            })}
          />
          
          {/* Carousel Indicators */}
          <View style={styles.carouselIndicators}>
            {HERO_DEALS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    width: heroIndex === index ? 24 : 8,
                    backgroundColor: heroIndex === index ? COLORS.primaryGold : 'rgba(255,255,255,0.3)',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Categories */}
        <View style={styles.quickCategories}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
            {QUICK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.quickCategoryChip}
                onPress={() => hapticFeedback.light()}
              >
                <LinearGradient
                  colors={[`${cat.color}20`, `${cat.color}10`]}
                  style={styles.quickCategoryGradient}
                >
                  <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                  <Text style={styles.quickCategoryText}>{cat.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Now Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryHeaderLeft}>
              <Ionicons name="flame" size={24} color="#EF4444" />
              <Text style={styles.categoryHeaderTitle}>Trending Now</Text>
            </View>
            <TouchableOpacity onPress={() => hapticFeedback.light()}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
            {CATEGORY_DEALS.trending.map((deal) => (
              <CompactDealCard key={deal.id} deal={deal} />
            ))}
          </ScrollView>
        </View>

        {/* Travel Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryHeaderLeft}>
              <Ionicons name="airplane" size={24} color="#3B82F6" />
              <Text style={styles.categoryHeaderTitle}>Travel Escapes</Text>
            </View>
            <TouchableOpacity onPress={() => hapticFeedback.light()}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
            {CATEGORY_DEALS.travel.map((deal) => (
              <CompactDealCard key={deal.id} deal={deal} />
            ))}
          </ScrollView>
        </View>

        {/* Dining Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryHeaderLeft}>
              <Ionicons name="restaurant" size={24} color="#10B981" />
              <Text style={styles.categoryHeaderTitle}>Fine Dining</Text>
            </View>
            <TouchableOpacity onPress={() => hapticFeedback.light()}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
            {CATEGORY_DEALS.dining.map((deal) => (
              <CompactDealCard key={deal.id} deal={deal} />
            ))}
          </ScrollView>
        </View>

        {/* Shopping Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryHeaderLeft}>
              <Ionicons name="cart" size={24} color="#8B5CF6" />
              <Text style={styles.categoryHeaderTitle}>Shopping Spree</Text>
            </View>
            <TouchableOpacity onPress={() => hapticFeedback.light()}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
            {CATEGORY_DEALS.shopping.map((deal) => (
              <CompactDealCard key={deal.id} deal={deal} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBackground },
  stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)' },
  headerBlur: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLogo: { flexDirection: 'row', alignItems: 'center' },
  headerSpurz: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold },
  headerIcon: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  // Welcome Hero
  welcomeHero: { paddingHorizontal: SPACING.lg, paddingTop: 100, paddingBottom: SPACING.xl },
  welcomeContent: { alignItems: 'center' },
  welcomeTitle: { fontSize: 36, fontWeight: '700', color: COLORS.primaryGold, fontFamily: FONTS.sans.bold, marginBottom: SPACING.xs, textAlign: 'center' },
  welcomeSubtitle: { fontSize: 16, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular, textAlign: 'center', marginBottom: SPACING.lg },
  welcomeStats: { flexDirection: 'row', gap: SPACING.md },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  statText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, fontFamily: FONTS.sans.semibold },
  
  // Hero Carousel
  heroCarousel: { height: height * 0.6, marginTop: 100 },
  heroCard: { width, height: height * 0.6, overflow: 'hidden' },
  heroGradient: { flex: 1, justifyContent: 'flex-end', padding: SPACING.xl },
  heroContent: { paddingBottom: SPACING.xl },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginBottom: SPACING.md },
  heroTagText: { fontSize: 11, fontWeight: '700', color: '#FFD700', fontFamily: FONTS.sans.bold },
  heroTitle: { fontSize: 36, fontWeight: '700', color: '#FFFFFF', fontFamily: FONTS.sans.bold, marginBottom: SPACING.xs },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.sans.regular, marginBottom: SPACING.lg },
  heroPricing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  heroPrice: { fontSize: 32, fontWeight: '700', color: COLORS.primaryGold, fontFamily: FONTS.sans.bold },
  heroOriginalPrice: { fontSize: 16, color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.sans.regular, textDecorationLine: 'line-through', marginTop: 4 },
  heroDiscountBadge: { backgroundColor: '#EF4444', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  heroDiscountText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', fontFamily: FONTS.sans.bold },
  heroTimer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.lg },
  heroTimerText: { fontSize: 13, fontWeight: '600', color: '#FFD700', fontFamily: FONTS.sans.semibold },
  heroCta: { overflow: 'hidden', borderRadius: RADIUS.lg },
  heroCtaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  heroCtaText: { fontSize: 18, fontWeight: '700', color: COLORS.primaryBackground, fontFamily: FONTS.sans.bold },
  carouselIndicators: { flexDirection: 'row', justifyContent: 'center', gap: 8, position: 'absolute', bottom: SPACING.xl, left: 0, right: 0 },
  indicator: { height: 8, borderRadius: 4, transition: 'all 0.3s' },
  
  // Quick Categories
  quickCategories: { marginVertical: SPACING.lg },
  quickCategoryChip: { marginRight: SPACING.md },
  quickCategoryGradient: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)' },
  quickCategoryText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, fontFamily: FONTS.sans.semibold },
  
  // Category Sections
  categorySection: { marginBottom: SPACING.xl },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  categoryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  categoryHeaderTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold },
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.primaryGold, fontFamily: FONTS.sans.semibold },
  
  // Compact Cards
  compactCard: { width: width * 0.7, marginRight: SPACING.md },
  compactCardInner: { padding: SPACING.lg },
  compactIcon: { width: 56, height: 56, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  compactContent: { flex: 1 },
  compactTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold, marginBottom: 4 },
  compactSubtitle: { fontSize: 13, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular, marginBottom: SPACING.md },
  compactPricing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  compactPrice: { fontSize: 20, fontWeight: '700', color: COLORS.primaryGold, fontFamily: FONTS.sans.bold },
  compactDiscountBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  compactDiscount: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', fontFamily: FONTS.sans.bold },
  compactCardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(212,175,55,0.1)', alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  compactCardText: { fontSize: 11, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular },
});
