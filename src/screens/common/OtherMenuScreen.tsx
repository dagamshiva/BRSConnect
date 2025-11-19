import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { useAppSelector } from '../../store/hooks';
import {
  selectIsLocalAdmin,
  selectIsSuperAdmin,
} from '../../store/slices/authSlice';

interface OtherMenuItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  color: string;
}

export const OtherMenuScreen = (): React.ReactElement => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isLocalAdmin = useAppSelector(selectIsLocalAdmin);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);

  const getMenuItems = (): OtherMenuItem[] => {
    const items: OtherMenuItem[] = [
      // Alerts viewing is available to all users
      {
        id: 'alerts-view',
        title: 'View Alerts',
        icon: 'notifications',
        route: 'AlertsView',
        color: colors.info,
      },
    ];
    if (isLocalAdmin || isSuperAdmin) {
      items.push({
        id: 'alerts',
        title: 'Send Alerts',
        icon: 'campaign',
        route: 'Alerts',
        color: colors.warning,
      });
    }
    // Add Membership for admin/super admin
    if (isLocalAdmin || isSuperAdmin) {
      items.push({
        id: 'approval-users',
        title: 'Membership',
        icon: 'people',
        route: 'ApprovalUsers',
        color: colors.success,
      });
    }
    if (isLocalAdmin || isSuperAdmin) {
      items.push({
        id: 'users',
        title: 'Manage Users',
        icon: isSuperAdmin ? 'supervisor-account' : 'group',
        route: 'UserManagement',
        color: colors.info,
      });
    }
    // Add Show User Details for admin/super admin
    if (isLocalAdmin || isSuperAdmin) {
      items.push({
        id: 'user-details',
        title: 'Request User Details',
        icon: 'person-search',
        route: 'ShowUserDetails',
        color: colors.accent,
      });
    }
    // Add admin-specific items
    if (isLocalAdmin || isSuperAdmin) {
      items.push({
        id: 'approvals',
        title: 'My Request Approvals',
        icon: 'verified-user',
        route: 'Approvals',
        color: colors.success,
      });
    }

    // Add Send Message to Segment Admins (for LocalAdmin and SuperAdmin)
    if (isLocalAdmin || isSuperAdmin) {
      items.push({
        id: 'send-message',
        title: 'Message Segment Admins',
        icon: 'send',
        route: 'SendMessageToSegmentAdmins',
        color: colors.info,
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const handleNavigate = (route: string) => {
    // Determine role prefix from user role - must match RootNavigator format
    // RootNavigator uses: 'member', 'localAdmin', 'superAdmin' (camelCase)
    let rolePrefix = 'member';
    if (isSuperAdmin) {
      rolePrefix = 'superAdmin';
    } else if (isLocalAdmin) {
      rolePrefix = 'localAdmin';
    }

    // Map route names to navigation routes (matching menuConfig names)
    const routeMap: Record<string, string> = {
      Suggestions: 'Suggestions',
      Reports: 'Reports',
      Approvals: 'Approvals',
      UserManagement: 'UserManagement',
      Alerts: 'Alerts',
      AlertsView: 'AlertsView',
      ApprovalUsers: 'ApprovalUsers',
      SendMessageToSegmentAdmins: 'SendMessageToSegmentAdmins',
      ShowUserDetails: 'ShowUserDetails',
    };

    const routeName = routeMap[route] || route;
    // Format: 'localAdmin-ShowUserDetails' matches RootNavigator registration
    const fullRouteName = `${rolePrefix}-${routeName}`;

    // Navigate within the tab navigator
    try {
      navigation.navigate(fullRouteName as never);
    } catch (error) {
      // If navigation fails, the screen might not be registered
      // This is expected for screens that are only accessible via Other menu
      console.log(
        'Navigation to',
        fullRouteName,
        'not available in tab navigator',
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 32),
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Other</Text>
        <Text style={styles.headerSubtitle}>Additional features and tools</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            onPress={() => handleNavigate(item.route)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${item.color}20` },
              ]}
            >
              <MaterialIcons
                name={item.icon as any}
                size={32}
                color={item.color}
              />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
