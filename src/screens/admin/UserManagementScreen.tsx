import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import { selectAuth, selectIsSuperAdmin } from "../../store/slices/authSlice";

type UserStatus = "Active" | "Inactive";

interface ManagedUser {
  id: string;
  realName: string;
  alias?: string;
  role: "SuperAdmin" | "LocalAdmin" | "Member";
  status: UserStatus;
  assembly: string;
  otpVerified: boolean;
}

const initialUsers: ManagedUser[] = [
  {
    id: "u1",
    realName: "Pink Car SuperAdmin",
    alias: "HQ Commander",
    role: "SuperAdmin",
    status: "Active",
    assembly: "Hyderabad Central",
    otpVerified: true,
  },
  {
    id: "u2",
    realName: "Pink Car LocalAdmin",
    alias: "Central Admin",
    role: "LocalAdmin",
    status: "Active",
    assembly: "Hyderabad Central",
    otpVerified: true,
  },
  {
    id: "u3",
    realName: "Grassroots Organizer",
    alias: "Booth Mobilizer",
    role: "Member",
    status: "Active",
    assembly: "Hyderabad Central",
    otpVerified: true,
  },
  {
    id: "u4",
    realName: "Volunteer Champion",
    role: "Member",
    status: "Inactive",
    assembly: "Warangal West",
    otpVerified: false,
  },
  {
    id: "u5",
    realName: "Booth Captain",
    alias: "Ward Captain",
    role: "LocalAdmin",
    status: "Active",
    assembly: "Secunderabad",
    otpVerified: true,
  },
];

export const UserManagementScreen = (): JSX.Element => {
  const auth = useAppSelector(selectAuth);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const adminAssembly = auth.user?.assignedAreas.assemblySegment ?? "Hyderabad Central";

  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [aliasDraft, setAliasDraft] = useState("");

  const scopedUsers = useMemo(
    () => (isSuperAdmin ? users : users.filter((user) => user.assembly === adminAssembly)),
    [users, isSuperAdmin, adminAssembly],
  );

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return scopedUsers;
    return scopedUsers.filter(
      (user) =>
        user.realName.toLowerCase().includes(term) ||
        (user.alias ?? "").toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term),
    );
  }, [scopedUsers, search]);

  const startAliasEdit = (user: ManagedUser) => {
    setEditingUserId(user.id);
    setAliasDraft(user.alias ?? "");
  };

  const saveAlias = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, alias: aliasDraft.trim() || undefined } : user,
      ),
    );
    setEditingUserId(null);
    setAliasDraft("");
  };

  const handleDeactivate = (user: ManagedUser) => {
    const nextStatus = user.status === "Active" ? "Inactive" : "Active";
    if (nextStatus === "Active" && !user.otpVerified) {
      Alert.alert("OTP pending", "Verify the user's OTP before activating the account.");
      return;
    }
    setUsers((prev) =>
      prev.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item)),
    );
  };

  const handleVerifyOtp = (user: ManagedUser) => {
    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id
          ? {
              ...item,
              otpVerified: true,
              status: item.status === "Inactive" ? "Active" : item.status,
            }
          : item,
      ),
    );
    Alert.alert("OTP verified", "User account is now eligible for activation.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Users (Admin / Super Admin)</Text>
      {!isSuperAdmin ? (
        <Text style={styles.scopeLock}>
          Scope limited to {adminAssembly}. Super Admins can view all assemblies.
        </Text>
      ) : null}

      <View style={styles.searchCard}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search alias, role or real name"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <MaterialIcons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {filteredUsers.map((user) => {
        const isEditing = editingUserId === user.id;
        return (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.aliasLabel}>Public Alias</Text>
              <Text style={styles.aliasName}>{user.alias ?? "Alias not set"}</Text>
              <Text style={styles.metaText}>Role • {user.role}</Text>
              <Text style={styles.metaText}>Assembly • {user.assembly}</Text>
              <Text style={styles.realName}>
                Real identity (hidden publicly): {user.realName}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusBadge,
                    user.status === "Active" ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <MaterialIcons
                    name={user.status === "Active" ? "check-circle" : "pause-circle"}
                    size={14}
                    color={colors.textPrimary}
                  />
                  <Text style={styles.statusText}>{user.status}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    user.otpVerified ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <MaterialIcons
                    name={user.otpVerified ? "verified" : "sms"}
                    size={14}
                    color={colors.textPrimary}
                  />
                  <Text style={styles.statusText}>
                    {user.otpVerified ? "OTP Verified" : "OTP Pending"}
                  </Text>
                </View>
              </View>
            </View>

            {isEditing ? (
              <View style={styles.aliasEditor}>
                <TextInput
                  style={styles.aliasInput}
                  value={aliasDraft}
                  onChangeText={setAliasDraft}
                  placeholder="Enter alias"
                  placeholderTextColor={colors.textSecondary}
                />
                <View style={styles.aliasButtons}>
                  <TouchableOpacity style={styles.saveAliasButton} onPress={() => saveAlias(user.id)}>
                    <Text style={styles.saveAliasText}>Save Alias</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelAliasButton}
                    onPress={() => {
                      setEditingUserId(null);
                      setAliasDraft("");
                    }}
                  >
                    <Text style={styles.cancelAliasText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.changeAliasButton} onPress={() => startAliasEdit(user)}>
                <MaterialIcons name="edit" size={16} color={colors.textPrimary} />
                <Text style={styles.changeAliasText}>Change Alias</Text>
              </TouchableOpacity>
            )}

            <View style={styles.actionRow}>
              {!user.otpVerified ? (
                <TouchableOpacity style={styles.verifyButton} onPress={() => handleVerifyOtp(user)}>
                  <MaterialIcons name="check-circle" size={16} color={colors.textPrimary} />
                  <Text style={styles.verifyButtonText}>Mark OTP Verified</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.deactivateButton} onPress={() => handleDeactivate(user)}>
                <Text style={styles.deactivateText}>
                  {user.status === "Active" ? "Deactivate" : "Activate"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="group" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptySubtitle}>Try a different search query.</Text>
        </View>
      ) : null}
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
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
  },
  scopeLock: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  userInfo: {
    gap: 4,
  },
  aliasLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: "uppercase",
  },
  aliasName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  metaText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  realName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
  },
  statusRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: colors.successDark,
  },
  statusInactive: {
    backgroundColor: colors.danger,
  },
  statusText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 12,
  },
  changeAliasButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeAliasText: {
    color: colors.primary,
    fontWeight: "600",
  },
  aliasEditor: {
    marginTop: 8,
    gap: 8,
  },
  aliasInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  aliasButtons: {
    flexDirection: "row",
    gap: 8,
  },
  saveAliasButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveAliasText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  cancelAliasButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelAliasText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  verifyButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  verifyButtonText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  deactivateButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  deactivateText: {
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
    fontSize: 16,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

