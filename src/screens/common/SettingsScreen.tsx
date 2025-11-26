import { StyleSheet, Text, TouchableOpacity, View, Switch } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../theme/useTheme";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout, selectAuth } from "../../store/slices/authSlice";
import { toggleTheme, selectTheme } from "../../store/slices/themeSlice";

export const SettingsScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const user = auth.user;
  const colors = useTheme();
  const themeMode = useAppSelector(selectTheme);

  if (!user) {
    const dynamicStyles = getStyles(colors);
    return (
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.emptyText}>Please sign in to view settings.</Text>
      </View>
    );
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  const dynamicStyles = getStyles(colors);

  return (
    <View style={dynamicStyles.container}>
      <TouchableOpacity
        style={dynamicStyles.profileCard}
        onPress={() => navigation.navigate("UserProfile" as never)}
      >
        <View style={dynamicStyles.avatar}>
          <Text style={dynamicStyles.avatarInitials}>{initials}</Text>
        </View>
        <View style={dynamicStyles.profileInfo}>
          <Text style={dynamicStyles.name}>{user.name}</Text>
          <View style={dynamicStyles.roleBadge}>
            <MaterialIcons name="military-tech" size={16} color="#FFFFFF" />
            <Text style={dynamicStyles.roleText}>{user.role}</Text>
          </View>
          {user.email ? <Text style={dynamicStyles.metaText}>{user.email}</Text> : null}
          {user.mobile ? <Text style={dynamicStyles.metaText}>{user.mobile}</Text> : null}
        </View>
        <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Assigned Areas</Text>
        <View style={dynamicStyles.sectionCard}>
          {user.assignedAreas.assemblySegment ? (
            <Text style={dynamicStyles.sectionValue}>{user.assignedAreas.assemblySegment}</Text>
          ) : (
            <Text style={dynamicStyles.sectionValueEmpty}>No assembly segment assigned</Text>
          )}
          {user.assignedAreas.village ? (
            <Text style={dynamicStyles.sectionValue}>Village: {user.assignedAreas.village}</Text>
          ) : null}
          {user.assignedAreas.ward ? (
            <Text style={dynamicStyles.sectionValue}>Ward: {user.assignedAreas.ward}</Text>
          ) : null}
          {user.assignedAreas.booth ? (
            <Text style={dynamicStyles.sectionValue}>Booth: {user.assignedAreas.booth}</Text>
          ) : null}
        </View>
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Settings</Text>
        <View style={dynamicStyles.sectionCard}>
          <TouchableOpacity style={dynamicStyles.settingRow}>
            <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
            <Text style={dynamicStyles.settingText}>Change Password</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={dynamicStyles.settingChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.settingRow}>
            <MaterialIcons name="notifications" size={20} color={colors.textSecondary} />
            <Text style={dynamicStyles.settingText}>Notification Preferences</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={dynamicStyles.settingChevron} />
          </TouchableOpacity>
          <View style={dynamicStyles.settingRow}>
            <MaterialIcons 
              name={themeMode === 'dark' ? 'dark-mode' : 'light-mode'} 
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={dynamicStyles.settingText}>Theme</Text>
            <View style={dynamicStyles.themeToggleContainer}>
              <Text style={[dynamicStyles.themeLabel, { color: colors.textSecondary }]}>Light</Text>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={() => dispatch(toggleTheme())}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.textPrimary}
                ios_backgroundColor={colors.border}
              />
              <Text style={[dynamicStyles.themeLabel, { color: colors.textSecondary }]}>Dark</Text>
            </View>
          </View>
          <TouchableOpacity style={dynamicStyles.settingRow}>
            <MaterialIcons name="privacy-tip" size={20} color={colors.textSecondary} />
            <Text style={dynamicStyles.settingText}>Privacy & Security</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={dynamicStyles.settingChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.settingRow}>
            <MaterialIcons name="info" size={20} color={colors.textSecondary} />
            <Text style={dynamicStyles.settingText}>About BRSConnect</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={dynamicStyles.settingChevron} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={dynamicStyles.logoutButton} onPress={() => dispatch(logout())}>
        <MaterialIcons name="logout" size={20} color={colors.textPrimary} />
        <Text style={dynamicStyles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: typeof import("../../theme/themeColors").whiteTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingBottom: 100,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 48,
    fontSize: 15,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: `${colors.primary}50`,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
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
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
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
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
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
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${colors.primary}40`,
    padding: 16,
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
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
  themeToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: "auto",
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
});

