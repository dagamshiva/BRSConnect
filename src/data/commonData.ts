// Common static data and constants used across screens

// Category options for feed filtering
export const CATEGORY_OPTIONS = ['News', 'Videos', 'Polls', 'Fake News', 'Suggestions'] as const;
export type Category = typeof CATEGORY_OPTIONS[number];

// Type mapping for mock feed items to categories
export const TYPE_TO_CATEGORY_MAP: Record<string, Category> = {
  NEWS: 'News',
  VIDEO: 'Videos',
  POLL: 'Polls',
  FAKE_NEWS: 'Fake News',
  SUGGESTION: 'Suggestions',
};

// Summary prefixes by type
export const SUMMARY_PREFIX_BY_TYPE: Record<string, string> = {
  NEWS: 'Field update from',
  VIDEO: 'Campaign highlight from',
  POLL: 'Pulse check captured across',
  FAKE_NEWS: 'Fact-check alert for',
  SUGGESTION: 'Ground suggestion raised in',
};

// Image thumbnails for different content types
export const IMAGE_THUMBNAILS = [
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
  'https://images.unsplash.com/photo-1478479405421-ce83c92fb3e1',
  'https://images.unsplash.com/photo-1542219550-37153d387c33',
  'https://images.unsplash.com/photo-1526662092594-e98c1e356d6a',
];

export const VIDEO_THUMBNAILS = [
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
];

export const SUGGESTION_THUMBNAILS = [
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
  'https://images.unsplash.com/photo-1500534314210-3a84de2e8fd5',
];

// Fallback images for fake news
export const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
  'https://images.unsplash.com/photo-1478479405421-ce83c92fb3e1',
];

// Report status filters
export const REPORT_STATUS_FILTERS = [
  { key: 'All' as const, label: 'All' },
  { key: 'PENDING' as const, label: 'Pending' },
  { key: 'IN_PROGRESS' as const, label: 'In Progress' },
  { key: 'RESOLVED' as const, label: 'Resolved' },
  { key: 'REJECTED' as const, label: 'Rejected' },
];

// Utility functions
export const randomElement = <T,>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Format time ago (e.g., "2h ago", "3d ago")
export const formatTimeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
};

// Format date as "dd/mm/yyyy hh:MM" (24-hour format)
export const formatPostedAt = (dateString: string | undefined | null): string => {
  if (!dateString || dateString.trim() === '') {
    return 'Date not available';
  }
  try {
    const trimmed = dateString.trim();
    let date: Date;
    
    if (trimmed.includes('T')) {
      date = new Date(trimmed);
    } else if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
      date = new Date(trimmed);
    } else {
      date = new Date(trimmed);
    }

    if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
      return trimmed.length > 20 ? trimmed.substring(0, 20) + '...' : trimmed;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    const safeString = dateString || 'Invalid date';
    return safeString.length > 20 ? safeString.substring(0, 20) + '...' : safeString;
  }
};

// Format reported date (same as formatPostedAt but with different name for clarity)
export const formatReportedAt = formatPostedAt;

