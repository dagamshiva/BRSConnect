import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import {
  selectIsSuperAdmin,
  selectIsLocalAdmin,
} from '../../store/slices/authSlice';
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

// Demo Data
const DEMO_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Ward 7 Core Team Weekly Review',
    type: 'Small/Core',
    date: '2025-11-30',
    time: '18:30',
    location: 'Ward 7 Office',
    expectedSize: 12,
    agenda: ['Review top 5 issues', 'Assign volunteers', 'Plan public meeting'],
    status: 'Scheduled',
    attendance: { invited: 12, attended: 0 },
    actionItems: [
      {
        id: 'a1',
        text: 'Follow up on water supply complaint',
        ownerName: 'Suresh',
        dueDate: '2025-12-02',
        status: 'Open',
      },
    ],
  },
  {
    id: 'm2',
    title: 'Ramagundam Mandal Cadre Meeting',
    type: 'Cadre',
    date: '2025-12-05',
    time: '10:00',
    location: 'Mandal Office, Ramagundam',
    expectedSize: 45,
    agenda: [
      'Quarterly review',
      'New volunteer onboarding',
      'Upcoming events planning',
    ],
    status: 'Scheduled',
    attendance: { invited: 45, attended: 0 },
  },
  {
    id: 'm3',
    title: 'Public Grievance Hearing - Ward 9',
    type: 'Public',
    date: '2025-12-10',
    time: '14:00',
    location: 'Community Hall, Ward 9',
    expectedSize: 100,
    agenda: [
      'Address public complaints',
      'Infrastructure updates',
      'Q&A session',
    ],
    status: 'Scheduled',
    attendance: { invited: 100, attended: 0 },
  },
  {
    id: 'm4',
    title: 'Chennur Ward Leaders Coordination',
    type: 'Small/Core',
    date: '2025-12-15',
    time: '16:00',
    location: 'Chennur Office',
    expectedSize: 8,
    agenda: ['Coordination strategy', 'Resource allocation'],
    status: 'Scheduled',
    attendance: { invited: 8, attended: 0 },
  },
  {
    id: 'm5',
    title: 'Monthly Review Meeting - November',
    type: 'Cadre',
    date: '2025-11-25',
    time: '11:00',
    location: 'District Office',
    expectedSize: 30,
    agenda: ['November achievements', 'December planning', 'Budget review'],
    status: 'Completed',
    attendance: { invited: 30, attended: 28 },
    actionItems: [
      {
        id: 'a2',
        text: 'Complete pending water connections',
        ownerName: 'Rajesh',
        dueDate: '2025-12-01',
        status: 'Open',
      },
      {
        id: 'a3',
        text: 'Submit monthly report',
        ownerName: 'Priya',
        dueDate: '2025-11-30',
        status: 'Done',
      },
    ],
  },
  {
    id: 'm6',
    title: 'Ward 5 Public Meeting',
    type: 'Public',
    date: '2025-11-20',
    time: '15:00',
    location: 'Ward 5 Community Center',
    expectedSize: 80,
    agenda: ['Road repair updates', 'Water supply issues', 'Public feedback'],
    status: 'Completed',
    attendance: { invited: 80, attended: 65 },
  },
  {
    id: 'm7',
    title: 'Siddipet Core Team Meeting',
    type: 'Small/Core',
    date: '2025-11-18',
    time: '17:00',
    location: 'Siddipet Office',
    expectedSize: 10,
    agenda: ['Local issues discussion', 'Action plan'],
    status: 'Completed',
    attendance: { invited: 10, attended: 9 },
  },
  {
    id: 'm8',
    title: 'Bellampalli Mandal Coordination Meeting',
    type: 'Cadre',
    date: '2025-12-08',
    time: '11:00',
    location: 'Bellampalli Mandal Office',
    expectedSize: 35,
    agenda: [
      'Mining area concerns',
      'Labor union coordination',
      'Safety measures review',
    ],
    status: 'Scheduled',
    attendance: { invited: 35, attended: 0 },
  },
  {
    id: 'm9',
    title: 'Chennur Public Grievance Session',
    type: 'Public',
    date: '2025-12-12',
    time: '15:30',
    location: 'Chennur Community Center',
    expectedSize: 120,
    agenda: [
      'Public complaints resolution',
      'Infrastructure development updates',
      'Citizen feedback collection',
    ],
    status: 'Scheduled',
    attendance: { invited: 120, attended: 0 },
  },
  {
    id: 'm10',
    title: 'Siddipet Ward Leaders Monthly Review',
    type: 'Small/Core',
    date: '2025-12-18',
    time: '19:00',
    location: 'Siddipet Ward Office',
    expectedSize: 15,
    agenda: [
      'Monthly performance review',
      'Next month planning',
      'Resource allocation',
    ],
    status: 'Scheduled',
    attendance: { invited: 15, attended: 0 },
  },
  {
    id: 'm11',
    title: 'Gajwel Assembly Segment Review',
    type: 'Cadre',
    date: '2025-12-20',
    time: '10:00',
    location: 'Gajwel Assembly Office',
    expectedSize: 50,
    agenda: [
      'Assembly segment performance',
      'Key achievements discussion',
      'Future roadmap planning',
    ],
    status: 'Scheduled',
    attendance: { invited: 50, attended: 0 },
  },
  {
    id: 'm12',
    title: 'Bellampalli Ward 5 Public Meeting',
    type: 'Public',
    date: '2025-11-28',
    time: '16:00',
    location: 'Bellampalli Ward 5 Community Hall',
    expectedSize: 90,
    agenda: [
      'Coal mine safety concerns',
      'Worker welfare',
      'Local development',
    ],
    status: 'Completed',
    attendance: { invited: 90, attended: 78 },
  },
  {
    id: 'm13',
    title: 'Chennur Core Team Strategy Session',
    type: 'Small/Core',
    date: '2025-11-22',
    time: '18:00',
    location: 'Chennur Office',
    expectedSize: 12,
    agenda: [
      'Strategic planning',
      'Resource mobilization',
      'Community engagement',
    ],
    status: 'Completed',
    attendance: { invited: 12, attended: 11 },
  },
  {
    id: 'm14',
    title: 'Siddipet Mandal Cadre Assembly',
    type: 'Cadre',
    date: '2025-11-15',
    time: '14:00',
    location: 'Siddipet Mandal Office',
    expectedSize: 40,
    agenda: ['Cadre strength review', 'Training programs', 'Field assignments'],
    status: 'Completed',
    attendance: { invited: 40, attended: 36 },
  },
  {
    id: 'm15',
    title: 'Gajwel Village Leaders Coordination',
    type: 'Small/Core',
    date: '2025-12-22',
    time: '17:30',
    location: 'Gajwel Village Office',
    expectedSize: 20,
    agenda: [
      'Village development plans',
      'Infrastructure projects',
      'Public welfare',
    ],
    status: 'Scheduled',
    attendance: { invited: 20, attended: 0 },
  },
];

type TabType = 'Upcoming' | 'Past';

export const MeetingsScreen: React.FC = () => {
  const colors = useTheme();
  const navigation = useNavigation();
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const isLocalAdmin = useAppSelector(selectIsLocalAdmin);
  const [activeTab, setActiveTab] = useState<TabType>('Upcoming');

  const userRole = isSuperAdmin
    ? 'superAdmin'
    : isLocalAdmin
    ? 'localAdmin'
    : 'member';

  const filteredMeetings = useMemo(() => {
    if (activeTab === 'Upcoming') {
      return DEMO_MEETINGS.filter(m => m.status === 'Scheduled');
    } else {
      return DEMO_MEETINGS.filter(m => m.status === 'Completed');
    }
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 20,
      letterSpacing: -0.5,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabButtonActive: {
      backgroundColor: `${colors.primary}20`,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    meetingCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    meetingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    meetingTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    typeBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    typeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.surface,
    },
    meetingDateTime: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    meetingLocation: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    expectedSize: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    agendaContainer: {
      marginBottom: 12,
    },
    agendaTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    agendaItem: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 8,
      marginBottom: 4,
    },
    detailsButton: {
      backgroundColor: `${colors.primary}20`,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    detailsButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  const renderMeetingItem = ({ item }: { item: Meeting }) => (
    <View style={styles.meetingCard}>
      <View style={styles.meetingHeader}>
        <Text style={styles.meetingTitle}>{item.title}</Text>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(item.type) },
          ]}
        >
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>
      <Text style={styles.meetingDateTime}>
        {formatDate(item.date)} • {item.time}
      </Text>
      <Text style={styles.meetingLocation}>
        <MaterialIcons
          name="location-on"
          size={14}
          color={colors.textSecondary}
        />{' '}
        {item.location}
      </Text>
      <Text style={styles.expectedSize}>
        Expected: {item.expectedSize} members
      </Text>
      {item.agenda && item.agenda.length > 0 && (
        <View style={styles.agendaContainer}>
          <Text style={styles.agendaTitle}>Agenda:</Text>
          {item.agenda.map((agendaItem, index) => (
            <Text key={index} style={styles.agendaItem}>
              • {agendaItem}
            </Text>
          ))}
        </View>
      )}
      {activeTab === 'Upcoming' && (
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => {
            const screenName = `${userRole}-MeetingDetail`;
            (navigation as any).navigate(screenName, { meeting: item });
          }}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Meetings & Events</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'Upcoming' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('Upcoming')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Upcoming' && styles.tabTextActive,
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'Past' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('Past')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Past' && styles.tabTextActive,
              ]}
            >
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {filteredMeetings.length > 0 ? (
          <FlatList
            data={filteredMeetings}
            renderItem={renderMeetingItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No {activeTab.toLowerCase()} meetings found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
