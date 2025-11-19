import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector } from '../../store/hooks';
import { selectIsSuperAdmin, selectAuth } from '../../store/slices/authSlice';

import { colors } from '../../theme/colors';
import { AssemblySelector } from '../../components/AssemblySelector';
import { mockFeed } from '../../../mocks/mock_feed';
import { telanganaUsers } from '../../../mocks/telangana_user';

interface MetricCard {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface SuggestionItem {
  id: string;
  title: string;
  description?: string;
  authorName: string;
  assemblySegment?: string;
  likes: number;
  dislikes: number;
  postedAt: string;
}

export const DashboardScreen = (): React.ReactElement => {
  const [selectedAssembly, setSelectedAssembly] = useState<string | null>(null);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const { user } = useAppSelector(selectAuth);

  // Calculate comprehensive metrics based on selected assembly (for SuperAdmin) or user's assembly
  const metrics = useMemo(() => {
    // For SuperAdmin: filter by selected assembly or show all
    // For LocalAdmin: filter by their assigned assembly segment
    // For others: show all data
    let assemblyFilter: string | null = null;

    if (isSuperAdmin) {
      assemblyFilter = selectedAssembly;
    } else if (
      user?.role === 'LocalAdmin' &&
      user?.assignedAreas?.assemblySegment
    ) {
      assemblyFilter = user.assignedAreas.assemblySegment;
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    monthAgo.setHours(0, 0, 0, 0);

    // ========== USER METRICS ==========
    // Filter users from telanganaUsers
    const allUsers = assemblyFilter
      ? telanganaUsers.filter(
          u => u.assignedAreas?.assemblySegment === assemblyFilter,
        )
      : telanganaUsers;

    const activeUsers = allUsers.filter(
      u => u.isActive && u.status === 'Approved',
    );
    const pendingUsers = allUsers.filter(u => u.status === 'Pending');
    const rejectedUsers = allUsers.filter(u => u.status === 'Rejected');
    const totalUsers = allUsers.length;
    const localAdmins = allUsers.filter(
      u => u.role === 'LocalAdmin' && u.isActive && u.status === 'Approved',
    );
    const members = allUsers.filter(
      u => u.role === 'Member' && u.isActive && u.status === 'Approved',
    );
    const superAdmins = allUsers.filter(u => u.role === 'SuperAdmin');
    const pendingRoleUsers = allUsers.filter(u => u.role === 'Pending');

    // New users this week
    const newUsersThisWeek = allUsers.filter(u => {
      if (!u.createdDate) return false;
      const createdDate = new Date(u.createdDate);
      return createdDate >= weekAgo;
    });

    // New users this month
    const newUsersThisMonth = allUsers.filter(u => {
      if (!u.createdDate) return false;
      const createdDate = new Date(u.createdDate);
      return createdDate >= monthAgo;
    });

    // Users with points
    const usersWithPoints = allUsers.filter(u => (u.points ?? 0) > 0);
    const totalPoints = allUsers.reduce((sum, u) => sum + (u.points ?? 0), 0);
    const avgPoints =
      activeUsers.length > 0 ? totalPoints / activeUsers.length : 0;

    // ========== FEED METRICS ==========
    // Filter all feed items
    const allFeedItems = assemblyFilter
      ? mockFeed.filter(
          item => item.areaScope?.assemblySegment === assemblyFilter,
        )
      : mockFeed;

    // Posts by type
    const newsPosts = allFeedItems.filter(item => item.type === 'NEWS');
    const videoPosts = allFeedItems.filter(item => item.type === 'VIDEO');
    const suggestionPosts = allFeedItems.filter(
      item => item.type === 'SUGGESTION',
    );
    const pollPosts = allFeedItems.filter(item => item.type === 'POLL');
    const fakeNewsPosts = allFeedItems.filter(
      item => item.type === 'FAKE_NEWS',
    );

    // Time-based post metrics
    // For "Posts Today", show posts from last 24 hours (since mock data has past dates)
    const postsToday = allFeedItems.filter(item => {
      if (
        item.type !== 'NEWS' &&
        item.type !== 'VIDEO' &&
        item.type !== 'SUGGESTION'
      )
        return false;
      try {
        const postDate = new Date(item.postedAt);
        if (isNaN(postDate.getTime())) return false;
        // Check if post is from last 24 hours
        const hoursDiff =
          (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 24 && hoursDiff >= 0;
      } catch {
        return false;
      }
    });

    const postsThisWeek = allFeedItems.filter(item => {
      if (
        item.type !== 'NEWS' &&
        item.type !== 'VIDEO' &&
        item.type !== 'SUGGESTION'
      )
        return false;
      const postDate = new Date(item.postedAt);
      return postDate >= weekAgo;
    });

    const postsThisMonth = allFeedItems.filter(item => {
      if (
        item.type !== 'NEWS' &&
        item.type !== 'VIDEO' &&
        item.type !== 'SUGGESTION'
      )
        return false;
      const postDate = new Date(item.postedAt);
      return postDate >= monthAgo;
    });

    // Active polls (last 30 days)
    const activePolls = allFeedItems.filter(item => {
      if (item.type !== 'POLL') return false;
      const pollDate = new Date(item.postedAt);
      const daysDiff =
        (now.getTime() - pollDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    // Resolved fake news reports
    const resolvedReports = allFeedItems.filter(
      item => item.type === 'FAKE_NEWS' && item.flagged,
    );
    const pendingReports = allFeedItems.filter(
      item => item.type === 'FAKE_NEWS' && !item.flagged,
    );

    // Engagement metrics
    const totalLikes = allFeedItems.reduce(
      (sum, item) => sum + (item.likes ?? 0),
      0,
    );
    const totalDislikes = allFeedItems.reduce(
      (sum, item) => sum + (item.dislikes ?? 0),
      0,
    );
    const totalEngagement = totalLikes + totalDislikes;

    // Total poll votes
    const totalPollVotes = pollPosts.reduce((sum, item) => {
      if (item.type === 'POLL' && item.options) {
        return (
          sum + item.options.reduce((optSum, opt) => optSum + opt.votes, 0)
        );
      }
      return sum;
    }, 0);

    // Content performance metrics
    const totalPosts =
      newsPosts.length + videoPosts.length + suggestionPosts.length;
    const avgLikesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0;
    const avgEngagementPerPost =
      totalPosts > 0 ? totalEngagement / totalPosts : 0;
    const engagementRate = totalPosts > 0 ? totalEngagement / totalPosts : 0;

    // Unique content creators
    const uniqueCreators = new Set(
      allFeedItems.map(item => item.postedBy).filter(Boolean),
    );

    // Unique assembly segments with content
    const uniqueSegments = new Set(
      allFeedItems.map(item => item.areaScope?.assemblySegment).filter(Boolean),
    );

    // Most liked post type
    const newsAvgLikes =
      newsPosts.length > 0
        ? newsPosts.reduce((sum, item) => sum + (item.likes ?? 0), 0) /
          newsPosts.length
        : 0;
    const videoAvgLikes =
      videoPosts.length > 0
        ? videoPosts.reduce((sum, item) => sum + (item.likes ?? 0), 0) /
          videoPosts.length
        : 0;
    const suggestionAvgLikes =
      suggestionPosts.length > 0
        ? suggestionPosts.reduce((sum, item) => sum + (item.likes ?? 0), 0) /
          suggestionPosts.length
        : 0;

    // Fake news resolution rate
    const fakeNewsResolutionRate =
      fakeNewsPosts.length > 0
        ? (resolvedReports.length / fakeNewsPosts.length) * 100
        : 0;

    // Poll participation rate (average votes per poll)
    const avgPollVotes =
      pollPosts.length > 0 ? totalPollVotes / pollPosts.length : 0;

    return [
      // Most Important 9 Metrics
      {
        id: 'm1',
        label: 'Total Users',
        value: totalUsers.toLocaleString(),
        icon: 'people',
        color: colors.primary,
      },
      {
        id: 'm2',
        label: 'Active Volunteers',
        value: activeUsers.length.toLocaleString(),
        icon: 'person-check',
        color: colors.success,
      },
      {
        id: 'm3',
        label: 'Total Posts',
        value: totalPosts.toLocaleString(),
        icon: 'post-add',
        color: colors.success,
      },
      {
        id: 'm4',
        label: 'Posts Today',
        value: postsToday.length.toLocaleString(),
        icon: 'today',
        color: colors.primary,
      },
      {
        id: 'm5',
        label: 'Total Engagement',
        value: totalEngagement.toLocaleString(),
        icon: 'trending-up',
        color: colors.primary,
      },
      {
        id: 'm6',
        label: 'Active Polls',
        value: activePolls.length.toLocaleString(),
        icon: 'how-to-vote',
        color: colors.accent,
      },
      {
        id: 'm7',
        label: 'Fake News Reports',
        value: fakeNewsPosts.length.toLocaleString(),
        icon: 'report-problem',
        color: colors.warning,
      },
      {
        id: 'm8',
        label: 'Resolved Reports',
        value: resolvedReports.length.toLocaleString(),
        icon: 'check-circle',
        color: colors.success,
      },
      {
        id: 'm9',
        label: 'Content Creators',
        value: uniqueCreators.size.toLocaleString(),
        icon: 'create',
        color: colors.info,
      },
    ];
  }, [selectedAssembly, isSuperAdmin, user]) as MetricCard[];

  // Get top 3 suggestions sorted by likes
  const topSuggestions = useMemo(() => {
    // For SuperAdmin: filter by selected assembly or show all
    // For LocalAdmin: filter by their assigned assembly segment
    // For others: show all data
    let assemblyFilter: string | null = null;

    if (isSuperAdmin) {
      assemblyFilter = selectedAssembly;
    } else if (
      user?.role === 'LocalAdmin' &&
      user?.assignedAreas?.assemblySegment
    ) {
      assemblyFilter = user.assignedAreas.assemblySegment;
    }

    const suggestions = mockFeed
      .filter(item => {
        if (item.type !== 'SUGGESTION') return false;
        if (assemblyFilter) {
          return item.areaScope?.assemblySegment === assemblyFilter;
        }
        return true;
      })
      .map(item => ({
        id: item.id,
        title: item.title,
        description: 'description' in item ? item.description : undefined,
        authorName: item.authorName || 'Unknown',
        assemblySegment: item.areaScope?.assemblySegment,
        likes: item.likes ?? 0,
        dislikes: item.dislikes ?? 0,
        postedAt: item.postedAt,
      }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3);

    return suggestions;
  }, [selectedAssembly, isSuperAdmin, user]) as SuggestionItem[];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Command Center</Text>
        <Text style={styles.headerSubtitle}>Real-time campaign insights</Text>
      </View>

      {/* Assembly Selector - Only for SuperAdmin */}
      {isSuperAdmin && (
        <View style={styles.assemblyContainer}>
          <AssemblySelector
            value={selectedAssembly}
            onSelect={setSelectedAssembly}
            placeholder="Select Assembly to Filter"
            mode="dropdown"
          />
          <Text style={styles.filterHint}>
            {selectedAssembly
              ? `Showing metrics for ${selectedAssembly}`
              : 'Select assembly to filter metrics (or leave empty to see all)'}
          </Text>
        </View>
      )}

      {/* Show current filter for LocalAdmin */}
      {user?.role === 'LocalAdmin' && user?.assignedAreas?.assemblySegment && (
        <View style={styles.assemblyContainer}>
          <Text style={styles.filterHint}>
            Showing metrics for your segment:{' '}
            {user.assignedAreas.assemblySegment}
          </Text>
        </View>
      )}

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
        <View style={styles.metricsGrid}>
          {metrics.map(metric => (
            <View key={metric.id} style={styles.metricCard}>
              <View
                style={[
                  styles.metricIconContainer,
                  { backgroundColor: `${metric.color}20` },
                ]}
              >
                <MaterialIcons
                  name={metric.icon as any}
                  size={24}
                  color={metric.color}
                />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top 3 Suggestions */}
      {topSuggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Top Suggestions</Text>
          {topSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionCard}
              activeOpacity={0.7}
            >
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionRank}>
                  <Text style={styles.suggestionRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle} numberOfLines={2}>
                    {suggestion.title}
                  </Text>
                  {suggestion.description && (
                    <Text
                      style={styles.suggestionDescription}
                      numberOfLines={2}
                    >
                      {suggestion.description}
                    </Text>
                  )}
                  <View style={styles.suggestionMeta}>
                    <Text style={styles.suggestionAuthor}>
                      {suggestion.authorName}
                    </Text>
                    {suggestion.assemblySegment && (
                      <Text style={styles.suggestionSegment}>
                        • {suggestion.assemblySegment}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.suggestionFooter}>
                <View style={styles.suggestionReactions}>
                  <MaterialIcons
                    name="thumb-up"
                    size={14}
                    color={colors.success}
                  />
                  <Text style={styles.suggestionReactionText}>
                    {suggestion.likes}
                  </Text>
                </View>
                <View style={styles.suggestionReactions}>
                  <MaterialIcons
                    name="thumb-down"
                    size={14}
                    color={colors.danger}
                  />
                  <Text style={styles.suggestionReactionText}>
                    {suggestion.dislikes}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  assemblyContainer: {
    marginBottom: 16,
  },
  filterHint: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestionRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionRankText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  suggestionContent: {
    flex: 1,
    gap: 4,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  suggestionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  suggestionAuthor: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  suggestionSegment: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  suggestionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestionReactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionReactionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
