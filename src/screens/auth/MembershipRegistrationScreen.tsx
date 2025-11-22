import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';
import { AssemblySelector } from '../../components/AssemblySelector';
import { registerMembership } from '../../services/membershipService';

interface MembershipFormData {
  firstName: string;
  lastName: string;
  aliasName: string;
  email: string;
  mobile: string;
  assemblySegment: string | null;
  village: string;
  referralId: string;
}

const initialFormData: MembershipFormData = {
  firstName: '',
  lastName: '',
  aliasName: '',
  email: '',
  mobile: '',
  assemblySegment: null,
  village: '',
  referralId: '',
};

export const MembershipRegistrationScreen = (): React.ReactElement => {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const [formData, setFormData] = useState<MembershipFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.aliasName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.mobile.trim() !== '' &&
      formData.assemblySegment !== null &&
      formData.village.trim() !== '' &&
      formData.referralId.trim() !== ''
    );
  }, [formData]);

  const handleFieldChange = (field: keyof MembershipFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssemblySelect = (assembly: string | null) => {
    setFormData(prev => ({ ...prev, assemblySegment: assembly }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string): boolean => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const handleSubmit = async () => {
    // Validate fields
    if (!formData.firstName.trim()) {
      Alert.alert('Validation Error', 'First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Validation Error', 'Last name is required');
      return;
    }
    if (!formData.aliasName.trim()) {
      Alert.alert('Validation Error', 'Alias name is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }
    if (!validateMobile(formData.mobile)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (!formData.assemblySegment) {
      Alert.alert('Validation Error', 'Please select an assembly segment');
      return;
    }
    if (!formData.village.trim()) {
      Alert.alert('Validation Error', 'Village is required');
      return;
    }
    if (!formData.referralId.trim()) {
      Alert.alert('Validation Error', 'Referral ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerMembership({
        firstName: formData.firstName,
        lastName: formData.lastName,
        aliasName: formData.aliasName,
        email: formData.email,
        mobile: formData.mobile,
        assemblySegment: formData.assemblySegment!,
        village: formData.village,
        referralId: formData.referralId,
      });

      if (result.success) {
        Alert.alert('Registration Successful', result.message, [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Registration Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit registration. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Membership Registration</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Personal Information</Text>
          <Text style={styles.sectionHelper}>
            Fill in all the required details to register for membership
          </Text>

          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter first name"
            placeholderTextColor={colors.textSecondary}
            value={formData.firstName}
            onChangeText={value => handleFieldChange('firstName', value)}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter last name"
            placeholderTextColor={colors.textSecondary}
            value={formData.lastName}
            onChangeText={value => handleFieldChange('lastName', value)}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Alias Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter alias name"
            placeholderTextColor={colors.textSecondary}
            value={formData.aliasName}
            onChangeText={value => handleFieldChange('aliasName', value)}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor={colors.textSecondary}
            value={formData.email}
            onChangeText={value => handleFieldChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mobile *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor={colors.textSecondary}
            value={formData.mobile}
            onChangeText={value => handleFieldChange('mobile', value.replace(/[^0-9]/g, ''))}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Assembly Segment *</Text>
          <AssemblySelector
            value={formData.assemblySegment}
            onSelect={handleAssemblySelect}
            placeholder="Select assembly segment"
            mode="autocomplete"
          />

          <Text style={styles.label}>Village *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter village name"
            placeholderTextColor={colors.textSecondary}
            value={formData.village}
            onChangeText={value => handleFieldChange('village', value)}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Referral ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter referral ID"
            placeholderTextColor={colors.textSecondary}
            value={formData.referralId}
            onChangeText={value => handleFieldChange('referralId', value)}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Registration</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            * All fields are required. Your registration will be reviewed by the
            admin/superadmin for your segment before approval.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionHelper: {
    color: colors.textSecondary,
    marginBottom: 20,
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: -0.2,
    fontSize: 16,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

