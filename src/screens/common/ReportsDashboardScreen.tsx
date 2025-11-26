import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/useTheme';

// Types
interface Area {
  district: string;
  mandal: string;
  ward: string;
}

interface Issue {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  area: Area;
  status: 'Open' | 'Resolved';
  createdAt: string;
  resolvedAt: string | null;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  status: 'Scheduled' | 'Completed';
  attendance?: {
    invited: number;
    attended: number;
  };
}

// Demo Data
const DEMO_ISSUES: Issue[] = [
  {
    id: 'i1',
    title: 'Water problem - Ward 7',
    priority: 'High',
    area: { district: 'Peddapalli', mandal: 'Ramagundam', ward: '7' },
    status: 'Open',
    createdAt: '2025-11-25T10:00:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i2',
    title: 'Road repair needed - Ward 9',
    priority: 'High',
    area: { district: 'Peddapalli', mandal: 'Ramagundam', ward: '9' },
    status: 'Open',
    createdAt: '2025-11-24T14:30:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i3',
    title: 'Street light not working - Ward 5',
    priority: 'Medium',
    area: { district: 'Peddapalli', mandal: 'Ramagundam', ward: '5' },
    status: 'Open',
    createdAt: '2025-11-23T09:15:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i4',
    title: 'Garbage collection issue - Ward 7',
    priority: 'High',
    area: { district: 'Peddapalli', mandal: 'Ramagundam', ward: '7' },
    status: 'Open',
    createdAt: '2025-11-22T16:45:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i5',
    title: 'Drainage problem - Ward 9',
    priority: 'Medium',
    area: { district: 'Peddapalli', mandal: 'Ramagundam', ward: '9' },
    status: 'Open',
    createdAt: '2025-11-21T11:20:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i6',
    title: 'Water supply restored - Ward 3',
    priority: 'High',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '3' },
    status: 'Resolved',
    createdAt: '2025-11-20T08:00:00+05:30',
    resolvedAt: '2025-11-22T15:30:00+05:30',
  },
  {
    id: 'i7',
    title: 'Road repair completed - Ward 12',
    priority: 'Medium',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '12' },
    status: 'Resolved',
    createdAt: '2025-11-18T10:00:00+05:30',
    resolvedAt: '2025-11-25T12:00:00+05:30',
  },
  {
    id: 'i8',
    title: 'Street light fixed - Ward 8',
    priority: 'Low',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '8' },
    status: 'Resolved',
    createdAt: '2025-11-15T14:00:00+05:30',
    resolvedAt: '2025-11-17T10:00:00+05:30',
  },
  {
    id: 'i9',
    title: 'Coal mine safety concerns - Bellampalli',
    priority: 'High',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '5' },
    status: 'Open',
    createdAt: '2025-11-26T09:00:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i10',
    title: 'Water supply disruption - Chennur Ward 2',
    priority: 'High',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '2' },
    status: 'Open',
    createdAt: '2025-11-27T11:30:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i11',
    title: 'Road widening project delay - Siddipet',
    priority: 'Medium',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '10' },
    status: 'Open',
    createdAt: '2025-11-28T08:15:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i12',
    title: 'Gajwel irrigation canal repair needed',
    priority: 'High',
    area: { district: 'Peddapalli', mandal: 'Gajwel', ward: '3' },
    status: 'Open',
    createdAt: '2025-11-29T14:20:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i13',
    title: 'Bellampalli worker housing issue',
    priority: 'Medium',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '6' },
    status: 'Open',
    createdAt: '2025-11-30T10:45:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i14',
    title: 'Chennur school infrastructure upgrade',
    priority: 'Medium',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '5' },
    status: 'Open',
    createdAt: '2025-12-01T09:30:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i15',
    title: 'Siddipet market area cleaning',
    priority: 'Low',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '8' },
    status: 'Open',
    createdAt: '2025-12-02T13:00:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i16',
    title: 'Gajwel healthcare center equipment',
    priority: 'High',
    area: { district: 'Peddapalli', mandal: 'Gajwel', ward: '7' },
    status: 'Open',
    createdAt: '2025-12-03T11:15:00+05:30',
    resolvedAt: null,
  },
  {
    id: 'i17',
    title: 'Bellampalli power supply restored',
    priority: 'High',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '4' },
    status: 'Resolved',
    createdAt: '2025-11-20T08:00:00+05:30',
    resolvedAt: '2025-11-21T18:00:00+05:30',
  },
  {
    id: 'i18',
    title: 'Chennur bridge repair completed',
    priority: 'Medium',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '6' },
    status: 'Resolved',
    createdAt: '2025-11-19T10:00:00+05:30',
    resolvedAt: '2025-11-24T16:30:00+05:30',
  },
  {
    id: 'i19',
    title: 'Siddipet drainage system fixed',
    priority: 'Medium',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '11' },
    status: 'Resolved',
    createdAt: '2025-11-17T12:00:00+05:30',
    resolvedAt: '2025-11-19T14:00:00+05:30',
  },
  {
    id: 'i20',
    title: 'Gajwel street lighting upgraded',
    priority: 'Low',
    area: { district: 'Peddapalli', mandal: 'Gajwel', ward: '9' },
    status: 'Resolved',
    createdAt: '2025-11-16T09:00:00+05:30',
    resolvedAt: '2025-11-18T17:00:00+05:30',
  },
];

const DEMO_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Ward 7 Core Team Weekly Review',
    date: '2025-11-30',
    status: 'Scheduled',
    attendance: { invited: 12, attended: 0 },
  },
  {
    id: 'm2',
    title: 'Ramagundam Mandal Cadre Meeting',
    date: '2025-12-05',
    status: 'Scheduled',
    attendance: { invited: 45, attended: 0 },
  },
  {
    id: 'm3',
    title: 'Public Grievance Hearing - Ward 9',
    date: '2025-12-10',
    status: 'Scheduled',
    attendance: { invited: 100, attended: 0 },
  },
  {
    id: 'm4',
    title: 'Monthly Review Meeting - November',
    date: '2025-11-25',
    status: 'Completed',
    attendance: { invited: 30, attended: 28 },
  },
  {
    id: 'm5',
    title: 'Ward 5 Public Meeting',
    date: '2025-11-20',
    status: 'Completed',
    attendance: { invited: 80, attended: 65 },
  },
  {
    id: 'm6',
    title: 'Siddipet Core Team Meeting',
    date: '2025-11-18',
    status: 'Completed',
    attendance: { invited: 10, attended: 9 },
  },
];

export const ReportsDashboardScreen: React.FC = () => {
  const colors = useTheme();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIssues = DEMO_ISSUES.length;
    const openIssues = DEMO_ISSUES.filter(i => i.status === 'Open').length;
    const highPriorityOpen = DEMO_ISSUES.filter(
      i => i.status === 'Open' && i.priority === 'High',
    ).length;

    // Hot issues (High priority + oldest createdAt)
    const hotIssues = DEMO_ISSUES.filter(
      i => i.status === 'Open' && i.priority === 'High',
    )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .slice(0, 3);

    // Pending by area
    const pendingByArea: Record<string, number> = {};
    DEMO_ISSUES.filter(i => i.status === 'Open').forEach(issue => {
      const key = `${issue.area.mandal} - Ward ${issue.area.ward}`;
      pendingByArea[key] = (pendingByArea[key] || 0) + 1;
    });

    // Resolution time analytics
    const resolvedIssues = DEMO_ISSUES.filter(
      i => i.status === 'Resolved' && i.resolvedAt,
    );
    let totalResolutionHours = 0;
    resolvedIssues.forEach(issue => {
      if (issue.resolvedAt) {
        const created = new Date(issue.createdAt).getTime();
        const resolved = new Date(issue.resolvedAt).getTime();
        const hours = (resolved - created) / (1000 * 60 * 60);
        totalResolutionHours += hours;
      }
    });
    const avgResolutionHours =
      resolvedIssues.length > 0
        ? (totalResolutionHours / resolvedIssues.length).toFixed(1)
        : '0';

    // Meetings summary
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthMeetings = DEMO_MEETINGS.filter(m => {
      const meetingDate = new Date(m.date);
      return (
        meetingDate.getMonth() === currentMonth &&
        meetingDate.getFullYear() === currentYear
      );
    });
    const completedThisMonth = thisMonthMeetings.filter(
      m => m.status === 'Completed',
    ).length;
    const totalInvited = DEMO_MEETINGS.reduce(
      (sum, m) => sum + (m.attendance?.invited || 0),
      0,
    );
    const totalAttended = DEMO_MEETINGS.reduce(
      (sum, m) => sum + (m.attendance?.attended || 0),
      0,
    );
    const attendanceRatio =
      totalInvited > 0
        ? ((totalAttended / totalInvited) * 100).toFixed(1)
        : '0';

    return {
      totalIssues,
      openIssues,
      highPriorityOpen,
      hotIssues,
      pendingByArea,
      avgResolutionHours,
      thisMonthMeetings: thisMonthMeetings.length,
      completedThisMonth,
      attendanceRatio,
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return colors.danger;
      case 'Medium':
        return colors.warning;
      case 'Low':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    metricCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricLabel: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    hotIssueCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
    },
    hotIssueTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    hotIssueDetails: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    priorityText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.surface,
    },
    areaItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    areaName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    areaCount: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    analyticsCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    analyticsText: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    analyticsValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Reports & Dashboard</Text>

        {/* Hot Issues Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hot Issues Summary</Text>
          <View style={styles.metricCard}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Issues</Text>
              <Text style={styles.metricValue}>{stats.totalIssues}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Open Issues</Text>
              <Text style={styles.metricValue}>{stats.openIssues}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>High Priority Open</Text>
              <Text style={[styles.metricValue, { color: colors.danger }]}>
                {stats.highPriorityOpen}
              </Text>
            </View>
          </View>

          {stats.hotIssues.length > 0 && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: 16, marginTop: 8, marginBottom: 12 },
                ]}
              >
                Top 3 Hot Issues
              </Text>
              {stats.hotIssues.map(issue => (
                <View
                  key={issue.id}
                  style={[
                    styles.hotIssueCard,
                    { borderLeftColor: getPriorityColor(issue.priority) },
                  ]}
                >
                  <Text style={styles.hotIssueTitle}>{issue.title}</Text>
                  <Text style={styles.hotIssueDetails}>
                    {issue.area.mandal} - Ward {issue.area.ward}
                  </Text>
                  <Text style={styles.hotIssueDetails}>
                    Created:{' '}
                    {new Date(issue.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(issue.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{issue.priority}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Pending by Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending by Area</Text>
          {Object.entries(stats.pendingByArea).length > 0 ? (
            Object.entries(stats.pendingByArea).map(([area, count]) => (
              <View key={area} style={styles.areaItem}>
                <Text style={styles.areaName}>{area}</Text>
                <Text style={styles.areaCount}>{count} pending</Text>
              </View>
            ))
          ) : (
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>No pending issues</Text>
            </View>
          )}
        </View>

        {/* Resolution Time Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resolution Time Analytics</Text>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsText}>
              Average resolution time:{' '}
              <Text style={styles.analyticsValue}>
                {stats.avgResolutionHours} hours
              </Text>
            </Text>
          </View>
        </View>

        {/* Meetings Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meetings Summary</Text>
          <View style={styles.metricCard}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Scheduled This Month</Text>
              <Text style={styles.metricValue}>{stats.thisMonthMeetings}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Completed</Text>
              <Text style={styles.metricValue}>{stats.completedThisMonth}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Attendance Ratio</Text>
              <Text style={[styles.metricValue, { color: colors.success }]}>
                {stats.attendanceRatio}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
