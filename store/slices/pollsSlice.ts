import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { pollService } from "../../services/pollService";
import { mapPollFromApi } from "../../services/transformers";
import type { CreatePollInput, Poll, VotePollInput } from "../../types";
import type { RootState } from "../index";

interface PollsState {
  items: Poll[];
  loading: boolean;
  creating: boolean;
  voting: boolean;
  error: string | null;
}

const initialState: PollsState = {
  items: [],
  loading: false,
  creating: false,
  voting: false,
  error: null,
};

export const fetchPolls = createAsyncThunk<Poll[]>(
  "polls/fetchPolls",
  async (_, { rejectWithValue }) => {
    try {
      const response = await pollService.fetchPolls();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(mapPollFromApi);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to load Pink Car polls.",
      );
    }
  },
);

export const createPoll = createAsyncThunk<Poll, CreatePollInput>(
  "polls/createPoll",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await pollService.createPoll(payload);
      return mapPollFromApi(response.data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to create poll.",
      );
    }
  },
);

export const voteOnPoll = createAsyncThunk<VotePollInput, VotePollInput>(
  "polls/voteOnPoll",
  async (payload, { rejectWithValue }) => {
    try {
      await pollService.votePoll(payload);
      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? "Unable to record vote.",
      );
    }
  },
);

const pollsSlice = createSlice({
  name: "polls",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPoll.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      .addCase(voteOnPoll.pending, (state) => {
        state.voting = true;
        state.error = null;
      })
      .addCase(voteOnPoll.fulfilled, (state, action) => {
        state.voting = false;
        state.items = state.items.map((poll) => {
          if (poll.id !== action.payload.pollId) {
            return poll;
          }
          return {
            ...poll,
            totalResponses: poll.totalResponses + 1,
            options: poll.options.map((option) =>
              option.id === action.payload.optionId
                ? { ...option, votes: option.votes + 1 }
                : option,
            ),
          };
        });
      })
      .addCase(voteOnPoll.rejected, (state, action) => {
        state.voting = false;
        state.error = action.payload as string;
      });
  },
});

export const selectPolls = (state: RootState) => state.polls;

export default pollsSlice.reducer;

