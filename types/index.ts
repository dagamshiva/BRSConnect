export type Role = "SuperAdmin" | "LocalAdmin" | "Member" | "Pending";
export type ApprovalStatus = "Pending" | "Approved" | "Rejected";

export interface AssignedAreas {
  assemblySegment: string;
  village?: string | null;
  ward?: string | null;
  booth?: string | null;
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  mobile?: string | null;
  role: Role;
  status: ApprovalStatus;
  assignedAreas: AssignedAreas;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface HighlightedSegment {
  segmentId: string;
  segmentName: string;
  candidate: string;
  counts: {
    win: number;
    lose: number;
    cantSay: number;
  };
  sampleSize: number;
  lastUpdated: string;
  source: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  type: "YES_NO" | "SINGLE" | "MULTI" | "RATING";
  visibility: "WARD" | "VILLAGE" | "ASSEMBLY";
  startsAt: string;
  endsAt: string;
  areaScope: AssignedAreas;
  createdBy: string;
  options: PollOption[];
  totalResponses: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaType?: "text" | "image" | "video" | "voice" | "link";
  mediaUrl?: string;
  areaScope: AssignedAreas;
  createdAt: string;
  trendingScore: number;
  visibility?: "WARD" | "ASSEMBLY" | "ALL";
  comments?: PostComment[];
}

export interface PostComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  title: string;
  description: string;
  status: "New" | "Under Review" | "Resolved" | "Dismissed";
  attachments: string[];
  areaScope: AssignedAreas;
  createdAt: string;
  updatedAt: string;
  assignedAdminId?: string | null;
}

export interface ApprovalRequest {
  id: string;
  name: string;
  email?: string | null;
  mobile?: string | null;
  submittedDocs: string[];
  assignedAreas: AssignedAreas;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export type TrendingMediaType = "image" | "video" | "tweet" | "instagram";

export interface TrendingMedia {
  id: string;
  title: string;
  description?: string;
  mediaType: TrendingMediaType;
  url: string;
  thumbnail?: string;
  likes: number;
  dislikes: number;
  platform: "Twitter" | "Instagram" | "YouTube" | "Image";
}

export interface FakeNewsPost {
  id: string;
  title: string;
  description?: string;
  mediaType: TrendingMediaType | "image";
  mediaUrl: string;
  thumbnail?: string;
  likes: number;
  dislikes: number;
  postedBy: string;
  publishedAt: string;
}

export interface CreatePollInput {
  title: string;
  description?: string;
  type: Poll["type"];
  visibility: Poll["visibility"];
  startsAt: string;
  endsAt: string;
  areaScope: AssignedAreas;
  options: Array<{ label: string }>;
}

export interface VotePollInput {
  pollId: string;
  optionId: string;
}

export interface CreatePostInput {
  content: string;
  areaScope: AssignedAreas;
  mediaType?: Post["mediaType"];
  mediaUrl?: string;
}

export interface CreateReportInput {
  title: string;
  description: string;
  attachments?: string[];
  areaScope: AssignedAreas;
}

export interface UpdateReportStatusInput {
  reportId: string;
  status: Report["status"];
  assignedAdminId?: string | null;
}

export interface ApprovalDecisionInput {
  id: string;
  reason?: string;
}

