import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
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
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../../theme/useTheme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, login, selectAuth } from '../../store/slices/authSlice';
import { isValidMobile } from './utils';
import { BRSLogo } from '../../components/BRSLogo';

const initialLoginState = {
  identifier: '',
  password: '',
};

export const LoginScreen = (): ReactElement => {
  console.log("LoginScreen: Rendering");
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const navigation =
    useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const colors = useTheme();
  
  console.log("LoginScreen: Auth state", { loading: auth.loading, error: auth.error });

  const [mobile, setMobile] = useState('');
  const [loginState, setLoginState] = useState({
    identifier: '',
    password: '',
  });
  
  // Create dynamic styles based on current theme
  const styles = useMemo(() => StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 24,
      paddingBottom: 48,
    },
    logoWrapper: {
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.primary,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '400',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 22,
      marginTop: 18,
      borderWidth: 0,
      shadowColor: colors.shadow || 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    sectionHeading: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    sectionHelper: {
      color: colors.textSecondary,
      marginBottom: 14,
      fontSize: 14,
      fontWeight: '400',
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 12,
      fontWeight: '400',
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    credentialButton: {
      marginTop: 0,
      marginBottom: 0,
    },
    otpSection: {
      marginTop: 24,
    },
    otpInput: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    otpButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    separator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    separatorText: {
      marginHorizontal: 16,
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    errorText: {
      color: colors.danger,
      marginBottom: 12,
      textAlign: 'center',
    },
    membershipButton: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderWidth: 2,
      borderColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      gap: 12,
    },
    membershipButtonText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 16,
    },
  }), [colors]);

  const isCredentialSubmitDisabled = useMemo(() => {
    if (auth.loading) {
      return true;
    }
    return !loginState.identifier || !loginState.password;
  }, [auth.loading, loginState]);

  const handleLoginChange = (
    field: keyof typeof initialLoginState,
    value: string,
  ) => {
    if (auth.error) {
      dispatch(clearError());
    }
    setLoginState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    dispatch(login(loginState));
  };

  const handleOtp = () => {
    if (!isValidMobile(mobile)) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number.');
      return;
    }
    Alert.alert('Demo OTP', '123456 has been sent to your mobile.');
    navigation.navigate('OTP', { mobile: `+91 ${mobile}` });
  };

  const renderError = () =>
    auth.error ? <Text style={styles.errorText}>{auth.error}</Text> : null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrapper}>
          <BRSLogo size={120} showText={false} variant="icon" />
          <Text style={styles.title}>BRSConnect</Text>
          <Text style={styles.subtitle}>Powering the Pink Car movement…</Text>
        </View>

        <View style={styles.card}>
          {renderError()}

          <Text style={styles.sectionHeading}>
            Login with User ID + Password
          </Text>
          <Text style={styles.sectionHelper}>
            Sign in using your BRS credentials.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="User ID or Email"
            placeholderTextColor={colors.textSecondary}
            value={loginState.identifier}
            onChangeText={value => handleLoginChange('identifier', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={loginState.password}
            onChangeText={value => handleLoginChange('password', value)}
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

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <Text style={styles.sectionHeading}>Quick OTP Login</Text>
          <Text style={styles.sectionHelper}>
            Sign in instantly with your mobile number.
          </Text>
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
            style={[
              styles.primaryButton,
              !isValidMobile(mobile) && styles.buttonDisabled,
            ]}
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
            style={styles.membershipButton}
            onPress={() =>
              navigation.navigate('MembershipRegistration' as never)
            }
          >
            <MaterialIcons name="person-add" size={22} color={colors.primary} />
            <Text style={styles.membershipButtonText}>
              Apply for Membership
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
