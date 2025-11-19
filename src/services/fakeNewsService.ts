import { api } from "./api";
import { USE_MOCK } from "../config/env";
import { mockFakeNewsPosts } from "../mocks/mockFakeNews";
import { mockResponse } from "./utils";

export const fakeNewsService = {
  fetchFakeNews: () =>
    USE_MOCK ? mockResponse(mockFakeNewsPosts) : api.get("/fake-news"),
  voteFakeNews: (postId: string, action: "like" | "dislike") =>
    USE_MOCK
      ? mockResponse({ id: postId, action })
      : api.post(`/fake-news/${postId}/vote`, { action }),
};

