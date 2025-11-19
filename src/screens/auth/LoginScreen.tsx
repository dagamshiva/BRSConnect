import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { colors } from "../../theme/colors";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearError, login, selectAuth } from "../../store/slices/authSlice";
import { isValidMobile } from "./utils";

const initialLoginState = {
  identifier: "",
  password: "",
};

export const LoginScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();

  const [mobile, setMobile] = useState("");
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [loginState, setLoginState] = useState({ identifier: "", password: "" });

  const isCredentialSubmitDisabled = useMemo(() => {
    if (auth.loading) {
      return true;
    }
    return !loginState.identifier || !loginState.password;
  }, [auth.loading, loginState]);

  const handleLoginChange = (field: keyof typeof initialLoginState, value: string) => {
    if (auth.error) {
      dispatch(clearError());
    }
    setLoginState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    dispatch(login(loginState));
  };

  const handleOtp = () => {
    if (!isValidMobile(mobile)) {
      Alert.alert("Invalid number", "Enter a valid 10-digit mobile number.");
      return;
    }
    Alert.alert("Demo OTP", "123456 has been sent to your mobile.");
    navigation.navigate("OTP", { mobile: `+91 ${mobile}` });
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
          {renderError()}

          <Text style={styles.sectionHeading}>Quick OTP Login</Text>
          <Text style={styles.sectionHelper}>Sign in instantly with your mobile number.</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
            maxLength={10}
          />
          <TouchableOpacity 
            style={[styles.primaryButton, !isValidMobile(mobile) && styles.buttonDisabled]} 
            onPress={handleOtp} 
            disabled={!isValidMobile(mobile) || auth.loading}
          >
            {auth.loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Get OTP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={styles.altButton}
            onPress={() => setShowCredentialForm((prev) => !prev)}
          >
            <MaterialIcons name="person-outline" size={22} color={colors.textPrimary} />
            <Text style={styles.altButtonText}>
              {showCredentialForm ? "Hide Password Login" : "Login with User ID + Password"}
            </Text>
          </TouchableOpacity>

          {showCredentialForm ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="User ID or Email"
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
              <TouchableOpacity
                style={[styles.primaryButton, styles.credentialButton]}
                onPress={handleSubmit}
                disabled={isCredentialSubmitDisabled}
              >
                {auth.loading ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text style={styles.primaryButtonText}>Login Securely</Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={styles.membershipButton}
            onPress={() => navigation.navigate("MembershipRegistration" as never)}
          >
            <MaterialIcons name="person-add" size={22} color={colors.primary} />
            <Text style={styles.membershipButtonText}>Apply for Membership</Text>
          </TouchableOpacity>
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
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    marginHorizontal: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  altButton: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  altButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  credentialButton: {
    marginTop: 0,
    marginBottom: 0,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionHelper: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: "center",
  },
  membershipButton: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 12,
  },
  membershipButtonText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
});

