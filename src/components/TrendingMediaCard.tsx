import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

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
    borderWidth: 1.5,
    borderColor: `${colors.primary}40`,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
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

