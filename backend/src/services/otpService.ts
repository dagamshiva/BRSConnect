export const otpService = {
  sendOTP: async (mobile: string) => {
    console.log(`Sending OTP to ${mobile} (mock)`);
    return { success: true };
  },
  verifyOTP: async (_mobile: string, _otp: string) => {
    console.log("Verifying OTP (mock)");
    return { success: true };
  },
};

