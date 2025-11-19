import {
  ApprovalRequest,
  FakeNewsPost,
  HighlightedSegment,
  Poll,
  Post,
  Report,
  TrendingMedia,
  User,
} from "../types";

const now = new Date();
const hoursAgo = (hours: number) =>
  new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

export const mockUser: User = {
  id: "user-1",
  firstName: "Ankita",
  lastName: "Rao",
  aliasName: "AnkitaR",
  name: "Ankita Rao",
  email: "ankita.rao@example.com",
  mobile: "+91 98765 43210",
  role: "LocalAdmin",
  status: "Approved",
  designation: "Local Admin",
  referralId: "REF12345",
  assignedAreas: {
    assemblySegment: "Suryapet Central",
    village: "Pink Nagar",
    ward: "Ward 12",
    booth: "Booth 44",
  },
  villageName: "Pink Nagar",
  isActive: true,
  createdBy: "user-superadmin",
  createdDate: hoursAgo(365),
  modifiedBy: "user-superadmin",
  modifiedDate: hoursAgo(30),
  points: 2500,
  approvedBy: "user-superadmin",
  approvedAt: hoursAgo(48),
};

// Re-export from main mockData file if available, otherwise use minimal data
export const mockUsers: User[] = [mockUser];

export const mockHighlightedSegment: HighlightedSegment = {
  segmentId: "segment-1",
  segmentName: "Suryapet Central",
  candidate: "Pink Car Candidate",
  counts: {
    win: 62,
    lose: 21,
    cantSay: 17,
  },
  sampleSize: 1200,
  lastUpdated: hoursAgo(3),
  source: "Ground Survey Teams",
};

export const mockTrendingMedia: TrendingMedia[] = [
  {
    id: "trend-1",
    title: "Massive Pink Car Rally draws thousands in Suryapet",
    description:
      "Residents show overwhelming support during the dawn-to-dusk rally covering all mandals.",
    mediaType: "video",
    url: "https://example.com/rally",
    thumbnail:
      "https://images.unsplash.com/photo-1526662092594-e98c1e356d6a?auto=format&fit=crop&w=900&q=60",
    likes: 412,
    dislikes: 12,
    platform: "YouTube",
  },
  {
    id: "trend-2",
    title: "Community healthcare camp launched under Pink Car mission",
    description:
      "Free check-ups and medicines distributed to over 1,500 families across the district.",
    mediaType: "image",
    url: "https://example.com/healthcare",
    thumbnail:
      "https://images.unsplash.com/photo-1542219550-37153d387c33?auto=format&fit=crop&w=900&q=60",
    likes: 298,
    dislikes: 8,
    platform: "Instagram",
  },
  {
    id: "trend-3",
    title: "Pink Car manifesto highlights job creation in rural segments",
    description:
      "Policy brief released focusing on youth employment, agro innovation, and smart subsidies.",
    mediaType: "tweet",
    url: "https://example.com/manifesto",
    thumbnail:
      "https://images.unsplash.com/photo-1529480490292-36f7e96c2e43?auto=format&fit=crop&w=900&q=60",
    likes: 512,
    dislikes: 21,
    platform: "Twitter",
  },
];

export const mockPolls: Poll[] = [
  {
    id: "poll-1",
    title: "Which development priority should Pink Car address first?",
    description:
      "Help shape our first 100-day action plan by sharing your top priority.",
    type: "SINGLE",
    visibility: "ASSEMBLY",
    startsAt: hoursAgo(12),
    endsAt: hoursAgo(-96),
    areaScope: {
      assemblySegment: "Suryapet Central",
    },
    createdBy: "user-admin",
    options: [
      { id: "option-1", label: "Youth Employment", votes: 244 },
      { id: "option-2", label: "Healthcare Access", votes: 189 },
      { id: "option-3", label: "Water Infrastructure", votes: 163 },
    ],
    totalResponses: 596,
  },
  {
    id: "poll-2",
    title: "Rate Pink Car’s survey teams in your booth",
    description: "Share feedback about engagement quality in your area.",
    type: "RATING",
    visibility: "WARD",
    startsAt: hoursAgo(72),
    endsAt: hoursAgo(24),
    areaScope: {
      assemblySegment: "Suryapet Central",
      ward: "Ward 12",
    },
    createdBy: "user-admin",
    options: [
      { id: "option-1", label: "⭐️⭐️⭐️⭐️⭐️", votes: 84 },
      { id: "option-2", label: "⭐️⭐️⭐️⭐️", votes: 96 },
      { id: "option-3", label: "⭐️⭐️⭐️", votes: 28 },
      { id: "option-4", label: "⭐️⭐️", votes: 12 },
      { id: "option-5", label: "⭐️", votes: 4 },
    ],
    totalResponses: 224,
  },
];

export const mockPastPolls: Poll[] = [
  {
    id: "poll-3",
    title: "Which welfare programme impacted your family most?",
    description: "We want to highlight stories in our manifesto launch event.",
    type: "MULTI",
    visibility: "ASSEMBLY",
    startsAt: hoursAgo(240),
    endsAt: hoursAgo(120),
    areaScope: {
      assemblySegment: "Suryapet Central",
    },
    createdBy: "user-admin",
    options: [
      { id: "option-1", label: "Scholarship Support", votes: 154 },
      { id: "option-2", label: "Healthcare Cards", votes: 201 },
      { id: "option-3", label: "Housing Grants", votes: 188 },
    ],
    totalResponses: 543,
  },
];

export const mockPosts: Post[] = [
  {
    id: "post-1",
    authorId: "volunteer-1",
    authorName: "Sita Ram",
    content:
      "Team Pink Car completed door-to-door outreach in Pink Nagar block. 320 households engaged and great reception!",
    mediaType: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60",
    areaScope: {
      assemblySegment: "Suryapet Central",
      village: "Pink Nagar",
    },
    createdAt: hoursAgo(5),
    trendingScore: 84,
    visibility: "WARD",
    comments: [
      {
        id: "comment-1",
        authorName: "Anil Kumar",
        content: "Fantastic energy, proud of the team!",
        createdAt: hoursAgo(4.5),
      },
    ],
  },
  {
    id: "post-2",
    authorId: "volunteer-2",
    authorName: "Lakshmi Devi",
    content:
      "Highlights from today's women entrepreneurship workshop—60 new business proposals reviewed.",
    mediaType: "video",
    mediaUrl:
      "https://images.unsplash.com/photo-1478479405421-ce83c92fb3e1?auto=format&fit=crop&w=900&q=60",
    areaScope: {
      assemblySegment: "Suryapet Central",
    },
    createdAt: hoursAgo(9),
    trendingScore: 62,
  },
];

export const mockReports: Report[] = [
  {
    id: "report-1",
    reporterId: "member-221",
    reporterName: "Mahesh Babu",
    title: "Streetlights non-functional near Pink Nagar bus stop",
    description:
      "Residents reporting safety issues during campaign house visits. Urgent fix required.",
    status: "Under Review",
    attachments: [],
    areaScope: {
      assemblySegment: "Suryapet Central",
      village: "Pink Nagar",
      ward: "Ward 12",
    },
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(10),
    assignedAdminId: "user-1",
  },
  {
    id: "report-2",
    reporterId: "member-332",
    reporterName: "Hema Priya",
    title: "Rally permission pending clearance",
    description:
      "Police forms submitted but awaiting approval. Need follow up at the district office.",
    status: "New",
    attachments: ["permit_form.pdf"],
    areaScope: {
      assemblySegment: "Suryapet Central",
    },
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(6),
  },
  {
    id: "report-3",
    reporterId: "member-109",
    reporterName: "Kiran",
    title: "Water tanker request fulfilled",
    description:
      "Ward 12 received tankers on schedule today. Closing the loop to update analytics.",
    status: "Resolved",
    attachments: [],
    areaScope: {
      assemblySegment: "Suryapet Central",
      ward: "Ward 12",
    },
    createdAt: hoursAgo(120),
    updatedAt: hoursAgo(3),
    assignedAdminId: "user-1",
  },
];

export const mockFakeNews: FakeNewsPost[] = [
  {
    id: "fake-1",
    title: "Rumor: Pink Car candidate hospitalized after rally",
    description:
      "False claim circulating on WhatsApp groups. Candidate has completed evening events successfully.",
    mediaType: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=60",
    likes: 182,
    dislikes: 36,
    postedBy: "Verified Fact-check Team",
    publishedAt: hoursAgo(2),
  },
  {
    id: "fake-2",
    title: "Fake polling schedule shared for Ward 12",
    description:
      "Misleading schedule lists the wrong booth timings. Official update shared in the Pink Car app.",
    mediaType: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60",
    likes: 143,
    dislikes: 12,
    postedBy: "Pink Car Media Cell",
    publishedAt: hoursAgo(7),
  },
];

export const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: "approval-1",
    name: "Ravi Shankar",
    mobile: "+91 99887 66554",
    submittedDocs: ["id-proof.jpeg", "address-proof.pdf"],
    assignedAreas: {
      assemblySegment: "Suryapet Central",
      village: "Pink Nagar",
    },
    createdAt: hoursAgo(24),
  },
  {
    id: "approval-2",
    name: "Fatima Begum",
    email: "fatima.begum@example.com",
    mobile: "+91 98765 12345",
    submittedDocs: ["volunteer-letter.pdf"],
    assignedAreas: {
      assemblySegment: "Suryapet Central",
      ward: "Ward 6",
    },
    createdAt: hoursAgo(30),
  },
  {
    id: "approval-3",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    mobile: "+91 91234 56780",
    submittedDocs: ["id-card.png"],
    assignedAreas: {
      assemblySegment: "Suryapet Central",
      booth: "Booth 18",
    },
    createdAt: hoursAgo(8),
  },
];

