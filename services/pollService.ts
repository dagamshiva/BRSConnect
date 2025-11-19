import { api } from "./api";
import { USE_MOCK } from "../config/env";
import { mockPolls } from "../mocks/mockData";
import { mockResponse } from "./utils";
import type { CreatePollInput, Poll, VotePollInput } from "../types";

export const pollService = {
  fetchPolls: () =>
    USE_MOCK ? mockResponse(mockPolls) : api.get("/polls"),
  createPoll: (payload: CreatePollInput) => {
    if (USE_MOCK) {
      const newPoll: Poll = {
        id: `mock-poll-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        type: payload.type,
        visibility: payload.visibility,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        areaScope: payload.areaScope,
        createdBy: "Mock Admin",
        totalResponses: 0,
        options: payload.options.map((option, index) => ({
          id: `opt-${index}`,
          label: option.label,
          votes: 0,
        })),
      };
      return mockResponse(newPoll);
    }

    return api.post("/polls", payload);
  },
  votePoll: (payload: VotePollInput) =>
    USE_MOCK
      ? mockResponse(payload)
      : api.post(`/polls/${payload.pollId}/vote`, { optionId: payload.optionId }),
};

