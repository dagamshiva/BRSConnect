import { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchCurrentUser,
  logout,
  selectAuth,
  selectIsLocalAdmin,
  selectIsPending,
  selectIsSuperAdmin,
} from "../store/slices/authSlice";
import { colors } from "../theme/colors";
import { ApprovalQueueScreen } from "../screens/admin/ApprovalQueueScreen";
import { DashboardScreen } from "../screens/common/DashboardScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { PendingApprovalScreen } from "../screens/auth/PendingApprovalScreen";
import { PollsScreen } from "../screens/common/PollsScreen";
import { PostsScreen } from "../screens/common/PostsScreen";
import { ReportsScreen } from "../screens/common/ReportsScreen";
import { SettingsScreen } from "../screens/common/SettingsScreen";
import { FakeNewsScreen } from "../screens/common/FakeNewsScreen";

type RootStackParamList = {
  Auth: undefined;
  Pending: undefined;
  Member: undefined;
  LocalAdmin: undefined;
  SuperAdmin: undefined;
  Logout: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
};

const MemberTabs = () => (
  <Tab.Navigator screenOptions={tabScreenOptions}>
    <Tab.Screen
      name="MemberDashboard"
      component={DashboardScreen}
      options={{
        title: "Overview",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="dashboard" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="MemberPosts"
      component={PostsScreen}
      options={{
        title: "Feed",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="dynamic-feed" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="MemberFakeNews"
      component={FakeNewsScreen}
      options={{
        title: "Fake News",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="report-problem" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="MemberPolls"
      component={PollsScreen}
      options={{
        title: "Polls",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="how-to-vote" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="MemberReports"
      component={ReportsScreen}
      options={{
        title: "Reports",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="report" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="MemberSettings"
      component={SettingsScreen}
      options={{
        title: "Settings",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const LocalAdminTabs = () => (
  <Tab.Navigator screenOptions={tabScreenOptions}>
    <Tab.Screen
      name="LocalDashboard"
      component={DashboardScreen}
      options={{
        title: "Overview",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="analytics" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="LocalPosts"
      component={PostsScreen}
      options={{
        title: "Feed",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="dynamic-feed" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="LocalFakeNews"
      component={FakeNewsScreen}
      options={{
        title: "Fake News",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="report-problem" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="LocalPolls"
      component={PollsScreen}
      options={{
        title: "Polls",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="how-to-vote" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="LocalReports"
      component={ReportsScreen}
      options={{
        title: "Reports",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="report" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="LocalSettings"
      component={SettingsScreen}
      options={{
        title: "Settings",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="settings" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="LocalApprovals"
      component={ApprovalQueueScreen}
      options={{
        title: "Approvals",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="verified-user" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const SuperAdminTabs = () => (
  <Tab.Navigator screenOptions={tabScreenOptions}>
    <Tab.Screen
      name="SuperDashboard"
      component={DashboardScreen}
      options={{
        title: "Overview",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="workspace-premium" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SuperPosts"
      component={PostsScreen}
      options={{
        title: "Feed",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="dynamic-feed" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SuperFakeNews"
      component={FakeNewsScreen}
      options={{
        title: "Fake News",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="report-problem" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SuperPolls"
      component={PollsScreen}
      options={{
        title: "Polls",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="poll" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SuperReports"
      component={ReportsScreen}
      options={{
        title: "Reports",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="gpp-bad" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SuperSettings"
      component={SettingsScreen}
      options={{
        title: "Settings",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="settings" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export const RootNavigator = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const isPending = useAppSelector(selectIsPending);
  const isLocalAdmin = useAppSelector(selectIsLocalAdmin);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);

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
          presentation: "modal",
        }}
        listeners={{
          focus: () => {
            dispatch(logout());
          },
        }}
      />
    </Stack.Navigator>
  );
};

