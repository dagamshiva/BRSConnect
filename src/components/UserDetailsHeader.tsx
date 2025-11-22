import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { selectAuth } from '../store/slices/authSlice';
import { useTheme } from '../theme/useTheme';

export const UserDetailsHeader = (): React.ReactElement | null => {
  const { user } = useAppSelector(selectAuth);
  const colors = useTheme();

  if (!user) return null;

  const name = user.name || `${user.firstName} ${user.lastName}`;
  const role = user.role || '';
  const assemblySegment = user.assignedAreas?.assemblySegment || '';
  const designation = user.designation || '';

  const parts: string[] = [];
  if (name) parts.push(name);
  if (role) parts.push(role);
  if (assemblySegment) parts.push(assemblySegment);
  if (designation) parts.push(designation);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    userDetails: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'right',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    userName: {
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.userDetails}>
        {parts.map((part, index) => {
          const isName = index === 0;
          return (
            <React.Fragment key={index}>
              {isName ? (
                <Text style={styles.userName}>{part}</Text>
              ) : (
                <Text>{part}</Text>
              )}
              {index < parts.length - 1 && <Text> - </Text>}
            </React.Fragment>
          );
        })}
      </Text>
    </View>
  );
};
