import React, { createContext, useContext, useMemo, useState } from "react";

export type LocalPollOption = {
  id: string;
  label: string;
  votes: number;
};

export type LocalPoll = {
  id: string;
  question: string;
  status: "Trending" | "Assembly";
  options: LocalPollOption[];
  likes: number;
  dislikes: number;
};

interface PollContextValue {
  polls: LocalPoll[];
  addPoll: (question: string, optionLabels: string[], status?: LocalPoll["status"]) => void;
  vote: (pollId: string, optionId: string, previousOptionId?: string) => void;
  forwardToTrending: (pollId: string) => void;
  updatePollReaction: (pollId: string, type: "like" | "dislike", increment: boolean) => void;
}

const PollsContext = createContext<PollContextValue | undefined>(undefined);

const initialPolls: LocalPoll[] = [
  {
    id: "p1",
    question: "Which initiative should Pink Car prioritize this week?",
    status: "Trending",
    options: [
      { id: "p1o1", label: "Skill camps", votes: 210 },
      { id: "p1o2", label: "Women safety patrols", votes: 156 },
      { id: "p1o3", label: "Health screenings", votes: 123 },
    ],
    likes: 245,
    dislikes: 12,
  },
  {
    id: "p2",
    question: "Do booth volunteers need weekend transport support?",
    status: "Assembly",
    options: [
      { id: "p2o1", label: "Yes, critical", votes: 188 },
      { id: "p2o2", label: "Manageable", votes: 62 },
    ],
    likes: 156,
    dislikes: 8,
  },
];

export const LocalPollsProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [polls, setPolls] = useState<LocalPoll[]>(initialPolls);

  const addPoll = (question: string, optionLabels: string[], status: LocalPoll["status"] = "Assembly") => {
    const sanitized = optionLabels.map((label) => label.trim()).filter(Boolean);
    if (!question.trim() || sanitized.length < 2) {
      return;
    }
    const id = `poll-${Date.now()}`;
    const options: LocalPollOption[] = sanitized.map((label, index) => ({
      id: `${id}-opt-${index}`,
      label,
      votes: 0,
    }));
    setPolls((prev) => [{ id, question: question.trim(), status, options, likes: 0, dislikes: 0 }, ...prev]);
  };

  const vote = (pollId: string, optionId: string, previousOptionId?: string) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        
        // If there was a previous vote, decrement it
        let updatedOptions = poll.options;
        if (previousOptionId && previousOptionId !== optionId) {
          updatedOptions = updatedOptions.map((option) =>
            option.id === previousOptionId ? { ...option, votes: Math.max(0, option.votes - 1) } : option,
          );
        }
        
        // Increment the new vote
        updatedOptions = updatedOptions.map((option) =>
          option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
        );
        
        return {
          ...poll,
          options: updatedOptions,
        };
      }),
    );
  };

  const forwardToTrending = (pollId: string) => {
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              status: "Trending",
            }
          : poll,
      ),
    );
  };

  const updatePollReaction = (pollId: string, type: "like" | "dislike", increment: boolean) => {
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              likes: type === "like" ? Math.max(0, poll.likes + (increment ? 1 : -1)) : poll.likes,
              dislikes: type === "dislike" ? Math.max(0, poll.dislikes + (increment ? 1 : -1)) : poll.dislikes,
            }
          : poll,
      ),
    );
  };

  const value = useMemo(() => ({ polls, addPoll, vote, forwardToTrending, updatePollReaction }), [polls]);

  return <PollsContext.Provider value={value}>{children}</PollsContext.Provider>;
};

export const useLocalPolls = (): PollContextValue => {
  const ctx = useContext(PollsContext);
  if (!ctx) {
    throw new Error("useLocalPolls must be used within LocalPollsProvider");
  }
  return ctx;
};


