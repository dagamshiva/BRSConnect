import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { colors } from "../../theme/colors";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

export const PendingApprovalScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();

  return (
    <View style={styles.container}>
      <MaterialIcons name="hourglass-top" size={72} color={colors.accent} />
      <Text style={styles.title}>Pending Approval</Text>
      <Text style={styles.subtitle}>
        Thank you for registering with the Pink Car movement. Your details are
        under review. We will notify you once your access is approved.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => dispatch(logout())}>
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 16,
  },
  subtitle: {
    marginTop: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
});

