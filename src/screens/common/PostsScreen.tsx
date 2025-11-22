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

import { useTheme } from '../../theme/useTheme';
import { useAppSelector } from '../../store/hooks';
import { selectAuth } from '../../store/slices/authSlice';
import { YouTubePlayer } from '../../components/embeds/YouTubePlayer';
import { TweetEmbed } from '../../components/embeds/TweetEmbed';
import { useLocalPolls } from '../../context/LocalPollsContext';
import { AssemblySelector } from '../../components/AssemblySelector';
import { UserBadge } from '../../components/UserBadge';
import { mockFeed } from '../../../mocks/mock_feed';
import { telanganaUsers } from '../../../mocks/telangana_user';
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
type SortMode = 'latest' | 'mostLiked';

interface FeedItem {
  id: string;
  scope: Scope;
  category: Category;
  title: string;
  summary: string;
  media: string;
  videoId?: string; // YouTube video ID for video posts
  videoUrl?: string;
  videoPlatform?: 'YouTube' | 'Twitter' | 'Instagram';
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

// Helper function to build Instagram thumbnail URL
// Defined early to ensure it's available when seedFeeds is evaluated
function buildInstagramThumbnail(url: string | undefined | null): string | null {
  // Guard against undefined/null/empty URLs
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Handle Instagram posts and reels: /p/{shortcode} or /reel/{shortcode}
  const postReelMatch = url.match(
    /instagram\.com\/(?:p|reel|reels|tv)\/([^/?#]+)/i,
  );
  if (postReelMatch?.[1]) {
    const shortcode = postReelMatch[1];
    // Use Instagram's media endpoint for thumbnail (works for public posts/reels)
    return `https://www.instagram.com/p/${shortcode}/media/?size=l`;
  }
  
  // Handle Instagram stories: /stories/{username}/{storyId}
  const storyMatch = url.match(
    /instagram\.com\/stories\/([^/]+)\/([^/?#]+)/i,
  );
  if (storyMatch?.[1] && storyMatch?.[2]) {
    // For stories, we can't easily get thumbnails without authentication
    // Return null and use a placeholder thumbnail instead
    // The component should handle this with a fallback
    return null;
  }
  
  return null;
}

const buildSummary = (item: MockFeedItem): string => {
  const segment = item.areaScope?.assemblySegment ?? 'All Segments';
  const village = item.areaScope?.village ? ` • ${item.areaScope.village}` : '';
  const prefix = SUMMARY_PREFIX_BY_TYPE[item.type] ?? 'Update from';
  return `${prefix} ${segment}${village}.`;
};

// Helper function to get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId: string): string => {
  // Try maxresdefault first (highest quality), fallback to hqdefault
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Helper function to get Twitter media preview URL
// Note: In production, you'd fetch from Twitter's oEmbed API or use a backend service
const getTwitterMediaUrl = (url: string): string | null => {
  // Twitter oEmbed endpoint (public, no auth required for basic preview)
  // Format: https://publish.twitter.com/oembed?url={tweet_url}
  // This returns JSON with thumbnail, but requires async fetch
  // For now, we'll use a service that provides direct image URLs
  // You can use services like linkpreview.net, opengraph.io, or implement backend fetching
  
  // For immediate display, we can try constructing a preview URL
  // Some services provide direct image URLs, but they require API keys
  // Returning null will use fallback thumbnail
  return null;
};

// Helper function to get Instagram media preview URL
// Note: Instagram requires authentication for their API
// In production, use Instagram Basic Display API or a backend service
const getInstagramMediaUrl = (url: string): string | null => {
  // Instagram oEmbed endpoint: https://api.instagram.com/oembed?url={post_url}
  // This also requires async fetch and may have CORS restrictions
  // For production, implement this via your backend
  return null;
};

const pickThumbnail = (
  type: MockFeedItem['type'],
  videoId?: string,
  videoUrl?: string,
  videoPlatform?: 'YouTube' | 'Twitter' | 'Instagram',
): string => {
  // If it's a YouTube video with videoId, use actual YouTube thumbnail
  if (videoPlatform === 'YouTube' && videoId) {
    return getYouTubeThumbnail(videoId);
  }
  
  // For Twitter: Don't set a thumbnail - we show TweetEmbed directly
  // The media field won't be used for Twitter posts
  if (videoPlatform === 'Twitter') {
    // Return a placeholder that won't be displayed (TweetEmbed is shown instead)
    return randomElement(IMAGE_THUMBNAILS);
  }
  
  // For Instagram: Try to build thumbnail URL, fallback to random thumbnail if it fails
  if (videoPlatform === 'Instagram') {
    // Try to extract URL from videoUrl or other sources
    if (videoUrl) {
      const thumbnailUrl = buildInstagramThumbnail(videoUrl);
      if (thumbnailUrl) {
        return thumbnailUrl;
      }
    }
    // Fallback to random thumbnail if we can't build a proper URL (e.g., stories)
    return randomElement(VIDEO_THUMBNAILS);
  }
  
  // Fallback to random thumbnails
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
  
  // Extract YouTube video ID if it's a YouTube URL
  let videoId: string | undefined = undefined;
  if (item.mediaUrl) {
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = item.mediaUrl.match(youtubeRegex);
    if (match && match[1]) {
      videoId = match[1];
    }
  }
  
  // Get videoPlatform from item if it exists (for new items), otherwise detect from URL
  // Check for videoPlatform and mediaUrl regardless of item type (NEWS can have Twitter/YouTube URLs)
  let videoPlatform: 'YouTube' | 'Twitter' | 'Instagram' | undefined = undefined;
  if ((item as any).videoPlatform) {
    videoPlatform = (item as any).videoPlatform;
  } else if (item.mediaUrl) {
    // Auto-detect platform from URL
    if (/youtube\.com|youtu\.be/i.test(item.mediaUrl)) {
      videoPlatform = 'YouTube';
    } else if (/(?:twitter\.com|x\.com)\/\w+\/status\//i.test(item.mediaUrl) || /t\.co\/\w+/i.test(item.mediaUrl)) {
      videoPlatform = 'Twitter';
    } else if (/instagram\.com\/(?:p|reel|tv|reels|stories)\//i.test(item.mediaUrl)) {
      videoPlatform = 'Instagram';
    }
  }
  
  // If mediaUrl contains a social media URL, treat it as videoUrl
  // This handles NEWS items with Twitter/YouTube/Instagram URLs
  const hasSocialMediaUrl = videoPlatform !== undefined && item.mediaUrl;
  const videoUrl = hasSocialMediaUrl ? item.mediaUrl : (item.type === 'VIDEO' ? item.mediaUrl : undefined);
  
  return {
    id: item.id,
    scope: 'assembly',
    category,
    title: item.title,
    summary: buildSummary(item),
    media: pickThumbnail(item.type, videoId, videoUrl, videoPlatform),
    videoId,
    videoUrl,
    videoPlatform,
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

  // Detect video platform from URL if available
  let videoPlatform: 'YouTube' | 'Twitter' | 'Instagram' | undefined = undefined;
  if (isVideo && (videoUrl || item.videoUrl)) {
    const url = videoUrl || item.videoUrl || '';
    if (/youtube\.com|youtu\.be/i.test(url)) {
      videoPlatform = 'YouTube';
    } else if (/(?:twitter\.com|x\.com)\/\w+\/status\//i.test(url) || /t\.co\/\w+/i.test(url)) {
      videoPlatform = 'Twitter';
    } else if (/instagram\.com\/(?:p|reel|tv|reels|stories)\//i.test(url)) {
      videoPlatform = 'Instagram';
    }
  }

  return {
    ...item,
    scope: 'assembly',
    summary: summaryText,
    media: fallbackMedia,
    videoUrl: isVideo ? videoUrl ?? item.media : undefined,
    videoPlatform,
    assemblySegment: item.assemblySegment,
  };
};

// Helper function to extract Twitter URL from feed item
const extractTwitterUrl = (item: FeedItem): string | null => {
  // If videoPlatform is explicitly Twitter, return videoUrl directly
  if (item.videoPlatform === 'Twitter' && item.videoUrl) {
    return item.videoUrl;
  }
  
  // Check videoUrl first (for Videos category and News with social media URLs)
  if (item.videoUrl) {
    const twitterMatch = item.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i);
    if (twitterMatch) {
      return twitterMatch[0].startsWith('http') ? twitterMatch[0] : `https://${twitterMatch[0]}`;
    }
  }
  
  // Check summary for Twitter URLs (for News category)
  if (item.summary) {
    const twitterMatch = item.summary.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i);
    if (twitterMatch) {
      return twitterMatch[0].startsWith('http') ? twitterMatch[0] : `https://${twitterMatch[0]}`;
    }
  }
  
  // Also check media field in case URL is stored there
  if (item.media && typeof item.media === 'string') {
    const twitterMatch = item.media.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i);
    if (twitterMatch) {
      return twitterMatch[0].startsWith('http') ? twitterMatch[0] : `https://${twitterMatch[0]}`;
    }
  }
  
  return null;
};

// Helper function to extract YouTube URL from feed item
const extractYouTubeUrl = (item: FeedItem): string | null => {
  if (item.videoId) {
    return `https://www.youtube.com/watch?v=${item.videoId}`;
  }
  
  if (item.videoUrl) {
    const youtubeMatch = item.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (youtubeMatch) {
      return youtubeMatch[0].startsWith('http') ? youtubeMatch[0] : `https://${youtubeMatch[0]}`;
    }
  }
  
  if (item.summary) {
    const youtubeMatch = item.summary.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (youtubeMatch) {
      return youtubeMatch[0].startsWith('http') ? youtubeMatch[0] : `https://${youtubeMatch[0]}`;
    }
  }
  
  return null;
};

// Helper function to extract Instagram URL from feed item
const extractInstagramUrl = (item: FeedItem): string | null => {
  // If videoPlatform is explicitly Instagram, return videoUrl directly
  if (item.videoPlatform === 'Instagram' && item.videoUrl) {
    return item.videoUrl;
  }
  
  // Check videoUrl first
  if (item.videoUrl) {
    const instagramMatch = item.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv|reels|stories)\/[^/\s?#]+/i);
    if (instagramMatch) {
      return instagramMatch[0].startsWith('http') ? instagramMatch[0] : `https://${instagramMatch[0]}`;
    }
  }
  
  // Check summary for Instagram URLs (including stories)
  if (item.summary) {
    const instagramMatch = item.summary.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv|reels|stories)\/[^/\s?#]+/i);
    if (instagramMatch) {
      return instagramMatch[0].startsWith('http') ? instagramMatch[0] : `https://${instagramMatch[0]}`;
    }
  }
  
  // Also check media field in case URL is stored there
  if (item.media && typeof item.media === 'string') {
    const instagramMatch = item.media.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv|reels|stories)\/[^/\s?#]+/i);
    if (instagramMatch) {
      return instagramMatch[0].startsWith('http') ? instagramMatch[0] : `https://${instagramMatch[0]}`;
    }
  }
  
  return null;
};

// Helper function to check if post is from social media platforms
const isSocialMediaPost = (item: FeedItem): boolean => {
  // Check if videoPlatform is explicitly set to social media
  if (item.videoPlatform === 'Twitter' || item.videoPlatform === 'Instagram' || item.videoPlatform === 'YouTube') {
    return true;
  }
  
  // Check for social media URLs
  const twitterUrl = extractTwitterUrl(item);
  const instagramUrl = extractInstagramUrl(item);
  const youtubeUrl = extractYouTubeUrl(item);
  const hasFacebookUrl = item.media?.match(/facebook\.com|fb\.com/i) || 
                         item.videoUrl?.match(/facebook\.com|fb\.com/i) ||
                         item.summary?.match(/facebook\.com|fb\.com/i);
  
  return !!(twitterUrl || instagramUrl || youtubeUrl || hasFacebookUrl);
};

// Helper function to download image or video
const handleDownloadImage = (mediaUrl: string, isVideo: boolean = false) => {
  const mediaType = isVideo ? 'Video' : 'Image';
  Alert.alert(
    `Download ${mediaType}`,
    `Choose how you want to download:`,
    [
      {
        text: 'Open in Browser',
        onPress: () => {
          Linking.openURL(mediaUrl).catch(() => {
            Alert.alert('Error', `Unable to open ${mediaType.toLowerCase()} URL.`);
          });
        },
      },
      {
        text: 'Download Instructions',
        onPress: () => {
          Alert.alert(
            'Download Instructions',
            `To download the ${mediaType.toLowerCase()}:\n\n1. Open the ${mediaType.toLowerCase()} in browser\n2. Long press on the ${mediaType.toLowerCase()}\n3. Select "Save ${mediaType}" or "Download ${mediaType}"\n\nYou can also use ${mediaType.toLowerCase()} downloader apps from app store.`,
            [{ text: 'OK' }],
          );
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
  );
};

// Helper function to remove URLs from text
const removeUrlsFromText = (text: string): string => {
  // Remove Twitter URLs
  text = text.replace(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/gi, '');
  // Remove YouTube URLs
  text = text.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/gi, '');
  // Remove Instagram URLs (including stories)
  text = text.replace(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv|reels|stories)\/[^/\s?#]+/gi, '');
  // Clean up extra spaces
  text = text.replace(/\s+/g, ' ').trim();
  return text;
};

// Helper function to get user points by aliasName or name
const getUserPoints = (aliasNameOrName: string): number | null | undefined => {
  if (!aliasNameOrName) return null;
  const user = telanganaUsers.find(
    u =>
      u.aliasName?.toLowerCase() === aliasNameOrName.toLowerCase() ||
      u.name?.toLowerCase() === aliasNameOrName.toLowerCase(),
  );
  return user?.points ?? null;
};

export const PostsScreen = (): React.ReactElement => {
  const navigation = useNavigation();
  const colors = useTheme();
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
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);

  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    videoId?: string;
    videoUrl?: string;
    platform?: 'YouTube' | 'Twitter' | 'Instagram';
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
  const [userBookmarks, setUserBookmarks] = useState<Set<string>>(
    new Set(user?.bookmarks || []),
  );

  // Bookmark handler
  const handleToggleBookmark = (feedId: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please login to bookmark feeds.');
      return;
    }

    const newBookmarks = new Set(userBookmarks);
    if (newBookmarks.has(feedId)) {
      newBookmarks.delete(feedId);
    } else {
      newBookmarks.add(feedId);
    }
    setUserBookmarks(newBookmarks);

    // Update telanganaUsers array
    const userIndex = telanganaUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      telanganaUsers[userIndex].bookmarks = Array.from(newBookmarks);
    }
  };

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

    // Filter by category type first
    if (filter === 'All') {
      // If filter is "All", filter by last 5 days
      const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
      pool = pool.filter(
        item => new Date(item.createdAt).getTime() >= fiveDaysAgo,
      );
    } else {
      // Filter by specific category
      pool = pool.filter(item => item.category === filter);
    }

    // Apply ordering based on sortMode
    // If order is "latest" → order by "postedAt" (createdAt) desc
    // If order is "mostLiked" → order by "likes" desc
    const sortedPool = [...pool].sort((a, b) => {
      if (sortMode === 'latest') {
        // Order by postedAt descending (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortMode === 'mostLiked') {
        // Order by likes descending (most liked first)
        return b.likes - a.likes;
      }
      // Default to latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sortedPool;
  }, [feeds, filter, scope, topTrending, selectedAssemblySegment, sortMode]);

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

  // Handle download for Instagram videos
  const handleDownloadInstagramVideo = (item: FeedItem) => {
    const instagramUrl = extractInstagramUrl(item);
    if (!instagramUrl) {
      Alert.alert('Error', 'Instagram URL not found.');
      return;
    }

    Alert.alert(
      'Download Instagram Video',
      'Choose how you want to download:',
      [
        {
          text: 'Open in Instagram',
          onPress: () => {
            Linking.openURL(instagramUrl).catch(() => {
              Alert.alert('Error', 'Unable to open Instagram link.');
            });
          },
        },
        {
          text: 'Download Instructions',
          onPress: () => {
            Linking.openURL(instagramUrl).catch(() => {
              Alert.alert('Error', 'Unable to open Instagram link.');
            });
            setTimeout(() => {
              Alert.alert(
                'How to Download',
                'To download Instagram videos:\n\n1. Open the video in Instagram app/browser\n2. For public posts: Long press and select "Save" or use browser download tools\n3. Use Instagram downloader websites/services\n4. Use video downloader apps from app store',
              );
            }, 500);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  // Handle download for Twitter/X videos
  const handleDownloadTwitterVideo = (item: FeedItem) => {
    const twitterUrl = extractTwitterUrl(item);
    if (!twitterUrl) {
      Alert.alert('Error', 'Twitter URL not found.');
      return;
    }

    Alert.alert(
      'Download Twitter Video',
      'Choose how you want to download:',
      [
        {
          text: 'Open in X/Twitter',
          onPress: () => {
            Linking.openURL(twitterUrl).catch(() => {
              Alert.alert('Error', 'Unable to open Twitter link.');
            });
          },
        },
        {
          text: 'Download via Browser',
          onPress: () => {
            Linking.openURL(twitterUrl).catch(() => {
              Alert.alert('Error', 'Unable to open Twitter link.');
            });
            Alert.alert(
              'Download Instructions',
              'To download:\n1. Open the tweet in browser\n2. Right-click/long press on the video\n3. Select "Save Video" or use a downloader tool\n\nYou can also use Twitter video downloader websites.',
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
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

  // Create dynamic styles based on current theme
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    createFeedButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 18,
      gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    createFeedButtonText: {
      color: colors.textPrimary,
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: -0.2,
    },
    filterRow: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      gap: 10,
    },
    filterHeader: {
      paddingVertical: 4,
    },
    filterHeaderContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filterHeaderLabels: {
      flexDirection: 'row',
      gap: 16,
      flex: 1,
    },
    filterSection: {
      gap: 6,
      paddingTop: 4,
    },
    filterLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 2,
    },
    filterValue: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    filterChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
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
    feedCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: `${colors.primary}40`,
      padding: 16,
      marginTop: 12,
      gap: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
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
      fontSize: 17,
      fontWeight: '800',
      marginTop: 4,
      letterSpacing: -0.3,
      lineHeight: 22,
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
    twitterEmbedContainer: {
      marginVertical: 8,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    platformButtonsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginVertical: 8,
    },
    platformButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
    },
    twitterButton: {
      backgroundColor: '#1DA1F2',
      borderColor: '#1DA1F2',
    },
    youtubeButton: {
      backgroundColor: '#FF0000',
      borderColor: '#FF0000',
    },
    instagramButton: {
      backgroundColor: '#E4405F',
      borderColor: '#E4405F',
    },
    platformButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
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
      backgroundColor: 'transparent', // Transparent - no black mask
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    platformBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    platformBadgeText: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: '600',
    },
    downloadButtonOverlay: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#E80089',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 1000,
      borderWidth: 2,
      borderColor: '#E80089',
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
      minHeight: 220,
    },
    externalVideoContainer: {
      height: 220,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      gap: 12,
    },
    externalVideoText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    externalVideoButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 8,
    },
    externalVideoButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
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
      marginBottom: 12,
    },
    pollQuestion: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
    },
    pollStatus: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    pollOptions: {
      gap: 8,
      marginBottom: 12,
    },
    pollOption: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    pollOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    pollOptionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    pollOptionLabel: {
      color: colors.textPrimary,
      fontWeight: '600',
      flex: 1,
    },
    pollOptionVotes: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    pollProgressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginTop: 6,
      overflow: 'hidden',
    },
    pollProgressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginTop: 6,
      overflow: 'hidden',
    },
    pollProgressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    pollOptionPercentage: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
      fontWeight: '600',
    },
    pollVoteButton: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 18,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    pollVoteButtonDisabled: {
      opacity: 0.6,
    },
    pollVoteButtonVoted: {
      backgroundColor: colors.success,
      shadowColor: colors.success,
    },
    pollVoteButtonText: {
      color: colors.textPrimary,
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: -0.2,
    },
    pollVoteButtonTextVoted: {
      color: colors.success,
    },
    chip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 5,
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
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 18,
      gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    addButtonText: {
      color: colors.textPrimary,
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: -0.2,
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
    // Note: The JSX content that was here has been moved to the return statement
    // All style definitions above are complete
  }), [colors]);

  // JSX content starts here - this was moved from inside the styles definition
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
        <TouchableOpacity
          style={styles.filterHeader}
          onPress={() => setFiltersExpanded(!filtersExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.filterHeaderContent}>
            <View style={styles.filterHeaderLabels}>
              <Text style={styles.filterLabel}>
                Filter: <Text style={styles.filterValue}>{filter}</Text>
              </Text>
              <Text style={styles.filterLabel}>
                Order: <Text style={styles.filterValue}>
                  {sortMode === 'latest' ? 'Latest' : 'Most Liked'}
                </Text>
              </Text>
            </View>
            <MaterialIcons
              name={filtersExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
        
        {filtersExpanded && (
          <>
            <View style={styles.filterSection}>
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
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Order:</Text>
              <View style={styles.filterChipsContainer}>
                {[
                  { label: 'Latest', value: 'latest' as SortMode },
                  { label: 'Most Liked', value: 'mostLiked' as SortMode },
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.chip,
                      sortMode === option.value && styles.chipActive,
                    ]}
                    onPress={() => setSortMode(option.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        sortMode === option.value && styles.chipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                      <Text style={styles.feedAliasName}>
                        Posted by{' '}
                      </Text>
                      <Text style={[styles.feedAliasName, { fontWeight: '800', color: colors.textPrimary }]}>
                        {item.aliasName}
                      </Text>
                      {(() => {
                        const userPoints = getUserPoints(item.aliasName);
                        if (userPoints !== null && userPoints !== undefined) {
                          return (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Text style={[styles.feedAliasName, { fontWeight: '600' }]}>
                                • Points: {userPoints.toLocaleString()}
                              </Text>
                              <UserBadge points={userPoints} size={16} />
                            </View>
                          );
                        }
                        return null;
                      })()}
                    </View>
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
              {(() => {
                const twitterUrl = extractTwitterUrl(item);
                const instagramUrl = extractInstagramUrl(item);
                // Don't show summary text for Twitter or Instagram posts
                if (!twitterUrl && !instagramUrl) {
                  return (
                    <Text style={styles.feedSummary}>
                      {removeUrlsFromText(item.summary)}
                    </Text>
                  );
                }
                return null;
              })()}
              
              {(() => {
                const twitterUrl = extractTwitterUrl(item);
                const youtubeUrl = extractYouTubeUrl(item);
                const instagramUrl = extractInstagramUrl(item);
                
                // Show media first, then button below
                if (twitterUrl) {
                  return (
                    <>
                      <View style={styles.twitterEmbedContainer}>
                        <TweetEmbed url={twitterUrl} height={400} />
                        <TouchableOpacity
                          style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
                          onPress={() => Linking.openURL(twitterUrl).catch(() => {
                            Alert.alert('Error', 'Unable to open Twitter link.');
                          })}
                          activeOpacity={1}
                        />
                      </View>
                      {/* Platform button below media */}
                      <TouchableOpacity
                        style={[styles.platformButton, styles.twitterButton]}
                        onPress={() => Linking.openURL(twitterUrl).catch(() => {
                          Alert.alert('Error', 'Unable to open Twitter link.');
                        })}
                      >
                        <MaterialIcons name="tag" size={20} color={colors.textPrimary} />
                        <Text style={styles.platformButtonText}>Open on X</Text>
                      </TouchableOpacity>
                    </>
                  );
                }
                
                if (item.videoId || youtubeUrl) {
                  return (
                    <>
                      {item.media && (
                        <TouchableOpacity
                          style={styles.videoThumbnail}
                          onPress={() => {
                            if (item.videoId) {
                              setSelectedVideo({
                                videoId: item.videoId,
                                platform: 'YouTube',
                                title: item.title,
                                summary: item.summary,
                              });
                            } else if (youtubeUrl) {
                              setSelectedVideo({
                                videoUrl: youtubeUrl,
                                platform: 'YouTube',
                                title: item.title,
                                summary: item.summary,
                              });
                            }
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
                      )}
                      {/* Platform button below media */}
                      {youtubeUrl && (
                        <TouchableOpacity
                          style={[styles.platformButton, styles.youtubeButton]}
                          onPress={() => {
                            if (item.videoId) {
                              setSelectedVideo({
                                videoId: item.videoId,
                                platform: 'YouTube',
                                title: item.title,
                                summary: item.summary,
                              });
                            } else {
                              setSelectedVideo({
                                videoUrl: youtubeUrl,
                                platform: 'YouTube',
                                title: item.title,
                                summary: item.summary,
                              });
                            }
                          }}
                        >
                          <MaterialIcons name="play-circle-outline" size={20} color={colors.textPrimary} />
                          <Text style={styles.platformButtonText}>Open on YouTube</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  );
                }
                
                if (instagramUrl) {
                  // Try to get Instagram thumbnail URL, fallback to item.media
                  const instagramThumbnail = buildInstagramThumbnail(instagramUrl);
                  const thumbnailUri = instagramThumbnail || item.media;
                  
                  // Show thumbnail with play button (Instagram embeds require login)
                  // Clicking opens Instagram in browser/app where public posts can be viewed without login
                  return (
                    <>
                      <TouchableOpacity
                        style={styles.videoThumbnail}
                        onPress={() => {
                          // Open Instagram URL directly - public posts can be viewed without login in browser/app
                          Linking.openURL(instagramUrl).catch(() => {
                            Alert.alert('Error', 'Unable to open Instagram link.');
                          });
                        }}
                      >
                        <Image
                          source={{ uri: thumbnailUri }}
                          style={styles.videoThumbnailImage}
                          resizeMode="cover"
                        />
                        <View style={[styles.playButtonOverlay, { backgroundColor: 'transparent' }]}>
                          <MaterialIcons
                            name="play-circle-filled"
                            size={64}
                            color={colors.textPrimary}
                          />
                        </View>
                      </TouchableOpacity>
                      {/* Platform button below media */}
                      <TouchableOpacity
                        style={[styles.platformButton, styles.instagramButton]}
                        onPress={() => Linking.openURL(instagramUrl).catch(() => {
                          Alert.alert('Error', 'Unable to open Instagram link.');
                        })}
                      >
                        <MaterialIcons name="photo-camera" size={20} color={colors.textPrimary} />
                        <Text style={styles.platformButtonText}>Open on Instagram</Text>
                      </TouchableOpacity>
                    </>
                  );
                }
                
                // Regular image - add download button (not from social media since we've already checked above)
                return (
                  item.media ? (
                    <View style={{ position: 'relative' }}>
                      <TouchableOpacity onPress={() => setSelectedImage(item.media)}>
                        <Image
                          source={{ uri: item.media }}
                          style={styles.feedImage}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.downloadButtonOverlay}
                        onPress={() => handleDownloadImage(item.media!, false)}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons
                          name="download"
                          size={24}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : null
                );
              })()}
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
                <TouchableOpacity
                  style={[
                    styles.action,
                    userBookmarks.has(item.id) && styles.actionActive,
                  ]}
                  onPress={() => handleToggleBookmark(item.id)}
                >
                  <MaterialIcons
                    name={userBookmarks.has(item.id) ? 'bookmark' : 'bookmark-border'}
                    size={18}
                    color={
                      userBookmarks.has(item.id)
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                      <Text style={styles.feedAliasName}>
                        Posted by{' '}
                      </Text>
                      <Text style={[styles.feedAliasName, { fontWeight: '800', color: colors.textPrimary }]}>
                        {item.aliasName}
                      </Text>
                      {(() => {
                        const userPoints = getUserPoints(item.aliasName);
                        if (userPoints !== null && userPoints !== undefined) {
                          return (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Text style={[styles.feedAliasName, { fontWeight: '600' }]}>
                                • Points: {userPoints.toLocaleString()}
                              </Text>
                              <UserBadge points={userPoints} size={16} />
                            </View>
                          );
                        }
                        return null;
                      })()}
                    </View>
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
              {(() => {
                // Check if this is a Twitter or Instagram post - don't show summary text
                const twitterUrl = extractTwitterUrl(item);
                const instagramUrl = extractInstagramUrl(item);
                // Don't show summary text for Twitter or Instagram posts
                if (!twitterUrl && !instagramUrl) {
                  return (
                    <Text style={styles.feedSummary}>
                      {removeUrlsFromText(item.summary)}
                    </Text>
                  );
                }
                return null;
              })()}
              
              {(() => {
                // Check if this is a Twitter post (from any category) - show embed
                const twitterUrl = extractTwitterUrl(item);
                if (twitterUrl) {
                  // Display Twitter embed for both News and Videos categories
                  return (
                    <>
                      <View style={styles.twitterEmbedContainer}>
                        <TweetEmbed url={twitterUrl} height={400} />
                        <TouchableOpacity
                          style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
                          onPress={() => Linking.openURL(twitterUrl).catch(() => {
                            Alert.alert('Error', 'Unable to open Twitter link.');
                          })}
                          activeOpacity={1}
                        />
                      </View>
                      {/* Platform button below media */}
                      <TouchableOpacity
                        style={[styles.platformButton, styles.twitterButton]}
                        onPress={() => Linking.openURL(twitterUrl).catch(() => {
                          Alert.alert('Error', 'Unable to open Twitter link.');
                        })}
                      >
                        <MaterialIcons name="tag" size={20} color={colors.textPrimary} />
                        <Text style={styles.platformButtonText}>Open on X</Text>
                      </TouchableOpacity>
                    </>
                  );
                }
                
                // YouTube video with videoId
                if (item.videoId) {
                  return (
                    <>
                      <TouchableOpacity
                        style={styles.videoThumbnail}
                        onPress={() => {
                          setSelectedVideo({
                            videoId: item.videoId!,
                            platform: 'YouTube',
                            title: item.title,
                            summary: item.summary,
                          });
                        }}
                      >
                        <Image
                          source={{ uri: item.media }}
                          style={styles.videoThumbnailImage}
                        />
                        <View style={[styles.playButtonOverlay, { backgroundColor: 'transparent' }]}>
                          <MaterialIcons
                            name="play-circle-filled"
                            size={64}
                            color={colors.textPrimary}
                          />
                        </View>
                        {item.videoPlatform && (
                          <View style={styles.platformBadge}>
                            <MaterialIcons
                              name={item.videoPlatform === 'YouTube' ? 'play-circle-outline' : item.videoPlatform === 'Twitter' ? 'tag' : 'photo-camera'}
                              size={14}
                              color={colors.textPrimary}
                            />
                            <Text style={styles.platformBadgeText}>{item.videoPlatform}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      {/* Platform button below media */}
                      <TouchableOpacity
                        style={[styles.platformButton, styles.youtubeButton]}
                        onPress={() => {
                          setSelectedVideo({
                            videoId: item.videoId!,
                            platform: 'YouTube',
                            title: item.title,
                            summary: item.summary,
                          });
                        }}
                      >
                        <MaterialIcons name="play-circle-outline" size={20} color={colors.textPrimary} />
                        <Text style={styles.platformButtonText}>Open on YouTube</Text>
                      </TouchableOpacity>
                    </>
                  );
                }
                
                // Instagram posts (can be in News or Videos category)
                const instagramUrl = extractInstagramUrl(item);
                if (instagramUrl) {
                  // Try to get Instagram thumbnail URL, fallback to item.media
                  const instagramThumbnail = buildInstagramThumbnail(instagramUrl);
                  const thumbnailUri = instagramThumbnail || item.media;
                  
                  // Show thumbnail with play button (Instagram embeds require login)
                  // Clicking opens Instagram in browser/app where public posts can be viewed without login
                  return (
                    <>
                      <TouchableOpacity
                        style={styles.videoThumbnail}
                        onPress={() => {
                          // Open Instagram URL directly - public posts can be viewed without login in browser/app
                          Linking.openURL(instagramUrl).catch(() => {
                            Alert.alert('Error', 'Unable to open Instagram link.');
                          });
                        }}
                      >
                        <Image
                          source={{ uri: thumbnailUri }}
                          style={styles.videoThumbnailImage}
                          resizeMode="cover"
                        />
                        <View style={[styles.playButtonOverlay, { backgroundColor: 'transparent' }]}>
                          <MaterialIcons
                            name="play-circle-filled"
                            size={64}
                            color={colors.textPrimary}
                          />
                        </View>
                      </TouchableOpacity>
                      {/* Platform button below media */}
                      <TouchableOpacity
                        style={[styles.platformButton, styles.instagramButton]}
                        onPress={() => Linking.openURL(instagramUrl).catch(() => {
                          Alert.alert('Error', 'Unable to open Instagram link.');
                        })}
                      >
                        <MaterialIcons name="photo-camera" size={20} color={colors.textPrimary} />
                        <Text style={styles.platformButtonText}>Open on Instagram</Text>
                      </TouchableOpacity>
                    </>
                  );
                }
                
                // Other videos (non-Instagram, non-YouTube, non-Twitter)
                if (item.category === 'Videos' && item.videoUrl) {
                  const youtubeUrl = extractYouTubeUrl(item);
                  const twitterUrl = extractTwitterUrl(item);
                  const instagramUrl = extractInstagramUrl(item);
                  
                  // Only show download for regular videos (not from social media)
                  const isSocialMediaVideo = !!(youtubeUrl || twitterUrl || instagramUrl);
                  
                  return (
                    <>
                      <View style={{ position: 'relative' }}>
                        <TouchableOpacity
                          style={styles.videoThumbnail}
                          onPress={() => {
                            handleOpenExternalVideo(item.videoUrl!);
                          }}
                        >
                          <Image
                            source={{ uri: item.media }}
                            style={styles.videoThumbnailImage}
                          />
                          <View style={[styles.playButtonOverlay, { backgroundColor: 'transparent' }]}>
                            <MaterialIcons
                              name="play-circle-filled"
                              size={64}
                              color={colors.textPrimary}
                            />
                          </View>
                          {item.videoPlatform && (
                            <View style={styles.platformBadge}>
                              <MaterialIcons
                                name={item.videoPlatform === 'YouTube' ? 'play-circle-outline' : item.videoPlatform === 'Twitter' ? 'tag' : 'photo-camera'}
                                size={14}
                                color={colors.textPrimary}
                              />
                              <Text style={styles.platformBadgeText}>{item.videoPlatform}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                        {!isSocialMediaVideo && item.media && (
                          <TouchableOpacity
                            style={styles.downloadButtonOverlay}
                            onPress={() => handleDownloadImage(item.media!, true)}
                            activeOpacity={0.8}
                          >
                            <MaterialIcons
                              name="download"
                              size={24}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      {/* Platform button below media */}
                      {youtubeUrl && (
                        <TouchableOpacity
                          style={[styles.platformButton, styles.youtubeButton]}
                          onPress={() => {
                            setSelectedVideo({
                              videoUrl: youtubeUrl,
                              platform: 'YouTube',
                              title: item.title,
                              summary: item.summary,
                            });
                          }}
                        >
                          <MaterialIcons name="play-circle-outline" size={20} color={colors.textPrimary} />
                          <Text style={styles.platformButtonText}>Open on YouTube</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  );
                }
                
                // Regular image - add download button (not from social media since we've already checked above)
                return (
                  item.media ? (
                    <View style={{ position: 'relative' }}>
                      <TouchableOpacity onPress={() => setSelectedImage(item.media)}>
                        <Image
                          source={{ uri: item.media }}
                          style={styles.feedImage}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.downloadButtonOverlay}
                        onPress={() => handleDownloadImage(item.media!, false)}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons
                          name="download"
                          size={24}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : null
                );
              })()}
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
                <TouchableOpacity
                  style={[
                    styles.action,
                    userBookmarks.has(item.id) && styles.actionActive,
                  ]}
                  onPress={() => handleToggleBookmark(item.id)}
                >
                  <MaterialIcons
                    name={userBookmarks.has(item.id) ? 'bookmark' : 'bookmark-border'}
                    size={18}
                    color={
                      userBookmarks.has(item.id)
                        ? colors.primary
                        : colors.textSecondary
                    }
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
                {selectedVideo.videoId && selectedVideo.platform === 'YouTube' ? (
                  <YouTubePlayer
                    videoId={selectedVideo.videoId}
                    height={220}
                    play={true}
                  />
                ) : selectedVideo.videoUrl && selectedVideo.platform === 'Twitter' ? (
                  <TweetEmbed url={selectedVideo.videoUrl} height={400} />
                ) : selectedVideo.videoUrl && selectedVideo.platform === 'Instagram' ? (
                  // Instagram embeds require login, so open in browser/app instead
                  <View style={styles.externalVideoContainer}>
                    <MaterialIcons
                      name="photo-camera"
                      size={48}
                      color={colors.textPrimary}
                    />
                    <Text style={styles.externalVideoText}>
                      Opening Instagram post...
                    </Text>
                    <TouchableOpacity
                      style={styles.externalVideoButton}
                      onPress={() => {
                        if (selectedVideo.videoUrl) {
                          Linking.openURL(selectedVideo.videoUrl).catch(() => {
                            Alert.alert('Error', 'Unable to open Instagram link.');
                          });
                        }
                      }}
                    >
                      <Text style={styles.externalVideoButtonText}>Open in Instagram</Text>
                    </TouchableOpacity>
                  </View>
                ) : selectedVideo.videoUrl ? (
                  // For other platforms, show in WebView or open externally
                  <View style={styles.externalVideoContainer}>
                    <MaterialIcons
                      name="play-circle-outline"
                      size={48}
                      color={colors.textPrimary}
                    />
                    <Text style={styles.externalVideoText}>
                      Opening video...
                    </Text>
                    <TouchableOpacity
                      style={styles.externalVideoButton}
                      onPress={() => {
                        if (selectedVideo.videoUrl) {
                          Linking.openURL(selectedVideo.videoUrl).catch(() => {
                            Alert.alert('Error', 'Unable to open video link.');
                          });
                        }
                      }}
                    >
                      <Text style={styles.externalVideoButtonText}>Open in Browser</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
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