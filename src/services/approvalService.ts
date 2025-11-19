import { api } from "./api";
import { USE_MOCK } from "../config/env";
import { mockApprovalRequests } from "../mocks/mockData";
import { mockResponse } from "./utils";
import type { ApprovalDecisionInput } from "../types";

export const approvalService = {
  fetchPending: () =>
    USE_MOCK
      ? mockResponse(mockApprovalRequests)
      : api.get("/admin/approvals/pending"),
  approve: (payload: ApprovalDecisionInput) =>
    USE_MOCK
      ? mockResponse({ id: payload.id, action: "approved" })
      : api.post(`/admin/approvals/${payload.id}/approve`, payload),
  reject: (payload: ApprovalDecisionInput) =>
    USE_MOCK
      ? mockResponse({ id: payload.id, action: "rejected", reason: payload.reason })
      : api.post(`/admin/approvals/${payload.id}/reject`, payload),
};

