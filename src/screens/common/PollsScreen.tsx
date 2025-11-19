import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme/colors";
import { useLocalPolls, type LocalPoll } from "../../context/LocalPollsContext";
import { mockFeed } from "../../../mocks/mock_feed";
import { telanganaUsers } from "../../../mocks/telangana_user";
import { randomInt, formatPostedAt } from "../../data/commonData";

const percentage = (votes: number, total: number) =>
  total === 0 ? 0 : Math.round((votes / total) * 100);

type DisplayPoll = LocalPoll & {
  source: "mock" | "local";
  assemblySegment?: string | null;
  postedAt?: string;
  postedBy?: string;
};

// Helper to get user alias name from UUID
const getUserAliasName = (userId: string | undefined | null): string => {
  if (!userId) return 'Unknown';
  const user = telanganaUsers.find(u => u.id === userId);
  if (user) {
    // Prioritize aliasName, fallback to name, then 'Unknown'
    return user.aliasName || user.name || 'Unknown';
  }
  // If user not found, return the userId (UUID) as fallback
  return userId;
};

const mockPollSeed: DisplayPoll[] = mockFeed
  .filter((item) => item.type === "POLL")
  .slice(0, 40)
  .map((item) => ({
    id: `mock-${item.id}`,
    question: item.title,
    status: item.likes && item.likes > (item.dislikes ?? 0) ? "Trending" : "Assembly",
    options:
      item.options?.map((opt) => ({
        id: opt.id,
        label: opt.label,
        votes: opt.votes,
      })) ?? [
        { id: `${item.id}-opt-a`, label: "Support", votes: randomInt(50, 150) },
        { id: `${item.id}-opt-b`, label: "Neutral", votes: randomInt(20, 80) },
      ],
    likes: item.likes ?? randomInt(150, 800),
    dislikes: item.dislikes ?? randomInt(5, 120),
    source: "mock",
    assemblySegment: item.areaScope?.assemblySegment ?? "Statewide",
    postedAt: item.postedAt,
    postedBy: getUserAliasName(item.postedBy) || item.authorName || 'Unknown',
  }));

export const PollsScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { polls, vote, forwardToTrending } = useLocalPolls();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [mockPolls, setMockPolls] = useState<DisplayPoll[]>(mockPollSeed);

  const combinedPolls = useMemo<DisplayPoll[]>(
    () => [
      ...mockPolls,
      ...polls.map<DisplayPoll>((poll) => ({ ...poll, source: "local" })),
    ],
    [mockPolls, polls],
  );

  const sortedPolls = useMemo(
    () =>
      [...combinedPolls].sort(
        (a, b) =>
          b.options.reduce((sum, opt) => sum + opt.votes, 0) -
          a.options.reduce((sum, opt) => sum + opt.votes, 0),
      ),
    [combinedPolls],
  );

  const handleLocalVote = (pollId: string, optionId: string) => {
    vote(pollId, optionId, userVotes[pollId]);
    setUserVotes((prev) => ({ ...prev, [pollId]: optionId }));
    Alert.alert("Vote recorded", "Thanks for taking the poll!");
  };

  const handleMockVote = (pollId: string, optionId: string) => {
    setMockPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        const previous = userVotes[pollId];
        let updatedOptions = poll.options;
        if (previous && previous !== optionId) {
          updatedOptions = updatedOptions.map((opt) =>
            opt.id === previous ? { ...opt, votes: Math.max(0, opt.votes - 1) } : opt,
          );
        }
        updatedOptions = updatedOptions.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt,
        );
        return { ...poll, options: updatedOptions };
      }),
    );
    setUserVotes((prev) => ({ ...prev, [pollId]: optionId }));
    Alert.alert("Vote recorded", "Thanks for taking the poll!");
  };

  const handleForward = (pollId: string) => {
    Alert.alert(
      "Forward to State",
      "Convert this assembly poll into a state-level trending poll?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Forward",
          onPress: () => {
            forwardToTrending(pollId);
            Alert.alert("Forwarded", "Poll promoted to state trending list.");
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Pink Car Polling Station</Text>
      <Text style={styles.pageSubtitle}>
        Create quick polls and review the top performers.
      </Text>

      <TouchableOpacity
        style={styles.createPollButton}
        onPress={() => navigation.navigate("CreatePoll")}
      >
        <MaterialIcons name="add-circle-outline" size={20} color={colors.textPrimary} />
        <Text style={styles.createPollText}>Create New Poll</Text>
      </TouchableOpacity>

      {sortedPolls.map((poll) => {
        const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        return (
          <View key={poll.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardStatus}>{poll.status}</Text>
              <Text style={styles.cardVotes}>{total} votes</Text>
            </View>
            <Text style={styles.cardQuestion}>{poll.question}</Text>
            
            {/* Metadata Section */}
            <View style={styles.metadataContainer}>
              {poll.assemblySegment ? (
                <Text style={styles.cardMetadata}>{poll.assemblySegment}</Text>
              ) : null}
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="thumb-up" size={14} color={colors.success} />
                  <Text style={styles.metaText}>{poll.likes ?? 0}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="thumb-down" size={14} color={colors.danger} />
                  <Text style={styles.metaText}>{poll.dislikes ?? 0}</Text>
                </View>
              </View>
              
              {poll.postedBy ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Posted by:</Text>
                  <Text style={styles.metaValue}>{poll.postedBy}</Text>
                </View>
              ) : null}
              
              {poll.postedAt ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Posted at:</Text>
                  <Text style={styles.metaValue}>{formatPostedAt(poll.postedAt)}</Text>
                </View>
              ) : null}
            </View>
            {poll.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionRow,
                  selectedOptions[poll.id] === option.id && styles.optionSelected,
                ]}
                onPress={() =>
                  setSelectedOptions((prev) => ({ ...prev, [poll.id]: option.id }))
                }
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionVotes}>{option.votes} votes</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage(option.votes, total)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.optionPercentage}>
                  {percentage(option.votes, total)}%
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.voteButton,
                !selectedOptions[poll.id] && styles.voteButtonDisabled,
              ]}
              onPress={() => {
                const optionId = selectedOptions[poll.id];
                if (optionId) {
                  if (poll.source === "mock") {
                    handleMockVote(poll.id, optionId);
                  } else {
                    handleLocalVote(poll.id, optionId);
                  }
                }
              }}
              disabled={!selectedOptions[poll.id]}
            >
              <MaterialIcons name="how-to-vote" size={18} color={colors.textPrimary} />
              <Text style={styles.voteButtonText}>Cast Vote</Text>
            </TouchableOpacity>
            {poll.source === "local" && poll.status === "Assembly" ? (
              <TouchableOpacity style={styles.forwardButton} onPress={() => handleForward(poll.id)}>
                <MaterialIcons name="trending-up" size={18} color={colors.textPrimary} />
                <Text style={styles.forwardButtonText}>Forward to State Trending</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}

      {sortedPolls.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="hourglass-empty" size={28} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No polls yet</Text>
          <Text style={styles.emptySubtitle}>
            Use the button above to create demo polls for your walkthrough.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 20,
  },
  pageSubtitle: {
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 16,
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
    fontWeight: "700",
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 18,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardStatus: {
    color: colors.accent,
    fontWeight: "700",
  },
  cardVotes: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cardQuestion: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  cardMetadata: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  metadataContainer: {
    marginBottom: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  optionRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionLabel: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  optionVotes: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 999,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  optionPercentage: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  voteButtonDisabled: {
    opacity: 0.6,
  },
  voteButtonText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  forwardButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  forwardButtonText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 48,
    gap: 8,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});

