import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import type { TrendingMedia } from "../types";
import { colors } from "../theme/colors";

interface Props {
  media: TrendingMedia;
  onPress?: (media: TrendingMedia) => void;
}

const platformIcon: Record<
  TrendingMedia["platform"],
  keyof typeof MaterialIcons.glyphMap
> = {
  Twitter: "tag",
  Instagram: "photo-camera",
  YouTube: "play-circle-fill",
  Image: "image",
};

export const TrendingMediaCard = ({ media, onPress }: Props): JSX.Element => (
  <TouchableOpacity
    style={styles.container}
    activeOpacity={0.9}
    onPress={() => onPress?.(media)}
  >
    <View style={styles.header}>
      <View style={styles.platformBadge}>
        <MaterialIcons
          name={platformIcon[media.platform]}
          size={16}
          color={colors.textPrimary}
        />
        <Text style={styles.platformText}>{media.platform}</Text>
      </View>
      <View style={styles.reactionRow}>
        <View style={styles.reaction}>
          <MaterialIcons name="thumb-up" size={16} color={colors.success} />
          <Text style={styles.reactionText}>{media.likes}</Text>
        </View>
        <View style={styles.reaction}>
          <MaterialIcons name="thumb-down" size={16} color={colors.danger} />
          <Text style={styles.reactionText}>{media.dislikes}</Text>
        </View>
      </View>
    </View>

    <Text style={styles.title} numberOfLines={2}>
      {media.title}
    </Text>
    {media.description ? (
      <Text style={styles.description} numberOfLines={3}>
        {media.description}
      </Text>
    ) : null}
    <Text style={styles.link} numberOfLines={1}>
      {media.url}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  platformText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  reactionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reaction: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  reactionText: {
    color: colors.textSecondary,
    marginLeft: 4,
    fontSize: 12,
  },
  title: {
    marginTop: 12,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 14,
  },
  link: {
    marginTop: 12,
    color: colors.accent,
    fontSize: 12,
  },
});
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { TrendingMedia } from "../types";
import { colors } from "../theme/colors";

interface Props {
  media: TrendingMedia;
  onPress?: () => void;
}

export const TrendingMediaCard = ({ media, onPress }: Props): JSX.Element => {
  const getPlatformIcon = () => {
    switch (media.platform) {
      case "Twitter":
        return "tag";
      case "Instagram":
        return "photo-camera";
      case "YouTube":
        return "play-circle-outline";
      default:
        return "image";
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {media.thumbnail ? (
        <Image source={{ uri: media.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <MaterialIcons name="image" color={colors.textSecondary} size={28} />
        </View>
      )}

      <View style={styles.platformBadge}>
        <MaterialIcons
          name={getPlatformIcon()}
          color={colors.textPrimary}
          size={14}
        />
        <Text style={styles.platformText}>{media.platform}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {media.title}
        </Text>
        {media.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {media.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.stat}>
            <MaterialIcons name="thumb-up" color={colors.success} size={16} />
            <Text style={styles.statText}>{media.likes}</Text>
          </View>
          <View style={styles.stat}>
            <MaterialIcons name="thumb-down" color={colors.danger} size={16} />
            <Text style={styles.statText}>{media.dislikes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  thumbnail: {
    width: "100%",
    height: 180,
  },
  thumbnailPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1b1b1b",
  },
  platformBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  platformText: {
    color: colors.textPrimary,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    marginTop: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: 4,
  },
});

