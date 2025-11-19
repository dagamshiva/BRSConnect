import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { reportService } from "../../services/reportService";
import { mapReportFromApi } from "../../services/transformers";
import { USE_MOCK } from "../../config/env";
import type { CreateReportInput, Report, UpdateReportStatusInput } from "../../types";
import type { RootState } from "../index";

interface ReportsState {
  items: Report[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  items: [],
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const fetchReports = createAsyncThunk<Report[]>(
  "reports/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.fetchReports();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(mapReportFromApi);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to load reports.",
      );
    }
  },
);

export const createReport = createAsyncThunk<Report, CreateReportInput>(
  "reports/createReport",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await reportService.createReport(payload);
      const mapped = mapReportFromApi(response.data);
      if (!USE_MOCK) {
        dispatch(fetchReports());
      }
      return mapped;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to log report.",
      );
    }
  },
);

export const updateReportStatus = createAsyncThunk<UpdateReportStatusInput, UpdateReportStatusInput>(
  "reports/updateReportStatus",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await reportService.updateStatus(payload);
      if (!USE_MOCK) {
        dispatch(fetchReports());
      }
      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to update report status.",
      );
    }
  },
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createReport.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createReport.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      .addCase(updateReportStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateReportStatus.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const selectReports = (state: RootState) => state.reports;

export default reportsSlice.reducer;

