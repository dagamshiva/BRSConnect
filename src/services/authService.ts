import { USE_MOCK } from "../config/env";
import { mockAuthRecords, type MockAuthRecord } from "../mocks/mockAuth";
import type { User } from "../types";
import { api } from "./api";
import { mockResponse } from "./utils";

const dynamicRecords: MockAuthRecord[] = [...mockAuthRecords];
let activeToken: string | null = null;

const normalize = (value: string) =>
  value
    .toString()
    .trim()
    .replace(/[\s\-]/g, "")
    .toLowerCase();

const findRecordByIdentifier = (identifier: string) => {
  const normalized = normalize(identifier);
  return dynamicRecords.find((record) =>
    record.credentials.identifiers.some(
      (value) => normalize(value) === normalized,
    ),
  );
};

const createSession = (record: MockAuthRecord) => {
  activeToken = record.token;
  return mockResponse({
    token: record.token,
    user: record.user,
  });
};

const createUserFromRegistration = (payload: Record<string, unknown>): User => {
  const now = new Date();
  return {
    id: `user-${now.getTime()}`,
    name: String(payload.name ?? "New Member"),
    email: (payload.email as string | undefined) ?? null,
    mobile: (payload.mobile as string | undefined) ?? null,
    role: "Pending",
    status: "Pending",
    assignedAreas: {
      assemblySegment: String(payload.assemblySegment ?? "Pending Assignment"),
      village: (payload.village as string | undefined) ?? null,
      ward: (payload.ward as string | undefined) ?? null,
      booth: (payload.booth as string | undefined) ?? null,
    },
    approvedAt: null,
    approvedBy: null,
  };
};

const createRecordFromRegistration = (
  payload: Record<string, unknown>,
): MockAuthRecord => {
  const user = createUserFromRegistration(payload);
  const password = String(payload.password ?? "Welcome@123");
  const identifiers = [
    payload.email,
    payload.mobile,
    user.name,
    user.assignedAreas.assemblySegment,
  ]
    .filter(Boolean)
    .map((value) => String(value));

  return {
    user,
    credentials: {
      identifiers,
      password,
    },
    token: `mock-token-${user.id}`,
  };
};

const loginMock = async (credentials: {
  identifier: string;
  password: string;
}) => {
  const record = findRecordByIdentifier(credentials.identifier);

  if (!record || record.credentials.password !== credentials.password) {
    const message =
      "Invalid credentials. Please check your email/mobile and password.";
    return Promise.reject({ response: { data: { message } } });
  }

  return createSession(record);
};

const registerMock = async (data: Record<string, unknown>) => {
  const record = createRecordFromRegistration(data);
  dynamicRecords.push(record);
  return createSession(record);
};

const getCurrentUserMock = async () => {
  if (!activeToken) {
    return Promise.reject({
      response: { data: { message: "No active session found." } },
    });
  }

  const record = dynamicRecords.find((item) => item.token === activeToken);

  if (!record) {
    return Promise.reject({
      response: { data: { message: "Session expired. Please log in again." } },
    });
  }

  // Sync with telanganaUsers to get latest voting preferences
  // Import dynamically to avoid circular dependency
  const { telanganaUsers } = require('../../mocks/telangana_user');
  const updatedUser = telanganaUsers.find(u => u.id === record.user.id);
  if (updatedUser) {
    record.user = updatedUser; // Update the record with latest data
  }

  return mockResponse(record.user);
};

const sendOtpMock = async () =>
  mockResponse({ success: true, message: "OTP sent successfully." });

const verifyOtpMock = async () =>
  mockResponse({ success: true, token: "mock-otp-token" });

export const authService = {
  login: (credentials: { identifier: string; password: string }) =>
    USE_MOCK ? loginMock(credentials) : api.post("/auth/login", credentials),

  register: (data: Record<string, unknown>) =>
    USE_MOCK ? registerMock(data) : api.post("/auth/register", data),

  getCurrentUser: () =>
    USE_MOCK ? getCurrentUserMock() : api.get("/auth/me"),

  sendOTP: (mobile: string) =>
    USE_MOCK ? sendOtpMock() : api.post("/auth/otp/send", { mobile }),

  verifyOTP: (mobile: string, otp: string) =>
    USE_MOCK ? verifyOtpMock() : api.post("/auth/otp/verify", { mobile, otp }),
};

