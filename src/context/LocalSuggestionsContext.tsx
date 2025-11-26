import React, { createContext, useContext, useMemo, useState } from "react";

export type LocalSuggestion = {
  id: string;
  title: string;
  summary: string;
  likes: number;
  comments: number;
};

interface SuggestionsContextValue {
  suggestions: LocalSuggestion[];
  addSuggestion: (title: string, summary: string) => void;
  likeSuggestion: (suggestionId: string) => void;
  addComment: (suggestionId: string) => void;
}

const SuggestionsContext = createContext<SuggestionsContextValue | undefined>(undefined);

const initialSuggestions: LocalSuggestion[] = [
  {
    id: "s1",
    title: "Build cadre, groom BRS party leaders",
    summary: "Focus on building strong cadre with combination of traditional leaders + young leaders for sustainable party growth.",
    likes: 850,
    comments: 72,
  },
  {
    id: "s2",
    title: "Don't depend much on any vote bank",
    summary: "Diversify support base and avoid over-reliance on any single vote bank for long-term political stability.",
    likes: 780,
    comments: 65,
  },
  {
    id: "s3",
    title: "Keep MIM away forever",
    summary: "Maintain strategic distance from MIM to preserve party's independent identity and voter base.",
    likes: 920,
    comments: 88,
  },
  {
    id: "s4",
    title: "KCR should come out occasionally and be on ground from 2027",
    summary: "KCR should make regular public appearances and actively engage on ground from 2027 to connect with voters directly.",
    likes: 950,
    comments: 95,
  },
  {
    id: "s5",
    title: "Be silent, don't respond too much on public issues",
    summary: "Let INC make mistakes. Timepass protests enough until 2027. Focus on strategic silence rather than reactive responses.",
    likes: 720,
    comments: 58,
  },
  {
    id: "s6",
    title: "Regular visits to constituencies",
    summary: "Regular visits to constituencies are essential. Sitting in Hyderabad or Telangana or meetings in bhavan will not help in anyway.",
    likes: 880,
    comments: 76,
  },
  {
    id: "s7",
    title: "Padayatra or any other yatra from 2027",
    summary: "Plan and execute padayatra or other yatras from 2027 to build momentum and connect with grassroots voters.",
    likes: 810,
    comments: 68,
  },
  {
    id: "s8",
    title: "Random meets with random constituency cadre",
    summary: "Engage directly with random constituency cadre (not just leaders) to understand ground reality and build trust.",
    likes: 760,
    comments: 62,
  },
  {
    id: "s9",
    title: "Appoint cadre fav as leader not your fav",
    summary: "Prioritize cadre preferences when appointing leaders rather than personal favorites to ensure better acceptance and effectiveness.",
    likes: 890,
    comments: 82,
  },
  {
    id: "s10",
    title: "Booth level committees - quality over quantity",
    summary: "Focus on quality booth level committees. 100% committees not needed, but 70% committees working effectively is better than timepass committees.",
    likes: 840,
    comments: 71,
  },
  {
    id: "s11",
    title: "Give free hand to Harish Rao in North Telangana",
    summary: "Provide complete autonomy to Harish Rao in North Telangana region for better regional management and development.",
    likes: 870,
    comments: 79,
  },
  {
    id: "s12",
    title: "KTR should take care of Warangal",
    summary: "KTR should focus on Warangal constituency management and development to strengthen party presence in the region.",
    likes: 830,
    comments: 74,
  },
  {
    id: "s13",
    title: "Agenda - one last chance to KCR",
    summary: "This is a critical juncture. Strategic decisions and actions needed to regain momentum and voter confidence.",
    likes: 960,
    comments: 98,
  },
  {
    id: "s14",
    title: "Be soft on BJP, attack only politically",
    summary: "Adopt soft stance on BJP regarding religious matters. Attack them only on political issues, not on religion politics.",
    likes: 740,
    comments: 61,
  },
  {
    id: "s15",
    title: "Design schemes for women voters",
    summary: "Women voters are slowly moving towards BRS. Design dedicated schemes for them. It's okay if we lose few thousand crores from state revenue. Also design schemes for DWAKRA groups if possible.",
    likes: 910,
    comments: 85,
  },
  {
    id: "s16",
    title: "Promise local employment to youth",
    summary: "Youth are ready to vote BRS. Promise local employment opportunities by bringing investments to their own places other than Hyderabad.",
    likes: 900,
    comments: 87,
  },
  {
    id: "s17",
    title: "Make clear message to public",
    summary: "Make it clear to public: Vote for us in assembly (assembly la mak veyandi) and vote for whomever you like in Lok Sabha (lok sabha la meeku ishtam ochinollaki veskondi).",
    likes: 820,
    comments: 70,
  },
  {
    id: "s18",
    title: "Regular surveys, booth level surveys",
    summary: "Conduct regular surveys and booth level surveys. Dedicated survey with 100% genuine feedback even if it's negative on us for accurate assessment.",
    likes: 860,
    comments: 75,
  },
  {
    id: "s19",
    title: "Create buzz before elections",
    summary: "Generate pre-election excitement by highlighting internal competition for BRS tickets. Show that 3-4 people are vying for tickets in each constituency.",
    likes: 790,
    comments: 66,
  },
  {
    id: "s20",
    title: "Improve local sanitation facilities",
    summary: "We need more public restrooms and waste management in the main market area.",
    likes: 620,
    comments: 45,
  },
  {
    id: "s21",
    title: "More public transport options",
    summary: "Request for additional bus routes connecting residential areas to the city center.",
    likes: 480,
    comments: 32,
  },
  {
    id: "s22",
    title: "Community health camp organization",
    summary: "Organize monthly health checkup camps in different wards for better accessibility.",
    likes: 750,
    comments: 58,
  },
  {
    id: "s23",
    title: "Street lighting improvements",
    summary: "Install LED street lights in poorly lit areas to improve safety at night.",
    likes: 320,
    comments: 21,
  },
];

export const LocalSuggestionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [suggestions, setSuggestions] = useState<LocalSuggestion[]>(initialSuggestions);

  const addSuggestion = (title: string, summary: string) => {
    const trimmedTitle = title.trim();
    const trimmedSummary = summary.trim();
    if (!trimmedTitle || !trimmedSummary) {
      return;
    }
    const id = `suggestion-${Date.now()}`;
    setSuggestions((prev) => [
      { id, title: trimmedTitle, summary: trimmedSummary, likes: 0, comments: 0 },
      ...prev,
    ]);
  };

  const likeSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion.id === suggestionId
          ? { ...suggestion, likes: suggestion.likes + 1 }
          : suggestion,
      ),
    );
  };

  const addComment = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion.id === suggestionId
          ? { ...suggestion, comments: suggestion.comments + 1 }
          : suggestion,
      ),
    );
  };

  const value = useMemo(() => ({ suggestions, addSuggestion, likeSuggestion, addComment }), [suggestions]);

  return <SuggestionsContext.Provider value={value}>{children}</SuggestionsContext.Provider>;
};

export const useLocalSuggestions = (): SuggestionsContextValue => {
  const ctx = useContext(SuggestionsContext);
  if (!ctx) {
    throw new Error("useLocalSuggestions must be used within LocalSuggestionsProvider");
  }
  return ctx;
};

