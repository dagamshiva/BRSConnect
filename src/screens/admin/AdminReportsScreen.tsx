import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import { selectAuth, selectIsSuperAdmin } from "../../store/slices/authSlice";

const assemblies = ["Hyderabad Central", "Warangal West", "Secunderabad"];
const villages = ["All", "Banjara Hills", "Jubilee Hills", "Begumpet"];
const mandals = ["All", "Mandal 1", "Mandal 2", "Mandal 3"];

const mockReports = [
  { id: "r1", assembly: "Hyderabad Central", status: "New", title: "Water supply delay" },
  { id: "r2", assembly: "Hyderabad Central", status: "Resolved", title: "Pink booth visibility" },
  { id: "r3", assembly: "Warangal West", status: "Under Review", title: "Volunteer shortage" },
  { id: "r4", assembly: "Secunderabad", status: "New", title: "Road show permissions" },
];

const statusColor: Record<string, string> = {
  New: colors.accent,
  "Under Review": colors.warning,
  Resolved: colors.success,
};

export const AdminReportsScreen = (): JSX.Element => {
  const auth = useAppSelector(selectAuth);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const assignedAssembly = auth.user?.assignedAreas.assemblySegment ?? assemblies[0];
  const assignedVillage = auth.user?.assignedAreas.village ?? villages[0];
  const assignedMandal = auth.user?.assignedAreas.ward ?? mandals[0];

  const availableAssemblies = isSuperAdmin ? assemblies : [assignedAssembly];
  const availableVillages = isSuperAdmin ? villages : [assignedVillage];
  const availableMandals = isSuperAdmin ? mandals : [assignedMandal];

  const [assemblyIndex, setAssemblyIndex] = useState(0);
  const [villageIndex, setVillageIndex] = useState(0);
  const [mandalIndex, setMandalIndex] = useState(0);

  const activeAssembly = availableAssemblies[assemblyIndex] ?? assignedAssembly;
  const activeVillage = availableVillages[villageIndex] ?? assignedVillage;
  const activeMandal = availableMandals[mandalIndex] ?? assignedMandal;

  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      if (activeAssembly !== assemblies[0] && report.assembly !== activeAssembly) return false;
      return true;
    });
  }, [activeAssembly]);

  const handleDownload = () => {
    Alert.alert(
      "Download report",
      `Generating Excel for:\nAssembly: ${activeAssembly}\nVillage: ${activeVillage}\nMandal: ${activeMandal}`,
    );
  };

  const filterButton = ({
    label,
    value,
    onPress,
    disabled,
  }: {
    label: string;
    value: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, disabled && styles.filterButtonDisabled]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterValueRow}>
        <Text style={styles.filterValue}>{value}</Text>
        <MaterialIcons
          name={disabled ? "lock" : "autorenew"}
          size={16}
          color={colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Reports</Text>
      <Text style={styles.pageSubtitle}>Monitor escalations from every assembly, village and mandal.</Text>

      <View style={styles.filtersCard}>
        <Text style={styles.sectionTitle}>Filters</Text>
        <View style={styles.filtersRow}>
          {filterButton({
            label: "Assembly",
            value: activeAssembly,
            onPress: () =>
              setAssemblyIndex((prev) => (prev + 1) % availableAssemblies.length),
            disabled: !isSuperAdmin,
          })}
          {filterButton({
            label: "Village",
            value: activeVillage,
            onPress: () =>
              setVillageIndex((prev) => (prev + 1) % availableVillages.length),
            disabled: !isSuperAdmin,
          })}
          {filterButton({
            label: "Mandal",
            value: activeMandal,
            onPress: () =>
              setMandalIndex((prev) => (prev + 1) % availableMandals.length),
            disabled: !isSuperAdmin,
          })}
        </View>
        <Text style={styles.hint}>
          {isSuperAdmin
            ? "Tap any filter to cycle through demo values."
            : "Locked to your assigned assembly for compliance."}
        </Text>
      </View>

      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
        <MaterialIcons name="file-download" size={20} color={colors.textPrimary} />
        <Text style={styles.downloadText}>Download Full Report (Excel)</Text>
      </TouchableOpacity>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Live Snapshot</Text>
        {filteredReports.map((report) => (
          <View key={report.id} style={styles.reportRow}>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportMeta}>{report.assembly}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor[report.status] }]}>
              <Text style={styles.statusText}>{report.status}</Text>
            </View>
          </View>
        ))}
        {filteredReports.length === 0 ? (
          <View style={styles.noDataState}>
            <MaterialIcons name="inbox" size={24} color={colors.textSecondary} />
            <Text style={styles.noDataText}>No reports for the selected assembly.</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 20,
  },
  pageSubtitle: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  filtersCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  filtersRow: {
    flexDirection: "column",
    gap: 12,
  },
  filterButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  filterButtonDisabled: {
    opacity: 0.7,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  filterValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterValue: {
    color: colors.textPrimary,
    fontWeight: "700",
    flex: 1,
    marginRight: 6,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  downloadText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 12,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  reportInfo: {
    flex: 1,
    marginRight: 12,
  },
  reportTitle: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  reportMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  noDataState: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
  },
  noDataText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});

