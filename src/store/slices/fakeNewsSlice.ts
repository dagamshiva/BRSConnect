import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fakeNewsService } from "../../services/fakeNewsService";
import { mapFakeNewsFromApi } from "../../services/transformers";
import type { FakeNewsPost } from "../../types";
import type { RootState } from "../index";

interface FakeNewsState {
  items: FakeNewsPost[];
  loading: boolean;
  voting: boolean;
  error: string | null;
}

const initialState: FakeNewsState = {
  items: [],
  loading: false,
  voting: false,
  error: null,
};

export const fetchFakeNews = createAsyncThunk<FakeNewsPost[]>(
  "fakeNews/fetchFakeNews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fakeNewsService.fetchFakeNews();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(mapFakeNewsFromApi);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to load fake news reports.",
      );
    }
  },
);

export const voteFakeNews = createAsyncThunk<{ id: string; action: "like" | "dislike" }, { id: string; action: "like" | "dislike" }>(
  "fakeNews/voteFakeNews",
  async ({ id, action }, { rejectWithValue }) => {
    try {
      await fakeNewsService.voteFakeNews(id, action);
      return { id, action };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to record reaction.",
      );
    }
  },
);

const fakeNewsSlice = createSlice({
  name: "fakeNews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFakeNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFakeNews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFakeNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(voteFakeNews.pending, (state) => {
        state.voting = true;
        state.error = null;
      })
      .addCase(voteFakeNews.fulfilled, (state, action) => {
        state.voting = false;
        state.items = state.items.map((item) => {
          if (item.id !== action.payload.id) {
            return item;
          }
          return action.payload.action === "like"
            ? { ...item, likes: item.likes + 1 }
            : { ...item, dislikes: item.dislikes + 1 };
        });
      })
      .addCase(voteFakeNews.rejected, (state, action) => {
        state.voting = false;
        state.error = action.payload as string;
      });
  },
});

export const selectFakeNews = (state: RootState) => state.fakeNews;

export default fakeNewsSlice.reducer;

