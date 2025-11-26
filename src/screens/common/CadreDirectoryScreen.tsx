import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Linking,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/useTheme';

// Types
interface Area {
  district: string;
  mandal: string;
  ward: string;
}

interface CadreMember {
  id: string;
  name: string;
  phone: string;
  role: string;
  area: Area;
  skills: string[];
  availability: 'Available' | 'Busy' | 'On Field';
}

// Demo Data
const DEMO_CADRE: CadreMember[] = [
  {
    id: 'c1',
    name: 'Rajesh Kumar',
    phone: '+919876543210',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Ramagundam', ward: '7' },
    skills: ['Negotiation', 'Public Speaking'],
    availability: 'Available',
  },
  {
    id: 'c2',
    name: 'Priya Sharma',
    phone: '+919876543211',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Ramagundam', ward: '9' },
    skills: ['Community Outreach', 'Data Collection'],
    availability: 'Busy',
  },
  {
    id: 'c3',
    name: 'Suresh Reddy',
    phone: '+919876543212',
    role: 'Mandal Coordinator',
    area: { district: 'Peddapalli', mandal: 'Ramagundam', ward: '5' },
    skills: ['Leadership', 'Event Management'],
    availability: 'On Field',
  },
  {
    id: 'c4',
    name: 'Anjali Patel',
    phone: '+919876543213',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '3' },
    skills: ['Public Speaking', 'Social Media'],
    availability: 'Available',
  },
  {
    id: 'c5',
    name: 'Kiran Naik',
    phone: '+919876543214',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '12' },
    skills: ['Data Collection', 'Field Work'],
    availability: 'Available',
  },
  {
    id: 'c6',
    name: 'Lakshmi Devi',
    phone: '+919876543215',
    role: 'Mandal Coordinator',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '8' },
    skills: ['Negotiation', 'Leadership'],
    availability: 'Busy',
  },
  {
    id: 'c7',
    name: 'Venkatesh Rao',
    phone: '+919876543216',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Ramagundam', ward: '10' },
    skills: ['Public Speaking', 'Event Management'],
    availability: 'On Field',
  },
  {
    id: 'c8',
    name: 'Meera Singh',
    phone: '+919876543217',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '4' },
    skills: ['Community Outreach', 'Social Media'],
    availability: 'Available',
  },
  {
    id: 'c9',
    name: 'Ravi Kumar',
    phone: '+919876543218',
    role: 'Mandal Coordinator',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '15' },
    skills: ['Leadership', 'Negotiation'],
    availability: 'Available',
  },
  {
    id: 'c10',
    name: 'Sunita Reddy',
    phone: '+919876543219',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '6' },
    skills: ['Event Management', 'Public Speaking'],
    availability: 'Busy',
  },
  {
    id: 'c11',
    name: 'Mohan Das',
    phone: '+919876543220',
    role: 'Mandal Coordinator',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '5' },
    skills: ['Labor Relations', 'Safety Management'],
    availability: 'Available',
  },
  {
    id: 'c12',
    name: 'Kavitha Reddy',
    phone: '+919876543221',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '4' },
    skills: ['Data Collection', 'Field Work'],
    availability: 'Available',
  },
  {
    id: 'c13',
    name: 'Ramesh Kumar',
    phone: '+919876543222',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '7' },
    skills: ['Negotiation', 'Community Outreach'],
    availability: 'On Field',
  },
  {
    id: 'c14',
    name: 'Sita Devi',
    phone: '+919876543223',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Bellampalli', ward: '3' },
    skills: ['Voter Registration', 'Awareness Campaigns'],
    availability: 'Available',
  },
  {
    id: 'c15',
    name: 'Nageshwar Rao',
    phone: '+919876543224',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '2' },
    skills: ['Public Speaking', 'Event Management'],
    availability: 'Available',
  },
  {
    id: 'c16',
    name: 'Padma Latha',
    phone: '+919876543225',
    role: 'Mandal Coordinator',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '1' },
    skills: ['Leadership', 'Strategic Planning'],
    availability: 'Busy',
  },
  {
    id: 'c17',
    name: 'Srinivas Reddy',
    phone: '+919876543226',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '6' },
    skills: ['Community Outreach', 'Data Collection'],
    availability: 'Available',
  },
  {
    id: 'c18',
    name: 'Lakshmi Bai',
    phone: '+919876543227',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '7' },
    skills: ['Public Speaking', 'Social Media'],
    availability: 'On Field',
  },
  {
    id: 'c19',
    name: 'Prakash Naidu',
    phone: '+919876543228',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Chennur', ward: '8' },
    skills: ['Field Work', 'Voter Engagement'],
    availability: 'Available',
  },
  {
    id: 'c20',
    name: 'Vijaya Lakshmi',
    phone: '+919876543229',
    role: 'Mandal Coordinator',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '9' },
    skills: ['Leadership', 'Event Management'],
    availability: 'Available',
  },
  {
    id: 'c21',
    name: 'Chandra Sekhar',
    phone: '+919876543230',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '10' },
    skills: ['Negotiation', 'Public Speaking'],
    availability: 'Busy',
  },
  {
    id: 'c22',
    name: 'Radha Kumari',
    phone: '+919876543231',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '11' },
    skills: ['Data Collection', 'Community Outreach'],
    availability: 'Available',
  },
  {
    id: 'c23',
    name: 'Narayana Swamy',
    phone: '+919876543232',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '13' },
    skills: ['Event Management', 'Leadership'],
    availability: 'On Field',
  },
  {
    id: 'c24',
    name: 'Saraswathi Devi',
    phone: '+919876543233',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Siddipet', ward: '14' },
    skills: ['Field Work', 'Voter Registration'],
    availability: 'Available',
  },
  {
    id: 'c25',
    name: 'Krishna Reddy',
    phone: '+919876543234',
    role: 'Mandal Coordinator',
    area: { district: 'Peddapalli', mandal: 'Gajwel', ward: '1' },
    skills: ['Strategic Planning', 'Leadership'],
    availability: 'Available',
  },
  {
    id: 'c26',
    name: 'Geetha Rani',
    phone: '+919876543235',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Gajwel', ward: '2' },
    skills: ['Public Speaking', 'Community Engagement'],
    availability: 'Busy',
  },
  {
    id: 'c27',
    name: 'Rama Krishna',
    phone: '+919876543236',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Gajwel', ward: '4' },
    skills: ['Data Collection', 'Field Work'],
    availability: 'Available',
  },
  {
    id: 'c28',
    name: 'Pushpa Kumari',
    phone: '+919876543237',
    role: 'Ward Leader',
    area: { district: 'Peddapalli', mandal: 'Gajwel', ward: '5' },
    skills: ['Event Management', 'Negotiation'],
    availability: 'On Field',
  },
  {
    id: 'c29',
    name: 'Sathyanarayana',
    phone: '+919876543238',
    role: 'Booth Volunteer',
    area: { district: 'Peddapalli', mandal: 'Gajwel', ward: '8' },
    skills: ['Community Outreach', 'Voter Engagement'],
    availability: 'Available',
  },
  {
    id: 'c30',
    name: 'Kamala Devi',
    phone: '+919876543239',
    role: 'Mandal Coordinator',
    area: { district: 'Peddapalli', mandal: 'Gajwel', ward: '10' },
    skills: ['Leadership', 'Strategic Planning'],
    availability: 'Available',
  },
];

type RoleFilter = 'All' | 'Leaders' | 'Volunteers';

export const CadreDirectoryScreen: React.FC = () => {
  const colors = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');

  const filteredCadre = useMemo(() => {
    let filtered = DEMO_CADRE;

    // Apply role filter
    if (roleFilter === 'Leaders') {
      filtered = filtered.filter(
        c => c.role === 'Ward Leader' || c.role === 'Mandal Coordinator',
      );
    } else if (roleFilter === 'Volunteers') {
      filtered = filtered.filter(c => c.role === 'Booth Volunteer');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.role.toLowerCase().includes(query) ||
          c.area.mandal.toLowerCase().includes(query) ||
          c.area.ward.toLowerCase().includes(query) ||
          c.skills.some(skill => skill.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [searchQuery, roleFilter]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleSMS = (phone: string) => {
    Linking.openURL(`sms:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent('Hello! How can I help you?');
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${message}`);
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
      marginBottom: 20,
    },
    searchContainer: {
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterButtonActive: {
      backgroundColor: `${colors.primary}20`,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterButtonTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    cadreCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cadreHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    cadreName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      flex: 1,
    },
    cadreRoleArea: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    skillBadge: {
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skillText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
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

  const renderCadreItem = ({ item }: { item: CadreMember }) => (
    <View style={styles.cadreCard}>
      <View style={styles.cadreHeader}>
        <Text style={styles.cadreName}>{item.name}</Text>
      </View>
      <Text style={styles.cadreRoleArea}>
        {item.role} • {item.area.mandal} - Ward {item.area.ward}
      </Text>
      <View style={styles.skillsContainer}>
        {item.skills.map((skill, index) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCall(item.phone)}
        >
          <MaterialIcons name="phone" size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSMS(item.phone)}
        >
          <MaterialIcons name="message" size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>SMS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleWhatsApp(item.phone)}
        >
          <MaterialIcons name="chat" size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Cadre Directory</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or area"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          {(['All', 'Leaders', 'Volunteers'] as RoleFilter[]).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                roleFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setRoleFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  roleFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredCadre.length > 0 ? (
          <FlatList
            data={filteredCadre}
            renderItem={renderCadreItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No cadre members found
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No cadre members found matching your search
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
