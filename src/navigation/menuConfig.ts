import type { ComponentType } from 'react';

import { DashboardScreen } from '../screens/common/DashboardScreen';
import { PostsScreen } from '../screens/common/PostsScreen';
import { FakeNewsScreen } from '../screens/common/FakeNewsScreen';
import { PollsScreen } from '../screens/common/PollsScreen';
import { ReportsScreen } from '../screens/common/ReportsScreen';
import { SettingsScreen } from '../screens/common/SettingsScreen';
import { SuggestionsScreen } from '../screens/common/SuggestionsScreen';
import { OtherMenuScreen } from '../screens/common/OtherMenuScreen';
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
      name: 'Posts',
      title: 'Feed',
      icon: 'dynamic-feed',
      component: PostsScreen,
    },
    {
      name: 'FakeNews',
      title: 'Fake News',
      icon: 'report-problem',
      component: FakeNewsScreen,
    },
    {
      name: 'Polls',
      title: 'Polls',
      icon: 'how-to-vote',
      component: PollsScreen,
    },
    {
      name: 'Other',
      title: 'Other',
      icon: 'more-horiz',
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
      name: 'Posts',
      title: 'Feed',
      icon: 'dynamic-feed',
      component: PostsScreen,
    },
    {
      name: 'FakeNews',
      title: 'Fake News',
      icon: 'report-problem',
      component: FakeNewsScreen,
    },
    {
      name: 'Polls',
      title: 'Polls',
      icon: 'how-to-vote',
      component: PollsScreen,
    },
    {
      name: 'Other',
      title: 'Other',
      icon: 'more-horiz',
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
      icon: 'workspace-premium',
      component: DashboardScreen,
    },
    {
      name: 'Posts',
      title: 'Feed',
      icon: 'dynamic-feed',
      component: PostsScreen,
    },
    {
      name: 'FakeNews',
      title: 'Fake News',
      icon: 'report-problem',
      component: FakeNewsScreen,
    },
    {
      name: 'Polls',
      title: 'Polls',
      icon: 'poll',
      component: PollsScreen,
    },
    {
      name: 'Other',
      title: 'Other',
      icon: 'more-horiz',
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
