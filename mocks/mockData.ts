import {
  ApprovalRequest,
  FakeNewsPost,
  HighlightedSegment,
  Poll,
  Post,
  Report,
  TrendingMedia,
  User,
} from '../types';
import { assemblySegments } from '../src/data/assemblySegments';
import { telanganaUsers } from './telangana_user';

const now = new Date();
const hoursAgo = (hours: number) =>
  new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

// Helper function to get random element from array
const randomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomLikes = () => randomInt(50, 5000);
const randomDislikes = () => randomInt(0, Math.floor(randomLikes() * 0.15));

// Indian names for users
const firstNames = [
  'Rajesh',
  'Priya',
  'Kiran',
  'Anjali',
  'Suresh',
  'Lakshmi',
  'Mahesh',
  'Divya',
  'Ravi',
  'Sunita',
  'Vikram',
  'Meera',
  'Amit',
  'Kavita',
  'Naveen',
  'Pooja',
  'Srinivas',
  'Radha',
  'Gopal',
  'Swati',
  'Harish',
  'Neha',
  'Venkat',
  'Anita',
  'Prakash',
  'Shanti',
  'Mohan',
  'Deepika',
  'Ramesh',
  'Sarita',
  'Kumar',
  'Jyoti',
  'Suresh',
  'Madhuri',
  'Anil',
  'Rekha',
  'Vijay',
  'Sangeeta',
  'Rahul',
  'Preeti',
  'Arjun',
  'Manisha',
  'Siddharth',
  'Rashmi',
  'Aditya',
  'Nisha',
  'Rohit',
  'Kiran',
  'Akhil',
  'Sneha',
  'Varun',
  'Shruti',
  'Karthik',
  'Anushka',
  'Nikhil',
  'Isha',
  'Sai',
  'Tanvi',
  'Harsh',
  'Aishwarya',
  'Yash',
  'Pallavi',
  'Abhishek',
  'Richa',
];

const lastNames = [
  'Kumar',
  'Sharma',
  'Patel',
  'Rao',
  'Reddy',
  'Naidu',
  'Devi',
  'Singh',
  'Nair',
  'Menon',
  'Iyer',
  'Pillai',
  'Das',
  'Bose',
  'Banerjee',
  'Chatterjee',
  'Gupta',
  'Agarwal',
  'Jain',
  'Mehta',
  'Shah',
  'Desai',
  'Joshi',
  'Malhotra',
  'Kapoor',
  'Khanna',
  'Chopra',
  'Bhatia',
  'Saxena',
  'Verma',
  'Yadav',
  'Khan',
];

// BRS Party related news topics
const brsNewsTopics = [
  'Rythu Bandhu scheme benefits reach farmers',
  'Kaleshwaram project transforms irrigation',
  'Mission Bhagiratha provides clean drinking water',
  'Pink Car rally mobilizes thousands',
  'Dalit Bandhu scheme empowers communities',
  'Aasara pension scheme supports elderly',
  "KCR's vision for Telangana development",
  'Women empowerment initiatives gain momentum',
  'Youth employment programs launched',
  'Healthcare reforms improve rural access',
  'Education reforms transform schools',
  'Infrastructure development accelerates',
  'IT sector growth creates opportunities',
  'Agricultural support schemes expand',
  'Social welfare programs reach all',
  'Village development plans implemented',
  'Smart city initiatives progress',
  'Water conservation efforts succeed',
  'Power sector reforms benefit consumers',
  'Transport infrastructure improves connectivity',
];

// BRS Party related video topics
const brsVideoTopics = [
  'KCR addresses massive rally',
  'Rythu Bandhu distribution ceremony',
  'Kaleshwaram project inauguration',
  'Mission Bhagiratha success story',
  'Dalit Bandhu beneficiary testimonial',
  'Aasara pension distribution',
  'Pink Car movement highlights',
  'Women SHG success stories',
  'Youth employment training program',
  'Healthcare camp organized',
  'School infrastructure upgrade',
  'Road construction progress',
  'IT park inauguration',
  'Farmer support program',
  'Social welfare distribution',
  'Village transformation story',
  'Smart city development',
  'Water conservation awareness',
  'Power plant inauguration',
  'Metro rail expansion',
];

// Poll topics related to BRS
const brsPollTopics = [
  'Which BRS scheme benefited you most?',
  'Rate Rythu Bandhu scheme effectiveness',
  'How satisfied are you with Mission Bhagiratha?',
  'Which development area needs priority?',
  'Rate Pink Car movement impact',
  'Which welfare program is most important?',
  'How effective is Dalit Bandhu?',
  'Rate healthcare access in your area',
  'Which infrastructure project is most needed?',
  'How satisfied with Aasara pension?',
  'Which education reform is most important?',
  'Rate water supply quality',
  'Which employment program helped most?',
  'Rate power supply reliability',
  'Which social welfare scheme is best?',
];

// Suggestion topics
const suggestionTopics = [
  'Improve road connectivity',
  'Increase healthcare facilities',
  'Enhance education infrastructure',
  'Better water supply system',
  'Improve power supply',
  'Expand public transport',
  'Create employment opportunities',
  'Enhance women safety measures',
  'Improve sanitation facilities',
  'Better waste management',
  'Expand digital connectivity',
  'Improve agricultural support',
  'Enhance skill development programs',
  'Better housing facilities',
  'Improve street lighting',
];

// Designations for users
const designations = [
  'Volunteer',
  'Field Coordinator',
  'Booth Incharge',
  'Ward Coordinator',
  'Village Coordinator',
  'District Coordinator',
  'State Coordinator',
  'Media Coordinator',
  'Youth Leader',
  'Women Leader',
  'Senior Leader',
];

// Load users from telangana_user.ts
export const mockUsers: User[] = telanganaUsers;

// Legacy: Generate additional mock users if needed (commented out - using telangana users instead)
/*
export const mockUsers: User[] = Array.from({ length: 65 }, (_, i) => {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const name = `${firstName} ${lastName}`;
  const aliasName = i % 4 === 0 ? `${firstName}${randomInt(1, 99)}` : null;
  const segment = randomElement(assemblySegments);
  const role: 'SuperAdmin' | 'LocalAdmin' | 'Member' | 'Pending' =
    i === 0
      ? 'SuperAdmin'
      : i < 5
      ? 'LocalAdmin'
      : i < 60
      ? 'Member'
      : 'Pending';
  const status: 'Pending' | 'Approved' | 'Rejected' =
    role === 'Pending'
      ? 'Pending'
      : randomElement([
          'Approved',
          'Approved',
          'Approved',
          'Rejected',
        ] as const);
  const isActive =
    status === 'Approved' && randomElement([true, true, true, false]);
  const villageName = i % 3 === 0 ? `Village ${randomInt(1, 50)}` : null;
  const createdDate = daysAgo(randomInt(1, 365));
  const modifiedDate = randomElement([createdDate, daysAgo(randomInt(1, 30))]);
  const createdBy =
    i === 0 ? null : randomElement(['user-1', 'user-2', 'user-3']);
  const modifiedBy = randomElement(['user-1', 'user-2', 'user-3', null]);
  const referralId = i % 3 === 0 ? `REF${randomInt(10000, 99999)}` : null;
  const points = randomInt(0, 5000);

  return {
    id: `user-${i + 1}`,
    firstName,
    lastName,
    aliasName,
    name,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@brsconnect.com`,
    mobile: `+91 ${randomInt(90000, 99999)} ${randomInt(10000, 99999)}`,
    role,
    status,
    designation:
      role === 'SuperAdmin'
        ? 'Super Admin'
        : role === 'LocalAdmin'
        ? 'Local Admin'
        : randomElement(designations),
    referralId,
    assignedAreas: {
      assemblySegment: segment,
      village: villageName,
      ward: i % 2 === 0 ? `Ward ${randomInt(1, 30)}` : null,
      booth: i % 4 === 0 ? `Booth ${randomInt(1, 100)}` : null,
    },
    villageName,
    isActive,
    createdBy,
    createdDate,
    modifiedBy,
    modifiedDate,
    points,
    approvedBy:
      status === 'Approved' && role !== 'SuperAdmin' ? 'user-1' : null,
    approvedAt: status === 'Approved' ? daysAgo(randomInt(1, 90)) : null,
  };
});
*/

// Generate 80+ news posts related to BRS party
export const mockNewsPosts: Post[] = Array.from({ length: 85 }, (_, i) => {
  const user = randomElement(mockUsers.filter(u => u.status === 'Approved'));
  const topic = randomElement(brsNewsTopics);
  const segment = randomElement(assemblySegments);

  const newsContent = [
    `${topic} in ${segment}. BRS party continues to deliver on promises.`,
    `Breaking: ${topic} reaches new milestone in ${segment} assembly segment.`,
    `Pink Car movement: ${topic} transforms lives in ${segment}.`,
    `${segment} celebrates success of ${topic}. KCR's vision in action.`,
    `Update from ${segment}: ${topic} benefits thousands of families.`,
    `${topic} implementation in ${segment} receives overwhelming support.`,
    `BRS party initiative: ${topic} makes significant impact in ${segment}.`,
    `${segment} residents praise ${topic} under BRS governance.`,
  ];

  return {
    id: `news-post-${i + 1}`,
    authorId: user.id,
    authorName: user.name,
    content: randomElement(newsContent),
    mediaType: randomElement(['text', 'image', 'video']),
    mediaUrl: randomElement([
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
      'https://images.unsplash.com/photo-1542219550-37153d387c33',
      'https://images.unsplash.com/photo-1526662092594-e98c1e356d6a',
    ]),
    areaScope: {
      assemblySegment: segment,
      village: i % 3 === 0 ? `Village ${randomInt(1, 50)}` : null,
      ward: i % 2 === 0 ? `Ward ${randomInt(1, 30)}` : null,
    },
    createdAt: hoursAgo(randomInt(1, 168)),
    trendingScore: randomInt(20, 100),
    visibility: randomElement(['WARD', 'ASSEMBLY', 'ALL']),
    comments: Array.from({ length: randomInt(0, 5) }, (_, j) => ({
      id: `comment-${i}-${j}`,
      authorName: randomElement(mockUsers).name,
      content: randomElement([
        'Great initiative!',
        'Proud to be part of BRS!',
        'This is amazing!',
        'Keep up the good work!',
        'Thank you for this!',
      ]),
      createdAt: hoursAgo(randomInt(1, 24)),
    })),
  };
});

// Generate 50+ video posts related to different segments
export const mockVideoPosts: Post[] = Array.from({ length: 55 }, (_, i) => {
  const user = randomElement(mockUsers.filter(u => u.status === 'Approved'));
  const topic = randomElement(brsVideoTopics);
  const segment = randomElement(assemblySegments);

  const videoContent = [
    `Watch: ${topic} in ${segment}. Exclusive coverage of BRS party event.`,
    `Video: ${topic} highlights from ${segment} assembly segment.`,
    `${segment} celebrates: ${topic} showcases BRS achievements.`,
    `Must watch: ${topic} in ${segment} - Pink Car movement in action.`,
    `Exclusive: ${topic} coverage from ${segment}. BRS party delivers.`,
  ];

  return {
    id: `video-post-${i + 1}`,
    authorId: user.id,
    authorName: user.name,
    content: randomElement(videoContent),
    mediaType: 'video',
    mediaUrl: `https://youtube.com/watch?v=${Math.random()
      .toString(36)
      .substring(7)}`,
    areaScope: {
      assemblySegment: segment,
      village: i % 3 === 0 ? `Village ${randomInt(1, 50)}` : null,
      ward: i % 2 === 0 ? `Ward ${randomInt(1, 30)}` : null,
    },
    createdAt: hoursAgo(randomInt(1, 120)),
    trendingScore: randomInt(30, 100),
    visibility: randomElement(['WARD', 'ASSEMBLY', 'ALL']),
  };
});

// Generate 40+ polls related to different segments
export const mockPolls: Poll[] = Array.from({ length: 45 }, (_, i) => {
  const topic = randomElement(brsPollTopics);
  const segment = randomElement(assemblySegments);
  const admin = randomElement(
    mockUsers.filter(u => u.role === 'LocalAdmin' || u.role === 'SuperAdmin'),
  );
  const pollType = randomElement(['YES_NO', 'SINGLE', 'MULTI', 'RATING']);

  let options: Array<{ id: string; label: string; votes: number }> = [];

  if (pollType === 'YES_NO') {
    options = [
      { id: `opt-${i}-1`, label: 'Yes', votes: randomInt(100, 500) },
      { id: `opt-${i}-2`, label: 'No', votes: randomInt(20, 150) },
    ];
  } else if (pollType === 'RATING') {
    options = [
      { id: `opt-${i}-1`, label: '⭐️⭐️⭐️⭐️⭐️', votes: randomInt(50, 300) },
      { id: `opt-${i}-2`, label: '⭐️⭐️⭐️⭐️', votes: randomInt(40, 250) },
      { id: `opt-${i}-3`, label: '⭐️⭐️⭐️', votes: randomInt(20, 150) },
      { id: `opt-${i}-4`, label: '⭐️⭐️', votes: randomInt(10, 80) },
      { id: `opt-${i}-5`, label: '⭐️', votes: randomInt(5, 40) },
    ];
  } else if (pollType === 'SINGLE') {
    options = [
      { id: `opt-${i}-1`, label: 'Rythu Bandhu', votes: randomInt(80, 400) },
      {
        id: `opt-${i}-2`,
        label: 'Mission Bhagiratha',
        votes: randomInt(60, 350),
      },
      { id: `opt-${i}-3`, label: 'Dalit Bandhu', votes: randomInt(50, 300) },
      { id: `opt-${i}-4`, label: 'Aasara Pension', votes: randomInt(40, 250) },
    ];
  } else {
    options = [
      { id: `opt-${i}-1`, label: 'Healthcare', votes: randomInt(100, 500) },
      { id: `opt-${i}-2`, label: 'Education', votes: randomInt(90, 450) },
      { id: `opt-${i}-3`, label: 'Employment', votes: randomInt(80, 400) },
      { id: `opt-${i}-4`, label: 'Infrastructure', votes: randomInt(70, 350) },
    ];
  }

  const totalResponses = options.reduce((sum, opt) => sum + opt.votes, 0);

  return {
    id: `poll-${i + 1}`,
    title: `${topic} - ${segment}`,
    description: `Share your opinion about ${topic} in ${segment} assembly segment.`,
    type: pollType as 'YES_NO' | 'SINGLE' | 'MULTI' | 'RATING',
    visibility: randomElement(['WARD', 'VILLAGE', 'ASSEMBLY']),
    startsAt: daysAgo(randomInt(1, 30)),
    endsAt: hoursAgo(-randomInt(1, 7)),
    areaScope: {
      assemblySegment: segment,
      village: i % 3 === 0 ? `Village ${randomInt(1, 50)}` : null,
      ward: i % 2 === 0 ? `Ward ${randomInt(1, 30)}` : null,
    },
    createdBy: admin.name,
    options,
    totalResponses,
  };
});

// Generate 50+ suggestions from different segments
export const mockSuggestions: Post[] = Array.from({ length: 55 }, (_, i) => {
  const user = randomElement(mockUsers.filter(u => u.status === 'Approved'));
  const topic = randomElement(suggestionTopics);
  const segment = randomElement(assemblySegments);

  const suggestionContent = [
    `Suggestion for ${segment}: ${topic} would greatly benefit our community.`,
    `Request from ${segment}: Please consider ${topic} for better development.`,
    `${segment} residents suggest: ${topic} needs immediate attention.`,
    `Community feedback from ${segment}: ${topic} should be prioritized.`,
    `Suggestion: ${topic} in ${segment} will improve quality of life.`,
  ];

  return {
    id: `suggestion-${i + 1}`,
    authorId: user.id,
    authorName: user.name,
    content: randomElement(suggestionContent),
    mediaType: randomElement(['text', 'image']),
    areaScope: {
      assemblySegment: segment,
      village: i % 3 === 0 ? `Village ${randomInt(1, 50)}` : null,
      ward: i % 2 === 0 ? `Ward ${randomInt(1, 30)}` : null,
    },
    createdAt: hoursAgo(randomInt(1, 200)),
    trendingScore: randomInt(15, 80),
    visibility: randomElement(['WARD', 'ASSEMBLY']),
  };
});

// Generate trending media with random likes/dislikes
export const mockTrendingMedia: TrendingMedia[] = Array.from(
  { length: 30 },
  (_, i) => {
    const topic = randomElement([...brsNewsTopics, ...brsVideoTopics]);
    const segment = randomElement(assemblySegments);
    const likes = randomLikes();
    const dislikes = randomDislikes();

    return {
      id: `trend-${i + 1}`,
      title: `${topic} - ${segment}`,
      description: `BRS party initiative ${topic} makes waves in ${segment} assembly segment.`,
      mediaType: randomElement(['image', 'video', 'tweet', 'instagram']),
      url: `https://brsconnect.com/media/${i + 1}`,
      thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i}`,
      likes,
      dislikes,
      platform: randomElement(['Twitter', 'Instagram', 'YouTube', 'Image']),
    };
  },
);

// Generate fake news posts with random likes/dislikes
export const mockFakeNews: FakeNewsPost[] = Array.from(
  { length: 20 },
  (_, i) => {
    const likes = randomLikes();
    const dislikes = randomDislikes();

    const fakeNewsTitles = [
      'Rumor: BRS candidate hospitalized - FALSE',
      'Fake claim: Rythu Bandhu discontinued - DEBUNKED',
      'Misleading: Mission Bhagiratha failure - FACT CHECKED',
      'False report: KCR resigns - VERIFIED FALSE',
      'Rumor: Pink Car movement ends - CLARIFIED',
    ];

    return {
      id: `fake-${i + 1}`,
      title: randomElement(fakeNewsTitles),
      description: `Fact-check team verifies this claim is false. Please share correct information.`,
      mediaType: 'image',
      mediaUrl: `https://images.unsplash.com/photo-${1600000000000 + i}`,
      likes,
      dislikes,
      postedBy: 'BRS Fact-Check Team',
      publishedAt: hoursAgo(randomInt(1, 48)),
    };
  },
);

// Generate reports
export const mockReports: Report[] = Array.from({ length: 40 }, (_, i) => {
  const user = randomElement(mockUsers.filter(u => u.status === 'Approved'));
  const segment = randomElement(assemblySegments);
  const admin =
    i % 3 === 0
      ? randomElement(mockUsers.filter(u => u.role === 'LocalAdmin'))
      : null;

  const reportTitles = [
    'Street light outage',
    'Water supply disruption',
    'Road repair needed',
    'Garbage collection issue',
    'Power cut complaint',
    'Drainage problem',
    'Public transport issue',
    'Healthcare facility needed',
  ];

  return {
    id: `report-${i + 1}`,
    reporterId: user.id,
    reporterName: user.name,
    title: `${randomElement(reportTitles)} in ${segment}`,
    description: `Issue reported from ${segment}. Requires immediate attention.`,
    status: randomElement(['New', 'Under Review', 'Resolved', 'Dismissed']),
    attachments: i % 2 === 0 ? [`attachment-${i}.jpg`] : [],
    areaScope: {
      assemblySegment: segment,
      village: i % 3 === 0 ? `Village ${randomInt(1, 50)}` : null,
      ward: i % 2 === 0 ? `Ward ${randomInt(1, 30)}` : null,
      booth: i % 4 === 0 ? `Booth ${randomInt(1, 100)}` : null,
    },
    createdAt: hoursAgo(randomInt(1, 240)),
    updatedAt: hoursAgo(randomInt(1, 120)),
    assignedAdminId: admin?.id || null,
  };
});

// Generate approval requests
export const mockApprovalRequests: ApprovalRequest[] = Array.from(
  { length: 25 },
  (_, i) => {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const segment = randomElement(assemblySegments);

    return {
      id: `approval-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      mobile: `+91 ${randomInt(90000, 99999)} ${randomInt(10000, 99999)}`,
      submittedDocs: randomElement([
        ['Voter ID', 'Party Membership'],
        ['Aadhar Card', 'Recommendation Letter'],
        ['ID Proof', 'Address Proof'],
      ]),
      assignedAreas: {
        assemblySegment: segment,
        village: i % 3 === 0 ? `Village ${randomInt(1, 50)}` : null,
        ward: i % 2 === 0 ? `Ward ${randomInt(1, 30)}` : null,
      },
      createdAt: hoursAgo(randomInt(1, 168)),
    };
  },
);

// Generate highlighted segments
export const mockHighlightedSegments: HighlightedSegment[] = Array.from(
  { length: 15 },
  (_, i) => {
    const segment = randomElement(assemblySegments);
    const win = randomInt(55, 75);
    const lose = randomInt(15, 30);
    const cantSay = 100 - win - lose;

    return {
      segmentId: `segment-${i + 1}`,
      segmentName: segment,
      candidate: 'BRS Candidate',
      counts: {
        win,
        lose,
        cantSay,
      },
      sampleSize: randomInt(1000, 5000),
      lastUpdated: hoursAgo(randomInt(1, 24)),
      source: randomElement([
        'Ground Worker Survey',
        'Door-to-Door Campaign',
        'Digital Poll',
        'Community Feedback',
      ]),
    };
  },
);

// Legacy exports for backward compatibility
export const mockUser = mockUsers[0];
export const mockHighlightedSegment = mockHighlightedSegments[0];
export const mockPosts = [
  ...mockNewsPosts,
  ...mockVideoPosts,
  ...mockSuggestions,
].slice(0, 20);
