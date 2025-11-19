import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import {
  SEGMENT_RECIPIENT_ROLES,
  RecipientRole,
  getRecipientRoleById,
} from "../../config/segmentRecipientRoles";

// Image picker implementation - supports both URL input and native picker when available
type MediaType = {
  uri: string;
  type?: string;
  name?: string;
};

export const SendMessageToSegmentAdminsScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const auth = useAppSelector(selectAuth);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggleRoleSelection = (roleId: string) => {
    const newSelectedRoles = new Set(selectedRoles);
    if (newSelectedRoles.has(roleId)) {
      newSelectedRoles.delete(roleId);
    } else {
      newSelectedRoles.add(roleId);
    }
    setSelectedRoles(newSelectedRoles);
  };

  const pickImageFromLibrary = async () => {
    // Try to use react-native-image-picker if available
    try {
      // Dynamic import to avoid errors if library is not installed
      const { launchImageLibrary, ImagePicker } = await import(
        "react-native-image-picker"
      ).catch(() => ({ launchImageLibrary: null, ImagePicker: null }));

      if (launchImageLibrary) {
        launchImageLibrary(
          {
            mediaType: "photo",
            quality: 0.8,
            selectionLimit: 1,
          },
          (response) => {
            if (response.didCancel) {
              return;
            }
            if (response.errorMessage) {
              Alert.alert("Error", response.errorMessage);
              return;
            }
            if (response.assets && response.assets[0]) {
              const asset = response.assets[0];
              setMedia(asset.uri || "");
              setMediaType("image");
            }
          },
        );
        return;
      }
    } catch (error) {
      // Library not installed, fall through to URL input
    }

    // Fallback: URL input
    showImageUrlPrompt();
  };

  const takePhoto = async () => {
    // Try to use react-native-image-picker if available
    try {
      const { launchCamera, ImagePicker } = await import(
        "react-native-image-picker"
      ).catch(() => ({ launchCamera: null, ImagePicker: null }));

      if (launchCamera) {
        launchCamera(
          {
            mediaType: "photo",
            quality: 0.8,
            saveToPhotos: true,
          },
          (response) => {
            if (response.didCancel) {
              return;
            }
            if (response.errorMessage) {
              Alert.alert("Error", response.errorMessage);
              return;
            }
            if (response.assets && response.assets[0]) {
              const asset = response.assets[0];
              setMedia(asset.uri || "");
              setMediaType("image");
            }
          },
        );
        return;
      }
    } catch (error) {
      // Library not installed, fall through to URL input
    }

    // Fallback: URL input
    showImageUrlPrompt();
  };

  const showImageUrlPrompt = () => {
    if (Platform.OS === "ios" && Alert.prompt) {
      Alert.prompt(
        "Add Image URL",
        "Enter image URL",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add",
            onPress: (url) => {
              if (url && url.trim()) {
                setMedia(url.trim());
                setMediaType("image");
              }
            },
          },
        ],
        "plain-text",
      );
    } else {
      // For Android, show an alert with instructions
      Alert.alert(
        "Add Media",
        "To use image picker, please install: npm install react-native-image-picker\n\nFor now, you can manually enter image URLs via the 'Add URL' option.",
        [{ text: "OK" }],
      );
    }
  };

  const addImageUrl = () => {
    if (Platform.OS === "ios" && Alert.prompt) {
      Alert.prompt(
        "Add Image URL",
        "Enter image URL",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add",
            onPress: (url) => {
              if (url && url.trim()) {
                setMedia(url.trim());
                setMediaType("image");
              }
            },
          },
        ],
        "plain-text",
      );
    } else {
      // Android fallback - you might want to create a modal for URL input
      Alert.alert(
        "Image URL",
        "Enter the image URL in the text input or install react-native-image-picker for native image selection.",
        [{ text: "OK" }],
      );
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaType(null);
  };

  const handleSend = () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a title for your message.");
      return;
    }

    if (!description.trim() && !media) {
      Alert.alert(
        "Content required",
        "Please enter a description or attach media.",
      );
      return;
    }

    if (selectedRoles.size === 0) {
      Alert.alert(
        "Recipients required",
        "Please select at least one recipient role.",
      );
      return;
    }

    // Validate media URL if provided
    if (media && !media.startsWith("http") && !media.startsWith("file://") && !media.startsWith("content://")) {
      Alert.alert(
        "Invalid media",
        "Please provide a valid image URL or select from gallery/camera.",
      );
      return;
    }

    setLoading(true);

    // Get selected role labels
    const selectedRoleLabels = Array.from(selectedRoles)
      .map(id => getRecipientRoleById(id))
      .filter((role): role is RecipientRole => role !== undefined)
      .map(role => role.label);

    // Prepare message payload
    const payload = {
      title: title.trim(),
      description: description.trim(),
      media: media || null,
      mediaType: mediaType || null,
      recipientRoles: Array.from(selectedRoles), // Role IDs
      recipientRoleLabels: selectedRoleLabels, // Human-readable labels
      assemblySegment: auth.user?.assignedAreas?.assemblySegment || "",
      senderId: auth.user?.id,
      senderName: auth.user?.name,
      senderRole: auth.user?.role,
      timestamp: new Date().toISOString(),
    };

    // Simulate API call
    // TODO: Replace with actual API call
    // Example: await api.post('/messages/send-to-segment-admins', payload);
    
    setTimeout(() => {
      setLoading(false);
      const roleList = selectedRoleLabels.join(", ");
      Alert.alert(
        "Message sent",
        `Your message has been sent to ${roleList} in your assembly segment. They will receive a notification.`,
        [
          {
            text: "OK",
            onPress: () => {
              setTitle("");
              setDescription("");
              setMedia(null);
              setMediaType(null);
              setSelectedRoles(new Set());
              navigation.goBack();
            },
          },
        ],
      );
    }, 1000);
  };

  const userName = auth.user?.name || "Admin";
  const userRole = auth.user?.role || "LocalAdmin";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Send Message to Segment Admins</Text>
          <Text style={styles.headerSubtitle}>
            Send messages to admins within your assembly segment
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.senderInfo}>
          <MaterialIcons name="person" size={20} color={colors.primary} />
          <View style={styles.senderDetails}>
            <Text style={styles.senderName}>{userName}</Text>
            <Text style={styles.senderRole}>{userRole}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter message title..."
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
          <Text style={styles.charCount}>
            {title.length} / 200 characters
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Recipients *</Text>
          <Text style={styles.inputHint}>
            Select the roles that should receive this message
          </Text>
          <View style={styles.roleSelectionContainer}>
            {SEGMENT_RECIPIENT_ROLES.map((role) => {
              const isSelected = selectedRoles.has(role.id);
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleChip,
                    isSelected && styles.roleChipSelected,
                  ]}
                  onPress={() => toggleRoleSelection(role.id)}
                >
                  <MaterialIcons
                    name={isSelected ? "check-circle" : "radio-button-unchecked"}
                    size={20}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleChipText,
                      isSelected && styles.roleChipTextSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedRoles.size > 0 && (
            <Text style={styles.selectedCount}>
              {selectedRoles.size} role{selectedRoles.size > 1 ? "s" : ""}{" "}
              selected
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Enter your message description..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.charCount}>
            {description.length} / 2000 characters
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.mediaSection}>
          <Text style={styles.inputLabel}>Media (Optional)</Text>
          {media ? (
            <View style={styles.mediaPreview}>
              {mediaType === "image" ? (
                <Image source={{ uri: media }} style={styles.mediaImage} />
              ) : (
                <View style={styles.mediaPlaceholder}>
                  <MaterialIcons name="insert-photo" size={48} color={colors.textSecondary} />
                  <Text style={styles.mediaPlaceholderText}>Media Preview</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={removeMedia}
              >
                <MaterialIcons name="close" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mediaButtons}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={pickImageFromLibrary}
              >
                <MaterialIcons name="photo-library" size={24} color={colors.primary} />
                <Text style={styles.mediaButtonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={takePhoto}
              >
                <MaterialIcons name="camera-alt" size={24} color={colors.primary} />
                <Text style={styles.mediaButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={addImageUrl}
              >
                <MaterialIcons name="link" size={24} color={colors.primary} />
                <Text style={styles.mediaButtonText}>URL</Text>
              </TouchableOpacity>
            </View>
          )}
          {media && (
            <Text style={styles.mediaHint}>
              {mediaType === "image" ? "Image attached" : "Media attached"}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          <MaterialIcons name="send" size={20} color={colors.textPrimary} />
          <Text style={styles.sendButtonText}>
            {loading ? "Sending..." : "Send Message"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <MaterialIcons name="info-outline" size={20} color={colors.info} />
        <Text style={styles.infoText}>
          Your message will be sent to selected roles within your assembly
          segment. Recipients will receive a notification about your message.
        </Text>
      </View>
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
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  backText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
    marginBottom: 16,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  senderRole: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  inputSection: {
    gap: 8,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  inputHint: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
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
  messageInput: {
    minHeight: 120,
  },
  charCount: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "right",
  },
  roleSelectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  roleChipSelected: {
    backgroundColor: `${colors.primary}20`,
    borderColor: colors.primary,
  },
  roleChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  roleChipTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  selectedCount: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  mediaSection: {
    gap: 12,
  },
  mediaButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  mediaButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  mediaPreview: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  mediaPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  mediaPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  mediaHint: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  removeMediaButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.danger,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.info,
    padding: 16,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});

