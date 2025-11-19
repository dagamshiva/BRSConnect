import { api } from "./api";
import { USE_MOCK } from "../config/env";
import { mockPosts } from "../mocks/mockData";
import { mockResponse } from "./utils";
import type { CreatePostInput, Post } from "../types";

export const postService = {
  fetchPosts: () =>
    USE_MOCK ? mockResponse(mockPosts) : api.get("/posts"),
  createPost: (payload: CreatePostInput) => {
    if (USE_MOCK) {
      const newPost: Post = {
        id: `mock-post-${Date.now()}`,
        authorId: "mock-author",
        authorName: "Pink Car Admin",
        content: payload.content,
        mediaType: payload.mediaType,
        mediaUrl: payload.mediaUrl,
        areaScope: payload.areaScope,
        createdAt: new Date().toISOString(),
        trendingScore: 0,
        visibility: "ALL",
        comments: [],
      };
      return mockResponse(newPost);
    }

    return api.post("/posts", payload);
  },
  likePost: (postId: string) =>
    USE_MOCK
      ? mockResponse({ id: postId, action: "liked" })
      : api.post(`/posts/${postId}/like`),
  commentOnPost: (postId: string, content: string) =>
    USE_MOCK
      ? mockResponse({ id: postId, content })
      : api.post(`/posts/${postId}/comments`, { content }),
};

