import { useState } from "react";
import {
  FlatList,
  Image,
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
import { selectAuth } from "../../store/slices/authSlice";

interface AlertItem {
  id: string;
  title: string;
  message: string;
  mediaUrl?: string;
  senderName: string;
  senderRole: "SuperAdmin" | "LocalAdmin";
  assemblySegment: string;
  createdAt: string;
  isRead: boolean;
}

// Mock data - in production, this would come from API
const mockAlerts: AlertItem[] = [
  {
    id: "a1",
    title: "Important Announcement",
    message:
      "All segment members are requested to attend the upcoming meeting scheduled for this weekend.",
    senderName: "Super Admin",
    senderRole: "SuperAdmin",
    assemblySegment: "Hyderabad Central",
    createdAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: "a2",
    title: "Weekly Update",
    message:
      "Great work everyone! We've achieved our weekly targets. Keep up the momentum.",
    mediaUrl: "https://via.placeholder.com/400x200?text=Update+Image",
    senderName: "Local Admin",
    senderRole: "LocalAdmin",
    assemblySegment: "Hyderabad Central",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
  },
  {
    id: "a3",
    title: "Event Reminder",
    message: "Community gathering event will be held tomorrow at 5 PM.",
    senderName: "Super Admin",
    senderRole: "SuperAdmin",
    assemblySegment: "Hyderabad Central",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
  },
];

const AlertCard = ({ alert }: { alert: AlertItem }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <View
      style={[
        styles.card,
        !alert.isRead && styles.unreadCard,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.senderInfo}>
          <View
            style={[
              styles.senderIcon,
              alert.senderRole === "SuperAdmin"
                ? styles.superAdminIcon
                : styles.localAdminIcon,
            ]}
          >
            <MaterialIcons
              name={
                alert.senderRole === "SuperAdmin" ? "star" : "admin-panel-settings"
              }
              size={20}
              color={colors.textPrimary}
            />
          </View>
          <View style={styles.senderDetails}>
            <Text style={styles.senderName}>{alert.senderName}</Text>
            <Text style={styles.senderRole}>
              {alert.senderRole === "SuperAdmin" ? "Super Admin" : "Local Admin"} •{" "}
              {alert.assemblySegment}
            </Text>
          </View>
        </View>
        {!alert.isRead && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.message}>{alert.message}</Text>
        {alert.mediaUrl && (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: alert.mediaUrl }} style={styles.mediaImage} />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.timestamp}>{formatTime(alert.createdAt)}</Text>
        <View style={styles.badge}>
          <MaterialIcons
            name={
              alert.senderRole === "SuperAdmin" ? "campaign" : "notifications"
            }
            size={14}
            color={colors.textPrimary}
          />
          <Text style={styles.badgeText}>Alert</Text>
        </View>
      </View>
    </View>
  );
};

export const AlertsScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const auth = useAppSelector(selectAuth);
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const userAssemblySegment =
    auth.user?.assignedAreas?.assemblySegment || "All";

  const filteredAlerts = alerts.filter((alert) => {
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        alert.title.toLowerCase().includes(term) ||
        alert.message.toLowerCase().includes(term) ||
        alert.senderName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const markAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert,
      ),
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredAlerts}
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
                <View style={styles.titleRow}>
                  <Text style={styles.pageTitle}>Alerts</Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pageSubtitle}>
                  Messages from Admins & SuperAdmins
                </Text>
              </View>
            </View>

            <View style={styles.searchRow}>
              <MaterialIcons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                placeholder="Search alerts..."
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

            <View style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={18} color={colors.info} />
              <Text style={styles.infoText}>
                Showing alerts for your assembly segment. You'll be notified when new
                alerts arrive.
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.9}
          >
            <AlertCard alert={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-off" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No alerts found</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? "Try a different search query."
                : "You don't have any alerts yet. Check back later!"}
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  pageSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
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
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.info,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
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
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  senderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  superAdminIcon: {
    backgroundColor: colors.primary,
  },
  localAdminIcon: {
    backgroundColor: colors.info,
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  senderRole: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  contentSection: {
    gap: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
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

