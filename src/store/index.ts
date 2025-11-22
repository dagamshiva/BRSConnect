import { configureStore } from "@reduxjs/toolkit";

import approvalsReducer from "./slices/approvalsSlice";
import authReducer from "./slices/authSlice";
import fakeNewsReducer from "./slices/fakeNewsSlice";
import pollsReducer from "./slices/pollsSlice";
import postsReducer from "./slices/postsSlice";
import reportsReducer from "./slices/reportsSlice";
import segmentsReducer from "./slices/segmentsSlice";
import trendingReducer from "./slices/trendingSlice";
import userDetailRequestsReducer from "./slices/userDetailRequestsSlice";
import themeReducer from "./slices/themeSlice";
import { attachTokenInterceptor } from "../services/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    approvals: approvalsReducer,
    polls: pollsReducer,
    posts: postsReducer,
    reports: reportsReducer,
    segments: segmentsReducer,
    trending: trendingReducer,
    fakeNews: fakeNewsReducer,
    userDetailRequests: userDetailRequestsReducer,
    theme: themeReducer,
  },
});

attachTokenInterceptor(() => store.getState());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
