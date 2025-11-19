import type { User } from '../types';
import { telanganaUsers } from '../../mocks/telangana_user';

export interface MockAuthRecord {
  user: User;
  credentials: {
    identifiers: string[];
    password: string;
  };
  token: string;
}

// Helper function to get user from telanganaUsers by ID
const getUserById = (userId: string): User | undefined => {
  return telanganaUsers.find(user => user.id === userId);
};

// Test account user IDs from telanganaUsers
const TEST_USER_IDS = {
  SUPER_ADMIN: '7ed0cff4-e59d-4a67-9c7b-7ee412b73c57', // Tarun Kumar
  LOCAL_ADMIN: '54902a58-5a38-488c-b81b-90ec97c5b862', // Priya Babu
  MEMBER: 'ce54f8e1-f8e3-43c6-b94e-78fe89dd4c97', // Priya Kumar
};

// Get users from telanganaUsers
const superAdminUser = getUserById(TEST_USER_IDS.SUPER_ADMIN);
const localAdminUser = getUserById(TEST_USER_IDS.LOCAL_ADMIN);
const memberUser = getUserById(TEST_USER_IDS.MEMBER);

// Validate that users exist
if (!superAdminUser) {
  throw new Error(
    `SuperAdmin user not found with ID: ${TEST_USER_IDS.SUPER_ADMIN}`,
  );
}
if (!localAdminUser) {
  throw new Error(
    `LocalAdmin user not found with ID: ${TEST_USER_IDS.LOCAL_ADMIN}`,
  );
}
if (!memberUser) {
  throw new Error(`Member user not found with ID: ${TEST_USER_IDS.MEMBER}`);
}

export const mockAuthRecords: MockAuthRecord[] = [
  {
    user: superAdminUser,
    credentials: {
      identifiers: [
        superAdminUser.email || '',
        superAdminUser.mobile || '',
        'super',
        'superadmin',
        'kcr',
        'kcr6', // aliasName
      ].filter(Boolean),
      password: 'Admin123',
    },
    token: 'mock-token-superadmin',
  },
  {
    user: localAdminUser,
    credentials: {
      identifiers: [
        localAdminUser.email || '',
        localAdminUser.mobile || '',
        'local',
        'localadmin',
      ].filter(Boolean),
      password: 'Local123',
    },
    token: 'mock-token-localadmin',
  },
  {
    user: memberUser,
    credentials: {
      identifiers: [
        memberUser.email || '',
        memberUser.mobile || '',
        'member',
        'priya',
        'priyakum32', // aliasName
      ].filter(Boolean),
      password: 'Member123',
    },
    token: 'mock-token-member',
  },
];
