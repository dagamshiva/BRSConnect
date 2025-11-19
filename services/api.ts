import axios from "axios";

import { API_URL } from "../config/env";
import type { RootState } from "../store";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const attachTokenInterceptor = (getState: () => RootState) => {
  api.interceptors.request.use((config) => {
    const state = getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
};

