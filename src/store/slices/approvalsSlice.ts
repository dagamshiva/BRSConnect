import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { approvalService } from "../../services/approvalService";
import { mapApprovalRequestFromApi } from "../../services/transformers";
import { USE_MOCK } from "../../config/env";
import type { ApprovalDecisionInput, ApprovalRequest } from "../../types";
import type { RootState } from "../index";

interface ApprovalsState {
  items: ApprovalRequest[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ApprovalsState = {
  items: [],
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchApprovals = createAsyncThunk<ApprovalRequest[]>(
  "approvals/fetchApprovals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await approvalService.fetchPending();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(mapApprovalRequestFromApi);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to load approval requests.",
      );
    }
  },
);

export const approveRequest = createAsyncThunk<ApprovalDecisionInput, ApprovalDecisionInput>(
  "approvals/approveRequest",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await approvalService.approve(payload);
      if (!USE_MOCK) {
        dispatch(fetchApprovals());
      }
      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to approve request.",
      );
    }
  },
);

export const rejectRequest = createAsyncThunk<ApprovalDecisionInput, ApprovalDecisionInput>(
  "approvals/rejectRequest",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await approvalService.reject(payload);
      if (!USE_MOCK) {
        dispatch(fetchApprovals());
      }
      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to reject request.",
      );
    }
  },
);

const approvalsSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approveRequest.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(rejectRequest.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectApprovals = (state: RootState) => state.approvals;

export default approvalsSlice.reducer;

