// Mock data for Assembly View posts
// Two types of views:
// 1. PARTY_PREFERENCE - For pie chart (BRS, Congress, BJP, Others)
// 2. BRS_SATISFACTION - For gauge chart (Satisfaction with current MLA candidate)

import { telanganaUsers } from './telangana_user';

export type AssemblyViewType = 'PARTY_PREFERENCE' | 'BRS_SATISFACTION';

export interface AssemblyView {
  id: string;
  type: AssemblyViewType;
  assemblySegment: string;
  postedBy: string; // User ID
  postedAt: string; // ISO date string

  // For PARTY_PREFERENCE type (aggregated counts per assembly segment)
  brs?: string; // Number of BRS supporters
  congress?: string; // Number of Congress supporters
  bjp?: string; // Number of BJP supporters
  others?: string; // Number of Others supporters
  // Legacy: individual party selection (kept for backward compatibility if needed)
  selectedParty?: 'BRS' | 'Congress' | 'BJP' | 'Others';

  // For BRS_SATISFACTION type (aggregated counts per assembly segment)
  happy?: string; // Number of happy members
  unhappy?: string; // Number of unhappy members
  // Legacy: individual satisfaction (kept for backward compatibility if needed)
  satisfaction?: 'Happy' | 'Not Happy';
}

// Mock data - Party Preference views (aggregated by assembly segment)
const partyPreferenceViews: AssemblyView[] = [
  {
    id: 'apv-1',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Vemulawada',
    postedBy: '40b5bc7b-aa2b-4314-88e6-9ad936c5367c',
    postedAt: '2025-01-15T12:30:00.000Z',
    brs: '9',
    congress: '3',
    bjp: '2',
    others: '1',
  },
  {
    id: 'apv-2',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Balkonda',
    postedBy: 'd74589b7-d9eb-41b9-bb96-2f631bf4a360',
    postedAt: '2025-01-15T11:30:00.000Z',
    brs: '7',
    congress: '2',
    bjp: '1',
    others: '1',
  },
  {
    id: 'apv-3',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Makthal',
    postedBy: 'c0d4e5f6-a7b8-9012-cdef-345678901234',
    postedAt: '2025-01-15T10:30:00.000Z',
    brs: '4',
    congress: '1',
    bjp: '2',
    others: '0',
  },
  {
    id: 'apv-4',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Khairatabad',
    postedBy: 'e2f6a7b8-c9d0-1234-ef01-567890123456',
    postedAt: '2025-01-15T11:00:00.000Z',
    brs: '8',
    congress: '2',
    bjp: '1',
    others: '0',
  },
  {
    id: 'apv-5',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Shadnagar',
    postedBy: 'b5c9d0e1-f2a3-4567-1234-890123456789',
    postedAt: '2025-01-15T10:00:00.000Z',
    brs: '5',
    congress: '2',
    bjp: '1',
    others: '1',
  },
  {
    id: 'apv-6',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Chennur',
    postedBy: '54902a58-5a38-488c-b81b-90ec97c5b845',
    postedAt: '2025-01-15T12:00:00.000Z',
    brs: '12',
    congress: '5',
    bjp: '3',
    others: '2',
  },
  {
    id: 'apv-7',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Ramagundam',
    postedBy: 'd74589b7-d9eb-41b9-bb96-2f631bf4a360',
    postedAt: '2025-01-15T11:45:00.000Z',
    brs: '15',
    congress: '4',
    bjp: '2',
    others: '1',
  },
  {
    id: 'apv-8',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Siddipet',
    postedBy: '40b5bc7b-aa2b-4314-88e6-9ad936c5367c',
    postedAt: '2025-01-15T12:15:00.000Z',
    brs: '18',
    congress: '6',
    bjp: '4',
    others: '2',
  },
  {
    id: 'apv-9',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Bellampalli',
    postedBy: 'c0d4e5f6-a7b8-9012-cdef-345678901234',
    postedAt: '2025-01-15T11:15:00.000Z',
    brs: '10',
    congress: '7',
    bjp: '3',
    others: '2',
  },
  {
    id: 'apv-10',
    type: 'PARTY_PREFERENCE',
    assemblySegment: 'Gajwel',
    postedBy: '40b5bc7b-aa2b-4314-88e6-9ad936c5367c',
    postedAt: '2025-01-15T12:45:00.000Z',
    brs: '20',
    congress: '6',
    bjp: '2',
    others: '1',
  },
];

// Mock data - BRS Satisfaction views (aggregated by assembly segment)
const brsSatisfactionViews: AssemblyView[] = [
  {
    id: 'bsv-1',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Vemulawada',
    postedBy: '40b5bc7b-aa2b-4314-88e6-9ad936c5367c',
    postedAt: '2025-01-15T14:30:00.000Z',
    happy: '10',
    unhappy: '3',
  },
  {
    id: 'bsv-2',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Balkonda',
    postedBy: 'd74589b7-d9eb-41b9-bb96-2f631bf4a360',
    postedAt: '2025-01-15T13:30:00.000Z',
    happy: '8',
    unhappy: '2',
  },
  {
    id: 'bsv-3',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Makthal',
    postedBy: 'c0d4e5f6-a7b8-9012-cdef-345678901234',
    postedAt: '2025-01-15T13:00:00.000Z',
    happy: '5',
    unhappy: '1',
  },
  {
    id: 'bsv-4',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Khairatabad',
    postedBy: 'e2f6a7b8-c9d0-1234-ef01-567890123456',
    postedAt: '2025-01-15T13:30:00.000Z',
    happy: '12',
    unhappy: '2',
  },
  {
    id: 'bsv-5',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Shadnagar',
    postedBy: 'b5c9d0e1-f2a3-4567-1234-890123456789',
    postedAt: '2025-01-15T13:00:00.000Z',
    happy: '4',
    unhappy: '3',
  },
  {
    id: 'bsv-6',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Chennur',
    postedBy: '54902a58-5a38-488c-b81b-90ec97c5b845',
    postedAt: '2025-01-15T14:00:00.000Z',
    happy: '15',
    unhappy: '5',
  },
  {
    id: 'bsv-7',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Ramagundam',
    postedBy: 'd74589b7-d9eb-41b9-bb96-2f631bf4a360',
    postedAt: '2025-01-15T14:15:00.000Z',
    happy: '18',
    unhappy: '4',
  },
  {
    id: 'bsv-8',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Siddipet',
    postedBy: '40b5bc7b-aa2b-4314-88e6-9ad936c5367c',
    postedAt: '2025-01-15T14:30:00.000Z',
    happy: '22',
    unhappy: '6',
  },
  {
    id: 'bsv-9',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Bellampalli',
    postedBy: 'c0d4e5f6-a7b8-9012-cdef-345678901234',
    postedAt: '2025-01-15T13:45:00.000Z',
    happy: '12',
    unhappy: '8',
  },
  {
    id: 'bsv-10',
    type: 'BRS_SATISFACTION',
    assemblySegment: 'Gajwel',
    postedBy: '40b5bc7b-aa2b-4314-88e6-9ad936c5367c',
    postedAt: '2025-01-15T15:00:00.000Z',
    happy: '24',
    unhappy: '4',
  },
];

// Combine all views
export const mockAssemblyViews: AssemblyView[] = [
  ...partyPreferenceViews,
  ...brsSatisfactionViews,
];

// Helper functions
export const getPartyPreferenceViews = (
  assemblySegment?: string | null,
): AssemblyView[] => {
  let views = mockAssemblyViews.filter(v => v.type === 'PARTY_PREFERENCE');
  if (assemblySegment) {
    views = views.filter(v => v.assemblySegment === assemblySegment);
  }
  return views;
};

export const getBRSSatisfactionViews = (
  assemblySegment?: string | null,
): AssemblyView[] => {
  let views = mockAssemblyViews.filter(v => v.type === 'BRS_SATISFACTION');
  if (assemblySegment) {
    views = views.filter(v => v.assemblySegment === assemblySegment);
  }
  return views;
};

// Helper to get party distribution from user voting preferences
export const getPartyDistribution = (
  assemblySegment?: string | null,
): { party: string; count: number; percentage: number }[] => {
  // Filter users by assembly segment if specified
  let users = telanganaUsers.filter(
    (u: any) => u.isActive && u.status === 'Approved',
  );
  if (assemblySegment) {
    users = users.filter(
      (u: any) => u.assignedAreas?.assemblySegment === assemblySegment,
    );
  }

  // Count votes from user voting preferences
  let totalBRS = 0;
  let totalCongress = 0;
  let totalBJP = 0;
  let totalOthers = 0;

  users.forEach((user: any) => {
    const partyPreference = user.votingPreferences?.partyPreference;
    if (partyPreference === 'BRS') {
      totalBRS += 1;
    } else if (partyPreference === 'Congress') {
      totalCongress += 1;
    } else if (partyPreference === 'BJP') {
      totalBJP += 1;
    } else if (partyPreference === 'Others') {
      totalOthers += 1;
    }
  });

  // Fallback: Also check legacy mock_myassembly_view data for aggregated counts
  const views = getPartyPreferenceViews(assemblySegment);
  views.forEach(view => {
    if (view.brs) {
      totalBRS += parseInt(view.brs, 10) || 0;
    }
    if (view.congress) {
      totalCongress += parseInt(view.congress, 10) || 0;
    }
    if (view.bjp) {
      totalBJP += parseInt(view.bjp, 10) || 0;
    }
    if (view.others) {
      totalOthers += parseInt(view.others, 10) || 0;
    }
  });

  const total = totalBRS + totalCongress + totalBJP + totalOthers;

  return [
    {
      party: 'BRS',
      count: totalBRS,
      percentage: total > 0 ? Math.round((totalBRS / total) * 100) : 0,
    },
    {
      party: 'Congress',
      count: totalCongress,
      percentage: total > 0 ? Math.round((totalCongress / total) * 100) : 0,
    },
    {
      party: 'BJP',
      count: totalBJP,
      percentage: total > 0 ? Math.round((totalBJP / total) * 100) : 0,
    },
    {
      party: 'Others',
      count: totalOthers,
      percentage: total > 0 ? Math.round((totalOthers / total) * 100) : 0,
    },
  ];
};

// Helper to get BRS satisfaction percentage from user voting preferences
export const getBRSSatisfactionPercentage = (
  assemblySegment?: string | null,
): number => {
  // Filter users by assembly segment if specified
  let users = telanganaUsers.filter(
    (u: any) => u.isActive && u.status === 'Approved',
  );
  if (assemblySegment) {
    users = users.filter(
      (u: any) => u.assignedAreas?.assemblySegment === assemblySegment,
    );
  }

  // Count votes from user voting preferences
  let totalHappy = 0;
  let totalUnhappy = 0;

  users.forEach((user: any) => {
    const satisfaction = user.votingPreferences?.brsSatisfaction;
    if (satisfaction === 'Happy') {
      totalHappy += 1;
    } else if (satisfaction === 'Not Happy') {
      totalUnhappy += 1;
    }
  });

  // Fallback: Also check legacy mock_myassembly_view data for aggregated counts
  const views = getBRSSatisfactionViews(assemblySegment);
  views.forEach(view => {
    if (view.happy) {
      totalHappy += parseInt(view.happy, 10) || 0;
    }
    if (view.unhappy) {
      totalUnhappy += parseInt(view.unhappy, 10) || 0;
    }
  });

  const total = totalHappy + totalUnhappy;

  if (total === 0) return 0;

  return Math.round((totalHappy / total) * 100);
};
