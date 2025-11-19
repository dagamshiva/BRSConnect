import { api } from "./api";
import { USE_MOCK } from "../config/env";
import { mockTrendingMedia } from "../mocks/mockData";
import { mockResponse } from "./utils";

export const trendingService = {
  fetchTrending: () =>
    USE_MOCK ? mockResponse(mockTrendingMedia) : api.get("/trending"),
};

