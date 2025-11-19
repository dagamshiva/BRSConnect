import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { colors } from "../../theme/colors";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearError,
  login,
  register,
  selectAuth,
} from "../../store/slices/authSlice";

const initialLoginState = {
  identifier: "",
  password: "",
};

const initialRegisterState = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  assemblySegment: "",
  village: "",
  ward: "",
  booth: "",
};

export const LoginScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);

  const [isRegistering, setIsRegistering] = useState(false);
  const [loginState, setLoginState] = useState(initialLoginState);
  const [registerState, setRegisterState] = useState(initialRegisterState);

  const isSubmitDisabled = useMemo(() => {
    if (auth.loading) {
      return true;
    }

    if (isRegistering) {
      return (
        !registerState.name ||
        !registerState.password ||
        !registerState.assemblySegment ||
        (!registerState.email && !registerState.mobile)
      );
    }

    return !loginState.identifier || !loginState.password;
  }, [auth.loading, isRegistering, loginState, registerState]);

  const handleLoginChange = (field: keyof typeof initialLoginState, value: string) => {
    if (auth.error) {
      dispatch(clearError());
    }
    setLoginState((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegisterChange = (
    field: keyof typeof initialRegisterState,
    value: string,
  ) => {
    if (auth.error) {
      dispatch(clearError());
    }
    setRegisterState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (isRegistering) {
      dispatch(
        register({
          ...registerState,
          email: registerState.email || undefined,
          mobile: registerState.mobile || undefined,
        }),
      );
    } else {
      dispatch(login(loginState));
    }
  };

  const toggleMode = () => {
    setIsRegistering((prev) => !prev);
    dispatch(clearError());
  };

  const renderError = () =>
    auth.error ? <Text style={styles.errorText}>{auth.error}</Text> : null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrapper}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="directions-car" size={56} color={colors.primary} />
          </View>
          <Text style={styles.title}>BRSConnect</Text>
          <Text style={styles.subtitle}>Powering the Pink Car movement…</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <TouchableOpacity
              style={[styles.switchButton, !isRegistering && styles.switchButtonActive]}
              onPress={() => {
                if (isRegistering) {
                  toggleMode();
                }
              }}
            >
              <Text
                style={[
                  styles.switchText,
                  !isRegistering && styles.switchTextActive,
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchButton, isRegistering && styles.switchButtonActive]}
              onPress={() => {
                if (!isRegistering) {
                  toggleMode();
                }
              }}
            >
              <Text
                style={[
                  styles.switchText,
                  isRegistering && styles.switchTextActive,
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {renderError()}

          {!isRegistering ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email or Mobile"
                placeholderTextColor={colors.textSecondary}
                value={loginState.identifier}
                onChangeText={(value) => handleLoginChange("identifier", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={loginState.password}
                onChangeText={(value) => handleLoginChange("password", value)}
                secureTextEntry
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitDisabled}>
                {auth.loading ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text style={styles.submitText}>Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkText}>Use OTP instead</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={registerState.name}
                onChangeText={(value) => handleRegisterChange("name", value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Email (optional)"
                placeholderTextColor={colors.textSecondary}
                value={registerState.email}
                onChangeText={(value) => handleRegisterChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Mobile (optional)"
                placeholderTextColor={colors.textSecondary}
                value={registerState.mobile}
                onChangeText={(value) => handleRegisterChange("mobile", value)}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={registerState.password}
                onChangeText={(value) => handleRegisterChange("password", value)}
                secureTextEntry
              />
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionTitle}>Assigned Areas</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Assembly Segment"
                placeholderTextColor={colors.textSecondary}
                value={registerState.assemblySegment}
                onChangeText={(value) =>
                  handleRegisterChange("assemblySegment", value)
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Village (optional)"
                placeholderTextColor={colors.textSecondary}
                value={registerState.village}
                onChangeText={(value) => handleRegisterChange("village", value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Ward (optional)"
                placeholderTextColor={colors.textSecondary}
                value={registerState.ward}
                onChangeText={(value) => handleRegisterChange("ward", value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Booth (optional)"
                placeholderTextColor={colors.textSecondary}
                value={registerState.booth}
                onChangeText={(value) => handleRegisterChange("booth", value)}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitDisabled}>
                {auth.loading ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text style={styles.submitText}>Submit Registration</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchRow: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  switchButtonActive: {
    backgroundColor: colors.primary,
  },
  switchText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  switchTextActive: {
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  linkButton: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: colors.accent,
    fontWeight: "600",
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: "center",
  },
});

