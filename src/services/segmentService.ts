import { api } from "./api";
import { USE_MOCK } from "../config/env";
import { mockHighlightedSegment } from "../mocks/mockData";
import { mockResponse } from "./utils";

export const segmentService = {
  fetchHighlighted: () =>
    USE_MOCK
      ? mockResponse(mockHighlightedSegment)
      : api.get("/segments/highlighted"),
};

