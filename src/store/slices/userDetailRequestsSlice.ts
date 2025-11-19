import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface UserDetailRequest {
  id: string;
  userId: string;
  userAlias: string;
  userName: string; // Full name (firstname + lastname)
  firstName: string;
  lastName: string;
  email?: string;
  mobile?: string;
  assemblySegment: string;
  village?: string;
  ward?: string;
  booth?: string;
  address?: string;
  designation?: string;
  role: string;
  requestedBy: string;
  requestedById: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  postsCount?: number;
  points?: number;
}

interface UserDetailRequestsState {
  requests: UserDetailRequest[];
}

const initialState: UserDetailRequestsState = {
  requests: [],
};

const userDetailRequestsSlice = createSlice({
  name: 'userDetailRequests',
  initialState,
  reducers: {
    addRequest: (state, action: PayloadAction<UserDetailRequest>) => {
      state.requests.unshift(action.payload);
    },
    updateRequestStatus: (
      state,
      action: PayloadAction<{ id: string; status: 'Approved' | 'Rejected' }>,
    ) => {
      const request = state.requests.find(r => r.id === action.payload.id);
      if (request) {
        request.status = action.payload.status;
      }
    },
    removeRequest: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter(r => r.id !== action.payload);
    },
    clearRequests: state => {
      state.requests = [];
    },
  },
});

export const {
  addRequest,
  updateRequestStatus,
  removeRequest,
  clearRequests,
} = userDetailRequestsSlice.actions;

export const selectUserDetailRequests = (state: RootState) =>
  state.userDetailRequests.requests;

export const selectPendingUserDetailRequests = (state: RootState) =>
  state.userDetailRequests.requests.filter(r => r.status === 'Pending');

export default userDetailRequestsSlice.reducer;

