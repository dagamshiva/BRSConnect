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
import { MaterialIcons } from "@expo/vector-icons";

import { colors } from "../../theme/colors";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  approveRequest,
  fetchApprovals,
  rejectRequest,
  selectApprovals,
} from "../../store/slices/approvalsSlice";

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

export const ApprovalQueueScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { items, loading, actionLoading, error } = useAppSelector(selectApprovals);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
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
              Onboard new volunteers and coordinators swiftly for the Pink Car movement.
            </Text>

            <View style={styles.searchRow}>
              <MaterialIcons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                placeholder="Search applicants"
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <ApprovalCard
            {...item}
            onApprove={() => handleApprove(item.id)}
            onReject={() => handleReject(item.id)}
            loading={actionLoading}
          />
        )}
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
                All applicants have been processed. Great work keeping the pipeline clear.
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
});

