import type { ComponentType } from 'react';

import { DashboardScreen } from '../screens/common/DashboardScreen';
import { PostsScreen } from '../screens/common/PostsScreen';
import { FakeNewsScreen } from '../screens/common/FakeNewsScreen';
import { PollsScreen } from '../screens/common/PollsScreen';
import { ReportsScreen } from '../screens/common/ReportsScreen';
import { SettingsScreen } from '../screens/common/SettingsScreen';
import { SuggestionsScreen } from '../screens/common/SuggestionsScreen';
import { OtherMenuScreen } from '../screens/common/OtherMenuScreen';
import { CadreDirectoryScreen } from '../screens/common/CadreDirectoryScreen';
import { MeetingsScreen } from '../screens/common/MeetingsScreen';
import { ReportsDashboardScreen } from '../screens/common/ReportsDashboardScreen';
import { TopicRecommendationScreen } from '../screens/common/TopicRecommendationScreen';
import { ApprovalQueueScreen } from '../screens/admin/ApprovalQueueScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { AdminReportsScreen } from '../screens/admin/AdminReportsScreen';
import { AdminAlertsScreen } from '../screens/admin/AdminAlertsScreen';

export type RoleKey = 'member' | 'localAdmin' | 'superAdmin';

export interface MenuItem {
  name: string;
  title: string;
  icon: string;
  component: ComponentType<any>;
}

export const menuConfig: Record<RoleKey, MenuItem[]> = {
  member: [
    {
      name: 'Dashboard',
      title: 'Overview',
      icon: 'home',
      component: DashboardScreen,
    },
    {
      name: 'Posts',
      title: 'Feed',
      icon: 'dynamic-feed',
      component: PostsScreen,
    },
    {
      name: 'TopicRecommendation',
      title: 'Topics',
      // Revert to lightbulb icon and keep this as 3rd tab
      icon: 'lightbulb',
      component: TopicRecommendationScreen,
    },
    {
      name: 'Meetings',
      title: 'Meetings',
      icon: 'event',
      component: MeetingsScreen,
    },
    {
      name: 'Other',
      title: 'Other',
      icon: 'apps',
      component: OtherMenuScreen,
    },
    {
      name: 'Settings',
      title: 'Settings',
      icon: 'settings',
      component: SettingsScreen,
    },
  ],
  localAdmin: [
    {
      name: 'Dashboard',
      title: 'Overview',
      icon: 'home',
      component: DashboardScreen,
    },
    {
      name: 'Posts',
      title: 'Feed',
      icon: 'dynamic-feed',
      component: PostsScreen,
    },
    {
      name: 'TopicRecommendation',
      title: 'Topics',
      icon: 'lightbulb',
      component: TopicRecommendationScreen,
    },
    {
      name: 'Meetings',
      title: 'Meetings',
      icon: 'event',
      component: MeetingsScreen,
    },
    {
      name: 'Other',
      title: 'Other',
      icon: 'apps',
      component: OtherMenuScreen,
    },
    {
      name: 'Settings',
      title: 'Settings',
      icon: 'settings',
      component: SettingsScreen,
    },
  ],
  superAdmin: [
    {
      name: 'Dashboard',
      title: 'Overview',
      icon: 'home',
      component: DashboardScreen,
    },
    {
      name: 'Posts',
      title: 'Feed',
      icon: 'dynamic-feed',
      component: PostsScreen,
    },
    {
      name: 'TopicRecommendation',
      title: 'Topics',
      icon: 'lightbulb',
      component: TopicRecommendationScreen,
    },
    {
      name: 'Meetings',
      title: 'Meetings',
      icon: 'event',
      component: MeetingsScreen,
    },
    {
      name: 'Other',
      title: 'Other',
      icon: 'apps',
      component: OtherMenuScreen,
    },
    {
      name: 'Settings',
      title: 'Settings',
      icon: 'settings',
      component: SettingsScreen,
    },
  ],
};

export const getMenuForRole = (role: RoleKey): MenuItem[] => menuConfig[role];
