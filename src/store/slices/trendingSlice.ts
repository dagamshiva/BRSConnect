import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { trendingService } from "../../services/trendingService";
import { mapTrendingMediaFromApi } from "../../services/transformers";
import type { TrendingMedia } from "../../types";
import type { RootState } from "../index";

interface TrendingState {
  items: TrendingMedia[];
  loading: boolean;
  error: string | null;
}

const initialState: TrendingState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTrendingMedia = createAsyncThunk<TrendingMedia[]>(
  "trending/fetchTrendingMedia",
  async (_, { rejectWithValue }) => {
    try {
      const response = await trendingService.fetchTrending();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(mapTrendingMediaFromApi);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to load trending media.",
      );
    }
  },
);

const trendingSlice = createSlice({
  name: "trending",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrendingMedia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTrendingMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectTrendingMedia = (state: RootState) => state.trending;

export default trendingSlice.reducer;

