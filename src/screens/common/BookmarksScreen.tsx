import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useTheme } from '../../theme/useTheme';
import { useAppSelector } from '../../store/hooks';
import { selectAuth } from '../../store/slices/authSlice';
import { YouTubePlayer } from '../../components/embeds/YouTubePlayer';
import { TweetEmbed } from '../../components/embeds/TweetEmbed';
import { mockFeed } from '../../../mocks/mock_feed';
import { telanganaUsers } from '../../../mocks/telangana_user';
import {
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

interface FeedItem {
  id: string;
  scope: 'assembly' | 'trending';
  category: Category;
  title: string;
  summary: string;
  media: string;
  videoId?: string;
  videoUrl?: string;
  videoPlatform?: 'YouTube' | 'Twitter' | 'Instagram';
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  createdAt: string;
  assemblySegment?: string;
  aliasName: string;
}

const buildSummary = (item: any): string => {
  const segment = item.areaScope?.assemblySegment ?? 'All Segments';
  const village = item.areaScope?.village ? ` • ${item.areaScope.village}` : '';
  const prefix = SUMMARY_PREFIX_BY_TYPE[item.type] ?? 'Update from';
  return `${prefix} ${segment}${village}.`;
};

const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const pickThumbnail = (
  type: string,
  videoId?: string,
  videoUrl?: string,
  videoPlatform?: 'YouTube' | 'Twitter' | 'Instagram',
): string => {
  if (videoPlatform === 'YouTube' && videoId) {
    return getYouTubeThumbnail(videoId);
  }
  if (videoPlatform === 'Twitter') {
    return randomElement(IMAGE_THUMBNAILS);
  }
  if (videoPlatform === 'Instagram') {
    return randomElement(VIDEO_THUMBNAILS);
  }
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
  
  let videoId: string | undefined = undefined;
  if (item.mediaUrl) {
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = item.mediaUrl.match(youtubeRegex);
    if (match && match[1]) {
      videoId = match[1];
    }
  }
  
  let videoPlatform: 'YouTube' | 'Twitter' | 'Instagram' | undefined = undefined;
  if ((item as any).videoPlatform) {
    videoPlatform = (item as any).videoPlatform;
  } else if (item.mediaUrl) {
    if (/youtube\.com|youtu\.be/i.test(item.mediaUrl)) {
      videoPlatform = 'YouTube';
    } else if (/(?:twitter\.com|x\.com)\/\w+\/status\//i.test(item.mediaUrl) || /t\.co\/\w+/i.test(item.mediaUrl)) {
      videoPlatform = 'Twitter';
    } else if (/instagram\.com\/(?:p|reel|tv|reels|stories)\//i.test(item.mediaUrl)) {
      videoPlatform = 'Instagram';
    }
  }
  
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
    aliasName: item.aliasName || 'Anonymous',
  };
});

const extractTwitterUrl = (item: FeedItem): string | null => {
  if (item.videoPlatform === 'Twitter' && item.videoUrl) {
    return item.videoUrl;
  }
  if (item.videoUrl) {
    const twitterMatch = item.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i);
    if (twitterMatch) {
      return twitterMatch[0].startsWith('http') ? twitterMatch[0] : `https://${twitterMatch[0]}`;
    }
  }
  return null;
};

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
  return null;
};

const extractInstagramUrl = (item: FeedItem): string | null => {
  if (item.videoPlatform === 'Instagram' && item.videoUrl) {
    return item.videoUrl;
  }
  if (item.videoUrl) {
    const instagramMatch = item.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv|reels|stories)\/[^/\s?#]+/i);
    if (instagramMatch) {
      return instagramMatch[0].startsWith('http') ? instagramMatch[0] : `https://${instagramMatch[0]}`;
    }
  }
  return null;
};

export const BookmarksScreen = (): React.ReactElement => {
  const colors = useTheme();
  const auth = useAppSelector(selectAuth);
  const user = auth.user;
  
  const [bookmarkedFeeds, setBookmarkedFeeds] = useState<FeedItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    videoId?: string;
    videoUrl?: string;
    platform?: 'YouTube' | 'Twitter' | 'Instagram';
    title?: string;
    summary?: string;
  } | null>(null);
  const [userBookmarks, setUserBookmarks] = useState<Set<string>>(
    new Set(user?.bookmarks || []),
  );

  // Load bookmarked feeds when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        const userData = telanganaUsers.find(u => u.id === user.id);
        const bookmarkIds = userData?.bookmarks || [];
        setUserBookmarks(new Set(bookmarkIds));
        
        // Filter feeds to show only bookmarked ones
        const bookmarked = seedFeeds.filter(feed => bookmarkIds.includes(feed.id));
        setBookmarkedFeeds(bookmarked);
      }
    }, [user?.id]),
  );

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

    // Update local state to remove from list
    setBookmarkedFeeds(prev => prev.filter(feed => feed.id !== feedId));
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          padding: 16,
        },
        pageTitle: {
          fontSize: 28,
          fontWeight: '800',
          color: colors.textPrimary,
          marginBottom: 4,
          letterSpacing: -0.5,
        },
        pageSubtitle: {
          fontSize: 14,
          color: colors.textSecondary,
          fontWeight: '600',
          marginBottom: 24,
          letterSpacing: -0.2,
        },
        emptyState: {
          alignItems: 'center',
          marginTop: 60,
          gap: 12,
        },
        emptyIcon: {
          marginBottom: 8,
        },
        emptyTitle: {
          fontSize: 20,
          fontWeight: '700',
          color: colors.textPrimary,
          letterSpacing: -0.3,
        },
        emptySubtitle: {
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
          paddingHorizontal: 32,
        },
        feedCard: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1.5,
          borderColor: `${colors.primary}40`,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
        },
        feedHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        feedCategory: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 4,
        },
        feedTitle: {
          fontSize: 18,
          fontWeight: '800',
          color: colors.textPrimary,
          marginBottom: 6,
          letterSpacing: -0.3,
          lineHeight: 24,
        },
        feedAssemblySegment: {
          fontSize: 13,
          color: colors.textSecondary,
          fontWeight: '600',
          marginBottom: 8,
        },
        feedMeta: {
          flexDirection: 'row',
          gap: 12,
          marginTop: 4,
        },
        feedAliasName: {
          fontSize: 12,
          color: colors.textSecondary,
          fontWeight: '600',
        },
        feedTimestamp: {
          fontSize: 12,
          color: colors.textSecondary,
        },
        feedSummary: {
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 20,
          marginBottom: 12,
        },
        feedImage: {
          width: '100%',
          height: 200,
          borderRadius: 12,
          marginBottom: 12,
        },
        videoThumbnail: {
          width: '100%',
          height: 200,
          borderRadius: 12,
          marginBottom: 12,
          position: 'relative',
        },
        videoThumbnailImage: {
          width: '100%',
          height: '100%',
          borderRadius: 12,
        },
        playButtonOverlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 12,
        },
        platformBadge: {
          position: 'absolute',
          top: 8,
          right: 8,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          gap: 4,
        },
        platformBadgeText: {
          color: colors.textPrimary,
          fontSize: 11,
          fontWeight: '600',
        },
        twitterEmbedContainer: {
          marginBottom: 12,
          borderRadius: 12,
          overflow: 'hidden',
        },
        platformButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 10,
          marginBottom: 12,
          gap: 8,
          borderWidth: 1.5,
          borderColor: `${colors.primary}40`,
        },
        twitterButton: {
          backgroundColor: '#1DA1F2',
        },
        youtubeButton: {
          backgroundColor: '#FF0000',
        },
        instagramButton: {
          backgroundColor: '#E4405F',
        },
        platformButtonText: {
          color: colors.textPrimary,
          fontSize: 14,
          fontWeight: '700',
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
      }),
    [colors],
  );

  if (!user?.id) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>My Bookmarks</Text>
          <View style={styles.emptyState}>
            <MaterialIcons
              name="lock"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>Please login to view bookmarks</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>My Bookmarks</Text>
      <Text style={styles.pageSubtitle}>
        All your saved feeds in one place
      </Text>

      {bookmarkedFeeds.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="bookmark-border"
            size={64}
            color={colors.textSecondary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptySubtitle}>
            Start bookmarking feeds from the Posts screen to see them here.
          </Text>
        </View>
      ) : (
        bookmarkedFeeds.map(item => (
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
                name="place"
                size={20}
                color={colors.accent}
              />
            </View>
            <Text style={styles.feedSummary}>{item.summary}</Text>
            
            {(() => {
              const twitterUrl = extractTwitterUrl(item);
              const youtubeUrl = extractYouTubeUrl(item);
              const instagramUrl = extractInstagramUrl(item);
              
              if (twitterUrl) {
                return (
                  <>
                    <View style={styles.twitterEmbedContainer}>
                      <TweetEmbed url={twitterUrl} height={400} />
                    </View>
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
                        <View style={styles.platformBadge}>
                          <MaterialIcons
                            name="play-circle-filled"
                            size={14}
                            color={colors.textPrimary}
                          />
                          <Text style={styles.platformBadgeText}>YouTube</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {youtubeUrl && (
                      <TouchableOpacity
                        style={[styles.platformButton, styles.youtubeButton]}
                        onPress={() => Linking.openURL(youtubeUrl).catch(() => {
                          Alert.alert('Error', 'Unable to open YouTube link.');
                        })}
                      >
                        <MaterialIcons name="play-circle-outline" size={20} color={colors.textPrimary} />
                        <Text style={styles.platformButtonText}>Open on YouTube</Text>
                      </TouchableOpacity>
                    )}
                  </>
                );
              }
              
              if (instagramUrl) {
                return (
                  <>
                    <TouchableOpacity
                      style={styles.videoThumbnail}
                      onPress={() => {
                        Linking.openURL(instagramUrl).catch(() => {
                          Alert.alert('Error', 'Unable to open Instagram link.');
                        });
                      }}
                    >
                      <Image
                        source={{ uri: item.media }}
                        style={styles.videoThumbnailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.playButtonOverlay}>
                        <MaterialIcons
                          name="play-circle-filled"
                          size={64}
                          color={colors.textPrimary}
                        />
                      </View>
                      <View style={styles.platformBadge}>
                        <MaterialIcons
                          name="photo-camera"
                          size={14}
                          color={colors.textPrimary}
                        />
                        <Text style={styles.platformBadgeText}>Instagram</Text>
                      </View>
                    </TouchableOpacity>
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
              
              return (
                <TouchableOpacity onPress={() => setSelectedImage(item.media)}>
                  <Image
                    source={{ uri: item.media }}
                    style={styles.feedImage}
                  />
                </TouchableOpacity>
              );
            })()}
            
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.action}>
                <MaterialIcons
                  name="thumb-up"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.actionText}>{item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action}>
                <MaterialIcons
                  name="thumb-down"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.actionText}>{item.dislikes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action}>
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.actionText}>{item.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action}>
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
                  name="bookmark"
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Image Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              zIndex: 10,
            }}
            onPress={() => setSelectedImage(null)}
          >
            <MaterialIcons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: '90%',
                height: '70%',
                resizeMode: 'contain',
              }}
            />
          )}
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal
        visible={selectedVideo !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedVideo(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={styles.closeVideoButton}
            onPress={() => setSelectedVideo(null)}
          >
            <MaterialIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          {selectedVideo?.videoId && (
            <YouTubePlayer
              videoId={selectedVideo.videoId}
              width="100%"
              height="40%"
            />
          )}
          {selectedVideo?.videoUrl && !selectedVideo.videoId && (
            <View style={{ padding: 20 }}>
              <Text style={{ color: '#FFF', marginBottom: 10 }}>
                {selectedVideo.title}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (selectedVideo.videoUrl) {
                    Linking.openURL(selectedVideo.videoUrl);
                  }
                }}
              >
                <Text style={{ color: '#1DA1F2', fontSize: 16 }}>
                  Open in browser
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

