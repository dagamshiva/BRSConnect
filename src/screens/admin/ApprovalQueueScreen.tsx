import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { colors } from "../../theme/colors";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  approveRequest,
  fetchApprovals,
  rejectRequest,
  selectApprovals,
} from "../../store/slices/approvalsSlice";
import {
  selectPendingUserDetailRequests,
  updateRequestStatus,
  type UserDetailRequest,
} from "../../store/slices/userDetailRequestsSlice";

const ApprovalCard = ({
  name,
  email,
  mobile,
  assignedAreas,
  createdAt,
  onApprove,
  onReject,
  loading,
}: {
  name: string;
  email?: string | null;
  mobile?: string | null;
  assignedAreas: { assemblySegment: string; village?: string | null; ward?: string | null };
  createdAt: string;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.applicantName}>{name}</Text>
      <Text style={styles.timestamp}>{new Date(createdAt).toLocaleString()}</Text>
    </View>
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>Contact</Text>
      <Text style={styles.metaValue}>{email ?? mobile ?? "Not provided"}</Text>
    </View>
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>Areas</Text>
      <Text style={styles.metaValue}>
        {[assignedAreas.assemblySegment, assignedAreas.village, assignedAreas.ward]
          .filter(Boolean)
          .join(" • ")}
      </Text>
    </View>
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.approveButton} onPress={onApprove} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <>
            <MaterialIcons name="check-circle" size={18} color={colors.textPrimary} />
            <Text style={styles.approveText}>Approve</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.rejectButton} onPress={onReject} disabled={loading}>
        <MaterialIcons name="cancel" size={18} color={colors.danger} />
        <Text style={styles.rejectText}>Reject</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const UserDetailRequestCard = ({
  request,
  onApprove,
  onReject,
  loading,
}: {
  request: UserDetailRequest;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) => (
  <View style={styles.userDetailCard}>
    <View style={styles.cardHeader}>
      <View style={styles.userHeaderInfo}>
        <MaterialIcons name="person-search" size={24} color={colors.primary} />
        <View style={styles.userHeaderText}>
          <Text style={styles.applicantName}>{request.userAlias}</Text>
          <Text style={styles.requestTypeLabel}>User Details Access Request</Text>
        </View>
      </View>
      <Text style={styles.timestamp}>{new Date(request.requestedAt).toLocaleString()}</Text>
    </View>

    <View style={styles.divider} />

    <View style={styles.userDetailsSection}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Username (Alias)</Text>
        <Text style={styles.detailValue}>{request.userAlias}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>First Name</Text>
        <Text style={styles.detailValue}>{request.firstName}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Last Name</Text>
        <Text style={styles.detailValue}>{request.lastName}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Full Name</Text>
        <Text style={styles.detailValue}>{request.userName}</Text>
      </View>
      {request.email && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{request.email}</Text>
        </View>
      )}
      {request.mobile && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mobile</Text>
          <Text style={styles.detailValue}>{request.mobile}</Text>
        </View>
      )}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Assembly</Text>
        <Text style={styles.detailValue}>{request.assemblySegment}</Text>
      </View>
      {request.village && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Village</Text>
          <Text style={styles.detailValue}>{request.village}</Text>
        </View>
      )}
      {request.ward && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ward</Text>
          <Text style={styles.detailValue}>{request.ward}</Text>
        </View>
      )}
      {request.booth && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Booth</Text>
          <Text style={styles.detailValue}>{request.booth}</Text>
        </View>
      )}
      {request.address && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address</Text>
          <Text style={styles.detailValue}>{request.address}</Text>
        </View>
      )}
      {request.designation && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Designation</Text>
          <Text style={styles.detailValue}>{request.designation}</Text>
        </View>
      )}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Role</Text>
        <Text style={styles.detailValue}>{request.role}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialIcons name="article" size={20} color={colors.primary} />
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Posts</Text>
            <Text style={styles.statValue}>{request.postsCount || 0}</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="stars" size={20} color={colors.accent} />
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Points</Text>
            <Text style={styles.statValue}>{request.points || 0}</Text>
          </View>
        </View>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.requestInfo}>
      <Text style={styles.requestInfoText}>
        Requested by: <Text style={styles.requestInfoBold}>{request.requestedBy}</Text>
      </Text>
    </View>

    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.approveButton} onPress={onApprove} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <>
            <MaterialIcons name="check-circle" size={18} color={colors.textPrimary} />
            <Text style={styles.approveText}>Approve</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.rejectButton} onPress={onReject} disabled={loading}>
        <MaterialIcons name="cancel" size={18} color={colors.danger} />
        <Text style={styles.rejectText}>Reject</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const ApprovalQueueScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { items, loading, actionLoading, error } = useAppSelector(selectApprovals);
  const userDetailRequests = useAppSelector(selectPendingUserDetailRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailRequestLoading, setDetailRequestLoading] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchApprovals());
    }, [dispatch]),
  );

  const filteredRequests = items.filter((request) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [request.name, request.email ?? "", request.mobile ?? ""].some((value) =>
      value.toLowerCase().includes(term),
    );
  });

  const filteredUserDetailRequests = userDetailRequests.filter((request) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [
      request.userAlias,
      request.firstName,
      request.lastName,
      request.userName,
      request.email ?? "",
      request.mobile ?? "",
    ].some((value) => value.toLowerCase().includes(term));
  });

  const handleApprove = (id: string) => {
    Alert.alert("Approve applicant", "Grant access to this volunteer?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () =>
          dispatch(approveRequest({ id }))
            .unwrap()
            .then(() => Alert.alert("Approved", "Member has been activated."))
            .catch((message) => Alert.alert("Unable to approve", message)),
      },
    ]);
  };

  const handleReject = (id: string) => {
    if (Alert.prompt) {
      Alert.prompt(
        "Reject applicant",
        "Provide a reason (optional)",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reject",
            style: "destructive",
            onPress: (reason) =>
              dispatch(rejectRequest({ id, reason }))
                .unwrap()
                .then(() => Alert.alert("Rejected", "Applicant has been informed."))
                .catch((message) => Alert.alert("Unable to reject", message)),
          },
        ],
        "plain-text",
      );
      return;
    }

    dispatch(rejectRequest({ id }))
      .unwrap()
      .then(() => Alert.alert("Rejected", "Applicant has been informed."))
      .catch((message) => Alert.alert("Unable to reject", message));
  };

  const handleApproveUserDetailRequest = (id: string) => {
    Alert.alert("Approve Access Request", "Grant access to view this user's details?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          setDetailRequestLoading(id);
          setTimeout(() => {
            dispatch(updateRequestStatus({ id, status: "Approved" }));
            setDetailRequestLoading(null);
            Alert.alert("Approved", "Access request has been approved.");
          }, 500);
        },
      },
    ]);
  };

  const handleRejectUserDetailRequest = (id: string) => {
    Alert.alert("Reject Access Request", "Reject this access request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          setDetailRequestLoading(id);
          setTimeout(() => {
            dispatch(updateRequestStatus({ id, status: "Rejected" }));
            setDetailRequestLoading(null);
            Alert.alert("Rejected", "Access request has been rejected.");
          }, 500);
        },
      },
    ]);
  };

  const allItems = [
    ...filteredUserDetailRequests.map((req) => ({ type: "userDetail", data: req })),
    ...filteredRequests.map((req) => ({ type: "approval", data: req })),
  ].sort((a, b) => {
    const dateA = a.type === "userDetail" ? a.data.requestedAt : a.data.createdAt;
    const dateB = b.type === "userDetail" ? b.data.requestedAt : b.data.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={allItems}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => dispatch(fetchApprovals())}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.pageTitle}>Approval Command Center</Text>
            <Text style={styles.pageSubtitle}>
              Review and approve membership requests and user detail access requests.
            </Text>

            <View style={styles.searchRow}>
              <MaterialIcons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                placeholder="Search applicants or user detail requests"
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {filteredUserDetailRequests.length > 0 && (
              <View style={styles.sectionHeader}>
                <MaterialIcons name="person-search" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>
                  User Detail Access Requests ({filteredUserDetailRequests.length})
                </Text>
              </View>
            )}

            {error ? (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => {
          if (item.type === "userDetail") {
            return (
              <UserDetailRequestCard
                request={item.data}
                onApprove={() => handleApproveUserDetailRequest(item.data.id)}
                onReject={() => handleRejectUserDetailRequest(item.data.id)}
                loading={detailRequestLoading === item.data.id}
              />
            );
          }
          return (
            <ApprovalCard
              {...item.data}
              onApprove={() => handleApprove(item.data.id)}
              onReject={() => handleReject(item.data.id)}
              loading={actionLoading}
            />
          );
        }}
        ListFooterComponent={
          filteredRequests.length > 0 && (
            <View style={styles.sectionHeader}>
              <MaterialIcons name="verified-user" size={20} color={colors.info} />
              <Text style={styles.sectionTitle}>
                Membership Approval Requests ({filteredRequests.length})
              </Text>
            </View>
          )
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="verified-user" size={32} color={colors.success} />
              <Text style={styles.emptyTitle}>No pending approvals</Text>
              <Text style={styles.emptySubtitle}>
                All applicants and access requests have been processed. Great work keeping the
                pipeline clear.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 24,
    paddingBottom: 48,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    marginTop: 20,
  },
  pageSubtitle: {
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  applicantName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metaValue: {
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  approveText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectText: {
    color: colors.textSecondary,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 48,
    gap: 10,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  userDetailCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
    gap: 12,
  },
  userHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  userHeaderText: {
    flex: 1,
  },
  requestTypeLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  userDetailsSection: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  requestInfo: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
  },
  requestInfoText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  requestInfoBold: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
});

