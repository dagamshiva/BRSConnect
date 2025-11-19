import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { colors } from "../../theme/colors";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createReport,
  fetchReports,
  selectReports,
  updateReportStatus,
} from "../../store/slices/reportsSlice";
import { selectAuth } from "../../store/slices/authSlice";
import type { Report } from "../../types";

// Use REPORT_STATUS_FILTERS from commonData - but ReportsScreen uses different status values
// So we'll keep a local version that matches the Report type
const statusFilters: Array<{ key: Report["status"] | "All"; label: string }> = [
  { key: "All", label: "All" },
  { key: "New", label: "New" },
  { key: "Under Review", label: "Under Review" },
  { key: "Resolved", label: "Resolved" },
  { key: "Dismissed", label: "Dismissed" },
];

const statusColor: Record<Report["status"], string> = {
  New: colors.accent,
  "Under Review": colors.warning,
  Resolved: colors.success,
  Dismissed: colors.danger,
};

const ReportCard = ({
  report,
  onUpdateStatus,
  loading,
}: {
  report: Report;
  onUpdateStatus: () => void;
  loading: boolean;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.title}>{report.title}</Text>
      <View style={[styles.statusBadge, { backgroundColor: statusColor[report.status] }]}>
        <Text style={styles.statusText}>{report.status}</Text>
      </View>
    </View>

    <Text style={styles.description}>{report.description}</Text>

    <View style={styles.metaRow}>
      <View style={styles.metaGroup}>
        <Text style={styles.metaLabel}>Reporter</Text>
        <Text style={styles.metaValue}>{report.reporterName}</Text>
      </View>
      <View style={styles.metaGroup}>
        <Text style={styles.metaLabel}>Area</Text>
        <Text style={styles.metaValue} numberOfLines={1}>
          {[
            report.areaScope.assemblySegment,
            report.areaScope.village,
            report.areaScope.ward,
          ]
            .filter(Boolean)
            .join(" • ")}
        </Text>
      </View>
    </View>

    <View style={styles.metaRow}>
      <View style={styles.metaGroup}>
        <Text style={styles.metaLabel}>Created</Text>
        <Text style={styles.metaValue}>
          {new Date(report.createdAt).toLocaleString()}
        </Text>
      </View>
      <View style={styles.metaGroup}>
        <Text style={styles.metaLabel}>Updated</Text>
        <Text style={styles.metaValue}>
          {new Date(report.updatedAt).toLocaleString()}
        </Text>
      </View>
    </View>

    <View style={styles.actionsRow}>
      <TouchableOpacity style={styles.primaryAction} onPress={onUpdateStatus} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.primaryActionText}>Advance Workflow</Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

export const ReportsScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const { items: reports, loading, creating, updating, error } = useAppSelector(selectReports);
  const [filter, setFilter] = useState<(typeof statusFilters)[number]["key"]>("All");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchReports());
    }, [dispatch]),
  );

  const filteredReports = useMemo(() => {
    if (filter === "All") {
      return reports;
    }
    return reports.filter((report) => report.status === filter);
  }, [filter, reports]);

  const handleCreateReport = () => {
    if (!auth.user) {
      Alert.alert("Login required", "Please sign in to raise reports.");
      return;
    }

    dispatch(
      createReport({
        title: "Field issue",
        description: "Auto-generated report for testing the flow.",
        areaScope: auth.user.assignedAreas,
      }),
    )
      .unwrap()
      .then(() => Alert.alert("Report logged", "Ground command will review it soon."))
      .catch((message) => Alert.alert("Unable to log report", message));
  };

  const handleAdvanceStatus = (report: Report) => {
    const progression: Record<Report["status"], Report["status"]> = {
      New: "Under Review",
      "Under Review": "Resolved",
      Resolved: "Resolved",
      Dismissed: "Dismissed",
    };

    const nextStatus = progression[report.status];
    if (report.status === "Resolved") {
      Alert.alert("Report resolved", "No further action required.");
      return;
    }

    dispatch(
      updateReportStatus({
        reportId: report.id,
        status: nextStatus,
        assignedAdminId: auth.user?.role !== "Member" ? auth.user?.id ?? undefined : undefined,
      }),
    )
      .unwrap()
      .then(() => Alert.alert("Status updated", `Report marked as ${nextStatus}.`))
      .catch((message) => Alert.alert("Unable to update", message));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchReports())
      .unwrap()
      .finally(() => setRefreshing(false));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.pageTitle}>Issue Command Center</Text>
            <Text style={styles.pageSubtitle}>
              Track escalations and keep the Pink Car movement responsive.
            </Text>

            <TouchableOpacity
              style={[styles.createButton, creating && styles.primaryActionDisabled]}
              onPress={handleCreateReport}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <>
                  <MaterialIcons name="add-alert" size={20} color={colors.textPrimary} />
                  <Text style={styles.createButtonText}>Log New Report</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.filterRow}>
              {statusFilters.map((status) => {
                const isActive = status.key === filter;
                return (
                  <TouchableOpacity
                    key={status.key}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setFilter(status.key)}
                  >
                    <Text
                      style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
          <ReportCard
            report={item}
            onUpdateStatus={() => handleAdvanceStatus(item)}
            loading={updating}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="task-alt" size={32} color={colors.success} />
              <Text style={styles.emptyTitle}>Nothing to track here!</Text>
              <Text style={styles.emptySubtitle}>
                All clear for now — great job staying ahead.
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
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  primaryActionDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: colors.textPrimary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaGroup: {
    flex: 1,
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metaValue: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  primaryAction: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  primaryActionText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 48,
    gap: 8,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});

