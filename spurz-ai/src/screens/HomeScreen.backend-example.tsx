/**
 * Home Screen - Backend Integration Example
 * 
 * This is a simplified example showing how to connect the HomeScreen to the backend.
 * Integrates with your existing UI components and animations.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext.new';
import ApiClient from '../services/api';

interface HomeDashboardData {
  meta: {
    userId: string;
    userName: string;
    scenarioCode: string;
    healthBand: string;
    healthScore: number;
    lastUpdated: string;
  };
  dataCompleteness: {
    completionPercentage: number;
    hasBasicInfo: boolean;
    hasSalaryInfo: boolean;
    hasCardInfo: boolean;
  };
  hero: {
    title: string;
    subtitle: string;
    pillText: string;
    color: string;
    priority: number;
  };
  keyStats: Array<{
    label: string;
    value: string;
    change?: string;
    icon: string;
  }>;
  nudges: {
    message: string;
    showOnboarding: boolean;
  };
  insights: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    priority: number;
  }>;
  nextBestActions: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    priority: number;
  }>;
  bestCardsForCategories: Array<{
    category: string;
    spendAmount: number;
    bestCard: any;
  }>;
}

export const HomeScreenBackendExample = () => {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<HomeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch dashboard data from backend
   */
  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (!isRefresh) setIsLoading(true);
      setError(null);

      const data = await ApiClient.getHomeDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Force refresh from backend
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await ApiClient.refreshHomeDashboard();
      await fetchDashboard(true);
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
      setIsRefreshing(false);
    }
  };

  // Load dashboard on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !dashboardData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Please log in to view your dashboard</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{dashboardData.hero.title}</Text>
        <Text style={styles.heroSubtitle}>{dashboardData.hero.subtitle}</Text>
        {dashboardData.hero.pillText && (
          <View style={[styles.pill, { backgroundColor: dashboardData.hero.color }]}>
            <Text style={styles.pillText}>{dashboardData.hero.pillText}</Text>
          </View>
        )}
      </View>

      {/* Health Score */}
      <View style={styles.healthScore}>
        <Text style={styles.sectionTitle}>Financial Health</Text>
        <Text style={styles.score}>{dashboardData.meta.healthScore}</Text>
        <Text style={styles.healthBand}>{dashboardData.meta.healthBand}</Text>
      </View>

      {/* Data Completeness */}
      {dashboardData.dataCompleteness.completionPercentage < 100 && (
        <View style={styles.nudge}>
          <Text style={styles.nudgeText}>{dashboardData.nudges.message}</Text>
        </View>
      )}

      {/* Key Stats */}
      <View style={styles.stats}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        {dashboardData.keyStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            {stat.change && <Text style={styles.statChange}>{stat.change}</Text>}
          </View>
        ))}
      </View>

      {/* Next Best Actions */}
      {dashboardData.nextBestActions.length > 0 && (
        <View style={styles.actions}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          {dashboardData.nextBestActions.slice(0, 3).map((action) => (
            <View key={action.id} style={styles.actionCard}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDesc}>{action.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Insights */}
      {dashboardData.insights.length > 0 && (
        <View style={styles.insights}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {dashboardData.insights.slice(0, 3).map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDesc}>{insight.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Best Cards for Categories */}
      {dashboardData.bestCardsForCategories.length > 0 && (
        <View style={styles.bestCards}>
          <Text style={styles.sectionTitle}>Best Cards for Your Spending</Text>
          {dashboardData.bestCardsForCategories.map((item, index) => (
            <View key={index} style={styles.categoryCard}>
              <Text style={styles.categoryName}>{item.category}</Text>
              <Text style={styles.categorySpend}>₹{item.spendAmount.toLocaleString()}</Text>
              {item.bestCard && (
                <Text style={styles.recommendedCard}>{item.bestCard.cardName}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  hero: {
    padding: 24,
    backgroundColor: '#111',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#999',
    marginBottom: 16,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  healthScore: {
    padding: 24,
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  healthBand: {
    fontSize: 18,
    color: '#999',
    marginTop: 8,
  },
  nudge: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1a3a52',
    borderRadius: 12,
  },
  nudgeText: {
    color: '#fff',
    fontSize: 14,
  },
  stats: {
    padding: 16,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statChange: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    padding: 16,
  },
  actionCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDesc: {
    color: '#999',
    fontSize: 14,
  },
  insights: {
    padding: 16,
  },
  insightCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightDesc: {
    color: '#999',
    fontSize: 14,
  },
  bestCards: {
    padding: 16,
    marginBottom: 32,
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categorySpend: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 4,
  },
  recommendedCard: {
    color: '#999',
    fontSize: 12,
    marginTop: 8,
  },
});

export default HomeScreenBackendExample;
