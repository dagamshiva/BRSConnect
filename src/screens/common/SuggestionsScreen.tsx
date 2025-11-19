import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { colors } from "../../theme/colors";
import { useLocalSuggestions } from "../../context/LocalSuggestionsContext";

export const SuggestionsScreen = (): JSX.Element => {
  const { suggestions, addSuggestion, likeSuggestion, addComment } = useLocalSuggestions();
  const [inputText, setInputText] = useState("");

  const handleSubmit = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      Alert.alert("Empty suggestion", "Please write a suggestion before submitting.");
      return;
    }

    // Split into title and summary (first line as title, rest as summary)
    const lines = trimmed.split("\n").filter((line) => line.trim());
    const title = lines[0] || trimmed.substring(0, 50);
    const summary = lines.length > 1 ? lines.slice(1).join(" ") : trimmed.substring(50) || trimmed;

    addSuggestion(title, summary);
    setInputText("");
    Alert.alert("Suggestion posted", "Your suggestion has been added to the list.");
  };

  const handleLike = (suggestionId: string) => {
    likeSuggestion(suggestionId);
  };

  const handleComment = (suggestionId: string) => {
    addComment(suggestionId);
    Alert.alert("Comment added", "Your comment has been recorded.");
  };

  const sortedSuggestions = [...suggestions].sort((a, b) => b.likes - a.likes).slice(0, 10);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Suggestions</Text>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Write a Suggestion</Text>
        <TextInput
          style={styles.input}
          placeholder="Share your idea or feedback..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <MaterialIcons name="send" size={18} color={colors.textPrimary} />
          <Text style={styles.submitText}>Post Suggestion</Text>
        </TouchableOpacity>
      </View>

      {sortedSuggestions.map((suggestion) => {
        const isTrending = suggestion.likes >= 500;
        return (
          <View key={suggestion.id} style={styles.suggestionCard}>
            {isTrending && (
              <View style={styles.trendingBadge}>
                <MaterialIcons name="trending-up" size={14} color={colors.accent} />
                <Text style={styles.trendingText}>Top Suggestion</Text>
              </View>
            )}
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            <Text style={styles.suggestionSummary}>{suggestion.summary}</Text>
            <View style={styles.engagementRow}>
              <TouchableOpacity
                style={styles.engagementButton}
                onPress={() => handleLike(suggestion.id)}
              >
                <MaterialIcons name="thumb-up" size={16} color={colors.textSecondary} />
                <Text style={styles.engagementText}>{suggestion.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.engagementButton}
                onPress={() => handleComment(suggestion.id)}
              >
                <MaterialIcons name="comment" size={16} color={colors.textSecondary} />
                <Text style={styles.engagementText}>{suggestion.comments}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {sortedSuggestions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="lightbulb-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No suggestions yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to share your ideas with the community.
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
    marginBottom: 8,
  },
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    minHeight: 100,
    fontSize: 14,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  submitText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  suggestionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 12,
  },
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  trendingText: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 11,
  },
  suggestionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  suggestionSummary: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  engagementRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  engagementButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  engagementText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 48,
    gap: 12,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});

