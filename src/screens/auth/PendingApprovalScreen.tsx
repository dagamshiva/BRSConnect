import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { colors } from "../../theme/colors";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

export const PendingApprovalScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const handleResend = () => {
    Alert.alert(
      "Request re-sent",
      "Your membership request has been nudged to the admin. We'll notify you after approval.",
    );
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="hourglass-top" size={72} color={colors.accent} />
      <Text style={styles.title}>Pending Approval</Text>
      <Text style={styles.subtitle}>
        Thank you for registering with the Pink Car movement. Access is enabled only
        after an admin approves your request.
      </Text>
      <TouchableOpacity style={styles.secondaryButton} onPress={handleResend}>
        <Text style={styles.secondaryButtonText}>Re-send Request</Text>
      </TouchableOpacity>
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
  secondaryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: "700",
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

