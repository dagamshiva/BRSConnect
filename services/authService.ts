import { api } from "./api";

export const authService = {
  login: (credentials: { identifier: string; password: string }) =>
    api.post("/auth/login", credentials),

  register: (data: Record<string, unknown>) => api.post("/auth/register", data),

  getCurrentUser: () => api.get("/auth/me"),

  sendOTP: (mobile: string) => api.post("/auth/otp/send", { mobile }),

  verifyOTP: (mobile: string, otp: string) =>
    api.post("/auth/otp/verify", { mobile, otp }),
};

