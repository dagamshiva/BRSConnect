import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme/colors";
import { useLocalPolls } from "../../context/LocalPollsContext";

export const CreatePollScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { addPoll } = useLocalPolls();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  const handleChangeOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, idx) => (idx === index ? value : opt)));
  };

  const handleSubmit = () => {
    const trimmed = options.map((opt) => opt.trim()).filter(Boolean);
    if (!question.trim() || trimmed.length < 2) {
      Alert.alert("Add details", "Enter a question and at least two options.");
      return;
    }
    addPoll(question.trim(), trimmed, "Assembly");
    Alert.alert("Poll saved", "Demo poll added to the list.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Poll</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Question</Text>
        <TextInput
          style={[styles.input, styles.questionInput]}
          placeholder="What should we ask the cadre?"
          placeholderTextColor={colors.textSecondary}
          value={question}
          onChangeText={setQuestion}
          multiline
        />

        <Text style={[styles.label, styles.optionsLabel]}>Options</Text>
        {options.map((value, index) => (
          <TextInput
            key={`option-${index}`}
            style={styles.input}
            placeholder={`Option ${index + 1}`}
            placeholderTextColor={colors.textSecondary}
            value={value}
            onChangeText={(text) => handleChangeOption(index, text)}
          />
        ))}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <MaterialIcons name="how-to-vote" size={20} color={colors.textPrimary} />
          <Text style={styles.submitText}>Submit Poll</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 14,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  optionsLabel: {
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
  },
  questionInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: -0.2,
  },
});


