import type {
  ApprovalRequest,
  AssignedAreas,
  Poll,
  Post,
  Report,
  TrendingMedia,
  FakeNewsPost,
  User,
} from "../types";

const toAssignedAreas = (source: Record<string, any>): AssignedAreas => ({
  assemblySegment:
    source.assemblyScope ?? source.assemblySegment ?? source.assignedAreas?.assemblySegment ?? "",
  village:
    source.villageScope ??
    source.village ??
    source.assignedAreas?.village ??
    null,
  ward:
    source.wardScope ??
    source.ward ??
    source.assignedAreas?.ward ??
    null,
  booth:
    source.boothScope ??
    source.booth ??
    source.assignedAreas?.booth ??
    null,
});

export const mapPollFromApi = (poll: any): Poll => ({
  id: poll.id,
  title: poll.title,
  description: poll.description ?? undefined,
  type: poll.type,
  visibility: poll.visibility,
  startsAt: poll.startsAt,
  endsAt: poll.endsAt,
  areaScope: toAssignedAreas(poll),
  createdBy:
    poll.createdBy?.name ??
    poll.createdByName ??
    (typeof poll.createdBy === "string" ? poll.createdBy : undefined) ??
    poll.createdById ??
    "Pink Car Admin",
  options: (poll.options ?? []).map((option: any) => ({
    id: option.id,
    label: option.label,
    votes:
      option._count?.votes ??
      (Array.isArray(option.votes) ? option.votes.length : option.votes ?? 0),
  })),
  totalResponses: poll.totalResponses ?? 0,
});

export const mapPostFromApi = (post: any): Post => ({
  id: post.id,
  authorId: post.authorId,
  authorName: post.author?.name ?? post.authorName ?? "Unknown",
  content: post.content,
  mediaType: post.mediaType ?? undefined,
  mediaUrl: post.mediaUrl ?? undefined,
  areaScope: toAssignedAreas(post),
  createdAt: post.createdAt,
  trendingScore: post.trendingScore ?? 0,
  visibility: post.visibility ?? undefined,
  comments: post.comments ?? [],
});

export const mapReportFromApi = (report: any): Report => ({
  id: report.id,
  reporterId: report.reporterId,
  reporterName: report.reporter?.name ?? report.reporterName ?? "Unknown",
  title: report.title,
  description: report.description,
  status: report.status,
  attachments: report.attachments ?? [],
  areaScope: toAssignedAreas(report),
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
  assignedAdminId: report.assigneeId ?? null,
});

export const mapApprovalRequestFromApi = (user: any): ApprovalRequest => ({
  id: user.id,
  name: user.name,
  email: user.email ?? null,
  mobile: user.mobile ?? null,
  submittedDocs: user.submittedDocs ?? [],
  assignedAreas: toAssignedAreas(user),
  createdAt: user.createdAt ?? new Date().toISOString(),
});

export const mapUserFromApi = (data: any): User => ({
  id: data.id,
  name: data.name,
  email: data.email ?? data.contactEmail ?? null,
  mobile: data.mobile ?? data.contactMobile ?? null,
  role: data.role ?? data.userRole ?? "Member",
  status: data.status ?? data.approvalStatus ?? "Pending",
  assignedAreas: {
    assemblySegment:
      data.assemblySegment ??
      data.assignedAreas?.assemblySegment ??
      data.areaScope?.assemblySegment ??
      "",
    village:
      data.village ??
      data.assignedAreas?.village ??
      data.areaScope?.village ??
      null,
    ward:
      data.ward ??
      data.assignedAreas?.ward ??
      data.areaScope?.ward ??
      null,
    booth:
      data.booth ??
      data.assignedAreas?.booth ??
      data.areaScope?.booth ??
      null,
  },
  approvedBy: data.approvedById ?? data.approvedBy ?? null,
  approvedAt: data.approvedAt ?? null,
});

export const mapTrendingMediaFromApi = (media: any): TrendingMedia => ({
  id: media.id,
  title: media.title,
  description: media.description ?? undefined,
  mediaType: media.mediaType,
  url: media.url,
  thumbnail: media.thumbnail ?? undefined,
  likes: media.likes ?? 0,
  dislikes: media.dislikes ?? 0,
  platform: media.platform,
});

export const mapFakeNewsFromApi = (item: any): FakeNewsPost => ({
  id: item.id,
  title: item.title,
  description: item.description ?? undefined,
  mediaType: item.mediaType ?? "image",
  mediaUrl: item.mediaUrl ?? "",
  thumbnail: item.thumbnail ?? undefined,
  likes: item.likes ?? 0,
  dislikes: item.dislikes ?? 0,
  postedBy: item.postedBy ?? "Unknown",
  publishedAt: item.publishedAt ?? new Date().toISOString(),
});

