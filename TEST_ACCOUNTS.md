# Test Accounts for BRSConnect

This document contains test account credentials for different user roles in the application.

## 🔐 Test Accounts

### 1. Super Admin Account
**Role:** SuperAdmin  
**Access:** Full system access, can manage all assemblies, users, and content

**User:** Tarun Kumar (from telanganaUsers)

**Login Credentials:**
- **Email:** `tarun.kumar.751@example.com`
- **Mobile:** `+91 9435925400`
- **Username:** `super`, `superadmin`, `tarun`, or `tarunkum766` (aliasName)
- **Password:** `Admin123`

**Features to Test:**
- ✅ View all assemblies and segments
- ✅ Manage all users (SuperAdmin, LocalAdmin, Members)
- ✅ Create and manage polls
- ✅ Send alerts to all segments
- ✅ View comprehensive dashboard analytics
- ✅ Approve/reject membership requests
- ✅ Access all admin features

---

### 2. Local Admin Account
**Role:** LocalAdmin  
**Access:** Limited to assigned assembly segment

**User:** Priya Babu (from telanganaUsers)

**Login Credentials:**
- **Email:** `priya.babu.146@example.com`
- **Mobile:** `+91 1045923730`
- **Username:** `local`, `localadmin`, `priya`, or `priyabab627` (aliasName)
- **Password:** `LocalAdmin@123`

**Assigned Areas:**
- Assembly Segment: `Bodhan`
- Ward: `Ward 58`
- Booth: `Booth 102`

**Features to Test:**
- ✅ View and manage users in assigned assembly segment
- ✅ Create polls for assigned segment
- ✅ Send alerts to segment admins
- ✅ Approve membership requests for assigned segment
- ✅ View dashboard analytics for assigned segment
- ✅ Manage posts and content for assigned segment

---

### 3. Member Account
**Role:** Member  
**Access:** Basic member features, limited to assigned areas

**User:** Priya Kumar (from telanganaUsers)

**Login Credentials:**
- **Email:** `priya.kumar.837@example.com`
- **Mobile:** `+91 0638699899`
- **Username:** `member`, `priya`, or `priyakum32` (aliasName)
- **Password:** `Member@123`

**Assigned Areas:**
- Assembly Segment: `Kothagudem`
- Village: `Kothagudem Palli 1`
- Booth: `Booth 39`

**Features to Test:**
- ✅ View posts and feeds
- ✅ Create suggestions
- ✅ Vote on polls
- ✅ Report fake news
- ✅ Submit reports/issues
- ✅ View alerts from admins
- ✅ View user profile
- ❌ Cannot manage users
- ❌ Cannot create polls
- ❌ Cannot send alerts

---

## 📱 Quick Login Guide

### Using Email
1. Open the app
2. Enter email address (e.g., `super@brsconnect.in`)
3. Enter corresponding password
4. Tap "Login"

### Using Mobile Number
1. Open the app
2. Enter mobile number (e.g., `+91 99999 00001` or `9999900001`)
3. Enter corresponding password
4. Tap "Login"

### Using Username
1. Open the app
2. Enter username (e.g., `super`, `local`, `member`)
3. Enter corresponding password
4. Tap "Login"

---

## 🧪 Testing Scenarios

### Scenario 1: Super Admin Testing
1. Login as Super Admin
2. Navigate to Dashboard - verify all metrics are visible
3. Go to "Other" menu → "Manage Users" - verify all users visible
4. Create a new poll
5. Send an alert to all segments
6. Approve a pending membership request
7. View reports from all segments

### Scenario 2: Local Admin Testing
1. Login as Local Admin
2. Navigate to Dashboard - verify only assigned segment data
3. Go to "Other" menu → "Manage Users" - verify only segment users
4. Create a poll for assigned segment
5. Send message to segment admins
6. Approve membership for assigned segment

### Scenario 3: Member Testing
1. Login as Member
2. Navigate to Posts - verify can view and interact
3. Create a suggestion
4. Vote on a poll
5. Report fake news
6. Submit a report/issue
7. View alerts from admins
8. Verify cannot access admin features

### Scenario 4: Role-Based Navigation Testing
1. Login as each role
2. Verify tab navigation shows appropriate screens
3. Verify "Other" menu shows role-appropriate options
4. Test all accessible features for each role

---

## 🔄 Switching Between Accounts

To switch accounts:
1. Go to Settings tab
2. Tap "Logout"
3. Login with different account credentials

---

## 📝 Notes

- All test accounts use mock authentication (no backend required)
- **User data is synced with `telangana_user.ts`** - user information comes from the telanganaUsers array
- Only credentials (identifiers and passwords) are stored in `mockAuth.ts`
- Passwords are case-sensitive
- All accounts are pre-approved and active
- Test data is reset when app restarts (mock mode)
- For production testing, use backend authentication with seeded data

## 🔄 Syncing with telanganaUsers

The test accounts reference users from `mocks/telangana_user.ts` by their user IDs:
- **SuperAdmin:** `7ed0cff4-e59d-4a67-9c7b-7ee412b73c57` (Tarun Kumar)
- **LocalAdmin:** `54902a58-5a38-488c-b81b-90ec97c5b862` (Priya Babu)
- **Member:** `ce54f8e1-f8e3-43c6-b94e-78fe89dd4c97` (Priya Kumar)

To change test accounts, update the `TEST_USER_IDS` in `src/mocks/mockAuth.ts` with different user IDs from telanganaUsers.

---

## 🛠️ Troubleshooting

**Issue:** Cannot login with credentials
- **Solution:** Ensure you're using exact credentials from this document (case-sensitive)

**Issue:** Wrong role permissions showing
- **Solution:** Logout and login again to refresh user session

**Issue:** Features not accessible
- **Solution:** Verify you're logged in with the correct role account

---

## 📞 Support

For issues or questions about test accounts, refer to:
- `src/mocks/mockAuth.ts` - Mock authentication configuration
- `src/config/env.ts` - Environment configuration (USE_MOCK setting)

