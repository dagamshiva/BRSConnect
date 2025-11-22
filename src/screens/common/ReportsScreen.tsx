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

import { useTheme } from "../../theme/useTheme";
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

const ReportCard = ({
  report,
  onUpdateStatus,
  loading,
  colors,
}: {
  report: Report;
  onUpdateStatus: () => void;
  loading: boolean;
  colors: ReturnType<typeof useTheme>;
}) => {
  const statusColor: Record<Report["status"], string> = {
    New: colors.accent,
    "Under Review": colors.warning,
    Resolved: colors.success,
    Dismissed: colors.danger,
  };

  const cardStyles = useMemo(() => StyleSheet.create({
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
      alignItems: "flex-start",
      marginBottom: 8,
    },
    title: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
      marginRight: 12,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    description: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: "row",
      gap: 16,
      marginTop: 8,
    },
    metaGroup: {
      flex: 1,
    },
    metaLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 2,
    },
    metaValue: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: "600",
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    actionButtonPrimary: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    actionButtonSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: `${colors.primary}40`,
    },
    actionButtonText: {
      color: colors.textPrimary,
      fontWeight: "800",
      fontSize: 14,
      letterSpacing: -0.1,
    },
    actionButtonTextSecondary: {
      color: colors.textSecondary,
    },
  }), [colors]);

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.cardHeader}>
        <Text style={cardStyles.title}>{report.title}</Text>
        <View style={[cardStyles.statusBadge, { backgroundColor: statusColor[report.status] }]}>
          <Text style={cardStyles.statusText}>{report.status}</Text>
        </View>
      </View>

      <Text style={cardStyles.description}>{report.description}</Text>

      <View style={cardStyles.metaRow}>
        <View style={cardStyles.metaGroup}>
          <Text style={cardStyles.metaLabel}>Reporter</Text>
          <Text style={cardStyles.metaValue}>{report.reporterName}</Text>
        </View>
        <View style={cardStyles.metaGroup}>
          <Text style={cardStyles.metaLabel}>Area</Text>
          <Text style={cardStyles.metaValue} numberOfLines={1}>
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

      <View style={cardStyles.metaRow}>
        <View style={cardStyles.metaGroup}>
          <Text style={cardStyles.metaLabel}>Created</Text>
          <Text style={cardStyles.metaValue}>
            {new Date(report.createdAt).toLocaleString()}
          </Text>
        </View>
        <View style={cardStyles.metaGroup}>
          <Text style={cardStyles.metaLabel}>Updated</Text>
          <Text style={cardStyles.metaValue}>
            {new Date(report.updatedAt).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={cardStyles.actions}>
        <TouchableOpacity 
          style={[cardStyles.actionButton, cardStyles.actionButtonPrimary]} 
          onPress={onUpdateStatus} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={cardStyles.actionButtonText}>Advance Workflow</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ReportsScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const colors = useTheme();
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

  // Create dynamic styles based on current theme
  const styles = useMemo(() => StyleSheet.create({
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
      fontSize: 28,
      fontWeight: "800",
      marginTop: 20,
      letterSpacing: -0.5,
    },
    pageSubtitle: {
      color: colors.textSecondary,
      marginTop: 6,
      marginBottom: 16,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: 14,
      gap: 8,
      marginBottom: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryActionDisabled: {
      opacity: 0.6,
    },
    createButtonText: {
      color: colors.textPrimary,
      fontWeight: "800",
      fontSize: 15,
      letterSpacing: -0.2,
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
      borderWidth: 1.5,
      borderColor: `${colors.primary}40`,
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
  }), [colors]);

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
            colors={colors}
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
