import { api } from "./api";
import { USE_MOCK } from "../config/env";
import { mockReports } from "../mocks/mockData";
import { mockResponse } from "./utils";
import type { CreateReportInput, Report, UpdateReportStatusInput } from "../types";

export const reportService = {
  fetchReports: () =>
    USE_MOCK ? mockResponse(mockReports) : api.get("/reports"),
  createReport: (payload: CreateReportInput) => {
    if (USE_MOCK) {
      const newReport: Report = {
        id: `mock-report-${Date.now()}`,
        reporterId: "mock-reporter",
        reporterName: "Pink Car Member",
        title: payload.title,
        description: payload.description,
        attachments: payload.attachments ?? [],
        status: "New",
        areaScope: payload.areaScope,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedAdminId: null,
      };
      return mockResponse(newReport);
    }

    return api.post("/reports", payload);
  },
  updateStatus: (payload: UpdateReportStatusInput) =>
    USE_MOCK
      ? mockResponse(payload)
      : api.patch(`/reports/${payload.reportId}`, payload),
};

