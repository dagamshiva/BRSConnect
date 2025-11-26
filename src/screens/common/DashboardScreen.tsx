import React, { useMemo, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import {
  selectIsSuperAdmin,
  selectIsLocalAdmin,
  selectAuth,
} from '../../store/slices/authSlice';

import { useTheme } from '../../theme/useTheme';
import type { ThemeColors } from '../../theme/themeColors';
import { AssemblySelector } from '../../components/AssemblySelector';
import { GaugeChart } from '../../components/GaugeChart';
import { PieChart } from '../../components/PieChart';
import { UserDetailsHeader } from '../../components/UserDetailsHeader';
import { UserBadge } from '../../components/UserBadge';
import { mockFeed } from '../../../mocks/mock_feed';
import { telanganaUsers } from '../../../mocks/telangana_user';
import {
  getPartyDistribution,
  getBRSSatisfactionPercentage,
} from '../../../mocks/mock_myassembly_view';
import { useLocalSuggestions } from '../../context/LocalSuggestionsContext';

interface MetricCard {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  screenName?: string;
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

// Separate component for Assembly Mood Charts to ensure proper recalculation
const AssemblyMoodCharts = ({
  refreshKey,
  selectedAssembly,
  userAssemblySegment,
  isSuperAdmin,
  showMyAssemblyOnly,
  colors,
}: {
  refreshKey: number;
  selectedAssembly: string | null;
  userAssemblySegment: string | null;
  isSuperAdmin: boolean;
  showMyAssemblyOnly: boolean;
  colors: ThemeColors;
}): React.ReactElement => {
  // Determine which assembly segment to use for charts
  // For SuperAdmin: Priority: selected assembly > My Assembly toggle > All segments
  // For LocalAdmin/Member: Always use their own assembly segment
  let assemblySegment: string | null = null;

  if (!isSuperAdmin && userAssemblySegment) {
    // For LocalAdmin and Member: always use their own assembly segment
    assemblySegment = userAssemblySegment;
  } else if (isSuperAdmin && selectedAssembly) {
    // SuperAdmin's selected assembly takes priority
    assemblySegment = selectedAssembly;
  } else if (showMyAssemblyOnly && userAssemblySegment) {
    // "My Assembly" toggle is active, filter to user's segment
    assemblySegment = userAssemblySegment;
  } else {
    // Default: show all segments (null) - only for SuperAdmin
    assemblySegment = null;
  }

  // Memoize chart data to recalculate when refreshKey or assemblySegment changes
  const brsSatisfactionPercentage = useMemo(
    () => getBRSSatisfactionPercentage(assemblySegment),
    [assemblySegment, refreshKey],
  );

  const partyDistributionData = useMemo(
    () =>
      getPartyDistribution(assemblySegment).map(item => ({
        label: item.party,
        value: item.count,
        color:
          item.party === 'BRS'
            ? colors.primary
            : item.party === 'Congress'
            ? '#00529B'
            : item.party === 'BJP'
            ? '#FF9933'
            : colors.textSecondary,
      })),
    [assemblySegment, refreshKey, colors.primary, colors.textSecondary],
  );

  const chartStyles = useMemo(
    () =>
      StyleSheet.create({
        chartsContainer: {
          flexDirection: 'column',
          gap: 12,
          marginTop: 12,
        },
        chartCard: {
          width: '100%',
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1.5,
          borderColor: `${colors.primary}40`,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        },
      }),
    [colors],
  );

  // Dynamic title for winning chances chart
  const winningChancesTitle = useMemo(() => {
    if (assemblySegment) {
      return `Winning Chances at ${assemblySegment}`;
    }
    return 'Winning Chances (All Segments)';
  }, [assemblySegment]);

  return (
    <View style={chartStyles.chartsContainer}>
      {/* BRS Satisfaction Gauge */}
      <View style={chartStyles.chartCard}>
        <GaugeChart
          key={`gauge-${refreshKey}-${assemblySegment}`}
          percentage={brsSatisfactionPercentage}
          title="BRS Satisfaction"
          size={180}
        />
      </View>

      {/* Winning Chances Pie Chart */}
      <View style={chartStyles.chartCard}>
        <PieChart
          key={`pie-${refreshKey}-${assemblySegment}`}
          data={partyDistributionData}
          title={winningChancesTitle}
          size={180}
        />
      </View>
    </View>
  );
};

export const DashboardScreen = (): React.ReactElement => {
  const { user } = useAppSelector(selectAuth);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const isLocalAdmin = useAppSelector(selectIsLocalAdmin);
  const { suggestions: localSuggestions } = useLocalSuggestions();

  // For LocalAdmin and Member: default to their own assembly segment
  // For SuperAdmin: start with null (can select any assembly)
  const defaultAssembly =
    !isSuperAdmin && user?.assignedAreas?.assemblySegment
      ? user.assignedAreas.assemblySegment
      : null;

  const [selectedAssembly, setSelectedAssembly] = useState<string | null>(
    defaultAssembly,
  );
  const [showMyAssemblyOnly, setShowMyAssemblyOnly] = useState<boolean>(false); // For Assembly Mood filter
  const [showMyAssemblyOnlySuggestions, setShowMyAssemblyOnlySuggestions] = useState<boolean>(false); // For Top Suggestions filter
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<SuggestionItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when votes change
  const navigation = useNavigation<any>();
  const colors = useTheme(); // Define colors early so it can be used in useMemo hooks

  // Set default assembly for LocalAdmin and Member when user data is available
  React.useEffect(() => {
    if (!isSuperAdmin && user?.assignedAreas?.assemblySegment) {
      // For LocalAdmin and Member: set their assembly as default
      if (selectedAssembly !== user.assignedAreas.assemblySegment) {
        setSelectedAssembly(user.assignedAreas.assemblySegment);
      }
    }
  }, [user?.assignedAreas?.assemblySegment, isSuperAdmin]);

  // Refresh dashboard when screen comes into focus (e.g., after voting)
  useFocusEffect(
    useCallback(() => {
      // Increment refreshKey to force recalculation of charts
      setRefreshKey(prev => prev + 1);
    }, []),
  );

  // Calculate comprehensive metrics based on selected assembly (for SuperAdmin) or user's assembly
  const metrics = useMemo(() => {
    // Determine the user's role for navigation
    const userRole = isSuperAdmin
      ? 'superAdmin'
      : isLocalAdmin
      ? 'localAdmin'
      : 'member';
    // For SuperAdmin: filter by selected assembly or show all
    // For LocalAdmin and Member: filter by their assigned assembly segment
    let assemblyFilter: string | null = null;

    if (isSuperAdmin) {
      assemblyFilter = selectedAssembly;
    } else if (user?.assignedAreas?.assemblySegment) {
      // For LocalAdmin and Member: always use their own assembly segment
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

    // Fake news today (last 24 hours)
    const fakeNewsToday = fakeNewsPosts.filter(item => {
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

    // Fake news resolution rate
    const fakeNewsResolutionRate =
      fakeNewsPosts.length > 0
        ? (resolvedReports.length / fakeNewsPosts.length) * 100
        : 0;

    // Poll participation rate (average votes per poll)
    const avgPollVotes =
      pollPosts.length > 0 ? totalPollVotes / pollPosts.length : 0;

    // Return totalUsers separately and exclude it from metrics array
    return {
      totalUsers,
      metrics: [
        {
          id: 'm4',
          label: 'Posts',
          value: postsToday.length.toLocaleString(),
          // Use a news/post related symbol instead of calendar
          icon: 'article',
          color: colors.primary,
          screenName: `${userRole}-Posts`,
        },
        {
          id: 'm6',
          label: 'Polls',
          value: activePolls.length.toLocaleString(),
          icon: 'how-to-vote',
          color: colors.accent,
          screenName: `${userRole}-Polls`,
        },
        {
          id: 'm7',
          label: 'Fake News',
          value: fakeNewsToday.length.toLocaleString(),
          icon: 'report-problem',
          color: colors.warning,
          screenName: `${userRole}-FakeNews`,
        },
      ],
    };
  }, [selectedAssembly, isSuperAdmin, isLocalAdmin, user, colors]) as {
    totalUsers: number;
    metrics: MetricCard[];
  };

  // Create dynamic styles based on current theme with modern design
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          padding: 20,
          paddingBottom: 32,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: 8,
          marginBottom: 24,
        },
        headerLeft: {
          flex: 1,
        },
        headerTitle: {
          fontSize: 32,
          fontWeight: '800',
          color: colors.textPrimary,
          marginBottom: 6,
          letterSpacing: -0.5,
        },
        headerSubtitle: {
          fontSize: 15,
          color: colors.textSecondary,
          fontWeight: '600',
          letterSpacing: -0.2,
        },
        assemblyContainer: {
          marginBottom: 20,
        },
        assemblySelectorRow: {
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
        },
        assemblySelectorWrapper: {
          flex: 0.65,
          minWidth: 0,
          height: 56,
        },
        filterHint: {
          marginTop: 10,
          color: colors.textSecondary,
          fontSize: 13,
          paddingHorizontal: 4,
          fontWeight: '600',
          letterSpacing: -0.1,
        },
        myAssemblyButtonCompact: {
          flex: 0.35,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          height: 36,
          minHeight: 36,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          minWidth: 0,
        },
        section: {
          backgroundColor: colors.card,
          borderRadius: 18,
          padding: 20,
          borderWidth: 1.5,
          borderColor: `${colors.primary}50`,
          marginBottom: 18,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 3,
        },
        sectionTitleContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap',
        },
        sectionTitle: {
          fontSize: 20,
          fontWeight: '800',
          color: colors.textPrimary,
          letterSpacing: -0.3,
        },
        sectionTitleCount: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.primary,
          letterSpacing: -0.2,
        },
        myAssemblyButtonActive: {
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}10`,
          borderWidth: 1.5,
        },
        myAssemblyButtonText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.textSecondary,
          letterSpacing: -0.1,
        },
        myAssemblyButtonTextActive: {
          color: colors.primary,
          fontWeight: '800',
          letterSpacing: -0.1,
        },
        suggestionToggleContainer: {
          flexDirection: 'row',
          gap: 6,
        },
        suggestionToggleButton: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.border,
        },
        suggestionToggleButtonActive: {
          backgroundColor: `${colors.primary}15`,
          borderColor: colors.primary,
        },
        suggestionToggleText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textSecondary,
        },
        suggestionToggleTextActive: {
          color: colors.primary,
          fontWeight: '700',
        },
        assemblyMoodFilterHint: {
          marginTop: 6,
          marginBottom: 14,
          color: colors.textSecondary,
          fontSize: 13,
          fontStyle: 'italic',
          fontWeight: '600',
          letterSpacing: -0.1,
        },
        assemblyNameBold: {
          fontWeight: '800',
          color: colors.textPrimary,
          fontStyle: 'normal',
          fontSize: 14,
        },
        metricsGrid: {
          flexDirection: 'row',
          flexWrap: 'nowrap',
          gap: 12,
          justifyContent: 'space-between',
        },
        metricCard: {
          flex: 1,
          minWidth: 0,
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 14,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: `${colors.primary}30`,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 2,
        },
        metricIconContainer: {
          width: 52,
          height: 52,
          borderRadius: 26,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
          backgroundColor: `${colors.primary}15`,
        },
        metricValue: {
          fontSize: 26,
          fontWeight: '800',
          color: colors.textPrimary,
          marginBottom: 6,
          letterSpacing: -0.5,
        },
        metricLabel: {
          fontSize: 13,
          color: colors.textSecondary,
          textAlign: 'center',
          fontWeight: '600',
          letterSpacing: -0.1,
        },
        suggestionCard: {
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 14,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: `${colors.primary}40`,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
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
          borderWidth: 1.5,
          borderColor: `${colors.primaryLight}80`,
          justifyContent: 'center',
          alignItems: 'center',
        },
        suggestionRankText: {
          color: colors.textPrimary,
          fontWeight: '800',
          fontSize: 15,
          letterSpacing: -0.3,
        },
        suggestionContent: {
          flex: 1,
          gap: 4,
        },
        suggestionTitle: {
          fontSize: 15,
          fontWeight: '700',
          color: colors.textPrimary,
          letterSpacing: -0.2,
          lineHeight: 20,
        },
        suggestionDescription: {
          fontSize: 13,
          color: colors.textSecondary,
          marginTop: 2,
          fontWeight: '500',
          lineHeight: 18,
        },
        suggestionMeta: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginTop: 4,
          gap: 4,
        },
        suggestionAuthor: {
          fontSize: 12,
          color: colors.textSecondary,
          fontWeight: '600',
          letterSpacing: -0.1,
        },
        suggestionSegment: {
          fontSize: 12,
          color: colors.textSecondary,
          fontWeight: '600',
          letterSpacing: -0.1,
        },
        suggestionFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: `${colors.primary}30`,
        },
        suggestionReactions: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        suggestionReactionText: {
          fontSize: 13,
          color: colors.textSecondary,
          fontWeight: '700',
          letterSpacing: -0.1,
        },
        suggestionModalBackdrop: {
          flex: 1,
          backgroundColor: '#00000066',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        },
        suggestionModal: {
          width: '100%',
          maxHeight: '80%',
          backgroundColor: colors.card,
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 20,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        },
        suggestionModalHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        suggestionModalTitle: {
          flex: 1,
          fontSize: 18,
          fontWeight: '800',
          color: colors.textPrimary,
          marginRight: 12,
        },
        suggestionModalClose: {
          padding: 4,
          borderRadius: 16,
          backgroundColor: colors.background,
        },
        suggestionModalBody: {
          fontSize: 14,
          lineHeight: 20,
          color: colors.textPrimary,
        },
      }),
    [colors],
  );

  // Get top 3 suggestions sorted by likes from LocalSuggestionsContext
  const topSuggestions = useMemo(() => {
    // Always sort by likes from local suggestions; ignore assembly for now since
    // LocalSuggestionsContext stores global strategic suggestions
    const sorted = [...localSuggestions].sort((a, b) => b.likes - a.likes).slice(0, 3);

    return sorted.map<SuggestionItem>((item) => ({
      id: item.id,
      title: item.title,
      description: item.summary,
      // Use a generic author label since LocalSuggestions don't track author names
      authorName: 'Top Cadre Strategy',
      assemblySegment:
        showMyAssemblyOnlySuggestions && user?.assignedAreas?.assemblySegment
          ? user.assignedAreas.assemblySegment
          : undefined,
      likes: item.likes,
      // Local suggestions don't track dislikes; keep as 0 for now
      dislikes: 0,
      postedAt: '',
    }));
  }, [localSuggestions, showMyAssemblyOnlySuggestions, user?.assignedAreas?.assemblySegment]) as SuggestionItem[];

  // Helper function to get user points by name or aliasName
  const getUserPoints = (nameOrAlias: string): number | null => {
    const user = telanganaUsers.find(
      u =>
        u.name?.toLowerCase() === nameOrAlias.toLowerCase() ||
        u.aliasName?.toLowerCase() === nameOrAlias.toLowerCase(),
    );
    return user?.points ?? null;
  };

  // Handle metric card press
  const handleMetricPress = (screenName: string | undefined) => {
    if (screenName) {
      navigation.navigate(screenName);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overview</Text>
      </View>

      {/* Assembly Selector - Only for SuperAdmin */}
      {isSuperAdmin && (
        <View style={styles.assemblyContainer}>
          <View style={styles.assemblySelectorRow}>
            <View style={styles.assemblySelectorWrapper}>
              <AssemblySelector
                key={`assembly-selector-${
                  showMyAssemblyOnly ? 'my-assembly' : 'filter'
                }`}
                value={selectedAssembly}
                onSelect={assembly => {
                  setSelectedAssembly(assembly);
                  // Clear "My Assembly" toggle when SuperAdmin selects an assembly
                  if (assembly) {
                    setShowMyAssemblyOnly(false);
                  }
                }}
                placeholder="Select Assembly to Filter"
                mode="dropdown"
              />
            </View>
            {/* My Assembly Button for SuperAdmin */}
            {user?.assignedAreas?.assemblySegment && (
              <TouchableOpacity
                style={[
                  styles.myAssemblyButtonCompact,
                  showMyAssemblyOnly && styles.myAssemblyButtonActive,
                ]}
                onPress={() => {
                  const newValue = !showMyAssemblyOnly;
                  setShowMyAssemblyOnly(newValue);
                  // Clear assembly selection when toggling My Assembly ON
                  // This will force the dropdown to close via the key change
                  if (newValue) {
                    setSelectedAssembly(null);
                  }
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={showMyAssemblyOnly ? 'location-on' : 'location-off'}
                  size={16}
                  color={
                    showMyAssemblyOnly ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.myAssemblyButtonText,
                    showMyAssemblyOnly && styles.myAssemblyButtonTextActive,
                  ]}
                >
                  My Assembly
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.filterHint}>
            {selectedAssembly
              ? `Showing metrics for ${selectedAssembly}`
              : showMyAssemblyOnly && user?.assignedAreas?.assemblySegment
              ? `Showing metrics for ${user.assignedAreas.assemblySegment}`
              : 'Select assembly to filter metrics (or leave empty to see all)'}
          </Text>
        </View>
      )}

      {/* Show current filter for LocalAdmin and Member */}
      {!isSuperAdmin && user?.assignedAreas?.assemblySegment && (
        <View style={styles.assemblyContainer}>
          <Text style={styles.filterHint}>
            Showing data for your segment: {user.assignedAreas.assemblySegment}
          </Text>
        </View>
      )}

      {/* Key Metrics - Only for SuperAdmin */}
      {isSuperAdmin && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>📊 Today Key Metrics</Text>
            <TouchableOpacity
              onPress={() => {
                const userRole = isSuperAdmin
                  ? 'superAdmin'
                  : isLocalAdmin
                  ? 'localAdmin'
                  : 'member';
                const screenName =
                  isSuperAdmin || isLocalAdmin
                    ? `${userRole}-UserManagement`
                    : undefined;
                if (screenName) {
                  navigation.navigate(screenName);
                }
              }}
              disabled={!(isSuperAdmin || isLocalAdmin)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitleCount}>
                ({metrics.totalUsers.toLocaleString()} Users)
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.metricsGrid}>
            {metrics.metrics.map(metric => (
              <TouchableOpacity
                key={metric.id}
                style={styles.metricCard}
                onPress={() => handleMetricPress(metric.screenName)}
                activeOpacity={0.7}
                disabled={!metric.screenName}
              >
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
                <Text
                  style={styles.metricLabel}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {metric.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Assembly Mood Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>📊 Assembly Mood</Text>
          <TouchableOpacity
            onPress={() => {
              // Determine which assembly to show details for
              const assemblyToShow = isSuperAdmin
                ? selectedAssembly || user?.assignedAreas?.assemblySegment
                : user?.assignedAreas?.assemblySegment;
              
              if (assemblyToShow) {
                // Remove any suffixes like (ST), (SC) for matching
                const cleanAssemblyName = assemblyToShow.replace(/\s*\([^)]*\)\s*$/, '');
                // Determine the role-based screen name
                const userRole = isSuperAdmin
                  ? 'superAdmin'
                  : isLocalAdmin
                  ? 'localAdmin'
                  : 'member';
                const screenName = `${userRole}-AssemblyDetails`;
                navigation.navigate(screenName as any, {
                  assemblyName: cleanAssemblyName,
                });
              }
            }}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: `${colors.primary}15`,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
          >
            <MaterialIcons name="info" size={16} color={colors.primary} />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: colors.primary,
                letterSpacing: -0.1,
              }}
            >
              Info
            </Text>
          </TouchableOpacity>
        </View>

        {/* Show current filter status */}
        {!isSuperAdmin && user?.assignedAreas?.assemblySegment && (
          <Text style={styles.assemblyMoodFilterHint}>
            Showing data for:{' '}
            <Text style={styles.assemblyNameBold}>
              {user.assignedAreas.assemblySegment}
            </Text>
          </Text>
        )}
        {isSuperAdmin &&
          showMyAssemblyOnly &&
          user?.assignedAreas?.assemblySegment && (
            <Text style={styles.assemblyMoodFilterHint}>
              Showing data for:{' '}
              <Text style={styles.assemblyNameBold}>
                {user.assignedAreas.assemblySegment}
              </Text>
            </Text>
          )}
        {isSuperAdmin && !showMyAssemblyOnly && !selectedAssembly && (
          <Text style={styles.assemblyMoodFilterHint}>
            Showing data for all segments
          </Text>
        )}
        {isSuperAdmin && selectedAssembly && (
          <Text style={styles.assemblyMoodFilterHint}>
            Showing data for:{' '}
            <Text style={styles.assemblyNameBold}>
              {selectedAssembly}
            </Text>
          </Text>
        )}

        <AssemblyMoodCharts
          refreshKey={refreshKey}
          selectedAssembly={
            isSuperAdmin
              ? selectedAssembly
              : user?.assignedAreas?.assemblySegment || null
          }
          userAssemblySegment={user?.assignedAreas?.assemblySegment || null}
          isSuperAdmin={isSuperAdmin}
          showMyAssemblyOnly={!isSuperAdmin || showMyAssemblyOnly}
          colors={colors}
        />
      </View>

      {/* Top 3 Suggestions */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>💡 Top Suggestions</Text>
          {user?.assignedAreas?.assemblySegment && (
            <View style={styles.suggestionToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.suggestionToggleButton,
                  !showMyAssemblyOnlySuggestions && styles.suggestionToggleButtonActive,
                ]}
                onPress={() => setShowMyAssemblyOnlySuggestions(false)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.suggestionToggleText,
                    !showMyAssemblyOnlySuggestions && styles.suggestionToggleTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.suggestionToggleButton,
                  showMyAssemblyOnlySuggestions && styles.suggestionToggleButtonActive,
                ]}
                onPress={() => setShowMyAssemblyOnlySuggestions(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.suggestionToggleText,
                    showMyAssemblyOnlySuggestions && styles.suggestionToggleTextActive,
                  ]}
                >
                  My Assembly
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {topSuggestions.length > 0 ? (
          topSuggestions.map((suggestion, index) => {
            // Color grading for #1, #2, #3
            let rankBackground = colors.primary;
            let rankBorder = `${colors.primaryLight}80`;
            let rankTextColor = colors.textPrimary;

            if (index === 0) {
              // #1 - Gold
              rankBackground = '#FFD700';
              rankBorder = '#E6C200';
              rankTextColor = '#7A5300';
            } else if (index === 1) {
              // #2 - Silver
              rankBackground = '#C0C0C0';
              rankBorder = '#A0A0A0';
              rankTextColor = '#333333';
            } else if (index === 2) {
              // #3 - Bronze
              rankBackground = '#CD7F32';
              rankBorder = '#B56922';
              rankTextColor = '#FFFFFF';
            }

            return (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionCard}
                activeOpacity={0.8}
                onPress={() => setSelectedSuggestion(suggestion)}
              >
              <View style={styles.suggestionHeader}>
                <View
                  style={[
                    styles.suggestionRank,
                    { backgroundColor: rankBackground, borderColor: rankBorder },
                  ]}
                >
                  <Text
                    style={[
                      styles.suggestionRankText,
                      { color: rankTextColor },
                    ]}
                  >
                    #{index + 1}
                  </Text>
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
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 4,
                      }}
                    >
                      <Text
                        style={[
                          styles.suggestionAuthor,
                          { fontWeight: '800', color: colors.textPrimary },
                        ]}
                      >
                        {suggestion.authorName}
                      </Text>
                      {(() => {
                        const userPoints = getUserPoints(suggestion.authorName);
                        if (userPoints && userPoints > 0) {
                          return (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Text
                                style={[
                                  styles.suggestionAuthor,
                                  { fontWeight: '600' },
                                ]}
                              >
                                • Points: {userPoints.toLocaleString()}
                              </Text>
                              <UserBadge points={userPoints} size={14} />
                            </View>
                          );
                        }
                        return null;
                      })()}
                    </View>
                    {suggestion.assemblySegment && (
                      <View style={{ marginTop: 4 }}>
                        <Text style={styles.suggestionSegment}>
                          {suggestion.assemblySegment}
                        </Text>
                      </View>
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
            );
          })
        ) : (
          <View
            style={{
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              No suggestions available for your segment yet.
            </Text>
          </View>
        )}
      </View>

      {/* Top suggestion full details modal */}
      {selectedSuggestion && (
        <Modal
          visible={!!selectedSuggestion}
          transparent
          animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
          onRequestClose={() => setSelectedSuggestion(null)}
        >
          <View style={styles.suggestionModalBackdrop}>
            <View style={styles.suggestionModal}>
              <View style={styles.suggestionModalHeader}>
                <Text style={styles.suggestionModalTitle}>
                  {selectedSuggestion.title}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedSuggestion(null)}
                  style={styles.suggestionModalClose}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <MaterialIcons
                    name="close"
                    size={22}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
              {selectedSuggestion.description ? (
                <Text style={styles.suggestionModalBody}>
                  {selectedSuggestion.description}
                </Text>
              ) : null}
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};
