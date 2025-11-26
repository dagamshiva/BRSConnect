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
  MEMBER: 'ce54f8e1-f8e3-43c6-b94e-78fe89dd4c97',
  LOCAL_ADMIN_2: '54902a58-5a38-488c-b81b-90ec97c5b845',
  LOCAL_ADMIN_3: '54902a58-5a38-488c-b81b-90ec97c5b846',
  // Priya Kumar
};

// Get users from telanganaUsers
const superAdminUser = getUserById(TEST_USER_IDS.SUPER_ADMIN);
const localAdminUser = getUserById(TEST_USER_IDS.LOCAL_ADMIN);
const memberUser = getUserById(TEST_USER_IDS.MEMBER);
const localAdminUser2 = getUserById(TEST_USER_IDS.LOCAL_ADMIN_2);
const localAdminUser3 = getUserById(TEST_USER_IDS.LOCAL_ADMIN_3);
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
if (!localAdminUser2) {
  throw new Error(
    `LocalAdmin user not found with ID: ${TEST_USER_IDS.LOCAL_ADMIN_2}`,
  );
}
if (!localAdminUser3) {
  throw new Error(
    `LocalAdmin user not found with ID: ${TEST_USER_IDS.LOCAL_ADMIN_3}`,
  );
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
    user: localAdminUser2,
    credentials: {
      identifiers: [
        localAdminUser2.email || '',
        localAdminUser2.mobile || '',
        'local',
        'localadmin',
        'saitharun@brsconnect.in',
      ].filter(Boolean),
      password: 'Local123',
    },
    token: 'mock-token-localadmin',
  },
  {
    user: localAdminUser3,
    credentials: {
      identifiers: [
        localAdminUser3.email || '',
        localAdminUser3.mobile || '',
        'local',
        'localadmin',
        'sridhargundu@brsconnect.in',
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
        'member1',
        'D', // aliasName
      ].filter(Boolean),
      password: 'Member123',
    },
    token: 'mock-token-member',
  },
];
