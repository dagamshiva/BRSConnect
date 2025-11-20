import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { AssemblySelector } from '../../components/AssemblySelector';
import { CATEGORY_OPTIONS, type Category } from '../../data/commonData';

type Scope = 'assembly' | 'trending';


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
  pollOptions?: Array<{ id: string; label: string; votes: number }>;
}

export const CreateFeedScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const onFeedCreated = (route.params as any)?.onFeedCreated;
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('News');
  const [newAssemblySegment, setNewAssemblySegment] = useState<string | null>(null);
  const [newMedia, setNewMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [videoPlatform, setVideoPlatform] = useState<'YouTube' | 'Twitter' | 'Instagram' | null>(null);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [scope, setScope] = useState<Scope>('assembly');
  // Poll options state
  const [pollOptions, setPollOptions] = useState<Array<{ id: string; label: string; votes: number }>>([
    { id: `opt-${Date.now()}-1`, label: '', votes: 0 },
    { id: `opt-${Date.now()}-2`, label: '', votes: 0 },
  ]);

  // Reset poll options when category changes
  const handleCategoryChange = (category: Category) => {
    setNewCategory(category);
    if (category === 'Polls') {
      setPollOptions([
        { id: `opt-${Date.now()}-1`, label: '', votes: 0 },
        { id: `opt-${Date.now()}-2`, label: '', votes: 0 },
      ]);
    }
  };

  const handleSelectMedia = () => {
    if (newMedia) {
      Alert.alert(
        'Remove Media',
        'Do you want to remove the current media?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              setNewMedia(null);
              setMediaType(null);
              setVideoPlatform(null);
            },
          },
        ],
        { cancelable: true },
      );
    } else {
      Alert.alert(
        'Select Media Type',
        'Choose the type of media you want to add',
        [
          {
            text: 'Image',
            onPress: () => {
              setMediaType('image');
              setShowMediaInput(true);
            },
          },
          {
            text: 'Video',
            onPress: () => {
              setMediaType('video');
              setShowMediaInput(true);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true },
      );
    }
  };

  const detectVideoPlatform = (url: string): 'YouTube' | 'Twitter' | 'Instagram' | null => {
    // YouTube patterns
    const youtubePatterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)/i,
      /^[a-zA-Z0-9_-]{11}$/, // YouTube video ID format
    ];
    
    // Twitter patterns
    const twitterPatterns = [
      /(?:twitter\.com|x\.com)\/\w+\/status\//i,
      /t\.co\/\w+/i, // Twitter short links
    ];
    
    // Instagram patterns
    const instagramPatterns = [
      /instagram\.com\/(?:p|reel|tv)\//i,
    ];

    if (youtubePatterns.some(pattern => pattern.test(url))) {
      return 'YouTube';
    }
    if (twitterPatterns.some(pattern => pattern.test(url))) {
      return 'Twitter';
    }
    if (instagramPatterns.some(pattern => pattern.test(url))) {
      return 'Instagram';
    }
    
    return null;
  };

  const handleSaveMediaUrl = () => {
    if (!mediaUrlInput.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    if (mediaType === 'video') {
      const platform = detectVideoPlatform(mediaUrlInput);
      
      if (platform) {
        setVideoPlatform(platform);
        setNewMedia(mediaUrlInput);
        setShowMediaInput(false);
        setMediaUrlInput('');
      } else {
        Alert.alert(
          'Error',
          'Please enter a valid YouTube, Twitter, or Instagram video URL',
        );
      }
    } else {
      setNewMedia(mediaUrlInput);
      setShowMediaInput(false);
      setMediaUrlInput('');
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length >= 4) {
      Alert.alert('Maximum options', 'You can add maximum 4 options.');
      return;
    }
    setPollOptions([
      ...pollOptions,
      { id: `opt-${Date.now()}-${pollOptions.length + 1}`, label: '', votes: 0 },
    ]);
  };

  const handleRemovePollOption = (optionId: string) => {
    if (pollOptions.length <= 2) {
      Alert.alert('Minimum options', 'You must have at least 2 options.');
      return;
    }
    setPollOptions(pollOptions.filter(opt => opt.id !== optionId));
  };

  const handleUpdatePollOption = (optionId: string, label: string) => {
    setPollOptions(
      pollOptions.map(opt => (opt.id === optionId ? { ...opt, label } : opt)),
    );
  };

  const handleAddFeed = () => {
    // Validation for POLL
    if (newCategory === 'Polls') {
      if (!newTitle.trim()) {
        Alert.alert('Add title', 'Please provide a poll title.');
        return;
      }
      const validOptions = pollOptions.filter(opt => opt.label.trim() !== '');
      if (validOptions.length < 2) {
        Alert.alert('Add options', 'Please provide at least 2 options.');
        return;
      }
      if (validOptions.length > 4) {
        Alert.alert('Too many options', 'Maximum 4 options allowed.');
        return;
      }
    } else {
      // Validation for other categories
      if (newCategory !== 'Videos' && (!newTitle.trim() || !newSummary.trim())) {
        Alert.alert('Add details', 'Please provide a headline & summary.');
        return;
      }
      if (newCategory === 'Videos' && !newTitle.trim() && !newSummary.trim()) {
        Alert.alert(
          'Add details',
          'Please provide at least a headline or summary for the video.',
        );
        return;
      }
    }

    // Generate UUID-like ID
    const generateId = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const feedId = generateId();
    const now = new Date().toISOString();

    // Format based on category to match mock_feed.ts structure
    if (newCategory === 'Polls') {
      const validOptions = pollOptions
        .filter(opt => opt.label.trim() !== '')
        .map(opt => ({
          id: generateId(),
          label: opt.label.trim(),
          votes: 0,
        }));

      const mockFeedItem = {
        id: feedId,
        type: 'POLL' as const,
        title: newTitle.trim(),
        postedBy: 'demo-user-id', // Demo user ID
        authorName: 'Demo User',
        areaScope: newAssemblySegment
          ? {
              assemblySegment: newAssemblySegment,
              village: null,
            }
          : undefined,
        postedAt: now,
        likes: 0,
        dislikes: 0,
        options: validOptions,
        totalResponses: 0,
      };

      // Convert to FeedItem format for display
      const newFeed: FeedItem = {
        id: feedId,
        scope: 'assembly',
        category: 'Polls',
        title: newTitle.trim(),
        summary: `Poll: ${newTitle.trim()}`,
        media: 'https://images.unsplash.com/photo-1500534314210-3a84de2e8fd5',
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
        createdAt: now,
        assemblySegment: newAssemblySegment || undefined,
        aliasName: 'Demo User',
        pollOptions: validOptions,
      };

      if (onFeedCreated) {
        onFeedCreated(newFeed);
      }
      Alert.alert('Poll created', 'Your poll has been added.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    // Handle NEWS, VIDEO, and other categories
    let videoId: string | undefined;
    let mediaUrl: string | undefined;
    let detectedPlatform: 'YouTube' | 'Twitter' | 'Instagram' | undefined = videoPlatform || undefined;
    
    if (newCategory === 'Videos' && newMedia) {
      // Detect platform if not already set
      if (!detectedPlatform) {
        detectedPlatform = detectVideoPlatform(newMedia) || undefined;
      }
      
      // Extract YouTube video ID if it's a YouTube URL
      if (detectedPlatform === 'YouTube') {
        const youtubeRegex =
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = newMedia.match(youtubeRegex);
        if (match && match[1]) {
          videoId = match[1];
          mediaUrl = newMedia;
        } else if (
          newMedia.length === 11 &&
          !newMedia.includes('/') &&
          !newMedia.includes('.')
        ) {
          videoId = newMedia;
          mediaUrl = `https://www.youtube.com/watch?v=${newMedia}`;
        } else {
          mediaUrl = newMedia;
        }
      } else {
        // For Twitter and Instagram, just use the URL
        mediaUrl = newMedia;
      }
    }

    const mockFeedItem =
      newCategory === 'Videos'
        ? {
            id: feedId,
            type: 'VIDEO' as const,
            title: newTitle.trim() || newSummary.trim() || 'Untitled',
            mediaUrl: mediaUrl || newMedia || '',
            videoPlatform: detectedPlatform || 'YouTube', // Default to YouTube for backward compatibility
            postedBy: 'demo-user-id',
            authorName: 'Demo User',
            areaScope: newAssemblySegment
              ? {
                  assemblySegment: newAssemblySegment,
                  village: null,
                }
              : undefined,
            postedAt: now,
            likes: 0,
            dislikes: 0,
          }
        : newCategory === 'Suggestions'
          ? {
              id: feedId,
              type: 'SUGGESTION' as const,
              title: newTitle.trim(),
              postedBy: 'demo-user-id',
              authorName: 'Demo User',
              areaScope: newAssemblySegment
                ? {
                    assemblySegment: newAssemblySegment,
                    village: null,
                  }
                : undefined,
              media: newMedia || 'https://picsum.photos/200/300?random=' + Date.now(),
              postedAt: now,
              likes: 0,
              dislikes: 0,
            }
          : {
              id: feedId,
              type: 'NEWS' as const,
              title: newTitle.trim(),
              postedBy: 'demo-user-id',
              authorName: 'Demo User',
              areaScope: newAssemblySegment
                ? {
                    assemblySegment: newAssemblySegment,
                    village: null,
                  }
                : undefined,
              media: newMedia || 'https://picsum.photos/200/300?random=' + Date.now(),
              postedAt: now,
              likes: 0,
              dislikes: 0,
            };

    // Generate proper media URL based on platform
    let mediaUrlForDisplay: string;
    if (newCategory === 'Videos' && newMedia && detectedPlatform) {
      if (detectedPlatform === 'YouTube' && videoId) {
        // Use actual YouTube thumbnail - this will show the real video thumbnail
        mediaUrlForDisplay = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      } else if (detectedPlatform === 'Twitter' || detectedPlatform === 'Instagram') {
        // For Twitter/Instagram, we can't get thumbnails without API calls
        // In production, you would:
        // 1. Make an API call to fetch the actual media/thumbnail
        // 2. Use a service like linkpreview.net or opengraph.io
        // 3. Store the thumbnail URL in your backend
        // For now, use a placeholder that indicates it's a social media post
        // The actual media will be visible when user clicks to open the link
        mediaUrlForDisplay = newMedia; // Keep the URL, but it won't display as image
        // You could also use: 'https://images.unsplash.com/photo-1500534314210-3a84de2e8fd5'
      } else {
        mediaUrlForDisplay = newMedia;
      }
    } else {
      mediaUrlForDisplay = newMedia || 'https://images.unsplash.com/photo-1500534314210-3a84de2e8fd5';
    }

    const newFeed: FeedItem = {
      id: feedId,
      scope: 'assembly',
      category: newCategory,
      title: newTitle.trim() || 'Untitled',
      summary: newSummary.trim() || '',
      media: mediaUrlForDisplay,
      videoId,
      videoUrl: mediaUrl,
      videoPlatform: detectedPlatform,
      likes: 0,
      dislikes: 0,
      comments: 0,
      shares: 0,
      createdAt: now,
      assemblySegment: newAssemblySegment || undefined,
      aliasName: 'Demo User',
    };

    if (onFeedCreated) {
      onFeedCreated(newFeed);
    }
    Alert.alert('Saved locally', 'Your demo feed card has been added.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text style={styles.backText}>Back to feed</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Create Feed</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>Headline</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter headline"
            placeholderTextColor={colors.textSecondary}
            value={newTitle}
            onChangeText={setNewTitle}
            editable={true}
            contextMenuHidden={false}
          />

          {newCategory !== 'Polls' && (
            <>
              <Text style={styles.label}>Summary</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Enter summary"
                placeholderTextColor={colors.textSecondary}
                multiline
                value={newSummary}
                onChangeText={setNewSummary}
                editable={true}
                contextMenuHidden={false}
              />
            </>
          )}

          {newCategory === 'Polls' && (
            <>
              <Text style={styles.label}>Poll Options (Min 2, Max 4)</Text>
              {pollOptions.map((option, index) => (
                <View key={option.id} style={styles.pollOptionRow}>
                  <TextInput
                    style={[styles.input, styles.pollOptionInput]}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={colors.textSecondary}
                    value={option.label}
                    onChangeText={label => handleUpdatePollOption(option.id, label)}
                    editable={true}
                    contextMenuHidden={false}
                  />
                  {pollOptions.length > 2 && (
                    <TouchableOpacity
                      style={styles.removeOptionButton}
                      onPress={() => handleRemovePollOption(option.id)}
                    >
                      <MaterialIcons name="close" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {pollOptions.length < 4 && (
                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={handleAddPollOption}
                >
                  <MaterialIcons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addOptionText}>Add Option</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipGroup}>
            {CATEGORY_OPTIONS.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.chip,
                  newCategory === option && styles.chipActive,
                ]}
                onPress={() => handleCategoryChange(option)}
              >
                <Text
                  style={[
                    styles.chipText,
                    newCategory === option && styles.chipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AssemblySelector
            value={newAssemblySegment}
            onSelect={setNewAssemblySegment}
            placeholder="Search Assembly Segment (Optional)"
            label="Assembly Segment (Optional)"
            mode="autocomplete"
          />

          {newCategory !== 'Polls' && (
            <>
              <Text style={styles.label}>Media (Optional)</Text>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={handleSelectMedia}
              >
                <MaterialIcons
                  name={mediaType === 'video' ? 'videocam' : 'image'}
                  size={20}
                  color={colors.textPrimary}
                />
                <Text style={styles.mediaButtonText}>
                  {newMedia
                    ? mediaType === 'video'
                      ? 'Change Video'
                      : 'Change Image'
                    : 'Add Image/Video'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {showMediaInput ? (
            <View style={styles.mediaInputContainer}>
              <Text style={styles.mediaInputLabel}>
                {mediaType === 'video' ? 'Video URL (YouTube, Twitter, or Instagram)' : 'Image URL'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${
                  mediaType === 'video' ? 'YouTube, Twitter, or Instagram video URL' : 'image'
                } URL`}
                placeholderTextColor={colors.textSecondary}
                value={mediaUrlInput}
                onChangeText={setMediaUrlInput}
                autoCapitalize="none"
                keyboardType="url"
                editable={true}
                contextMenuHidden={false}
              />
              <View style={styles.mediaInputActions}>
                <TouchableOpacity
                  style={[
                    styles.mediaInputButton,
                    styles.mediaInputButtonCancel,
                  ]}
                  onPress={() => {
                    setShowMediaInput(false);
                    setMediaUrlInput('');
                  }}
                >
                  <Text style={styles.mediaInputButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mediaInputButton, styles.mediaInputButtonSave]}
                  onPress={handleSaveMediaUrl}
                >
                  <Text style={styles.mediaInputButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {newMedia ? (
            <View style={styles.mediaPreview}>
              {mediaType === 'video' ? (
                <View style={styles.videoPreview}>
                  <MaterialIcons
                    name="play-circle-filled"
                    size={48}
                    color={colors.textPrimary}
                  />
                  <Text style={styles.mediaPreviewText}>
                    {videoPlatform ? `${videoPlatform} Video Selected` : 'Video Selected'}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => {
                      setNewMedia(null);
                      setMediaType(null);
                      setVideoPlatform(null);
                    }}
                  >
                    <MaterialIcons
                      name="close"
                      size={16}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: newMedia }}
                    style={styles.mediaPreviewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => {
                      setNewMedia(null);
                      setMediaType(null);
                      setVideoPlatform(null);
                    }}
                  >
                    <MaterialIcons
                      name="close"
                      size={16}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}

          <TouchableOpacity style={styles.submitButton} onPress={handleAddFeed}>
            <MaterialIcons name="add" size={20} color={colors.textPrimary} />
            <Text style={styles.submitText}>Create Feed</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    zIndex: 1,
  },
  backText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 0,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 110, // Match back button approximate width
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.textPrimary,
  },
  assemblySegmentContainer: {
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
  assemblySegmentClearButton: {
    padding: 4,
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
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
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
  mediaPreview: {
    marginTop: 8,
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
    color: colors.textPrimary,
    marginTop: 8,
    fontWeight: '600',
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  submitText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pollOptionInput: {
    flex: 1,
  },
  removeOptionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

