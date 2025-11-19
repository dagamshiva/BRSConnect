import { useMemo, useState } from "react";
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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import { selectAuth, selectIsSuperAdmin } from "../../store/slices/authSlice";

interface ApprovalUser {
  id: string;
  name: string;
  alias?: string;
  email?: string;
  mobile?: string;
  role: "SuperAdmin" | "LocalAdmin" | "Member" | "Pending";
  status: "Pending" | "Approved" | "Rejected";
  assemblySegment: string;
  village?: string;
  ward?: string;
  booth?: string;
  createdAt: string;
}

// Mock data - in production, this would come from API
const mockUsers: ApprovalUser[] = [
  {
    id: "u1",
    name: "Rajesh Kumar",
    alias: "Booth Captain",
    email: "rajesh@example.com",
    mobile: "+91 98765 43210",
    role: "Member",
    status: "Approved",
    assemblySegment: "Hyderabad Central",
    village: "Banjara Hills",
    ward: "Ward 12",
    booth: "Booth 42",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u2",
    name: "Priya Sharma",
    role: "Member",
    status: "Pending",
    assemblySegment: "Hyderabad Central",
    village: "Jubilee Hills",
    ward: "Ward 8",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "u3",
    name: "Amit Patel",
    alias: "Volunteer Leader",
    mobile: "+91 91234 56789",
    role: "LocalAdmin",
    status: "Approved",
    assemblySegment: "Hyderabad Central",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const UserCard = ({
  user,
  onApprove,
  onReject,
  loading,
}: {
  user: ApprovalUser;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.alias || user.name}</Text>
        {user.alias && (
          <Text style={styles.realName}>Real: {user.name}</Text>
        )}
        <Text style={styles.roleBadge}>{user.role}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          user.status === "Approved"
            ? styles.statusApproved
            : user.status === "Pending"
            ? styles.statusPending
            : styles.statusRejected,
        ]}
      >
        <Text style={styles.statusText}>{user.status}</Text>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.metaSection}>
      <View style={styles.metaRow}>
        <MaterialIcons name="email" size={16} color={colors.textSecondary} />
        <Text style={styles.metaText}>{user.email || "Not provided"}</Text>
      </View>
      <View style={styles.metaRow}>
        <MaterialIcons name="phone" size={16} color={colors.textSecondary} />
        <Text style={styles.metaText}>{user.mobile || "Not provided"}</Text>
      </View>
      <View style={styles.metaRow}>
        <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
        <Text style={styles.metaText}>
          {[
            user.assemblySegment,
            user.village,
            user.ward,
            user.booth,
          ]
            .filter(Boolean)
            .join(" • ")}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
        <Text style={styles.metaText}>
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>

    {user.status === "Pending" && (
      <>
        <View style={styles.divider} />
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={onApprove}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} size="small" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={18} color={colors.textPrimary} />
                <Text style={styles.approveText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={onReject}
            disabled={loading}
          >
            <MaterialIcons name="cancel" size={18} color={colors.danger} />
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </>
    )}
  </View>
);

export const ApprovalUsersScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const auth = useAppSelector(selectAuth);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const [users, setUsers] = useState<ApprovalUser[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const adminAssemblySegment =
    auth.user?.assignedAreas?.assemblySegment || "Hyderabad Central";

  const scopedUsers = useMemo(() => {
    if (isSuperAdmin) return users;
    return users.filter((user) => user.assemblySegment === adminAssemblySegment);
  }, [users, isSuperAdmin, adminAssemblySegment]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return scopedUsers;
    return scopedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        (user.alias ?? "").toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.mobile?.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term),
    );
  }, [scopedUsers, search]);

  const handleApprove = (userId: string) => {
    Alert.alert("Approve User", "Grant access to this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          setLoading(true);
          // Simulate API call
          setTimeout(() => {
            setUsers((prev) =>
              prev.map((user) =>
                user.id === userId
                  ? { ...user, status: "Approved" as const }
                  : user,
              ),
            );
            setLoading(false);
            Alert.alert("Approved", "User has been activated.");
          }, 500);
        },
      },
    ]);
  };

  const handleReject = (userId: string) => {
    Alert.alert("Reject User", "Are you sure you want to reject this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          setLoading(true);
          // Simulate API call
          setTimeout(() => {
            setUsers((prev) =>
              prev.map((user) =>
                user.id === userId
                  ? { ...user, status: "Rejected" as const }
                  : user,
              ),
            );
            setLoading(false);
            Alert.alert("Rejected", "User has been rejected.");
          }, 500);
        },
      },
    ]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredUsers}
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
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.pageTitle}>Approval Users</Text>
                {!isSuperAdmin && (
                  <Text style={styles.scopeText}>
                    Assembly: {adminAssemblySegment}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.searchRow}>
              <MaterialIcons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                placeholder="Search by name, alias, email, or role..."
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <MaterialIcons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{filteredUsers.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {filteredUsers.filter((u) => u.status === "Pending").length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {filteredUsers.filter((u) => u.status === "Approved").length}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onApprove={() => handleApprove(item.id)}
            onReject={() => handleReject(item.id)}
            loading={loading}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="group-off" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? "Try a different search query."
                : "No users in your assembly segment yet."}
            </Text>
          </View>
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
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  backText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  headerContent: {
    flex: 1,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  scopeText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    alignItems: "center",
  },
  statNumber: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  realName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  roleBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusApproved: {
    backgroundColor: colors.success,
  },
  statusPending: {
    backgroundColor: colors.warning,
  },
  statusRejected: {
    backgroundColor: colors.danger,
  },
  statusText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  metaSection: {
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectText: {
    color: colors.danger,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 48,
    gap: 12,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});

