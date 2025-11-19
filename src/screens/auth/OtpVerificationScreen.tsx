import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { colors } from "../../theme/colors";

type RouteParams = {
  mobile: string;
};

export const OtpVerificationScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mobile } = (route.params as RouteParams) ?? { mobile: "" };
  const [otp, setOtp] = useState("");
  const isValidOtp = otp.trim().length === 6;

  const handleVerify = () => {
    if (!isValidOtp) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit code.");
      return;
    }
    Alert.alert("Verification Success", "Mock OTP accepted. Navigating back.");
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Enter the code sent to {mobile}</Text>
          <TextInput
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            placeholder="••••••"
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity
            style={[styles.verifyButton, !isValidOtp && styles.disabledButton]}
            onPress={handleVerify}
            disabled={!isValidOtp}
          >
            <Text style={styles.verifyText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 16,
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
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 20,
    letterSpacing: 16,
    textAlign: "center",
    color: colors.textPrimary,
    backgroundColor: colors.card,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  verifyText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
});


