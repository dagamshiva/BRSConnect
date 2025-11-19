import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";

export const AdminAlertsScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const auth = useAppSelector(selectAuth);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSendAlert = () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter an alert title.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Message required", "Please enter an alert message.");
      return;
    }

    // Demo: Show success alert
    Alert.alert(
      "Alert sent",
      `Alert "${title}" has been sent to the assembly.`,
      [{ text: "OK", onPress: () => {
        setTitle("");
        setMessage("");
      }}],
    );
  };

  const assemblyName = auth.user?.assignedAreas.assemblySegment || "Assembly";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts Screen (Admin)</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.sendAlertHeader}>
          <MaterialIcons name="campaign" size={20} color={colors.textPrimary} />
          <Text style={styles.sendAlertText}>Send Alert to {assemblyName}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Title Input</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter alert title..."
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Message Input</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Enter alert message..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.sendButton} onPress={handleSendAlert}>
          <MaterialIcons name="send" size={20} color={colors.textPrimary} />
          <Text style={styles.sendButtonText}>Send Alert</Text>
        </TouchableOpacity>
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
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
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
    gap: 16,
  },
  sendAlertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  sendAlertText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
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
  sendButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});

