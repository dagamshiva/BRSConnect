import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';

// Types
interface ActionItem {
  id: string;
  text: string;
  ownerName: string;
  dueDate: string;
  status: 'Open' | 'Done';
}

interface Meeting {
  id: string;
  title: string;
  type: 'Small/Core' | 'Cadre' | 'Public';
  date: string;
  time: string;
  location: string;
  expectedSize: number;
  agenda: string[];
  status: 'Scheduled' | 'Completed';
  attendance?: {
    invited: number;
    attended: number;
  };
  actionItems?: ActionItem[];
}

export const MeetingDetailScreen: React.FC = () => {
  const colors = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const meeting = (route.params as any)?.meeting as Meeting;

  if (!meeting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textPrimary }}>Meeting not found</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Small/Core':
        return colors.info;
      case 'Cadre':
        return colors.primary;
      case 'Public':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const attendanceRatio = meeting.attendance
    ? meeting.attendance.invited > 0
      ? ((meeting.attendance.attended / meeting.attendance.invited) * 100).toFixed(1)
      : '0'
    : '0';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    typeBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginBottom: 16,
    },
    typeText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.surface,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoIcon: {
      marginRight: 8,
    },
    infoText: {
      fontSize: 16,
      color: colors.textSecondary,
      flex: 1,
    },
    agendaContainer: {
      marginTop: 8,
    },
    agendaItem: {
      fontSize: 15,
      color: colors.textSecondary,
      marginLeft: 8,
      marginBottom: 8,
      lineHeight: 22,
    },
    attendanceContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    attendanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    attendanceLabel: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    attendanceValue: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    attendanceRatio: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    actionItemsContainer: {
      marginTop: 8,
    },
    actionItemCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionItemText: {
      fontSize: 15,
      color: colors.textPrimary,
      marginBottom: 8,
      lineHeight: 22,
    },
    actionItemDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    actionItemDetail: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.surface,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{meeting.title}</Text>
          <View
            style={[styles.typeBadge, { backgroundColor: getTypeColor(meeting.type) }]}
          >
            <Text style={styles.typeText}>{meeting.type}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="event"
              size={20}
              color={colors.textSecondary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{formatDate(meeting.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="access-time"
              size={20}
              color={colors.textSecondary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{meeting.time}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="location-on"
              size={20}
              color={colors.textSecondary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{meeting.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agenda</Text>
          <View style={styles.agendaContainer}>
            {meeting.agenda.map((item, index) => (
              <Text key={index} style={styles.agendaItem}>
                • {item}
              </Text>
            ))}
          </View>
        </View>

        {meeting.attendance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <View style={styles.attendanceContainer}>
              <View style={styles.attendanceRow}>
                <Text style={styles.attendanceLabel}>Invited:</Text>
                <Text style={styles.attendanceValue}>
                  {meeting.attendance.invited}
                </Text>
              </View>
              <View style={styles.attendanceRow}>
                <Text style={styles.attendanceLabel}>Attended:</Text>
                <Text style={styles.attendanceValue}>
                  {meeting.attendance.attended}
                </Text>
              </View>
              <Text style={styles.attendanceRatio}>
                Attendance Rate: {attendanceRatio}%
              </Text>
            </View>
          </View>
        )}

        {meeting.actionItems && meeting.actionItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Action Items</Text>
            <View style={styles.actionItemsContainer}>
              {meeting.actionItems.map(item => (
                <View key={item.id} style={styles.actionItemCard}>
                  <Text style={styles.actionItemText}>{item.text}</Text>
                  <View style={styles.actionItemDetails}>
                    <Text style={styles.actionItemDetail}>
                      Owner: {item.ownerName}
                    </Text>
                    <Text style={styles.actionItemDetail}>
                      Due: {new Date(item.dueDate).toLocaleDateString('en-IN')}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            item.status === 'Done'
                              ? colors.success
                              : colors.warning,
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

