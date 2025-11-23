import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, GRADIENTS, SPACING, RADIUS } from '@constants/theme';
import { hapticFeedback } from '@utils/haptics';

const GOALS = [
  { id: '1', emoji: '✈️', name: 'Dream Vacation', target: 150000, saved: 85000, deadline: '6 months', color: COLORS.travel },
  { id: '2', emoji: '🏠', name: 'New Apartment', target: 2000000, saved: 950000, deadline: '2 years', color: COLORS.warning },
  { id: '3', emoji: '📱', name: 'New Gadgets', target: 80000, saved: 65000, deadline: '2 months', color: COLORS.entertainment }
];

const GoalCard = ({ goal, index }: any) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: false })
      ])
    ]).start();
  }, []);

  const progress = (goal.saved / goal.target) * 100;

  return (
    <Animated.View style={[styles.goalCardWrapper, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.goalCard} activeOpacity={0.8}>
        <LinearGradient colors={[`${goal.color}15`, `${goal.color}05`]} style={styles.goalCardBg}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>{goal.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.goalDeadline}>{goal.deadline}</Text>
            </View>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => hapticFeedback.light()}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[goal.color, goal.color]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>₹{goal.saved.toLocaleString()}</Text>
              <Text style={styles.amountSeparator}>of</Text>
              <Text style={styles.amountTarget}>₹{goal.target.toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.goalCtaButton, { backgroundColor: `${goal.color}20` }]}
            onPress={() => hapticFeedback.light()}
          >
            <Text style={[styles.goalCtaText, { color: goal.color }]}>Add Savings</Text>
            <Ionicons name="arrow-forward" size={14} color={goal.color} />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function GoalsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [scrollAnim] = useState(new Animated.Value(0));

  const headerOpacity = scrollAnim.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={GRADIENTS.background as [string, string, string]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
        <BlurView tint="dark" intensity={90} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Goals</Text>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => hapticFeedback.medium()}
            >
              <Ionicons name="add-circle" size={22} color={COLORS.primaryGold} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      <ScrollView onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollAnim } } }], { useNativeDriver: false })} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false} directionalLockEnabled={true}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Your Goals</Text>
          <Text style={styles.heroSubtitle}>Track and achieve your financial dreams</Text>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Saved</Text>
            <Text style={styles.summaryValue}>₹{GOALS.reduce((sum, g) => sum + g.saved, 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Active Goals</Text>
            <Text style={styles.summaryValue}>{GOALS.length}</Text>
          </View>
        </View>

        <View style={styles.goalsContainer}>
          {GOALS.map((goal, idx) => <GoalCard key={goal.id} goal={goal} index={idx} />)}
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold },
  headerIcon: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center' },
  heroSection: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl, marginTop: 80 },
  heroTitle: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold, marginBottom: SPACING.md },
  heroSubtitle: { fontSize: 15, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular },
  summarySection: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.md, marginBottom: SPACING.xl },
  summaryCard: { flex: 1, padding: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)' },
  summaryLabel: { fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular, marginBottom: SPACING.sm },
  summaryValue: { fontSize: 20, fontWeight: '700', color: COLORS.primaryGold, fontFamily: FONTS.sans.bold },
  goalsContainer: { paddingHorizontal: SPACING.lg, gap: SPACING.lg },
  goalCardWrapper: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  goalCard: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  goalCardBg: { padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: RADIUS.lg },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  goalEmoji: { fontSize: 32 },
  goalName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold },
  goalDeadline: { fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular, marginTop: 2 },
  moreButton: { padding: SPACING.sm },
  progressSection: { marginBottom: SPACING.lg },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  progressLabel: { fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular },
  progressPercent: { fontSize: 14, fontWeight: '700', color: COLORS.primaryGold, fontFamily: FONTS.sans.bold },
  progressBar: { height: 6, borderRadius: RADIUS.full, backgroundColor: 'rgba(212,175,55,0.15)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: RADIUS.full },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.md },
  amountLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, fontFamily: FONTS.sans.bold },
  amountSeparator: { fontSize: 12, color: COLORS.textSecondary },
  amountTarget: { fontSize: 13, color: COLORS.textSecondary, fontFamily: FONTS.sans.regular },
  goalCtaButton: { padding: SPACING.md, borderRadius: RADIUS.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  goalCtaText: { fontSize: 13, fontWeight: '600', fontFamily: FONTS.sans.semibold }
});
