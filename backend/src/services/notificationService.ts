export const notificationService = {
  sendApprovalNotification: async (userId: string) => {
    console.log(`Notify user ${userId} about approval (mock)`);
  },
  sendRejectionNotification: async (userId: string, reason?: string) => {
    console.log(`Notify user ${userId} about rejection: ${reason ?? "No reason"}`);
  },
};

