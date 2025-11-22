import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectAuth, updateUser } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { telanganaUsers } from '../../../mocks/telangana_user';

type ViewTypeSelection = 'PARTY_PREFERENCE' | 'BRS_SATISFACTION' | null;

export const PostAssemblyViewScreen = (): React.ReactElement => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const [selectedViewType, setSelectedViewType] =
    useState<ViewTypeSelection>(null);
  const [selectedParty, setSelectedParty] = useState<
    'BRS' | 'Congress' | 'BJP' | 'Others' | null
  >(null);
  const [selectedSatisfaction, setSelectedSatisfaction] = useState<
    'Happy' | 'Not Happy' | null
  >(null);

  const userAssemblySegment =
    user?.assignedAreas?.assemblySegment || 'Unknown';

  // Load existing votes when component mounts
  useEffect(() => {
    if (user?.votingPreferences) {
      if (user.votingPreferences.partyPreference) {
        setSelectedParty(user.votingPreferences.partyPreference);
      }
      if (user.votingPreferences.brsSatisfaction) {
        setSelectedSatisfaction(user.votingPreferences.brsSatisfaction);
      }
    }
  }, [user]);

  const handleSubmit = () => {
    if (!user) {
      Alert.alert('Error', 'Please login to post your view.');
      return;
    }

    if (!selectedViewType) {
      Alert.alert('Select View Type', 'Please select a view type first.');
      return;
    }

    if (
      selectedViewType === 'PARTY_PREFERENCE' &&
      !selectedParty
    ) {
      Alert.alert('Select Party', 'Please select your preferred party.');
      return;
    }

    if (
      selectedViewType === 'BRS_SATISFACTION' &&
      !selectedSatisfaction
    ) {
      Alert.alert(
        'Select Satisfaction',
        'Please select your satisfaction level.',
      );
      return;
    }

    // Find the user in telanganaUsers and update their voting preferences
    const userIndex = telanganaUsers.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) {
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }

    const now = new Date().toISOString();
    
    // Update user's voting preferences
    if (!telanganaUsers[userIndex].votingPreferences) {
      telanganaUsers[userIndex].votingPreferences = {};
    }

    let updatedPreferences;

    // Update the specific vote type
    if (selectedViewType === 'PARTY_PREFERENCE' && selectedParty) {
      const previousParty = telanganaUsers[userIndex].votingPreferences?.partyPreference;
      updatedPreferences = {
        ...telanganaUsers[userIndex].votingPreferences,
        partyPreference: selectedParty,
        partyPreferenceUpdatedAt: now,
        // Keep existing BRS satisfaction if updating only party preference
        brsSatisfaction: telanganaUsers[userIndex].votingPreferences?.brsSatisfaction || null,
        brsSatisfactionUpdatedAt: telanganaUsers[userIndex].votingPreferences?.brsSatisfactionUpdatedAt || null,
      };
      
      // Update in memory
      telanganaUsers[userIndex].votingPreferences = updatedPreferences;
      
      // Also update mockAuthRecords if this user is in there (for session sync)
      try {
        const { mockAuthRecords } = require('../../../src/mocks/mockAuth');
        const authRecord = mockAuthRecords.find((r: any) => r.user?.id === user.id);
        if (authRecord && authRecord.user) {
          authRecord.user.votingPreferences = updatedPreferences;
        }
      } catch (e) {
        // Ignore if mockAuth not available
      }
      
      // Update Redux store so UI reflects the changes immediately
      dispatch(updateUser({ votingPreferences: updatedPreferences }));
      
      // NOTE: In-memory updates are done. For file persistence in development,
      // the telanganaUsers array is updated and will persist during the session.
      // For production, implement API endpoint to save votes to backend.
      
      const message = previousParty 
        ? `Your party preference has been updated from ${previousParty} to ${selectedParty}.`
        : `Your party preference (${selectedParty}) has been saved for ${userAssemblySegment} assembly segment.`;
      
      Alert.alert(
        previousParty ? 'Vote Updated' : 'Vote Submitted',
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedViewType(null);
              setSelectedParty(null);
              setSelectedSatisfaction(null);
              navigation.goBack();
            },
          },
        ],
      );
    } else if (selectedViewType === 'BRS_SATISFACTION' && selectedSatisfaction) {
      const previousSatisfaction = telanganaUsers[userIndex].votingPreferences?.brsSatisfaction;
      updatedPreferences = {
        ...telanganaUsers[userIndex].votingPreferences,
        brsSatisfaction: selectedSatisfaction,
        brsSatisfactionUpdatedAt: now,
        // Keep existing party preference if updating only satisfaction
        partyPreference: telanganaUsers[userIndex].votingPreferences?.partyPreference || null,
        partyPreferenceUpdatedAt: telanganaUsers[userIndex].votingPreferences?.partyPreferenceUpdatedAt || null,
      };
      
      // Update in memory
      telanganaUsers[userIndex].votingPreferences = updatedPreferences;
      
      // Also update mockAuthRecords if this user is in there (for session sync)
      try {
        const { mockAuthRecords } = require('../../../src/mocks/mockAuth');
        const authRecord = mockAuthRecords.find((r: any) => r.user?.id === user.id);
        if (authRecord && authRecord.user) {
          authRecord.user.votingPreferences = updatedPreferences;
        }
      } catch (e) {
        // Ignore if mockAuth not available
      }
      
      // Update Redux store so UI reflects the changes immediately
      dispatch(updateUser({ votingPreferences: updatedPreferences }));
      
      const message = previousSatisfaction
        ? `Your satisfaction has been updated from "${previousSatisfaction}" to "${selectedSatisfaction === 'Happy' ? 'Happy' : 'Not Happy'}".`
        : `Your satisfaction view (${selectedSatisfaction === 'Happy' ? 'Happy' : 'Not Happy'}) has been saved for ${userAssemblySegment} assembly segment.`;
      
      Alert.alert(
        previousSatisfaction ? 'Vote Updated' : 'Vote Submitted',
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedViewType(null);
              setSelectedParty(null);
              setSelectedSatisfaction(null);
              navigation.goBack();
            },
          },
        ],
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Your View</Text>
      </View>

      <View style={styles.infoCard}>
        <MaterialIcons name="info" size={20} color={colors.info} />
        <Text style={styles.infoText}>
          You can post your view for your assembly segment:{' '}
          <Text style={styles.assemblyText}>{userAssemblySegment}</Text>
        </Text>
      </View>

      {/* Show existing votes if any */}
      {user?.votingPreferences && (
        (user.votingPreferences.partyPreference || user.votingPreferences.brsSatisfaction) && (
          <View style={styles.existingVotesCard}>
            <MaterialIcons name="history" size={20} color={colors.accent} />
            <View style={styles.existingVotesContent}>
              <Text style={styles.existingVotesTitle}>Your Current Votes:</Text>
              {user.votingPreferences.partyPreference && (
                <Text style={styles.existingVoteText}>
                  Party Preference: <Text style={styles.voteValue}>{user.votingPreferences.partyPreference}</Text>
                  {user.votingPreferences.partyPreferenceUpdatedAt && (
                    <Text style={styles.voteDate}>
                      {' '}(Updated: {new Date(user.votingPreferences.partyPreferenceUpdatedAt).toLocaleDateString()})
                    </Text>
                  )}
                </Text>
              )}
              {user.votingPreferences.brsSatisfaction && (
                <Text style={styles.existingVoteText}>
                  BRS Satisfaction: <Text style={styles.voteValue}>
                    {user.votingPreferences.brsSatisfaction === 'Happy' ? 'Happy' : 'Not Happy'}
                  </Text>
                  {user.votingPreferences.brsSatisfactionUpdatedAt && (
                    <Text style={styles.voteDate}>
                      {' '}(Updated: {new Date(user.votingPreferences.brsSatisfactionUpdatedAt).toLocaleDateString()})
                    </Text>
                  )}
                </Text>
              )}
              <Text style={styles.updateNote}>You can update your votes below.</Text>
            </View>
          </View>
        )
      )}

      {/* View Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select View Type</Text>
        <View style={styles.viewTypeContainer}>
          <TouchableOpacity
            style={[
              styles.viewTypeCard,
              selectedViewType === 'PARTY_PREFERENCE' &&
                styles.viewTypeCardSelected,
            ]}
            onPress={() => {
              setSelectedViewType('PARTY_PREFERENCE');
              setSelectedSatisfaction(null);
            }}
          >
            <MaterialIcons
              name="pie-chart"
              size={32}
              color={
                selectedViewType === 'PARTY_PREFERENCE'
                  ? colors.primary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.viewTypeText,
                selectedViewType === 'PARTY_PREFERENCE' &&
                  styles.viewTypeTextSelected,
              ]}
            >
              Party Preference
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewTypeCard,
              selectedViewType === 'BRS_SATISFACTION' &&
                styles.viewTypeCardSelected,
            ]}
            onPress={() => {
              setSelectedViewType('BRS_SATISFACTION');
              setSelectedParty(null);
            }}
          >
            <MaterialIcons
              name="speed"
              size={32}
              color={
                selectedViewType === 'BRS_SATISFACTION'
                  ? colors.primary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.viewTypeText,
                selectedViewType === 'BRS_SATISFACTION' &&
                  styles.viewTypeTextSelected,
              ]}
            >
              BRS Satisfaction
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Party Preference Options */}
      {selectedViewType === 'PARTY_PREFERENCE' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Which party do you prefer?
          </Text>
          <View style={styles.optionsContainer}>
            {(['BRS', 'Congress', 'BJP', 'Others'] as const).map(party => (
              <TouchableOpacity
                key={party}
                style={[
                  styles.optionCard,
                  selectedParty === party && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedParty(party)}
              >
                <View
                  style={[
                    styles.optionRadio,
                    selectedParty === party && styles.optionRadioSelected,
                  ]}
                >
                  {selectedParty === party && (
                    <View style={styles.optionRadioInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    selectedParty === party && styles.optionTextSelected,
                  ]}
                >
                  {party}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* BRS Satisfaction Options */}
      {selectedViewType === 'BRS_SATISFACTION' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Are you happy with the current MLA candidate?
          </Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedSatisfaction === 'Happy' && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedSatisfaction('Happy')}
            >
              <View
                style={[
                  styles.optionRadio,
                  selectedSatisfaction === 'Happy' &&
                    styles.optionRadioSelected,
                ]}
              >
                {selectedSatisfaction === 'Happy' && (
                  <View style={styles.optionRadioInner} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedSatisfaction === 'Happy' &&
                    styles.optionTextSelected,
                ]}
              >
                We are happy with current MLA candidate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedSatisfaction === 'Not Happy' &&
                  styles.optionCardSelected,
              ]}
              onPress={() => setSelectedSatisfaction('Not Happy')}
            >
              <View
                style={[
                  styles.optionRadio,
                  selectedSatisfaction === 'Not Happy' &&
                    styles.optionRadioSelected,
                ]}
              >
                {selectedSatisfaction === 'Not Happy' && (
                  <View style={styles.optionRadioInner} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedSatisfaction === 'Not Happy' &&
                    styles.optionTextSelected,
                ]}
              >
                We are not happy with candidate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Submit Button */}
      {(selectedViewType === 'PARTY_PREFERENCE' && selectedParty) ||
      (selectedViewType === 'BRS_SATISFACTION' && selectedSatisfaction) ? (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <MaterialIcons name="send" size={20} color={colors.textPrimary} />
          <Text style={styles.submitText}>Submit View</Text>
        </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.info}20`,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.info,
  },
  infoText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
  },
  assemblyText: {
    fontWeight: '700',
    color: colors.info,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  viewTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  viewTypeCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  viewTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  viewTypeText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  viewTypeTextSelected: {
    color: colors.primary,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: colors.primary,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  existingVotesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: `${colors.accent}20`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  existingVotesContent: {
    flex: 1,
    gap: 8,
  },
  existingVotesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  existingVoteText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  voteValue: {
    fontWeight: '700',
    color: colors.accent,
  },
  voteDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  updateNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

