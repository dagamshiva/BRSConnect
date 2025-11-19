import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { segmentService } from "../../services/segmentService";
import type { HighlightedSegment } from "../../types";
import type { RootState } from "../index";

interface SegmentsState {
  highlighted: HighlightedSegment | null;
  loading: boolean;
  error: string | null;
}

const initialState: SegmentsState = {
  highlighted: null,
  loading: false,
  error: null,
};

export const fetchHighlightedSegment = createAsyncThunk<HighlightedSegment>(
  "segments/fetchHighlighted",
  async (_, { rejectWithValue }) => {
    try {
      const response = await segmentService.fetchHighlighted();
      return response.data as HighlightedSegment;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to load highlighted segment.",
      );
    }
  },
);

const segmentsSlice = createSlice({
  name: "segments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHighlightedSegment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHighlightedSegment.fulfilled, (state, action) => {
        state.loading = false;
        state.highlighted = action.payload;
      })
      .addCase(fetchHighlightedSegment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectHighlightedSegment = (state: RootState) =>
  state.segments.highlighted;

export const selectSegmentsLoading = (state: RootState) => state.segments.loading;

export default segmentsSlice.reducer;

