# BRSConnect - Complete Business Function Replication Guide

> **Purpose**: This document provides a comprehensive guide to replicate the BRSConnect application for demos or new clients. It includes all components, services, screens, theme configuration, database schema, and business logic.

---

## 📱 Application Overview

**BRSConnect** is a React Native mobile application for political campaign management with role-based access control (RBAC). It features real-time analytics, polling, fake news detection, reporting, and community engagement for the "Pink Car" movement.

### Key Features
- **Role-Based Access**: SuperAdmin, LocalAdmin, Member, Pending
- **Dashboard Analytics**: Winning segment charts, trending media
- **Polls Management**: Create and participate in polls with visibility controls
- **Posts & Feed**: Community feed with media support
- **Fake News Detection**: Identify and report fake news
- **Reports System**: Issue reporting with admin assignment
- **User Approval Workflow**: Multi-level approval system
- **Area-Based Scoping**: Assembly, Village, Ward, Booth hierarchy

---

## 🎨 Branding & Theme

### Color Scheme (Pink Car Movement)
```typescript
// src/theme/colors.ts
export const colors = {
  background: '#121212',      // Dark background
  surface: '#1E1E1E',         // Card/surface background
  card: '#262626',            // Elevated card
  primary: '#E91E63',         // Pink Car brand color
  primaryLight: '#FF5C8D',    // Light pink
  primaryDark: '#B0003A',     // Dark pink
  accent: '#FFC107',          // Gold/amber accent
  textPrimary: '#FFFFFF',     // White text
  textSecondary: '#C7C7C7',   // Gray text
  border: '#2F2F2F',          // Border color
  success: '#2ECC71',         // Green for success
  warning: '#F39C12',         // Orange for warnings
  danger: '#E74C3C',          // Red for errors
};
```

### App Identity
- **Name**: BRSConnect
- **Tagline**: "Powering the Pink Car movement…"
- **Icon**: Pink Car (MaterialIcons: `directions-car`)
- **Package**: com.brsconnect.app
- **Theme**: Dark mode with pink primary color

---

## 🏗️ Project Structure

```
BRSConnect/
├── android/                    # Android native code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/brsconnect/app/
│   │   │   └── res/            # Android resources (icons, splash)
│   │   └── build.gradle
│   └── build.gradle
│
├── backend/                    # Node.js + Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed data
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── middlewares/        # Auth, ABAC, error handling
│   │   ├── config/             # Environment config
│   │   └── index.ts            # Server entry
│   └── package.json
│
├── src/                        # React Native source
│   ├── components/             # Reusable UI components
│   │   ├── FakeNewsCard.tsx
│   │   ├── TrendingMediaCard.tsx
│   │   └── WinningSegmentChart.tsx
│   │
│   ├── screens/                # Screen components
│   │   ├── auth/               # Authentication screens
│   │   │   ├── LoginScreen.tsx
│   │   │   └── PendingApprovalScreen.tsx
│   │   ├── admin/              # Admin-only screens
│   │   │   └── ApprovalQueueScreen.tsx
│   │   └── common/             # Shared screens
│   │       ├── DashboardScreen.tsx
│   │       ├── FakeNewsScreen.tsx
│   │       ├── PollsScreen.tsx
│   │       ├── PostsScreen.tsx
│   │       ├── ReportsScreen.tsx
│   │       └── SettingsScreen.tsx
│   │
│   ├── navigation/             # Navigation setup
│   │   └── RootNavigator.tsx
│   │
│   ├── services/               # API service layer
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── approvalService.ts
│   │   ├── fakeNewsService.ts
│   │   ├── pollService.ts
│   │   ├── postService.ts
│   │   ├── reportService.ts
│   │   ├── segmentService.ts
│   │   └── trendingService.ts
│   │
│   ├── store/                  # Redux state management
│   │   ├── index.ts
│   │   ├── hooks.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── approvalsSlice.ts
│   │       ├── fakeNewsSlice.ts
│   │       ├── pollsSlice.ts
│   │       ├── postsSlice.ts
│   │       ├── reportsSlice.ts
│   │       ├── segmentsSlice.ts
│   │       └── trendingSlice.ts
│   │
│   ├── theme/                  # Theme configuration
│   │   ├── colors.ts
│   │   └── theme.ts
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   │
│   ├── mocks/                  # Mock data for development
│   │   ├── mockData.ts
│   │   └── mockFakeNews.ts
│   │
│   └── config/                 # App configuration
│       └── env.ts
│
├── assets/                     # Images, fonts, etc.
├── App.tsx                     # Root component
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── tsconfig.json              # TypeScript config
```

---

## 📊 Database Schema

### Core Models (Prisma)

#### User Model
```prisma
model User {
  id              String            @id @default(cuid())
  name            String
  email           String?           @unique
  mobile          String?           @unique
  passwordHash    String?
  role            Role              @default(Pending)
  status          ApprovalStatus    @default(Pending)
  
  // Area assignment
  assemblySegment String
  village         String?
  ward            String?
  booth           String?
  
  // Approval tracking
  approvedById    String?
  approvedBy      User?             @relation("UserApproval")
  approvalsGiven  User[]            @relation("UserApproval")
  approvedAt      DateTime?
  
  // Relations
  polls           Poll[]
  posts           Post[]
  reports         Report[]
  highlightedSegments HighlightedSegment[]
  pollVotes       PollVote[]
}

enum Role {
  SuperAdmin
  LocalAdmin
  Member
  Pending
}

enum ApprovalStatus {
  Pending
  Approved
  Rejected
}
```

#### HighlightedSegment Model (Winning Segments)
```prisma
model HighlightedSegment {
  id             String   @id @default(cuid())
  segmentId      String   @unique
  segmentName    String
  candidate      String
  winCount       Int
  loseCount      Int
  cantSayCount   Int
  sampleSize     Int
  source         String
  lastUpdated    DateTime
  createdById    String
  createdBy      User     @relation(fields: [createdById])
}
```

#### Poll Model
```prisma
model Poll {
  id             String      @id @default(cuid())
  title          String
  description    String?
  type           String      // YES_NO, SINGLE, MULTI, RATING
  visibility     String      // WARD, VILLAGE, ASSEMBLY
  
  // Area scope
  assemblyScope  String
  villageScope   String?
  wardScope      String?
  boothScope     String?
  
  startsAt       DateTime
  endsAt         DateTime
  totalResponses Int         @default(0)
  
  createdById    String
  createdBy      User        @relation(fields: [createdById])
  options        PollOption[]
  votes          PollVote[]
}

model PollOption {
  id      String  @id @default(cuid())
  label   String
  pollId  String
  poll    Poll    @relation(fields: [pollId])
  votes   PollVote[]
}

model PollVote {
  id        String   @id @default(cuid())
  pollId    String
  optionId  String
  userId    String
  
  @@unique([pollId, userId])  // One vote per user per poll
}
```

#### Post Model (Community Feed)
```prisma
model Post {
  id             String   @id @default(cuid())
  authorId       String
  author         User     @relation(fields: [authorId])
  content        String
  mediaType      String?  // text, image, video, voice, link
  mediaUrl       String?
  
  // Area scope
  assemblyScope  String
  villageScope   String?
  wardScope      String?
  boothScope     String?
  
  trendingScore  Int      @default(0)
  createdAt      DateTime @default(now())
}
```

#### Report Model
```prisma
model Report {
  id             String   @id @default(cuid())
  reporterId     String
  reporter       User     @relation("ReportReporter")
  assigneeId     String?
  assignee       User?    @relation("ReportAssignee")
  
  title          String
  description    String
  attachments    String[]
  status         String   @default("New")  // New, Under Review, Resolved, Dismissed
  
  // Area scope
  assemblyScope  String
  villageScope   String?
  wardScope      String?
  boothScope     String?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## 🎯 Role-Based Access Control (RBAC)

### Role Hierarchy

#### 1. **SuperAdmin**
- **Access**: Global, unrestricted
- **Capabilities**:
  - View all data across all areas
  - Approve/reject LocalAdmins
  - Create/manage polls globally
  - View all reports
  - Access analytics dashboard
  - Manage highlighted segments
  
**Navigation Tabs**:
- Overview (workspace-premium icon)
- Feed (dynamic-feed)
- Fake News (report-problem)
- Polls (poll)
- Reports (gpp-bad)
- Settings (settings)

#### 2. **LocalAdmin**
- **Access**: Limited to assigned Assembly Segment / Village / Ward
- **Capabilities**:
  - Approve/reject Members in their area
  - Create polls scoped to their area
  - View reports in their area
  - Moderate posts
  - Access approval queue
  
**Navigation Tabs**:
- Overview (analytics icon)
- Feed (dynamic-feed)
- Fake News (report-problem)
- Polls (how-to-vote)
- Reports (report)
- Settings (settings)
- **Approvals** (verified-user) - *Unique to LocalAdmin*

#### 3. **Member**
- **Access**: Limited to their assigned areas
- **Capabilities**:
  - Participate in polls
  - Create posts
  - Submit reports
  - View trending content
  - View fake news alerts
  
**Navigation Tabs**:
- Overview (dashboard icon)
- Feed (dynamic-feed)
- Fake News (report-problem)
- Polls (how-to-vote)
- Reports (report)
- Settings (person)

#### 4. **Pending**
- **Access**: Restricted - Waiting for approval
- **Screen**: PendingApprovalScreen only
- **Message**: Account awaiting approval

---

## 📱 Screens Breakdown

### 1. LoginScreen (`src/screens/auth/LoginScreen.tsx`)

**Purpose**: Authentication entry point

**Features**:
- Mobile/Email + Password login
- OTP-based authentication
- New user registration
- Form validation
- Loading states
- Error handling
- Pink car animated logo

**Key Functions**:
- `handleLogin()` - Authenticate user
- `handleRegister()` - New user registration
- Form validation with error messages

**Redux Actions**:
- `login()` - Dispatch login action
- `register()` - Dispatch registration

---

### 2. DashboardScreen (`src/screens/common/DashboardScreen.tsx`)

**Purpose**: Main analytics and overview screen

**Components**:
- **Winning Segment Chart** (`WinningSegmentChart.tsx`)
  - Victory Native bar chart
  - Shows Win/Lose/Can't Say counts
  - Color-coded bars (success/danger/warning)
  - Sample size display
  - Last updated timestamp
  
- **Trending Media Cards** (`TrendingMediaCard.tsx`)
  - Image/Video/Tweet preview
  - Like/Dislike counts
  - Platform badge (Twitter, Instagram, YouTube)
  - View/Play action

**Layout**:
```
┌─────────────────────────────────┐
│  BRS Connect Dashboard          │
├─────────────────────────────────┤
│  Winning Segment                │
│  ┌───────────────────────────┐  │
│  │  [Bar Chart]              │  │
│  │  Win | Lose | Can't Say   │  │
│  └───────────────────────────┘  │
│                                 │
│  Trending Media                 │
│  ┌───────────────────────────┐  │
│  │  [Media Card 1]           │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  [Media Card 2]           │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Data Sources**:
- `segmentService.fetchHighlightedSegments()`
- `trendingService.fetchTrendingMedia()`

---

### 3. PollsScreen (`src/screens/common/PollsScreen.tsx`)

**Purpose**: Create and participate in polls

**Features**:
- View active polls
- Vote on polls (one vote per user)
- Create new polls (Admin only)
- Poll types: YES_NO, SINGLE, MULTI, RATING
- Visibility control: WARD, VILLAGE, ASSEMBLY
- Start/End date scheduling
- Real-time vote counts

**Poll Card Layout**:
```
┌─────────────────────────────────┐
│  Poll Title                     │
│  Description...                 │
│  ─────────────────────────────  │
│  ○ Option 1        [45% | 120]  │
│  ○ Option 2        [35% | 93]   │
│  ○ Option 3        [20% | 53]   │
│  ─────────────────────────────  │
│  👥 266 responses               │
│  ⏰ Ends in 2 days              │
└─────────────────────────────────┘
```

**Admin Features** (Create Poll Modal):
- Title & Description
- Poll Type selector
- Add/Remove options
- Visibility scope selector
- Date range picker
- Area scope assignment

---

### 4. PostsScreen (`src/screens/common/PostsScreen.tsx`)

**Purpose**: Community feed with posts

**Features**:
- Infinite scroll feed
- Create new post (text, image, video, voice, link)
- Like/Comment functionality
- Media preview
- Author information
- Timestamp
- Area scope badge

**Post Card Layout**:
```
┌─────────────────────────────────┐
│  👤 John Doe                    │
│     Ward 12 • 2 hours ago       │
│  ─────────────────────────────  │
│  Post content goes here...      │
│  with multiple lines            │
│                                 │
│  [Media Preview if exists]      │
│  ─────────────────────────────  │
│  ❤️ 45  💬 12  🔗 Share        │
└─────────────────────────────────┘
```

**Create Post Form**:
- Text area
- Media picker (image/video)
- Visibility selector
- Area scope auto-filled
- Submit button

---

### 5. FakeNewsScreen (`src/screens/common/FakeNewsScreen.tsx`)

**Purpose**: Identify and report fake news

**Features**:
- Scrollable feed of fake news posts
- Report fake news
- Like/Dislike voting
- Platform source badge
- Media preview
- Debunk information

**Fake News Card** (`FakeNewsCard.tsx`):
```
┌─────────────────────────────────┐
│  [Media Thumbnail]              │
│  ─────────────────────────────  │
│  ⚠️ FAKE NEWS ALERT            │
│  Title: Misleading Headline     │
│  Description: This post contains│
│  false information...           │
│  ─────────────────────────────  │
│  Posted by: @fakeaccount        │
│  Platform: Twitter              │
│  ─────────────────────────────  │
│  👍 12  👎 89                   │
└─────────────────────────────────┘
```

**Actions**:
- View full post
- Report to platform
- Share debunk information
- Vote (thumbs up/down)

---

### 6. ReportsScreen (`src/screens/common/ReportsScreen.tsx`)

**Purpose**: Issue reporting and tracking

**Features**:
- Create new report
- View report status
- Filter by status (New, Under Review, Resolved, Dismissed)
- Attach images/documents
- Admin assignment (Admin only)
- Status updates

**Report Card Layout**:
```
┌─────────────────────────────────┐
│  📋 Report Title                │
│  Status: [Under Review] 🟡      │
│  ─────────────────────────────  │
│  Reported by: Member Name       │
│  Area: Ward 12, Assembly XYZ    │
│  Created: Jan 15, 2024          │
│  ─────────────────────────────  │
│  Description preview...         │
│  ─────────────────────────────  │
│  📎 2 attachments               │
│  👤 Assigned to: Admin Name     │
└─────────────────────────────────┘
```

**Status Colors**:
- New: 🔵 Blue
- Under Review: 🟡 Yellow
- Resolved: 🟢 Green
- Dismissed: 🔴 Red

**Create Report Form**:
- Title (required)
- Description (required)
- Attachments (optional)
- Submit button

---

### 7. SettingsScreen (`src/screens/common/SettingsScreen.tsx`)

**Purpose**: User profile and app settings

**Features**:
- User profile display
- Role badge
- Assigned areas
- Account information
- Change password
- Notification settings
- App version
- Logout button

**Layout**:
```
┌─────────────────────────────────┐
│        [Profile Avatar]         │
│        John Doe                 │
│     [LocalAdmin Badge]          │
│  ─────────────────────────────  │
│  📧 Email: john@example.com    │
│  📱 Mobile: +91 98765 43210    │
│  📍 Assembly: XYZ Segment      │
│     Ward: 12                    │
│  ─────────────────────────────  │
│  Settings                       │
│  › Change Password              │
│  › Notifications                │
│  › Privacy                      │
│  › About                        │
│  ─────────────────────────────  │
│  [Logout Button]                │
└─────────────────────────────────┘
```

---

### 8. ApprovalQueueScreen (`src/screens/admin/ApprovalQueueScreen.tsx`)

**Purpose**: Admin screen to approve/reject users

**Access**: LocalAdmin and SuperAdmin only

**Features**:
- List of pending users
- View user details
- Approve button (changes status to Approved, role to Member)
- Reject button with reason
- Filter by area (LocalAdmin sees only their area)
- Search by name/mobile/email

**Pending User Card**:
```
┌─────────────────────────────────┐
│  👤 Jane Smith                  │
│  📱 +91 98765 43210            │
│  📧 jane@example.com           │
│  ─────────────────────────────  │
│  Requested Areas:               │
│  Assembly: ABC Segment          │
│  Ward: 8                        │
│  Village: Village Name          │
│  ─────────────────────────────  │
│  Submitted: Jan 10, 2024        │
│  ─────────────────────────────  │
│  [Approve ✓]  [Reject ✗]       │
└─────────────────────────────────┘
```

**Actions**:
- **Approve**: Sets `status = Approved`, `role = Member`, `approvedBy = current admin`, `approvedAt = now`
- **Reject**: Sets `status = Rejected`, stores rejection reason

---

### 9. PendingApprovalScreen (`src/screens/auth/PendingApprovalScreen.tsx`)

**Purpose**: Screen shown to users with Pending status

**Features**:
- Waiting message
- Submitted information display
- Logout button
- Contact support

**Layout**:
```
┌─────────────────────────────────┐
│                                 │
│     ⏳ Pending Approval         │
│                                 │
│  Your account is awaiting       │
│  approval from an administrator.│
│                                 │
│  You will be notified once your │
│  account is approved.           │
│                                 │
│  Submitted Information:         │
│  Name: Your Name                │
│  Mobile: +91 98765 43210        │
│  Area: Assembly XYZ, Ward 12    │
│                                 │
│  [Back to Login]                │
└─────────────────────────────────┘
```

---

## 🔧 Components Library

### WinningSegmentChart (`src/components/WinningSegmentChart.tsx`)

**Props**:
```typescript
interface Props {
  segment: HighlightedSegment;
}
```

**Features**:
- Victory Native bar chart
- Three bars: Win (green), Lose (red), Can't Say (amber)
- Y-axis: Count (0-100% of sample size)
- X-axis: Labels
- Animated transitions
- Responsive sizing

**Dependencies**:
- `victory-native`
- `react-native-svg`

---

### TrendingMediaCard (`src/components/TrendingMediaCard.tsx`)

**Props**:
```typescript
interface Props {
  media: TrendingMedia;
  onPress?: () => void;
}
```

**Features**:
- Media thumbnail
- Title & description
- Platform badge (Twitter/Instagram/YouTube/Image)
- Like/Dislike counts
- Tap to view full media

**Layout Elements**:
- Image background with overlay
- Platform icon badge (top-right)
- Title (bold, 18px)
- Description (14px, secondary color, truncated)
- Like/Dislike row (bottom)

---

### FakeNewsCard (`src/components/FakeNewsCard.tsx`)

**Props**:
```typescript
interface Props {
  fakeNews: FakeNewsPost;
  onLike?: () => void;
  onDislike?: () => void;
}
```

**Features**:
- Warning banner (⚠️ FAKE NEWS ALERT)
- Media preview
- Title & description
- Source information
- Posted by & platform
- Like/Dislike actions

**Styling**:
- Danger color accent (#E74C3C)
- Warning icon
- Border highlight on fake news

---

## 🌐 API Services

### Base API Configuration (`src/services/api.ts`)

```typescript
import axios from 'axios';
import { API_URL } from '../config/env';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### authService.ts

**Endpoints**:
- `POST /api/auth/login` - Login with mobile/email + password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `GET /api/auth/me` - Get current user

**Functions**:
```typescript
export const authService = {
  login: (credentials: LoginCredentials) => api.post('/auth/login', credentials),
  register: (data: RegisterData) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  sendOTP: (mobile: string) => api.post('/auth/otp/send', { mobile }),
  verifyOTP: (mobile: string, otp: string) => api.post('/auth/otp/verify', { mobile, otp }),
};
```

---

### approvalService.ts

**Endpoints**:
- `GET /api/admin/approvals/pending` - Get pending approvals
- `POST /api/admin/approvals/:id/approve` - Approve user
- `POST /api/admin/approvals/:id/reject` - Reject user

**Functions**:
```typescript
export const approvalService = {
  getPendingApprovals: () => api.get('/admin/approvals/pending'),
  approveUser: (userId: string) => api.post(`/admin/approvals/${userId}/approve`),
  rejectUser: (userId: string, reason: string) => 
    api.post(`/admin/approvals/${userId}/reject`, { reason }),
};
```

---

### pollService.ts

**Endpoints**:
- `GET /api/polls` - Get polls (filtered by user's area)
- `GET /api/polls/:id` - Get poll details
- `POST /api/polls` - Create poll (Admin only)
- `POST /api/polls/:id/vote` - Vote on poll
- `GET /api/polls/:id/results` - Get poll results

**Functions**:
```typescript
export const pollService = {
  getPolls: () => api.get('/polls'),
  getPoll: (id: string) => api.get(`/polls/${id}`),
  createPoll: (data: CreatePollData) => api.post('/polls', data),
  votePoll: (pollId: string, optionId: string) => 
    api.post(`/polls/${pollId}/vote`, { optionId }),
  getPollResults: (id: string) => api.get(`/polls/${id}/results`),
};
```

---

### postService.ts

**Endpoints**:
- `GET /api/posts` - Get posts feed
- `GET /api/posts/:id` - Get post details
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comment` - Comment on post

**Functions**:
```typescript
export const postService = {
  getPosts: (page = 1, limit = 20) => api.get('/posts', { params: { page, limit } }),
  getPost: (id: string) => api.get(`/posts/${id}`),
  createPost: (data: CreatePostData) => api.post('/posts', data),
  likePost: (id: string) => api.post(`/posts/${id}/like`),
  commentPost: (id: string, content: string) => 
    api.post(`/posts/${id}/comment`, { content }),
};
```

---

### reportService.ts

**Endpoints**:
- `GET /api/reports` - Get reports
- `GET /api/reports/:id` - Get report details
- `POST /api/reports` - Create report
- `PATCH /api/reports/:id/status` - Update report status (Admin)
- `POST /api/reports/:id/assign` - Assign report (Admin)

**Functions**:
```typescript
export const reportService = {
  getReports: () => api.get('/reports'),
  getReport: (id: string) => api.get(`/reports/${id}`),
  createReport: (data: CreateReportData) => api.post('/reports', data),
  updateStatus: (id: string, status: string) => 
    api.patch(`/reports/${id}/status`, { status }),
  assignReport: (id: string, adminId: string) => 
    api.post(`/reports/${id}/assign`, { adminId }),
};
```

---

### segmentService.ts

**Endpoints**:
- `GET /api/segments/highlighted` - Get highlighted winning segments
- `POST /api/segments/highlighted` - Create/Update highlighted segment (SuperAdmin)

**Functions**:
```typescript
export const segmentService = {
  getHighlightedSegments: () => api.get('/segments/highlighted'),
  updateHighlightedSegment: (data: SegmentData) => 
    api.post('/segments/highlighted', data),
};
```

---

### trendingService.ts

**Endpoints**:
- `GET /api/trending/media` - Get trending media

**Functions**:
```typescript
export const trendingService = {
  getTrendingMedia: () => api.get('/trending/media'),
};
```

---

### fakeNewsService.ts

**Endpoints**:
- `GET /api/fakenews` - Get fake news posts
- `POST /api/fakenews/:id/vote` - Vote on fake news (like/dislike)

**Functions**:
```typescript
export const fakeNewsService = {
  getFakeNews: () => api.get('/fakenews'),
  voteFakeNews: (id: string, vote: 'like' | 'dislike') => 
    api.post(`/fakenews/${id}/vote`, { vote }),
};
```

---

## 🗄️ Redux Store Structure

### Store Setup (`src/store/index.ts`)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import approvalsReducer from './slices/approvalsSlice';
import pollsReducer from './slices/pollsSlice';
import postsReducer from './slices/postsSlice';
import reportsReducer from './slices/reportsSlice';
import segmentsReducer from './slices/segmentsSlice';
import trendingReducer from './slices/trendingSlice';
import fakeNewsReducer from './slices/fakeNewsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    approvals: approvalsReducer,
    polls: pollsReducer,
    posts: postsReducer,
    reports: reportsReducer,
    segments: segmentsReducer,
    trending: trendingReducer,
    fakeNews: fakeNewsReducer,
  },
});
```

---

### authSlice.ts

**State**:
```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

**Actions**:
- `login` - Authenticate user
- `logout` - Clear auth state
- `register` - Register new user
- `fetchCurrentUser` - Get current user details

**Selectors**:
- `selectAuth` - Get auth state
- `selectIsSuperAdmin` - Check if user is SuperAdmin
- `selectIsLocalAdmin` - Check if user is LocalAdmin
- `selectIsPending` - Check if user status is Pending

---

### approvalsSlice.ts

**State**:
```typescript
interface ApprovalsState {
  pendingUsers: ApprovalRequest[];
  loading: boolean;
  error: string | null;
}
```

**Actions**:
- `fetchPendingApprovals` - Get pending user approvals
- `approveUser` - Approve a pending user
- `rejectUser` - Reject a pending user

---

### pollsSlice.ts

**State**:
```typescript
interface PollsState {
  polls: Poll[];
  currentPoll: Poll | null;
  loading: boolean;
  error: string | null;
}
```

**Actions**:
- `fetchPolls` - Get all polls
- `fetchPoll` - Get single poll
- `createPoll` - Create new poll
- `votePoll` - Vote on poll
- `fetchPollResults` - Get poll results

---

### postsSlice.ts

**State**:
```typescript
interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}
```

**Actions**:
- `fetchPosts` - Get posts feed
- `fetchPost` - Get single post
- `createPost` - Create new post
- `likePost` - Like a post
- `commentPost` - Comment on post

---

### reportsSlice.ts

**State**:
```typescript
interface ReportsState {
  reports: Report[];
  currentReport: Report | null;
  loading: boolean;
  error: string | null;
}
```

**Actions**:
- `fetchReports` - Get all reports
- `fetchReport` - Get single report
- `createReport` - Create new report
- `updateReportStatus` - Update report status
- `assignReport` - Assign report to admin

---

### segmentsSlice.ts

**State**:
```typescript
interface SegmentsState {
  highlightedSegments: HighlightedSegment[];
  loading: boolean;
  error: string | null;
}
```

**Actions**:
- `fetchHighlightedSegments` - Get highlighted segments
- `updateHighlightedSegment` - Update segment data

---

### trendingSlice.ts

**State**:
```typescript
interface TrendingState {
  media: TrendingMedia[];
  loading: boolean;
  error: string | null;
}
```

**Actions**:
- `fetchTrendingMedia` - Get trending media

---

### fakeNewsSlice.ts

**State**:
```typescript
interface FakeNewsState {
  posts: FakeNewsPost[];
  loading: boolean;
  error: string | null;
}
```

**Actions**:
- `fetchFakeNews` - Get fake news posts
- `voteFakeNews` - Vote on fake news

---

## 📦 Dependencies

### Frontend (React Native)

```json
{
  "dependencies": {
    "@react-navigation/bottom-tabs": "^6.6.1",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/native-stack": "^6.9.27",
    "@reduxjs/toolkit": "^2.2.6",
    "axios": "^1.7.7",
    "date-fns": "^4.1.0",
    "expo": "^54.0.0",
    "expo-status-bar": "~3.0.8",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-webview": "13.15.0",
    "react-redux": "^9.1.2",
    "victory-native": "^36.9.2"
  }
}
```

### Backend (Node.js)

```json
{
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "prisma": "^5.20.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- React Native development environment
- Android Studio (for Android) / Xcode (for iOS)
- PostgreSQL database
- Git

---

### Step 1: Clone or Create Project

```bash
# Create new Expo project
npx create-expo-app BRSConnect --template blank-typescript

# Or clone from repository
git clone <repository-url> BRSConnect
cd BRSConnect
```

---

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

### Step 3: Setup Database

```bash
# Navigate to backend
cd backend

# Create .env file
cp env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/brsconnect"
# JWT_SECRET="your-secret-key"
# PORT=4000

# Run Prisma migrations
npm run prisma:migrate

# Seed database (optional)
npm run seed
```

---

### Step 4: Configure Frontend Environment

```typescript
// src/config/env.ts
export const API_URL = __DEV__ 
  ? 'http://localhost:4000/api'
  : 'https://your-production-api.com/api';

export const USE_MOCK = false; // Set to true for offline development
```

```json
// app.json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:4000/api",
      "useMock": false
    }
  }
}
```

---

### Step 5: Run Backend Server

```bash
cd backend
npm run dev
# Server starts on http://localhost:4000
```

---

### Step 6: Run Mobile App

```bash
# From root directory
npm start

# Then press:
# 'a' for Android
# 'i' for iOS
# 'w' for Web

# Or directly:
npm run android
npm run ios
```

---

### Step 7: Build for Production

**Android**:
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

**iOS**:
```bash
npx expo run:ios --configuration Release
# Or use Xcode to archive
```

---

## 🎨 Customization Guide

### 1. Change Branding

**Colors** (`src/theme/colors.ts`):
```typescript
export const colors = {
  primary: '#YOUR_PRIMARY_COLOR',
  primaryLight: '#YOUR_PRIMARY_LIGHT',
  primaryDark: '#YOUR_PRIMARY_DARK',
  // ... other colors
};
```

**App Name & Icon**:
```json
// app.json
{
  "expo": {
    "name": "YourAppName",
    "slug": "yourappslug",
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

**Loading Screen** (`App.tsx`):
```typescript
// Change icon, title, and subtitle
<MaterialIcons name="your-icon" size={64} color="#YOUR_COLOR" />
<Text>Your App Name</Text>
<Text>Your tagline...</Text>
```

---

### 2. Add New Role

**Database**:
```prisma
// backend/prisma/schema.prisma
enum Role {
  SuperAdmin
  LocalAdmin
  Member
  Pending
  NewRole  // Add your new role
}
```

**Frontend**:
```typescript
// src/types/index.ts
export type Role = "SuperAdmin" | "LocalAdmin" | "Member" | "Pending" | "NewRole";

// src/navigation/RootNavigator.tsx
// Add new tab navigator for the role
const NewRoleTabs = () => (
  <Tab.Navigator>
    {/* Add tabs */}
  </Tab.Navigator>
);

// Add condition in RootNavigator
{isNewRole ? (
  <Stack.Screen name="NewRole" component={NewRoleTabs} />
) : ...}
```

---

### 3. Add New Screen

**Create Screen**:
```bash
# Create file
touch src/screens/common/NewScreen.tsx
```

```typescript
// src/screens/common/NewScreen.tsx
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const NewScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    color: colors.textPrimary,
  },
});
```

**Add to Navigation**:
```typescript
// src/navigation/RootNavigator.tsx
import { NewScreen } from '../screens/common/NewScreen';

// Add to Tab.Navigator
<Tab.Screen
  name="NewScreen"
  component={NewScreen}
  options={{
    title: "New",
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="new-icon" size={size} color={color} />
    )
  }}
/>
```

---

### 4. Add New API Endpoint

**Backend Route**:
```typescript
// backend/src/routes/newRoutes.ts
import { Router } from 'express';

const router = Router();

router.get('/new-endpoint', async (req, res) => {
  // Your logic
  res.json({ message: 'Success' });
});

export default router;
```

**Register Route**:
```typescript
// backend/src/app.ts
import newRoutes from './routes/newRoutes';

app.use('/api/new', newRoutes);
```

**Frontend Service**:
```typescript
// src/services/newService.ts
import { api } from './api';

export const newService = {
  getNewData: () => api.get('/new/new-endpoint'),
};
```

---

### 5. Customize Area Hierarchy

Currently: Assembly → Village → Ward → Booth

To add new level (e.g., District):

**Database**:
```prisma
// backend/prisma/schema.prisma
model User {
  // ... existing fields
  district        String?  // Add new field
  assemblySegment String
  village         String?
  ward            String?
  booth           String?
}
```

**Frontend Types**:
```typescript
// src/types/index.ts
export interface AssignedAreas {
  district?: string | null;  // Add new field
  assemblySegment: string;
  village?: string | null;
  ward?: string | null;
  booth?: string | null;
}
```

**Update Forms**: Add district selector to LoginScreen, Settings, etc.

---

## 🧪 Testing

### Mock Data

For offline development/testing:

```typescript
// src/config/env.ts
export const USE_MOCK = true;

// src/mocks/mockData.ts
// Contains mock data for all entities
```

Mock files:
- `src/mocks/mockData.ts` - Users, polls, posts, reports
- `src/mocks/mockFakeNews.ts` - Fake news data

---

### Backend Tests

```bash
cd backend
npm test

# Specific test
npm test -- abacMiddleware.test.ts
```

---

## 📱 Mobile App Configuration

### Android

**Package Name**: `com.brsconnect.app`

**Icons**: 
- Located in `android/app/src/main/res/mipmap-*/`
- Sizes: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi

**Splash Screen**:
- `android/app/src/main/res/drawable-*/splashscreen_logo.png`

**Permissions** (if needed):
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

---

### iOS

**Bundle Identifier**: `com.brsconnect.app`

**Info.plist**: (configure permissions)
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select images</string>
```

---

## 🔒 Security Considerations

### JWT Authentication
- Token expiry: 7 days
- Refresh token flow (implement if needed)
- Secure token storage (React Native SecureStore)

### Password Security
- bcrypt hashing (10 rounds)
- Minimum password length: 8 characters
- Password complexity rules (implement if needed)

### API Security
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting (implement express-rate-limit)
- Input validation (Zod schemas)

### ABAC (Attribute-Based Access Control)
- Area-based data filtering
- Role-based permissions
- Middleware: `backend/src/middlewares/abacMiddleware.ts`

---

## 🎯 Business Logic Rules

### User Approval Workflow
1. User registers → Status: `Pending`, Role: `Pending`
2. LocalAdmin/SuperAdmin approves → Status: `Approved`, Role: `Member`
3. User can be rejected → Status: `Rejected`

### Area Scoping Rules
- **SuperAdmin**: Access all areas
- **LocalAdmin**: Access assigned Assembly/Village/Ward
- **Member**: Access own area only

### Poll Visibility
- **WARD**: Visible to users in specific ward
- **VILLAGE**: Visible to users in specific village
- **ASSEMBLY**: Visible to users in entire assembly segment

### Trending Score Calculation
```typescript
trendingScore = (likes * 2) + (comments * 3) + (shares * 5) - (reports * 10)
// Higher score = more trending
```

---

## 📚 Additional Features to Implement

### Phase 2 Enhancements
1. **Push Notifications**
   - Poll reminders
   - Report status updates
   - Approval notifications
   - New fake news alerts

2. **Chat/Messaging**
   - Direct messaging between users
   - Group chats per area
   - Admin broadcast messages

3. **Events Calendar**
   - Campaign events
   - Rally schedules
   - Meeting reminders

4. **Analytics Dashboard**
   - User engagement metrics
   - Poll participation rates
   - Area-wise statistics
   - Export reports (PDF/Excel)

5. **Media Library**
   - Upload campaign media
   - Share approved content
   - Media moderation queue

6. **Advanced Search**
   - Search posts by keyword
   - Filter polls by type/status
   - Search reports by category

7. **Offline Mode**
   - Cache data locally
   - Sync when online
   - Offline post creation

---

## 📖 Documentation Links

### Technologies Used
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/
- **Redux Toolkit**: https://redux-toolkit.js.org/
- **Victory Native**: https://formidable.com/open-source/victory/docs/native/
- **Prisma**: https://www.prisma.io/docs/
- **Express.js**: https://expressjs.com/

### Icon Library
- **Material Icons**: https://materialdesignicons.com/

---

## 🆘 Troubleshooting

### Common Issues

**1. Android Build Fails**
```bash
# Clear Gradle cache
cd android
./gradlew clean
./gradlew --stop

# Clear node_modules and reinstall
cd ..
rm -rf node_modules
npm install
```

**2. Metro Bundler Issues**
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

**3. Database Connection Error**
```bash
# Check DATABASE_URL in backend/.env
# Ensure PostgreSQL is running
# Run migrations
cd backend
npm run prisma:migrate
```

**4. JWT Token Expired**
- User needs to log in again
- Implement refresh token flow for better UX

**5. API Not Connecting**
- Check API_URL in `src/config/env.ts`
- Ensure backend is running
- Check network permissions in AndroidManifest.xml

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Update app version in `app.json` and `package.json`
- [ ] Change `USE_MOCK` to `false`
- [ ] Update API_URL to production URL
- [ ] Generate production API keys/secrets
- [ ] Test all user roles and permissions
- [ ] Test on real devices (Android & iOS)
- [ ] Review and fix all linter warnings
- [ ] Update splash screen and app icons
- [ ] Configure push notification credentials
- [ ] Setup error tracking (Sentry, Bugsnag)
- [ ] Setup analytics (Firebase, Mixpanel)

### Backend Deployment
- [ ] Setup production database (PostgreSQL)
- [ ] Run Prisma migrations on production DB
- [ ] Setup environment variables on hosting
- [ ] Configure CORS for production domain
- [ ] Setup SSL certificate (HTTPS)
- [ ] Configure domain/subdomain
- [ ] Setup PM2 or Docker for process management
- [ ] Configure logging and monitoring
- [ ] Setup database backups
- [ ] Load test API endpoints

### Mobile App Deployment

**Android**:
- [ ] Generate signed APK/AAB
- [ ] Create Play Store listing
- [ ] Upload screenshots and descriptions
- [ ] Submit for review

**iOS**:
- [ ] Configure Xcode for release
- [ ] Generate App Store provisioning profile
- [ ] Create App Store listing
- [ ] Upload screenshots and descriptions
- [ ] Submit for review

---

## 📞 Support & Maintenance

### Monitoring
- Application logs
- Error tracking
- User analytics
- Performance metrics
- Database health

### Regular Updates
- Security patches
- Dependency updates
- Bug fixes
- Feature enhancements
- User feedback implementation

---

## 🎓 Training Materials

### For Admins
1. How to approve/reject users
2. How to create polls
3. How to manage reports
4. How to moderate posts
5. How to update winning segments

### For Members
1. How to create posts
2. How to participate in polls
3. How to submit reports
4. How to identify fake news
5. How to navigate the app

---

## 📝 License & Credits

**Application**: BRSConnect
**Purpose**: Political campaign management for the Pink Car movement
**Built with**: React Native, Expo, Node.js, PostgreSQL, Prisma

---

## ✅ Final Notes

This guide covers the **complete business function** of BRSConnect including:
- ✅ All screens and components
- ✅ Complete navigation structure
- ✅ Database schema and relationships
- ✅ API services and endpoints
- ✅ State management (Redux)
- ✅ Theme and styling
- ✅ Role-based access control
- ✅ Business logic rules
- ✅ Setup and deployment instructions

To replicate for a demo or new client:
1. Copy all source files
2. Update branding (colors, name, logo)
3. Configure database
4. Update API endpoints
5. Test all features
6. Deploy backend and mobile apps

---

**End of Document**

