import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";

export const UserProfileScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const auth = useAppSelector(selectAuth);
  const user = auth.user;

  // Dummy stats for demo
  const userStats = {
    postsCount: 24,
    likesEarned: 156,
    dislikes: 8,
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>User not found</Text>
      </View>
    );
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const assemblyVillage = user.assignedAreas.village
    ? `${user.assignedAreas.assemblySegment} / ${user.assignedAreas.village}`
    : user.assignedAreas.assemblySegment;

  const handleAboutUser = () => {
    Alert.alert(
      "About User",
      `Name: ${user.name}\nRole: ${user.role}\nStatus: ${user.status}\n${
        user.email ? `Email: ${user.email}\n` : ""
      }${user.mobile ? `Mobile: ${user.mobile}` : ""}`,
      [{ text: "OK" }],
    );
  };

  const handlePostsHistory = () => {
    Alert.alert("Posts History", "This feature will show the user's post history.", [{ text: "OK" }]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.aliasName}>{user.name}</Text>
          <Text style={styles.location}>{assemblyVillage}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.postsCount}</Text>
            <Text style={styles.statLabel}>Posts Count</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.likesEarned}</Text>
            <Text style={styles.statLabel}>Likes Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.dislikes}</Text>
            <Text style={styles.statLabel}>Dislikes</Text>
          </View>
        </View>
      </View>

      <View style={styles.linksCard}>
        <TouchableOpacity style={styles.linkRow} onPress={handleAboutUser}>
          <MaterialIcons name="person" size={20} color={colors.textPrimary} />
          <Text style={styles.linkText}>About User</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.linkDivider} />

        <TouchableOpacity style={styles.linkRow} onPress={handlePostsHistory}>
          <MaterialIcons name="history" size={20} color={colors.textPrimary} />
          <Text style={styles.linkText}>Posts History</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
    gap: 20,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: "700",
  },
  userInfo: {
    alignItems: "center",
    gap: 8,
  },
  aliasName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  location: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  linksCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  linkText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  linkDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 48,
  },
});

