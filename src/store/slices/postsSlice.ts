import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { postService } from "../../services/postService";
import { mapPostFromApi } from "../../services/transformers";
import type { CreatePostInput, Post } from "../../types";
import type { RootState } from "../index";

interface PostsState {
  items: Post[];
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  loading: false,
  creating: false,
  error: null,
};

export const fetchPosts = createAsyncThunk<Post[]>(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postService.fetchPosts();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(mapPostFromApi);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to load community posts.",
      );
    }
  },
);

export const createPost = createAsyncThunk<Post, CreatePostInput>(
  "posts/createPost",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await postService.createPost(payload);
      return mapPostFromApi(response.data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to publish post.",
      );
    }
  },
);

export const likePost = createAsyncThunk<string, string>(
  "posts/likePost",
  async (postId, { rejectWithValue }) => {
    try {
      await postService.likePost(postId);
      return postId;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to like post.",
      );
    }
  },
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPost.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.items.find((item) => item.id === action.payload);
        if (post) {
          post.trendingScore += 1;
        }
      });
  },
});

export const selectPosts = (state: RootState) => state.posts;

export default postsSlice.reducer;

