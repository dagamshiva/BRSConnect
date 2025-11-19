import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme/colors";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout, selectAuth } from "../../store/slices/authSlice";

export const SettingsScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const user = auth.user;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Please sign in to view settings.</Text>
      </View>
    );
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => navigation.navigate("UserProfile" as never)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <MaterialIcons name="military-tech" size={16} color={colors.textPrimary} />
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
          {user.email ? <Text style={styles.metaText}>{user.email}</Text> : null}
          {user.mobile ? <Text style={styles.metaText}>{user.mobile}</Text> : null}
        </View>
        <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assigned Areas</Text>
        <View style={styles.sectionCard}>
          {user.assignedAreas.assemblySegment ? (
            <Text style={styles.sectionValue}>{user.assignedAreas.assemblySegment}</Text>
          ) : (
            <Text style={styles.sectionValueEmpty}>No assembly segment assigned</Text>
          )}
          {user.assignedAreas.village ? (
            <Text style={styles.sectionValue}>Village: {user.assignedAreas.village}</Text>
          ) : null}
          {user.assignedAreas.ward ? (
            <Text style={styles.sectionValue}>Ward: {user.assignedAreas.ward}</Text>
          ) : null}
          {user.assignedAreas.booth ? (
            <Text style={styles.sectionValue}>Booth: {user.assignedAreas.booth}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>Change Password</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={styles.settingChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialIcons name="notifications" size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>Notification Preferences</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={styles.settingChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialIcons name="privacy-tip" size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={styles.settingChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialIcons name="info" size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>About BRSConnect</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={styles.settingChevron} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => dispatch(logout())}>
        <MaterialIcons name="logout" size={20} color={colors.textPrimary} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingBottom: 100,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 48,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarInitials: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.primaryDark,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  sectionValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  sectionValueEmpty: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  settingText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  settingChevron: {
    marginLeft: "auto",
  },
  logoutButton: {
    marginTop: "auto",
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
});

