import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { Card3D } from '@components/Card3D';
import { hapticFeedback } from '@utils/haptics';

const { width } = Dimensions.get('window');

interface CategoryDetailScreenProps {
  route: {
    params: {
      category: string;
      amount: number;
      color: string;
      icon: string;
    };
  };
  navigation: any;
}

type TimeRange = 'daily' | 'weekly' | 'monthly';

export default function CategoryDetailScreen({ route, navigation }: CategoryDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { category, amount, color, icon } = route.params;
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  // Mock data - will be replaced with API data
  const getDataForRange = (range: TimeRange) => {
    switch (range) {
      case 'daily':
        return { total: amount / 30, breakdown: [] };
      case 'weekly':
        return { total: amount / 4, breakdown: [] };
      case 'monthly':
        return { total: amount, breakdown: [] };
    }
  };

  const data = getDataForRange(timeRange);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[COLORS.primaryBackground, COLORS.secondaryBackground]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            hapticFeedback.light();
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Category Hero */}
        <Card3D
          colors={[`${color}20`, `${color}10`]}
          borderRadius={20}
          style={styles.heroCard}
        >
          <View style={[styles.iconLarge, { backgroundColor: `${color}30` }]}>
            <Ionicons name={icon as any} size={40} color={color} />
          </View>
          <Text style={styles.heroAmount}>₹{data.total.toLocaleString()}</Text>
          <Text style={styles.heroLabel}>Total {timeRange} spending</Text>
        </Card3D>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
              onPress={() => {
                hapticFeedback.light();
                setTimeRange(range);
              }}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Breakdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breakdown</Text>
          <Card3D
            colors={['rgba(30,30,30,0.4)', 'rgba(20,20,20,0.2)']}
            borderRadius={16}
            style={styles.breakdownCard}
          >
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyStateText}>Detailed breakdown coming soon</Text>
              <Text style={styles.emptyStateSubtext}>
                We're analyzing your spending patterns to provide granular insights
              </Text>
            </View>
          </Card3D>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <Card3D
            colors={['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)']}
            borderRadius={16}
            style={styles.insightCard}
          >
            <View style={styles.insightHeader}>
              <Ionicons name="sparkles" size={20} color="#8B5CF6" />
              <Text style={styles.insightTitle}>Analysing</Text>
            </View>
            <Text style={styles.insightText}>
              We're analyzing your {category.toLowerCase()} spending patterns to provide personalized recommendations...
            </Text>
          </Card3D>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  heroCard: {
    padding: SPACING.xxl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconLarge: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.xs,
  },
  heroLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.primaryGold,
    borderColor: COLORS.primaryGold,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.semibold,
  },
  timeRangeTextActive: {
    color: COLORS.primaryBackground,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans.bold,
    marginBottom: SPACING.md,
  },
  breakdownCard: {
    padding: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.semibold,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontFamily: FONTS.sans.regular,
    textAlign: 'center',
    lineHeight: 18,
  },
  insightCard: {
    padding: SPACING.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    fontFamily: FONTS.sans.bold,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans.regular,
    lineHeight: 20,
  },
});
