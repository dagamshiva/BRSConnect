/**
 * Configuration for recipient roles within assembly segments
 * 
 * This file allows easy addition or removal of recipient roles
 * for the "Send Message to Segment Admins" feature.
 * 
 * Roles will be matched based on user designation or role within
 * the same assembly segment.
 */

export interface RecipientRole {
  id: string;
  label: string;
  // Optional: Add matching criteria (designation keywords, role types, etc.)
  matchDesignation?: string[]; // Array of designation keywords to match
  matchRoles?: string[]; // Array of role types to match (e.g., "LocalAdmin", "SuperAdmin")
}

/**
 * List of recipient roles that can receive messages within an assembly segment
 * 
 * To add a new role: Add a new object to the array with unique id and label
 * To remove a role: Simply delete the corresponding object
 */
export const SEGMENT_RECIPIENT_ROLES: RecipientRole[] = [
  {
    id: 'admins',
    label: 'Admins',
    matchRoles: ['LocalAdmin', 'SuperAdmin'],
  },
  {
    id: 'constituency-incharge',
    label: 'Constituency Incharge',
    matchDesignation: ['Constituency Incharge', 'Constituency In-Charge'],
  },
  {
    id: 'assembly-coordinator',
    label: 'Assembly Coordinator',
    matchDesignation: ['Assembly Coordinator'],
  },
  {
    id: 'parliament-coordinator',
    label: 'Parliament Coordinator',
    matchDesignation: ['Parliament Coordinator'],
  },
];

/**
 * Get all recipient role labels as an array (for UI display)
 */
export const getRecipientRoleLabels = (): string[] => {
  return SEGMENT_RECIPIENT_ROLES.map(role => role.label);
};

/**
 * Get recipient role by ID
 */
export const getRecipientRoleById = (id: string): RecipientRole | undefined => {
  return SEGMENT_RECIPIENT_ROLES.find(role => role.id === id);
};

