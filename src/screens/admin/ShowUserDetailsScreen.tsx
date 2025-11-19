import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectAuth } from '../../store/slices/authSlice';
import {
  addRequest,
  selectUserDetailRequests,
} from '../../store/slices/userDetailRequestsSlice';

interface User {
  id: string;
  aliasName: string;
  name: string;
  email?: string;
  mobile?: string;
  role: 'SuperAdmin' | 'LocalAdmin' | 'Member';
  assemblySegment: string;
  village?: string;
  ward?: string;
  booth?: string;
  address?: string;
  designation?: string;
  createdAt: string;
}

interface AccessRequest {
  id: string;
  userId: string;
  requestedBy: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  userAlias: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: 'u1',
    aliasName: 'Booth Captain',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    mobile: '+91 98765 43210',
    role: 'Member',
    assemblySegment: 'Hyderabad Central',
    village: 'Banjara Hills',
    ward: 'Ward 12',
    booth: 'Booth 42',
    address: '123 Main Street, Banjara Hills',
    designation: 'Booth Coordinator',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u2',
    aliasName: 'Volunteer Leader',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    mobile: '+91 91234 56789',
    role: 'Member',
    assemblySegment: 'Hyderabad Central',
    village: 'Jubilee Hills',
    ward: 'Ward 8',
    designation: 'Community Organizer',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u3',
    aliasName: 'Field Officer',
    name: 'Amit Patel',
    mobile: '+91 98765 12345',
    role: 'LocalAdmin',
    assemblySegment: 'Hyderabad Central',
    address: '456 Park Avenue',
    createdAt: new Date().toISOString(),
  },
];

const UserDetailsCard = ({ user }: { user: User }) => (
  <View style={styles.detailsCard}>
    <View style={styles.detailsHeader}>
      <MaterialIcons name="person" size={24} color={colors.primary} />
      <Text style={styles.detailsTitle}>User Details</Text>
    </View>

    <View style={styles.divider} />

    <View style={styles.detailsSection}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Alias Name</Text>
        <Text style={styles.detailValue}>{user.aliasName}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Real Name</Text>
        <Text style={styles.detailValue}>{user.name}</Text>
      </View>
      {user.designation && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Designation</Text>
          <Text style={styles.detailValue}>{user.designation}</Text>
        </View>
      )}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Role</Text>
        <Text style={styles.detailValue}>{user.role}</Text>
      </View>
      {user.email && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{user.email}</Text>
        </View>
      )}
      {user.mobile && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mobile</Text>
          <Text style={styles.detailValue}>{user.mobile}</Text>
        </View>
      )}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Assembly Segment</Text>
        <Text style={styles.detailValue}>{user.assemblySegment}</Text>
      </View>
      {user.village && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Village</Text>
          <Text style={styles.detailValue}>{user.village}</Text>
        </View>
      )}
      {user.ward && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ward</Text>
          <Text style={styles.detailValue}>{user.ward}</Text>
        </View>
      )}
      {user.booth && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Booth</Text>
          <Text style={styles.detailValue}>{user.booth}</Text>
        </View>
      )}
      {user.address && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address</Text>
          <Text style={styles.detailValue}>{user.address}</Text>
        </View>
      )}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Joined</Text>
        <Text style={styles.detailValue}>
          {new Date(user.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  </View>
);

const AccessRequestCard = ({
  request,
  onApprove,
  onReject,
  loading,
}: {
  request: AccessRequest;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) => (
  <View style={styles.requestCard}>
    <View style={styles.requestHeader}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestAlias}>{request.userAlias}</Text>
        <Text style={styles.requestMeta}>
          Requested by {request.requestedBy} •{' '}
          {new Date(request.requestedAt).toLocaleDateString()}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          request.status === 'Pending'
            ? styles.statusPending
            : request.status === 'Approved'
            ? styles.statusApproved
            : styles.statusRejected,
        ]}
      >
        <Text style={styles.statusText}>{request.status}</Text>
      </View>
    </View>
    {request.status === 'Pending' && (
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={onApprove}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} size="small" />
          ) : (
            <>
              <MaterialIcons
                name="check"
                size={18}
                color={colors.textPrimary}
              />
              <Text style={styles.approveText}>Grant Access</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={onReject}
          disabled={loading}
        >
          <MaterialIcons name="close" size={18} color={colors.danger} />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

export const ShowUserDetailsScreen = (): React.ReactElement => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const userDetailRequests = useAppSelector(selectUserDetailRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [showRequests, setShowRequests] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const term = searchQuery.toLowerCase();
    return mockUsers.filter(
      user =>
        user.aliasName.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term),
    );
  }, [searchQuery]);

  const handleUserSelect = (user: User) => {
    setSearchQuery(user.aliasName);
    setSelectedUser(user);
    // Check if there's an approved request for this user in Redux store
    const approvedRequest = userDetailRequests.find(
      req => req.userId === user.id && req.status === 'Approved',
    );
    setHasAccess(!!approvedRequest);
  };

  const handleRequestAccess = () => {
    if (!selectedUser) return;

    Alert.alert(
      'Request Access',
      `Send a request to ${selectedUser.aliasName} to view their details?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: () => {
            const newRequest: AccessRequest = {
              id: Date.now().toString(),
              userId: selectedUser.id,
              requestedBy: auth.user?.name || 'Admin',
              requestedAt: new Date().toISOString(),
              status: 'Pending',
              userAlias: selectedUser.aliasName,
            };
            setRequests(prev => [newRequest, ...prev]);

            // Split name into firstname and lastname
            const nameParts = selectedUser.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Add to Redux store so it appears in Approval feature
            dispatch(
              addRequest({
                id: newRequest.id,
                userId: selectedUser.id,
                userAlias: selectedUser.aliasName,
                userName: selectedUser.name,
                firstName,
                lastName,
                email: selectedUser.email,
                mobile: selectedUser.mobile,
                assemblySegment: selectedUser.assemblySegment,
                village: selectedUser.village,
                ward: selectedUser.ward,
                booth: selectedUser.booth,
                address: selectedUser.address,
                designation: selectedUser.designation,
                role: selectedUser.role,
                requestedBy: auth.user?.name || 'Admin',
                requestedById: auth.user?.id || '',
                requestedAt: new Date().toISOString(),
                status: 'Pending',
                postsCount: Math.floor(Math.random() * 50) + 1, // Mock data - replace with actual API call
                points: Math.floor(Math.random() * 1000) + 100, // Mock data - replace with actual API call
              }),
            );

            Alert.alert(
              'Request Sent',
              "The request has been sent. Check the 'Approvals' section to view user details once approved.",
            );
          },
        },
      ],
    );
  };

  const handleApproveRequest = (requestId: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: 'Approved' as const } : req,
        ),
      );
      setLoading(false);
      if (selectedUser) {
        setHasAccess(true);
        Alert.alert('Access Granted', 'You can now view the user details.');
      }
    }, 500);
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'Rejected' as const } : req,
      ),
    );
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  // Check if selected user has approved access request
  useEffect(() => {
    if (selectedUser) {
      const approvedRequest = userDetailRequests.find(
        req => req.userId === selectedUser.id && req.status === 'Approved',
      );
      setHasAccess(!!approvedRequest);
    }
  }, [selectedUser, userDetailRequests]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back"
            size={22}
            color={colors.textPrimary}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Show User Details</Text>
          <Text style={styles.headerSubtitle}>
            Search by alias name and request access
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Search User by Alias</Text>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Type alias name to search..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedUser(null);
                setHasAccess(false);
              }}
            >
              <MaterialIcons
                name="close"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {!searchQuery && (
          <View style={styles.helpSection}>
            <MaterialIcons name="info-outline" size={20} color={colors.info} />
            <Text style={styles.helpText}>
              Type an alias name in the search box above to find users. You'll
              need to request access to view their full details.
            </Text>
          </View>
        )}

        {searchQuery && filteredUsers.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={filteredUsers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleUserSelect(item)}
                >
                  <MaterialIcons
                    name="person"
                    size={20}
                    color={colors.primary}
                  />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionAlias}>{item.aliasName}</Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {searchQuery && filteredUsers.length === 0 && (
          <View style={styles.noResults}>
            <MaterialIcons
              name="search-off"
              size={24}
              color={colors.textSecondary}
            />
            <Text style={styles.noResultsText}>No users found</Text>
            <Text style={styles.noResultsHint}>
              Try searching for: "Booth Captain", "Volunteer Leader", or "Field
              Officer"
            </Text>
          </View>
        )}
      </View>

      {selectedUser && (
        <View style={styles.card}>
          <View style={styles.selectedUserInfo}>
            <MaterialIcons name="person" size={24} color={colors.primary} />
            <View style={styles.selectedUserDetails}>
              <Text style={styles.selectedUserAlias}>
                {selectedUser.aliasName}
              </Text>
              {hasAccess ? (
                <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
              ) : (
                <Text style={styles.selectedUserNameHint}>
                  Personal details hidden until access is granted
                </Text>
              )}
            </View>
          </View>

          {!hasAccess ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.accessMessage}>
                You don't have access to view this user's details. Request
                access from the user to view their full information including
                name, email, mobile, address, and other details.
              </Text>
              {requests.some(
                r => r.userId === selectedUser.id && r.status === 'Pending',
              ) ? (
                <View style={styles.pendingRequestCard}>
                  <MaterialIcons
                    name="hourglass-empty"
                    size={20}
                    color={colors.warning}
                  />
                  <Text style={styles.pendingRequestText}>
                    Access request pending. Waiting for user approval.
                  </Text>
                </View>
              ) : requests.some(
                  r => r.userId === selectedUser.id && r.status === 'Rejected',
                ) ? (
                <View style={styles.rejectedRequestCard}>
                  <MaterialIcons
                    name="cancel"
                    size={20}
                    color={colors.danger}
                  />
                  <Text style={styles.rejectedRequestText}>
                    Access request was rejected. You can request again.
                  </Text>
                  <TouchableOpacity
                    style={styles.requestButton}
                    onPress={handleRequestAccess}
                  >
                    <MaterialIcons
                      name="lock-open"
                      size={20}
                      color={colors.textPrimary}
                    />
                    <Text style={styles.requestButtonText}>
                      Request Access Again
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={handleRequestAccess}
                >
                  <MaterialIcons
                    name="lock-open"
                    size={20}
                    color={colors.textPrimary}
                  />
                  <Text style={styles.requestButtonText}>Request Access</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <View style={styles.divider} />
              <UserDetailsCard user={selectedUser} />
            </>
          )}
        </View>
      )}

      {requests.length > 0 && (
        <View style={styles.card}>
          <View style={styles.requestsHeader}>
            <Text style={styles.sectionTitle}>Access Requests</Text>
            <TouchableOpacity onPress={() => setShowRequests(!showRequests)}>
              <MaterialIcons
                name={showRequests ? 'expand-less' : 'expand-more'}
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
          {pendingRequests.length > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>
                {pendingRequests.length} Pending
              </Text>
            </View>
          )}

          {showRequests && (
            <>
              <View style={styles.divider} />
              <View style={styles.requestsList}>
                {requests.map(request => (
                  <AccessRequestCard
                    key={request.id}
                    request={request}
                    onApprove={() => handleApproveRequest(request.id)}
                    onReject={() => handleRejectRequest(request.id)}
                    loading={loading}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  backText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
    gap: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionAlias: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionName: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 8,
  },
  helpText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 8,
  },
  noResultsText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  noResultsHint: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  selectedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedUserDetails: {
    flex: 1,
  },
  selectedUserAlias: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  selectedUserName: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  selectedUserNameHint: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  pendingRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 12,
    marginTop: 8,
  },
  pendingRequestText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
  },
  rejectedRequestCard: {
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 12,
    marginTop: 8,
  },
  rejectedRequestText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  accessMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  requestButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailsTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  detailsSection: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  requestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  pendingBadgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestInfo: {
    flex: 1,
  },
  requestAlias: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  requestMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: colors.warning,
  },
  statusApproved: {
    backgroundColor: colors.success,
  },
  statusRejected: {
    backgroundColor: colors.danger,
  },
  statusText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingVertical: 10,
  },
  approveText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
  },
  rejectText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
