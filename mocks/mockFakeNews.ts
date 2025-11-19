import { FakeNewsPost } from "../types";

export const mockFakeNewsPosts: FakeNewsPost[] = [
  {
    id: "fake-1",
    title: "Pink Car campaign funds allegedly diverted",
    description:
      "A false rumor claiming campaign funds were diverted to personal accounts. Verified and debunked by finance team.",
    mediaType: "image",
    mediaUrl: "https://pinkcarmovement.in/media/debunk/funds",
    likes: 420,
    dislikes: 32,
    postedBy: "Rival Propaganda Handle",
    publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: "fake-2",
    title: "Pink Car leader hospitalized after rally clash",
    description:
      "Viral fake news reporting injuries to the Pink Car leader. Leader appeared live to dismiss claims.",
    mediaType: "video",
    mediaUrl: "https://pinkcarmovement.in/media/debunk/leader",
    likes: 680,
    dislikes: 44,
    postedBy: "Unknown Source",
    publishedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    id: "fake-3",
    title: "Pink Car manifesto excludes rural welfare",
    description:
      "A misinterpreted clip suggested rural welfare was excluded. Full manifesto confirms major rural initiatives.",
    mediaType: "tweet",
    mediaUrl: "https://pinkcarmovement.in/media/debunk/manifesto",
    likes: 352,
    dislikes: 27,
    postedBy: "Anonymous Blog",
    publishedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

