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
    title: "Improve local sanitation facilities",
    summary: "We need more public restrooms and waste management in the main market area.",
    likes: 620,
    comments: 45,
  },
  {
    id: "s2",
    title: "More public transport options",
    summary: "Request for additional bus routes connecting residential areas to the city center.",
    likes: 480,
    comments: 32,
  },
  {
    id: "s3",
    title: "Community health camp organization",
    summary: "Organize monthly health checkup camps in different wards for better accessibility.",
    likes: 750,
    comments: 58,
  },
  {
    id: "s4",
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

