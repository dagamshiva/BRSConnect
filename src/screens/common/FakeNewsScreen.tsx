import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '../../theme/useTheme';
import { UserBadge } from '../../components/UserBadge';
import { TweetEmbed } from '../../components/embeds/TweetEmbed';
import { mockFeed } from '../../../mocks/mock_feed';
import { telanganaUsers } from '../../../mocks/telangana_user';
import {
  FALLBACK_IMAGES,
  randomElement,
  randomInt,
  formatReportedAt,
} from '../../data/commonData';

interface FakeNewsItem {
  id: string;
  title: string;
  description: { reporter: string; rest: string };
  media: string;
  mediaUrl?: string;
  votesTrue: number;
  votesFake: number;
  aliasName: string;
  reportedAt: string;
  postedBy: string;
}

const buildDescription = (
  item: (typeof mockFeed)[number],
): { reporter: string; rest: string } => {
  // Special handling for ScribeFactCheck items
  if (item.id === 'fn-top-1-scribe-factcheck') {
    return {
      reporter: 'Fact Check Team',
      rest: ' reported: False claims about industrial land allocation in Hyderabad. The allegations about 9292 acres and ₹5 lakh crores are unsubstantiated and misleading. All land allocations follow proper legal procedures and due process.',
    };
  }
  if (item.id === 'fn-top-2-scribe-factcheck') {
    return {
      reporter: 'Verification Team',
      rest: ' reported: Misleading claims about sand mafia and check dams. The allegations lack proper verification and context. Environmental protection and legal compliance are priorities, with strict enforcement mechanisms in place.',
    };
  }
  if (item.id === 'fn-top-3-scribe-factcheck') {
    return {
      reporter: 'Legal Review Team',
      rest: ' reported: Unverified claims about BC reservations and election schedules. Court cases follow proper legal procedures, and all decisions respect due process. Speculation about court decisions before they are announced is misleading.',
    };
  }

  // Default description for other items
  const assembly = item.areaScope?.assemblySegment ?? 'statewide';
  const village = item.areaScope?.village ? ` • ${item.areaScope.village}` : '';
  const reporter = item.authorName ?? 'field teams';
  const rest = ` flagged this rumour in ${assembly}${village}. Fact-check requested for broadcast correction.`;
  return { reporter, rest };
};

// formatReportedAt is imported from commonData

// Helper to get user name from UUID
const getUserName = (userId: string | undefined | null): string => {
  if (!userId) return 'Unknown';
  const user = telanganaUsers.find(u => u.id === userId);
  return user ? user.aliasName || user.name || 'Unknown' : userId;
};

// Helper function to get user points by aliasName or name
const getUserPoints = (aliasNameOrName: string): number | null => {
  const user = telanganaUsers.find(
    u =>
      u.aliasName?.toLowerCase() === aliasNameOrName.toLowerCase() ||
      u.name?.toLowerCase() === aliasNameOrName.toLowerCase(),
  );
  return user?.points ?? null;
};

const feedFakeNews = mockFeed
  .filter(item => item.type === 'FAKE_NEWS')
  .map(item => ({
    id: item.id,
    title: item.title,
    description: buildDescription(item),
    media:
      item.media ??
      item.mediaUrl ??
      randomElement(FALLBACK_IMAGES) ??
      FALLBACK_IMAGES[0],
    mediaUrl: item.mediaUrl,
    votesTrue: item.dislikes ?? randomInt(5, 60),
    votesFake: item.likes ?? randomInt(80, 400),
    aliasName: item.authorName ?? 'Command Center',
    reportedAt: item.postedAt ?? new Date().toISOString(),
    postedBy: getUserName(item.postedBy) || item.authorName || 'Unknown',
  }));

const seedReports: FakeNewsItem[] =
  feedFakeNews.length > 0
    ? feedFakeNews
    : [
        {
          id: 'fn-fallback-1',
          title: 'No fake news detected',
          description: {
            reporter: 'Command Center',
            rest: ' reports all clear. Submit a rumour report to simulate review flow.',
          },
          media: randomElement(FALLBACK_IMAGES),
          votesTrue: 0,
          votesFake: 0,
          aliasName: 'Command Center',
          reportedAt: new Date().toISOString(),
          postedBy: 'Command Center',
        },
      ];

// IDs of top fact-check items from ScribeFactCheck that should be pinned at the top
const PINNED_FAKE_NEWS_IDS = new Set<string>([
  'fn-top-1-scribe-factcheck',
  'fn-top-2-scribe-factcheck',
  'fn-top-3-scribe-factcheck',
]);

export const FakeNewsScreen = (): React.ReactElement => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const colors = useTheme();
  const [reports, setReports] = useState<FakeNewsItem[]>(seedReports);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const titleInputRef = useRef<TextInput>(null);

  const topTen = useMemo(() => {
    const copy = [...reports];

    // Split into pinned and other items
    const pinned = copy.filter(item => PINNED_FAKE_NEWS_IDS.has(item.id));
    const others = copy.filter(item => !PINNED_FAKE_NEWS_IDS.has(item.id));

    // Sort pinned items by total votes (fake + true) descending
    pinned.sort(
      (a, b) => b.votesFake + b.votesTrue - (a.votesFake + a.votesTrue),
    );

    // Sort remaining items by total votes (fake + true) descending
    others.sort(
      (a, b) => b.votesFake + b.votesTrue - (a.votesFake + a.votesTrue),
    );

    // Pinned items should always appear first
    return [...pinned, ...others].slice(0, 10);
  }, [reports]);

  const focusComposer = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 300);
    });
  }, []);

  useEffect(() => {
    if ((route?.params as any)?.openComposer) {
      focusComposer();
      navigation.setParams?.({
        ...(route.params as Record<string, unknown>),
        openComposer: false,
      });
    }
  }, [route?.params, navigation, focusComposer]);

  const handleVote = (id: string, type: 'true' | 'fake') => {
    setReports(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              votesTrue: type === 'true' ? item.votesTrue + 1 : item.votesTrue,
              votesFake: type === 'fake' ? item.votesFake + 1 : item.votesFake,
            }
          : item,
      ),
    );
  };

  const handleCreateReport = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Add details', 'Please include a title and description.');
      return;
    }
    if (!media.trim()) {
      Alert.alert('Proof required', 'Add an image or video link as proof.');
      return;
    }
    const next: FakeNewsItem = {
      id: `demo-${Date.now()}`,
      title: title.trim(),
      description: {
        reporter: 'Field Reporter',
        rest: ` reported: ${description.trim()}`,
      },
      media: media.trim(),
      votesTrue: 0,
      votesFake: 0,
      aliasName: 'Field Reporter',
      reportedAt: new Date().toISOString(),
      postedBy: 'Field Reporter',
    };
    setReports(prev => [next, ...prev]);
    setTitle('');
    setDescription('');
    setMedia('');
    Alert.alert('Saved locally', 'Fake news report added for demo.');
  };

  // Create dynamic styles based on current theme
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          padding: 24,
          paddingBottom: 64,
          gap: 20,
        },
        pageTitle: {
          color: colors.textPrimary,
          fontSize: 28,
          fontWeight: '800',
          marginTop: 20,
          letterSpacing: -0.5,
        },
        pageSubtitle: {
          color: colors.textSecondary,
          marginTop: 6,
          marginBottom: 16,
          fontWeight: '600',
          letterSpacing: -0.2,
        },
        composer: {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          gap: 12,
        },
        composerTitle: {
          color: colors.textPrimary,
          fontWeight: '700',
          fontSize: 16,
        },
        input: {
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          color: colors.textPrimary,
        },
        inputMultiline: {
          minHeight: 90,
          textAlignVertical: 'top',
        },
        addButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: `${colors.primary}20`,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 18,
        },
        addButtonText: {
          color: colors.primary,
          fontWeight: '800',
          fontSize: 15,
          letterSpacing: -0.2,
        },
        sectionTitle: {
          color: colors.textPrimary,
          fontSize: 20,
          fontWeight: '700',
          marginTop: 12,
        },
        card: {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: `${colors.primary}40`,
          padding: 16,
          marginTop: 14,
          gap: 12,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
        },
        cardHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        cardTitle: {
          color: colors.textPrimary,
          fontWeight: '700',
          flex: 1,
        },
        cardImage: {
          width: '100%',
          height: 170,
          borderRadius: 12,
        },
        twitterEmbedContainer: {
          marginVertical: 8,
          borderRadius: 12,
          overflow: 'hidden',
        },
        cardDescription: {
          color: colors.textSecondary,
          lineHeight: 18,
        },
        reporterName: {
          fontWeight: '700',
          color: colors.textPrimary,
        },
        metaRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
        },
        metaLabel: {
          color: colors.textSecondary,
          fontSize: 12,
        },
        metaValue: {
          color: colors.textPrimary,
          fontSize: 12,
          fontWeight: '600',
        },
        voteRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 12,
        },
        voteButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        voteText: {
          color: colors.textPrimary,
          fontWeight: '600',
        },
        emptyState: {
          alignItems: 'center',
          marginTop: 48,
          gap: 8,
        },
        emptyTitle: {
          color: colors.textPrimary,
          fontWeight: '700',
        },
        emptySubtitle: {
          color: colors.textSecondary,
          fontSize: 12,
          textAlign: 'center',
        },
      }),
    [colors],
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.pageTitle}>Fake News Radar</Text>

      <Text style={styles.sectionTitle}>Fake News (Top 10)</Text>
      {topTen.map(item => {
        const twitterUrl =
          item.mediaUrl &&
          /(?:twitter\.com|x\.com)\/\w+\/status\//i.test(item.mediaUrl)
            ? item.mediaUrl
            : null;

        return (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="error" size={18} color={colors.danger} />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            {twitterUrl ? (
              <View style={styles.twitterEmbedContainer}>
                <TweetEmbed url={twitterUrl} height={400} />
              </View>
            ) : (
              <Image source={{ uri: item.media }} style={styles.cardImage} />
            )}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Reported by</Text>
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
                    styles.metaValue,
                    { fontWeight: '800', color: colors.textPrimary },
                  ]}
                >
                  {item.aliasName}
                </Text>
                {(() => {
                  const userPoints = getUserPoints(item.aliasName);
                  if (userPoints !== null && userPoints !== undefined) {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Text style={[styles.metaValue, { fontWeight: '600' }]}>
                          • Points: {userPoints.toLocaleString()}
                        </Text>
                        <UserBadge points={userPoints} size={14} />
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Reported date</Text>
              <Text style={styles.metaValue}>
                {formatReportedAt(item.reportedAt)}
              </Text>
            </View>

            <Text style={styles.cardDescription}>
              <Text style={styles.reporterName}>
                {item.description.reporter}
              </Text>
              {item.description.rest}
            </Text>
            <View style={styles.voteRow}>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => handleVote(item.id, 'true')}
              >
                <MaterialIcons
                  name="thumb-up"
                  size={18}
                  color={colors.success}
                />
                <Text style={styles.voteText}>{item.votesTrue} true</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => handleVote(item.id, 'fake')}
              >
                <MaterialIcons
                  name="thumb-down"
                  size={18}
                  color={colors.danger}
                />
                <Text style={styles.voteText}>{item.votesFake} fake</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {topTen.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="verified" size={32} color={colors.success} />
          <Text style={styles.emptyTitle}>No fake news detected</Text>
          <Text style={styles.emptySubtitle}>
            Use the form above to add demo cases for review.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};
