import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCurrentUser,
  logout,
  selectAuth,
  selectIsLocalAdmin,
  selectIsPending,
  selectIsSuperAdmin,
} from '../store/slices/authSlice';
import { useTheme } from '../theme/useTheme';
import { UserDetailsHeader } from '../components/UserDetailsHeader';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { PendingApprovalScreen } from '../screens/auth/PendingApprovalScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { MembershipRegistrationScreen } from '../screens/auth/MembershipRegistrationScreen';
import { CreatePollScreen } from '../screens/common/CreatePollScreen';
import { CreateFeedScreen } from '../screens/common/CreateFeedScreen';
import { UserProfileScreen } from '../screens/common/UserProfileScreen';
import { SuggestionsScreen } from '../screens/common/SuggestionsScreen';
import { ReportsScreen } from '../screens/common/ReportsScreen';
import { PostAssemblyViewScreen } from '../screens/common/PostAssemblyViewScreen';
import { BookmarksScreen } from '../screens/common/BookmarksScreen';
import { ApprovalQueueScreen } from '../screens/admin/ApprovalQueueScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { AdminAlertsScreen } from '../screens/admin/AdminAlertsScreen';
import { ApprovalUsersScreen } from '../screens/admin/ApprovalUsersScreen';
import { SendMessageToSegmentAdminsScreen } from '../screens/admin/SendMessageToSuperAdminsScreen';
import { AlertsScreen } from '../screens/admin/AlertsScreen';
import { ShowUserDetailsScreen } from '../screens/admin/ShowUserDetailsScreen';
import { getMenuForRole, type RoleKey } from './menuConfig';

type RootStackParamList = {
  Auth: undefined;
  Pending: undefined;
  Member: undefined;
  LocalAdmin: undefined;
  SuperAdmin: undefined;
  Logout: undefined;
  OTP: { mobile: string };
  MembershipRegistration: undefined;
  CreatePoll: undefined;
  CreateFeed: { onFeedCreated?: (feed: any) => void } | undefined;
  UserProfile: undefined;
} & {
  [key: string]: undefined | object | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const getHiddenScreens = (role: RoleKey) => {
  const shared = [
    { name: 'Suggestions', component: SuggestionsScreen },
    { name: 'AlertsView', component: AlertsScreen },
    { name: 'PostAssemblyView', component: PostAssemblyViewScreen },
    { name: 'Bookmarks', component: BookmarksScreen },
  ];

  if (role === 'localAdmin' || role === 'superAdmin') {
    shared.push(
      { name: 'Reports', component: ReportsScreen },
      { name: 'Approvals', component: ApprovalQueueScreen },
      { name: 'UserManagement', component: UserManagementScreen },
      { name: 'Alerts', component: AdminAlertsScreen },
      { name: 'ApprovalUsers', component: ApprovalUsersScreen },
      { name: 'ShowUserDetails', component: ShowUserDetailsScreen },
      {
        name: 'SendMessageToSegmentAdmins',
        component: SendMessageToSegmentAdminsScreen,
      },
    );
  }

  return shared;
};

// Create a function to get tab screen options with safe area insets and role-based styling
const getTabScreenOptions = (
  insets: { top: number; bottom: number },
  tabCount: number,
  colors: ReturnType<typeof useTheme>,
) => {
  const isCompact = tabCount >= 6;
  const bottomPadding = Math.max(insets.bottom, 8);
  return {
    headerShown: true,
    header: () => (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: insets.top + 4,
          paddingBottom: 4,
          backgroundColor: colors.background,
        }}
      >
        <UserDetailsHeader />
      </View>
    ),
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      height: 65 + bottomPadding,
      paddingBottom: bottomPadding,
      paddingTop: 8,
      paddingHorizontal: 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    tabBarItemStyle: {
      flex: 1,
      marginHorizontal: 0,
      paddingVertical: 4,
      minHeight: 52,
      justifyContent: 'center' as ViewStyle['justifyContent'],
      alignItems: 'center' as ViewStyle['alignItems'],
    },
    tabBarShowLabel: false,
  };
};

type TabBuilderProps = {
  role: 'member' | 'localAdmin' | 'superAdmin';
};

const buildTabs =
  ({ role }: TabBuilderProps) =>
  () => {
    const insets = useSafeAreaInsets();
    const colors = useTheme();
    try {
      if (!getMenuForRole) {
        console.error('getMenuForRole is not available. Using fallback.');
        return (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.background,
            }}
          >
            <Text style={{ color: colors.textPrimary }}>
              Menu configuration error
            </Text>
          </View>
        );
      }
      const menuItems = getMenuForRole(role);
      if (!menuItems || !Array.isArray(menuItems)) {
        console.error('getMenuForRole returned invalid result:', menuItems);
        return (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.background,
            }}
          >
            <Text style={{ color: colors.textPrimary }}>
              Menu configuration error
            </Text>
          </View>
        );
      }
      const tabCount = menuItems.length;

      return (
        <Tab.Navigator
          screenOptions={getTabScreenOptions(insets, tabCount, colors)}
        >
          {menuItems.map(item => (
            <Tab.Screen
              key={`${role}-${item.name}`}
              name={`${role}-${item.name}`}
              component={item.component}
              options={{
                title: item.title,
                tabBarIcon: ({ color, focused }) => (
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <MaterialIcons
                      name={item.icon as any}
                      size={
                        tabCount === 6 ? (focused ? 24 : 22) : focused ? 26 : 24
                      }
                      color={color}
                    />
                    <Text
                      style={{
                        color,
                        fontSize: tabCount === 6 ? 10 : 11,
                        fontWeight: (focused
                          ? '700'
                          : '600') as TextStyle['fontWeight'],
                        textAlign: 'center',
                        marginTop: 0,
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {item.title}
                    </Text>
                  </View>
                ),
              }}
            />
          ))}
        </Tab.Navigator>
      );
    } catch (error) {
      console.error('Error in buildTabs:', error);
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ color: colors.textPrimary }}>
            Error loading menu configuration
          </Text>
        </View>
      );
    }
  };

const MemberTabs = buildTabs({ role: 'member' });
const LocalAdminTabs = buildTabs({ role: 'localAdmin' });
const SuperAdminTabs = buildTabs({ role: 'superAdmin' });

export const RootNavigator = (): React.ReactElement => {
  console.log('RootNavigator: Starting');
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const isPending = useAppSelector(selectIsPending);
  const isLocalAdmin = useAppSelector(selectIsLocalAdmin);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);

  console.log('RootNavigator: Auth state', {
    hasToken: !!auth.token,
    isPending,
    isLocalAdmin,
    isSuperAdmin,
  });

  const activeRole: RoleKey = isSuperAdmin
    ? 'superAdmin'
    : isLocalAdmin
    ? 'localAdmin'
    : 'member';
  const extraScreens =
    !auth.token || isPending ? [] : getHiddenScreens(activeRole);

  useEffect(() => {
    if (auth.token && !auth.user && !auth.loading) {
      dispatch(fetchCurrentUser());
    }
  }, [auth.token, auth.user, auth.loading, dispatch]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!auth.token ? (
        <Stack.Screen name="Auth" component={LoginScreen} />
      ) : isPending ? (
        <Stack.Screen name="Pending" component={PendingApprovalScreen} />
      ) : isSuperAdmin ? (
        <Stack.Screen name="SuperAdmin" component={SuperAdminTabs} />
      ) : isLocalAdmin ? (
        <Stack.Screen name="LocalAdmin" component={LocalAdminTabs} />
      ) : (
        <Stack.Screen name="Member" component={MemberTabs} />
      )}

      <Stack.Screen
        name="Logout"
        component={LoginScreen}
        options={{
          presentation: 'modal',
        }}
        listeners={{
          focus: () => {
            dispatch(logout());
          },
        }}
      />
      <Stack.Screen
        name="OTP"
        component={OtpVerificationScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="MembershipRegistration"
        component={MembershipRegistrationScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreatePoll"
        component={CreatePollScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="CreateFeed"
        component={CreateFeedScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          presentation: 'card',
        }}
      />
      {extraScreens.map(screen => (
        <Stack.Screen
          key={`${activeRole}-${screen.name}`}
          name={`${activeRole}-${screen.name}`}
          component={screen.component}
          options={{ headerShown: false }}
        />
      ))}
    </Stack.Navigator>
  );
};

// Ensure the export is available
export default RootNavigator;
