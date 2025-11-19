import { User } from '../types';

/**
 * Service to handle membership registration
 * 
 * Note: In a real application, this would make an API call to save the user data.
 * Since we can't directly write to files in React Native, this service simulates
 * the registration process. In production, replace this with an actual API call.
 */

export interface MembershipRegistrationData {
  firstName: string;
  lastName: string;
  aliasName: string;
  email: string;
  mobile: string;
  assemblySegment: string;
  village: string;
  referralId: string;
}

/**
 * Register a new membership
 * 
 * In production, this would:
 * 1. Make an API POST request to /api/membership/register
 * 2. The backend would save the user to the database
 * 3. Return success/error response
 * 
 * For now, this simulates the registration and returns success.
 * The actual saving to telangana_user.ts would need to be done via backend API.
 */
export const registerMembership = async (
  data: MembershipRegistrationData,
): Promise<{ success: boolean; message: string; userId?: string }> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would be:
    // const response = await api.post('/api/membership/register', {
    //   ...data,
    //   mobile: `+91 ${data.mobile}`,
    // });
    // return response.data;

    // For demo purposes, return success
    // The backend would create the user with:
    // - role: 'Pending'
    // - status: 'Pending'
    // - isActive: false
    // - All other fields with default values
    // - The user would appear in the approval queue for admin/superadmin

    return {
      success: true,
      message:
        'Your membership registration has been submitted successfully. Your request is pending approval from the admin/superadmin for your segment.',
      userId: `user-${Date.now()}`,
    };
  } catch (error) {
    console.error('Membership registration error:', error);
    return {
      success: false,
      message: 'Failed to submit registration. Please try again.',
    };
  }
};

/**
 * Format user data for registration
 * This creates a User object with all required fields and defaults
 */
export const formatUserForRegistration = (
  data: MembershipRegistrationData,
): Omit<User, 'id'> => {
  const now = new Date().toISOString();
  
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    aliasName: data.aliasName.trim(),
    name: `${data.firstName.trim()} ${data.lastName.trim()}`,
    email: data.email.trim(),
    mobile: `+91 ${data.mobile}`,
    role: 'Pending',
    status: 'Pending',
    designation: null,
    referralId: data.referralId.trim(),
    assignedAreas: {
      assemblySegment: data.assemblySegment,
      village: data.village.trim(),
      ward: null,
      booth: null,
    },
    villageName: data.village.trim(),
    isActive: false, // Inactive until approved
    createdBy: null,
    createdDate: now,
    modifiedBy: null,
    modifiedDate: now,
    points: 0,
    approvedBy: null,
    approvedAt: null,
  };
};

