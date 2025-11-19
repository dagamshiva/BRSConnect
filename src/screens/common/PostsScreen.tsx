import { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../theme/colors';
import { useAppSelector } from '../../store/hooks';
import { selectAuth } from '../../store/slices/authSlice';
import { YouTubePlayer } from '../../components/embeds/YouTubePlayer';
import { useLocalPolls } from '../../context/LocalPollsContext';
import { AssemblySelector } from '../../components/AssemblySelector';
import { mockFeed } from '../../../mocks/mock_feed';
import {
  CATEGORY_OPTIONS,
  TYPE_TO_CATEGORY_MAP,
  SUMMARY_PREFIX_BY_TYPE,
  IMAGE_THUMBNAILS,
  VIDEO_THUMBNAILS,
  SUGGESTION_THUMBNAILS,
  randomElement,
  randomInt,
  formatTimeAgo,
  type Category,
} from '../../data/commonData';

type Scope = 'assembly' | 'trending';

interface FeedItem {
  id: string;
  scope: Scope;
  category: Category;
  title: string;
  summary: string;
  media: string;
  videoId?: string; // YouTube video ID for video posts
  videoUrl?: string;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  createdAt: string;
  assemblySegment?: string; // Optional
  aliasName: string;
}

interface LegacyFeedItem
  extends Omit<
    FeedItem,
    'videoUrl' | 'assemblySegment' | 'scope' | 'category'
  > {
  category: Category;
  scope: Scope;
  assemblySegment?: string;
}

type MockFeedItem = (typeof mockFeed)[number];

const buildSummary = (item: MockFeedItem): string => {
  const segment = item.areaScope?.assemblySegment ?? 'All Segments';
  const village = item.areaScope?.village ? ` • ${item.areaScope.village}` : '';
  const prefix = SUMMARY_PREFIX_BY_TYPE[item.type] ?? 'Update from';
  return `${prefix} ${segment}${village}.`;
};

const pickThumbnail = (type: MockFeedItem['type']): string => {
  switch (type) {
    case 'VIDEO':
      return randomElement(VIDEO_THUMBNAILS);
    case 'SUGGESTION':
      return randomElement(SUGGESTION_THUMBNAILS);
    default:
      return randomElement(IMAGE_THUMBNAILS);
  }
};

const seedFeeds: FeedItem[] = mockFeed.slice(0, 300).map(item => {
  const category = TYPE_TO_CATEGORY_MAP[item.type] ?? 'News';
  return {
    id: item.id,
    scope: 'assembly',
    category,
    title: item.title,
    summary: buildSummary(item),
    media: pickThumbnail(item.type),
    videoId: undefined,
    videoUrl: item.type === 'VIDEO' ? item.mediaUrl : undefined,
    likes: item.likes ?? randomInt(120, 1900),
    dislikes: item.dislikes ?? randomInt(5, 240),
    comments: randomInt(10, 120),
    shares: randomInt(4, 90),
    createdAt: item.postedAt,
    assemblySegment: item.areaScope?.assemblySegment,
    aliasName: item.authorName,
  };
});

const trendingIds = [...seedFeeds]
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 40)
  .map(item => item.id);

seedFeeds.forEach(item => {
  if (trendingIds.includes(item.id)) {
    item.scope = 'trending';
  }
});

const convertLegacyFeed = (item: LegacyFeedItem): FeedItem => {
  const fallbackMedia =
    item.media ||
    randomElement([
      ...IMAGE_THUMBNAILS,
      ...VIDEO_THUMBNAILS,
      ...SUGGESTION_THUMBNAILS,
    ]);
  const isVideo = item.category === 'Videos';
  const videoUrl = item.videoId
    ? `https://www.youtube.com/watch?v=${item.videoId}`
    : undefined;

  const summaryText =
    item.summary?.trim().length > 0
      ? item.summary
      : `Update shared by ${item.aliasName}`;

  return {
    ...item,
    scope: 'assembly',
    summary: summaryText,
    media: fallbackMedia,
    videoUrl: isVideo ? videoUrl ?? item.media : undefined,
    assemblySegment: item.assemblySegment,
  };
};

export const PostsScreen = (): React.ReactElement => {
  const navigation = useNavigation();
  const { polls, vote, updatePollReaction } = useLocalPolls();
  const auth = useAppSelector(selectAuth);
  const user = auth.user;
  
  // Get user's assembly segment from telanganaUsers
  const userAssemblySegment = user?.assignedAreas?.assemblySegment || null;
  
  const [scope, setScope] = useState<Scope>('assembly');
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [feeds, setFeeds] = useState<FeedItem[]>(seedFeeds);
  const [selectedAssemblySegment, setSelectedAssemblySegment] = useState<
    string | null
  >(null); // Default to null (shows "All")

  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    videoId: string;
    title?: string;
    summary?: string;
  } | null>(null);
  const [selectedPollOptions, setSelectedPollOptions] = useState<
    Record<string, string>
  >({});
  const [userReactions, setUserReactions] = useState<
    Record<string, 'like' | 'dislike'>
  >({});
  const [pollReactions, setPollReactions] = useState<
    Record<string, 'like' | 'dislike'>
  >({});
  const [userPollVotes, setUserPollVotes] = useState<Record<string, string>>(
    {},
  );

  const topTrending = useMemo(
    () => [...feeds].sort((a, b) => b.likes - a.likes).slice(0, 10),
    [feeds],
  );

  // Get top poll from polls context
  const topPoll = useMemo(() => {
    if (polls.length === 0) return null;
    const sorted = [...polls].sort(
      (a, b) =>
        b.options.reduce((sum, opt) => sum + opt.votes, 0) -
        a.options.reduce((sum, opt) => sum + opt.votes, 0),
    );
    return sorted[0];
  }, [polls]);

  const filteredFeeds = useMemo(() => {
    let pool =
      scope === 'trending'
        ? topTrending
        : feeds.filter(item => item.scope === 'assembly');

    // Filter by selected assembly segment if one is selected
    if (selectedAssemblySegment) {
      pool = pool.filter(
        item => item.assemblySegment === selectedAssemblySegment,
      );
    }

    // If filter is "All", filter by last 5 days and sort by likes
    if (filter === 'All') {
      const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
      pool = pool
        .filter(item => new Date(item.createdAt).getTime() >= fiveDaysAgo)
        .sort((a, b) => b.likes - a.likes);
    } else {
      pool = pool.filter(item => item.category === filter);
    }

    return pool;
  }, [feeds, filter, scope, topTrending, selectedAssemblySegment]);

  // Get polls to display when filter is "Polls"
  const displayPolls = useMemo(() => {
    if (filter !== 'Polls') return [];
    // Sort polls by likes (descending) - trending polls based on likes
    return [...polls].sort((a, b) => b.likes - a.likes);
  }, [polls, filter]);

  // Get trending suggestions to display when filter is "Suggestions"
  const displaySuggestions = useMemo(() => {
    if (filter !== 'Suggestions') return [];
    // Get all suggestions from feeds
    let suggestions = feeds.filter(item => item.category === 'Suggestions');

    // Filter by selected assembly segment if one is selected
    if (selectedAssemblySegment) {
      suggestions = suggestions.filter(
        item => item.assemblySegment === selectedAssemblySegment,
      );
    }

    // Sort by likes (descending) - trending suggestions
    return suggestions.sort((a, b) => b.likes - a.likes);
  }, [feeds, filter, selectedAssemblySegment]);

  const handleLike = (feedId: string) => {
    const currentReaction = userReactions[feedId];

    setFeeds(prev =>
      prev.map(item => {
        if (item.id !== feedId) return item;

        let newLikes = item.likes;
        let newDislikes = item.dislikes;

        if (currentReaction === 'like') {
          // Already liked, toggle off (decrement likes)
          newLikes = Math.max(0, item.likes - 1);
          setUserReactions(prevReactions => {
            const next = { ...prevReactions };
            delete next[feedId];
            return next;
          });
        } else {
          // Not liked or was disliked
          if (currentReaction === 'dislike') {
            // Was disliked, remove dislike and add like
            newDislikes = Math.max(0, item.dislikes - 1);
            newLikes = item.likes + 1;
          } else {
            // No previous reaction, just add like
            newLikes = item.likes + 1;
          }
          setUserReactions(prevReactions => ({
            ...prevReactions,
            [feedId]: 'like',
          }));
        }

        return { ...item, likes: newLikes, dislikes: newDislikes };
      }),
    );
  };

  const handleDislike = (feedId: string) => {
    const currentReaction = userReactions[feedId];

    setFeeds(prev =>
      prev.map(item => {
        if (item.id !== feedId) return item;

        let newLikes = item.likes;
        let newDislikes = item.dislikes;

        if (currentReaction === 'dislike') {
          // Already disliked, toggle off (decrement dislikes)
          newDislikes = Math.max(0, item.dislikes - 1);
          setUserReactions(prevReactions => {
            const next = { ...prevReactions };
            delete next[feedId];
            return next;
          });
        } else {
          // Not disliked or was liked
          if (currentReaction === 'like') {
            // Was liked, remove like and add dislike
            newLikes = Math.max(0, item.likes - 1);
            newDislikes = item.dislikes + 1;
          } else {
            // No previous reaction, just add dislike
            newDislikes = item.dislikes + 1;
          }
          setUserReactions(prevReactions => ({
            ...prevReactions,
            [feedId]: 'dislike',
          }));
        }

        return { ...item, likes: newLikes, dislikes: newDislikes };
      }),
    );
  };

  const handleDownloadOrShare = (item: FeedItem) => {
    if (item.category === 'Videos' && (item.videoId || item.videoUrl)) {
      // For videos, show options to download or share to WhatsApp
      Alert.alert(
        'Video Options',
        'What would you like to do?',
        [
          {
            text: 'Download Video',
            onPress: () => handleDownloadVideo(item),
          },
          {
            text: 'Share to WhatsApp',
            onPress: () => handleShareToWhatsApp(item),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true },
      );
    } else {
      // For images, share to WhatsApp directly
      handleShareToWhatsApp(item);
    }
  };

  const handleDownloadVideo = (item: FeedItem) => {
    if (item.videoUrl) {
      Linking.openURL(item.videoUrl).catch(() => {
        Alert.alert(
          'Unable to open video',
          'Please check the link or try again later.',
        );
      });
      return;
    }

    Alert.alert(
      'Download Video',
      item.videoId
        ? `Video "${item.title}" will open in YouTube.`
        : 'Video download will be available soon.',
      [
        {
          text: 'OK',
          onPress: () => {
            if (item.videoId) {
              const url = `https://www.youtube.com/watch?v=${item.videoId}`;
              Linking.openURL(url).catch(() => {
                Alert.alert('Unable to open YouTube link.');
              });
            }
          },
        },
      ],
    );
  };

  const handleShareToWhatsApp = (item: FeedItem) => {
    const message = `${item.title}\n\n${item.summary}`;
    const url = item.videoId
      ? `https://www.youtube.com/watch?v=${item.videoId}`
      : item.videoUrl ?? item.media;

    const fullMessage = `${message}\n\n${url}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
      fullMessage,
    )}`;

    // Try WhatsApp app first
    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          // Fallback to WhatsApp Web
          const webUrl = `https://wa.me/?text=${encodeURIComponent(
            fullMessage,
          )}`;
          return Linking.openURL(webUrl).catch(() => {
            Alert.alert(
              'WhatsApp Not Available',
              'Please install WhatsApp or use WhatsApp Web to share this content.',
              [{ text: 'OK' }],
            );
          });
        }
      })
      .catch(err => {
        console.error('Error opening WhatsApp:', err);
        // Fallback to WhatsApp Web
        const webUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
        Linking.openURL(webUrl).catch(() => {
          Alert.alert('Error', 'Unable to open WhatsApp.', [{ text: 'OK' }]);
        });
      });
  };

  const handlePollLike = (pollId: string) => {
    const currentReaction = pollReactions[pollId];

    // Update poll reactions state first
    if (currentReaction === 'like') {
      // Already liked, toggle off
      setPollReactions(prevReactions => {
        const next = { ...prevReactions };
        delete next[pollId];
        return next;
      });
      updatePollReaction(pollId, 'like', false);
    } else {
      // Not liked or was disliked - set to liked
      setPollReactions(prevReactions => ({
        ...prevReactions,
        [pollId]: 'like',
      }));
      if (currentReaction === 'dislike') {
        // Was disliked, remove dislike first
        updatePollReaction(pollId, 'dislike', false);
      }
      updatePollReaction(pollId, 'like', true);
    }
  };

  const handlePollDislike = (pollId: string) => {
    const currentReaction = pollReactions[pollId];

    // Update poll reactions state first
    if (currentReaction === 'dislike') {
      // Already disliked, toggle off
      setPollReactions(prevReactions => {
        const next = { ...prevReactions };
        delete next[pollId];
        return next;
      });
      updatePollReaction(pollId, 'dislike', false);
    } else {
      // Not disliked or was liked - set to disliked
      setPollReactions(prevReactions => ({
        ...prevReactions,
        [pollId]: 'dislike',
      }));
      if (currentReaction === 'like') {
        // Was liked, remove like first
        updatePollReaction(pollId, 'like', false);
      }
      updatePollReaction(pollId, 'dislike', true);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Assembly Feed</Text>
      <Text style={styles.pageSubtitle}>
        Showcase news, videos, polls, and fact-checks for your unit.
      </Text>

      <View style={styles.scopeRow}>
        <TouchableOpacity
          style={[
            styles.scopeTab,
            selectedAssemblySegment === userAssemblySegment &&
              styles.scopeTabActive,
          ]}
          onPress={() => {
            if (userAssemblySegment) {
              setSelectedAssemblySegment(userAssemblySegment);
            }
          }}
        >
          <Text
            style={[
              styles.scopeLabel,
              selectedAssemblySegment === userAssemblySegment &&
                styles.scopeLabelActive,
            ]}
          >
            {userAssemblySegment || 'My Assembly'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.scopeTab,
            !selectedAssemblySegment && styles.scopeTabActive,
          ]}
          onPress={() => {
            setFilter('All');
            setSelectedAssemblySegment(null);
          }}
        >
          <Text
            style={[
              styles.scopeLabel,
              !selectedAssemblySegment && styles.scopeLabelActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createFeedButton}
          onPress={() => {
            (navigation as any).navigate('CreateFeed', {
              onFeedCreated: (newFeed: LegacyFeedItem) => {
                setFeeds(prev => [convertLegacyFeed(newFeed), ...prev]);
              },
            });
          }}
        >
          <MaterialIcons
            name="add-circle"
            size={20}
            color={colors.textPrimary}
          />
          <Text style={styles.createFeedButtonText}>Create feed</Text>
        </TouchableOpacity>
      </View>

      {/* Assembly Segment Selector */}
      <AssemblySelector
        value={selectedAssemblySegment}
        onSelect={setSelectedAssemblySegment}
        placeholder="Select Assembly Segment"
        mode="dropdown"
      />

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <View style={styles.filterChipsContainer}>
          <TouchableOpacity
            style={[styles.chip, filter === 'All' && styles.chipActive]}
            onPress={() => setFilter('All')}
          >
            <Text
              style={[
                styles.chipText,
                filter === 'All' && styles.chipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORY_OPTIONS.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.chip, filter === option && styles.chipActive]}
              onPress={() => setFilter(option)}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === option && styles.chipTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Render Polls when filter is "Polls" */}
      {filter === 'Polls' && displayPolls.length > 0
        ? displayPolls.map(poll => {
            const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
            const percentage = (votes: number) =>
              total === 0 ? 0 : Math.round((votes / total) * 100);
            return (
              <View key={poll.id} style={styles.pollCard}>
                <View style={styles.pollHeader}>
                  <Text style={styles.pollStatus}>{poll.status}</Text>
                  <Text style={styles.pollVotes}>{total} votes</Text>
                </View>
                <Text style={styles.pollQuestion}>{poll.question}</Text>
                {poll.options.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.pollOption,
                      (selectedPollOptions[poll.id] === option.id ||
                        userPollVotes[poll.id] === option.id) &&
                        styles.pollOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedPollOptions(prev => ({
                        ...prev,
                        [poll.id]: option.id,
                      }));
                    }}
                  >
                    <View style={styles.pollOptionHeader}>
                      <Text style={styles.pollOptionLabel}>{option.label}</Text>
                      <Text style={styles.pollOptionVotes}>
                        {option.votes} votes
                      </Text>
                    </View>
                    <View style={styles.pollProgressTrack}>
                      <View
                        style={[
                          styles.pollProgressFill,
                          { width: `${percentage(option.votes)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.pollOptionPercentage}>
                      {percentage(option.votes)}%
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.pollVoteButton,
                    !selectedPollOptions[poll.id] &&
                      styles.pollVoteButtonDisabled,
                  ]}
                  onPress={() => {
                    const optionId = selectedPollOptions[poll.id];
                    if (optionId) {
                      const previousOptionId = userPollVotes[poll.id];
                      vote(poll.id, optionId, previousOptionId);
                      setUserPollVotes(prev => ({
                        ...prev,
                        [poll.id]: optionId,
                      }));
                      Alert.alert(
                        previousOptionId ? 'Vote updated' : 'Vote recorded',
                        previousOptionId
                          ? 'Your vote has been changed!'
                          : 'Thanks for taking the poll!',
                      );
                      // Clear selection after voting
                      setSelectedPollOptions(prev => {
                        const next = { ...prev };
                        delete next[poll.id];
                        return next;
                      });
                    }
                  }}
                  disabled={!selectedPollOptions[poll.id]}
                >
                  <MaterialIcons
                    name={userPollVotes[poll.id] ? 'edit' : 'how-to-vote'}
                    size={18}
                    color={colors.textPrimary}
                  />
                  <Text style={styles.pollVoteButtonText}>
                    {userPollVotes[poll.id] ? 'Change Vote' : 'Cast Vote'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.action,
                      pollReactions[poll.id] === 'like' && styles.actionActive,
                    ]}
                    onPress={() => handlePollLike(poll.id)}
                  >
                    <MaterialIcons
                      name="thumb-up"
                      size={18}
                      color={
                        pollReactions[poll.id] === 'like'
                          ? colors.success
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.actionText,
                        pollReactions[poll.id] === 'like' &&
                          styles.actionTextActive,
                      ]}
                    >
                      {poll.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.action,
                      pollReactions[poll.id] === 'dislike' &&
                        styles.actionActive,
                    ]}
                    onPress={() => handlePollDislike(poll.id)}
                  >
                    <MaterialIcons
                      name="thumb-down"
                      size={18}
                      color={
                        pollReactions[poll.id] === 'dislike'
                          ? colors.danger
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.actionText,
                        pollReactions[poll.id] === 'dislike' &&
                          styles.actionTextActive,
                      ]}
                    >
                      {poll.dislikes}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        : filter === 'Suggestions' && displaySuggestions.length > 0
        ? displaySuggestions.map(item => (
            <View key={item.id} style={styles.feedCard}>
              <View style={styles.feedHeader}>
                <View>
                  <Text style={styles.feedCategory}>{item.category}</Text>
                  <Text style={styles.feedTitle}>{item.title}</Text>
                  {item.assemblySegment && (
                    <Text style={styles.feedAssemblySegment}>
                      {item.assemblySegment}
                    </Text>
                  )}
                  <View style={styles.feedMeta}>
                    <Text style={styles.feedAliasName}>
                      Posted by {item.aliasName}
                    </Text>
                    <Text style={styles.feedTimestamp}>
                      {formatTimeAgo(item.createdAt)}
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name={item.scope === 'assembly' ? 'place' : 'auto-graph'}
                  size={20}
                  color={
                    item.scope === 'assembly' ? colors.accent : colors.primary
                  }
                />
              </View>
              <Text style={styles.feedSummary}>{item.summary}</Text>
              {item.media && (
                <TouchableOpacity onPress={() => setSelectedImage(item.media)}>
                  <Image
                    source={{ uri: item.media }}
                    style={styles.feedImage}
                  />
                </TouchableOpacity>
              )}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.action,
                    userReactions[item.id] === 'like' && styles.actionActive,
                  ]}
                  onPress={() => handleLike(item.id)}
                >
                  <MaterialIcons
                    name="thumb-up"
                    size={18}
                    color={
                      userReactions[item.id] === 'like'
                        ? colors.success
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.actionText,
                      userReactions[item.id] === 'like' &&
                        styles.actionTextActive,
                    ]}
                  >
                    {item.likes}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.action,
                    userReactions[item.id] === 'dislike' && styles.actionActive,
                  ]}
                  onPress={() => handleDislike(item.id)}
                >
                  <MaterialIcons
                    name="thumb-down"
                    size={18}
                    color={
                      userReactions[item.id] === 'dislike'
                        ? colors.danger
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.actionText,
                      userReactions[item.id] === 'dislike' &&
                        styles.actionTextActive,
                    ]}
                  >
                    {item.dislikes}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.action}>
                  <MaterialIcons
                    name="chat-bubble-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.actionText}>{item.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.action}
                  onPress={() => handleShareToWhatsApp(item)}
                >
                  <MaterialIcons
                    name="share"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.actionText}>{item.shares}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        : filter !== 'Polls' && filter !== 'Suggestions'
        ? filteredFeeds.map(item => (
            <View key={item.id} style={styles.feedCard}>
              <View style={styles.feedHeader}>
                <View>
                  <Text style={styles.feedCategory}>{item.category}</Text>
                  <Text style={styles.feedTitle}>{item.title}</Text>
                  {item.assemblySegment && (
                    <Text style={styles.feedAssemblySegment}>
                      {item.assemblySegment}
                    </Text>
                  )}
                  <View style={styles.feedMeta}>
                    <Text style={styles.feedAliasName}>
                      Posted by {item.aliasName}
                    </Text>
                    <Text style={styles.feedTimestamp}>
                      {formatTimeAgo(item.createdAt)}
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name={item.scope === 'assembly' ? 'place' : 'auto-graph'}
                  size={20}
                  color={
                    item.scope === 'assembly' ? colors.accent : colors.primary
                  }
                />
              </View>
              <Text style={styles.feedSummary}>{item.summary}</Text>
              {item.videoId ? (
                <TouchableOpacity
                  style={styles.videoThumbnail}
                  onPress={() => {
                    setSelectedVideo({
                      videoId: item.videoId!,
                      title: item.title,
                      summary: item.summary,
                    });
                  }}
                >
                  <Image
                    source={{ uri: item.media }}
                    style={styles.videoThumbnailImage}
                  />
                  <View style={styles.playButtonOverlay}>
                    <MaterialIcons
                      name="play-circle-filled"
                      size={64}
                      color={colors.textPrimary}
                    />
                  </View>
                </TouchableOpacity>
              ) : item.category === 'Videos' && item.videoUrl ? (
                <TouchableOpacity
                  style={styles.videoThumbnail}
                  onPress={() => handleOpenExternalVideo(item.videoUrl!)}
                >
                  <Image
                    source={{ uri: item.media }}
                    style={styles.videoThumbnailImage}
                  />
                  <View style={styles.playButtonOverlay}>
                    <MaterialIcons
                      name="play-circle-filled"
                      size={64}
                      color={colors.textPrimary}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setSelectedImage(item.media)}>
                  <Image
                    source={{ uri: item.media }}
                    style={styles.feedImage}
                  />
                </TouchableOpacity>
              )}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.action,
                    userReactions[item.id] === 'like' && styles.actionActive,
                  ]}
                  onPress={() => handleLike(item.id)}
                >
                  <MaterialIcons
                    name="thumb-up"
                    size={18}
                    color={
                      userReactions[item.id] === 'like'
                        ? colors.success
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.actionText,
                      userReactions[item.id] === 'like' &&
                        styles.actionTextActive,
                    ]}
                  >
                    {item.likes}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.action,
                    userReactions[item.id] === 'dislike' && styles.actionActive,
                  ]}
                  onPress={() => handleDislike(item.id)}
                >
                  <MaterialIcons
                    name="thumb-down"
                    size={18}
                    color={
                      userReactions[item.id] === 'dislike'
                        ? colors.danger
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.actionText,
                      userReactions[item.id] === 'dislike' &&
                        styles.actionTextActive,
                    ]}
                  >
                    {item.dislikes}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.action}
                  onPress={() => handleDownloadOrShare(item)}
                >
                  <MaterialIcons
                    name={item.videoId ? 'download' : 'share'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        : null}

      {filter === 'Polls' && displayPolls.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="hourglass-empty"
            size={28}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No polls yet</Text>
          <Text style={styles.emptySubtitle}>
            Create polls in the Polls section to see them here.
          </Text>
        </View>
      ) : filter === 'Suggestions' && displaySuggestions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="lightbulb-outline"
            size={28}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No suggestions yet</Text>
          <Text style={styles.emptySubtitle}>
            Create suggestions to see them here.
          </Text>
        </View>
      ) : filter !== 'Polls' &&
        filter !== 'Suggestions' &&
        filteredFeeds.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="feed" size={28} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No cards yet</Text>
          <Text style={styles.emptySubtitle}>
            Use the creator above to add demo feed entries.
          </Text>
        </View>
      ) : null}

      {/* Image Modal Viewer */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageModalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <View style={styles.imageModalContent}>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imageModalImage}
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity
                style={styles.imageModalCloseButton}
                onPress={() => setSelectedImage(null)}
              >
                <MaterialIcons
                  name="close"
                  size={28}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Video Popup Player */}
      <Modal
        visible={selectedVideo !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedVideo(null)}
      >
        <View style={styles.videoModalContainer}>
          <View style={styles.videoModalContent}>
            <View style={styles.videoModalHeader}>
              {selectedVideo?.title && (
                <Text style={styles.videoModalTitle} numberOfLines={2}>
                  {selectedVideo.title}
                </Text>
              )}
              <TouchableOpacity
                style={styles.videoModalCloseButton}
                onPress={() => setSelectedVideo(null)}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
            {selectedVideo && (
              <View style={styles.videoModalPlayer}>
                <YouTubePlayer
                  videoId={selectedVideo.videoId}
                  height={220}
                  play={true}
                />
              </View>
            )}
            {selectedVideo?.summary && (
              <View style={styles.videoModalSummary}>
                <Text style={styles.videoModalSummaryText}>
                  {selectedVideo.summary}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const handleOpenExternalVideo = (url: string) => {
  Linking.openURL(url).catch(() => {
    Alert.alert('Unable to open video link.');
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 20,
  },
  pageSubtitle: {
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 16,
  },
  content: {
    padding: 24,
    paddingBottom: 64,
    gap: 16,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
    marginBottom: 16,
  },
  scopeTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    minHeight: 44,
  },
  scopeTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scopeLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  scopeLabelActive: {
    color: colors.textPrimary,
  },
  filterRow: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assemblySelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  assemblySelectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    minHeight: 44,
  },
  assemblySelectorIcon: {
    marginRight: 4,
  },
  assemblySelectorText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  clearAssemblyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  assemblyDropdownContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    maxHeight: 300,
    overflow: 'hidden',
  },
  assemblySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 12,
    gap: 8,
  },
  assemblySearchIcon: {
    marginRight: 4,
  },
  assemblySearchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 4,
  },
  assemblyDropdownList: {
    maxHeight: 250,
  },
  assemblyDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  assemblyDropdownItemActive: {
    backgroundColor: colors.primary + '20',
  },
  assemblyDropdownItemText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  assemblyDropdownItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  createFeedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    minHeight: 44,
  },
  createFeedButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  composerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
    marginTop: 12,
  },
  composerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  composerTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    gap: 8,
  },
  mediaButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  mediaPreview: {
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mediaPreviewText: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 12,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInputContainer: {
    gap: 8,
  },
  mediaInputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  mediaInputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaInputButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  mediaInputButtonCancel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaInputButtonSave: {
    backgroundColor: colors.primary,
  },
  mediaInputButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  assemblySegmentContainer: {
    marginBottom: 12,
    position: 'relative',
    zIndex: 10,
  },
  assemblySegmentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  assemblySegmentIcon: {
    marginRight: 8,
  },
  assemblySegmentInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 10,
  },
  assemblySegmentDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  assemblySegmentDropdownList: {
    maxHeight: 200,
  },
  assemblySegmentDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  assemblySegmentDropdownItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  assemblySegmentClearButton: {
    padding: 4,
  },
  feedCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedCategory: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  feedTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  feedAssemblySegment: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  feedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  feedAliasName: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  feedTimestamp: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '400',
  },
  feedSummary: {
    color: colors.textSecondary,
  },
  feedImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  videoThumbnail: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  videoThumbnailImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  closeVideoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.danger,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionActive: {
    opacity: 1,
  },
  actionText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    gap: 6,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Image Modal Styles
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageModalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Video Modal Styles
  videoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  videoModalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  videoModalTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  videoModalCloseButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoModalPlayer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoModalSummary: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  videoModalSummaryText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  // Poll Styles (used when filter is "Polls")
  pollCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginTop: 16,
    gap: 12,
  },
  pollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pollStatus: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  pollVotes: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  pollQuestion: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  pollOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  pollOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pollOptionDisabled: {
    opacity: 0.6,
  },
  pollOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollOptionLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  pollOptionVotes: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  pollProgressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  pollProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  pollOptionPercentage: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pollVoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  pollVoteButtonDisabled: {
    opacity: 0.6,
  },
  pollVoteButtonVoted: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.success,
  },
  pollVoteButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  pollVoteButtonTextVoted: {
    color: colors.success,
  },
});
