import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme/useTheme';

interface UserBadgeProps {
  points: number | null | undefined;
  size?: number;
}

export const UserBadge = ({
  points,
  size = 18,
}: UserBadgeProps): React.ReactElement | null => {
  const colors = useTheme();

  if (!points || points === 0) {
    return null;
  }

  let badgeType: 'gold' | 'silver' | 'bronze' | null = null;

  if (points > 7000) {
    badgeType = 'gold';
  } else if (points > 5000) {
    badgeType = 'silver';
  } else if (points > 3000) {
    badgeType = 'bronze';
  }

  if (!badgeType) {
    return null;
  }

  // Colors that work in both light and dark themes
  const badgeColors = {
    gold: {
      icon: '#FFD700', // Gold - visible in both themes
      border: '#FFA500', // Orange gold border
      glow: '#FFD700',
    },
    silver: {
      icon: '#C0C0C0', // Silver - visible in both themes
      border: '#A8A8A8', // Darker silver border
      glow: '#C0C0C0',
    },
    bronze: {
      icon: '#CD7F32', // Bronze - visible in both themes
      border: '#A0522D', // Darker bronze border
      glow: '#CD7F32',
    },
  };

  const currentBadge = badgeColors[badgeType];

  const badgeStyles = StyleSheet.create({
    badge: {
      marginLeft: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      shadowColor: currentBadge.glow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 3,
      elevation: 3,
    },
  });

  return (
    <View style={badgeStyles.badge}>
      <View style={badgeStyles.iconContainer}>
        <MaterialIcons
          name="emoji-events"
          size={size}
          color={currentBadge.icon}
        />
      </View>
    </View>
  );
};
