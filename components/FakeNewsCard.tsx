import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import type { FakeNewsPost } from "../types";
import { colors } from "../theme/colors";

interface Props {
  fakeNews: FakeNewsPost;
  onLike?: (post: FakeNewsPost) => void;
  onDislike?: (post: FakeNewsPost) => void;
  onShare?: (post: FakeNewsPost) => void;
}

export const FakeNewsCard = ({
  fakeNews,
  onLike,
  onDislike,
  onShare,
}: Props): JSX.Element => (
  <View style={styles.container}>
    <View style={styles.banner}>
      <MaterialIcons name="warning" size={20} color={colors.textPrimary} />
      <Text style={styles.bannerText}>Fake News Alert</Text>
    </View>

    <View style={styles.content}>
      <Text style={styles.title}>{fakeNews.title}</Text>
      {fakeNews.description ? (
        <Text style={styles.description}>{fakeNews.description}</Text>
      ) : null}

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Posted by {fakeNews.postedBy}</Text>
        <Text style={styles.metaText}>
          {new Date(fakeNews.publishedAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike?.(fakeNews)}
        >
          <MaterialIcons name="thumb-up" size={18} color={colors.success} />
          <Text style={styles.actionText}>{fakeNews.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDislike?.(fakeNews)}
        >
          <MaterialIcons name="thumb-down" size={18} color={colors.danger} />
          <Text style={styles.actionText}>{fakeNews.dislikes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => onShare?.(fakeNews)}
        >
          <MaterialIcons name="share" size={18} color={colors.textPrimary} />
          <Text style={[styles.actionText, styles.shareText]}>Share Debunk</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.danger,
    overflow: "hidden",
    marginBottom: 16,
  },
  banner: {
    backgroundColor: colors.danger,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  bannerText: {
    color: colors.textPrimary,
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
  },
  content: {
    padding: 18,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    gap: 6,
  },
  actionText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shareText: {
    color: colors.textPrimary,
  },
});

