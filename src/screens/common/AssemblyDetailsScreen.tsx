import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';
// Import JSON data - using require to avoid bundling issues with large files
const assembliesData = require('../../mocks/assemblies_clean_with_extra_updated.json');

interface PositionData {
  position: number;
  name: string;
  votes: number;
  votesPercent: string;
  party: string;
}

interface YearData {
  [year: string]: PositionData[];
}

interface AnalysisData {
  assembly: string;
  bjp_gain_percent: string;
  ThirdPartyGained: string;
  'Wave seat': string;
  'Extra Information': string;
  wiki_results?: {
    [year: string]: {
      winner: string;
      party: string;
      votes: number;
      percent: number;
      majority: number;
    };
  };
}

interface AssemblyData {
  assembly: string;
  years: YearData;
  analysis: AnalysisData;
}

export const AssemblyDetailsScreen = (): React.ReactElement => {
  const route = useRoute();
  const navigation = useNavigation();
  const colors = useTheme();
  const { assemblyName } = (route.params as { assemblyName?: string }) || {};

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(true); // Default to true

  // Find the assembly data
  const assemblyData = useMemo(() => {
    if (!assemblyName) return null;
    const data = (assembliesData as any).assemblies || assembliesData;
    // Try exact match first
    let found = data.find((a: any) => a.assembly === assemblyName);
    if (found) return found;

    // Try matching by removing suffixes like (ST), (SC) from both
    const cleanAssemblyName = assemblyName
      .replace(/\s*\([^)]*\)\s*$/, '')
      .trim();
    found = data.find((a: any) => {
      const cleanDataName = a.assembly.replace(/\s*\([^)]*\)\s*$/, '').trim();
      return (
        cleanDataName === cleanAssemblyName ||
        cleanDataName.toLowerCase() === cleanAssemblyName.toLowerCase()
      );
    });
    if (found) return found;

    // Try case-insensitive partial match
    found = data.find((a: any) => {
      const cleanDataName = a.assembly.replace(/\s*\([^)]*\)\s*$/, '').trim();
      return (
        cleanDataName.toLowerCase().includes(cleanAssemblyName.toLowerCase()) ||
        cleanAssemblyName.toLowerCase().includes(cleanDataName.toLowerCase())
      );
    });

    return found || null;
  }, [assemblyName]);

  // Get available years
  const availableYears = useMemo(() => {
    if (!assemblyData) return [];
    return Object.keys(assemblyData.years).sort(
      (a, b) => Number(b) - Number(a),
    );
  }, [assemblyData]);

  // Get position data for selected year (only positions 1-5)
  const positionData = useMemo(() => {
    if (!assemblyData || !selectedYear) return [];
    const yearData = assemblyData.years[selectedYear] || [];
    // Filter to get unique positions 1-5 (take first occurrence of each position)
    const positions = [1, 2, 3, 4, 5];
    return positions
      .map(pos => yearData.find((item: PositionData) => item.position === pos))
      .filter(Boolean) as PositionData[];
  }, [assemblyData, selectedYear]);

  // Auto-select first year if available
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear && !showMoreInfo) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear, showMoreInfo]);

  // Helper to clean candidate names like "Kalvakuntla Chandrashekar Rao 111"
  const getCleanCandidateName = (rawName: string | null | undefined): string => {
    if (!rawName) {
      return '';
    }
    // Remove trailing numeric tokens (e.g., " 111", " 325")
    return rawName.replace(/\s+\d+$/, '').trim();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        backButton: {
          marginRight: 12,
          padding: 8,
        },
        headerTitle: {
          flex: 1,
          fontSize: 20,
          fontWeight: '800',
          color: colors.textPrimary,
          letterSpacing: -0.3,
        },
        content: {
          padding: 20,
        },
        sectionTitle: {
          fontSize: 20,
          fontWeight: '800',
          color: colors.textPrimary,
          marginBottom: 16,
          letterSpacing: -0.3,
        },
        yearButtonsContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        },
        yearButton: {
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          minWidth: 80,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
        },
        yearButtonActive: {
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}15`,
        },
        yearButtonText: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.textSecondary,
        },
        yearButtonTextActive: {
          color: colors.primary,
          fontWeight: '800',
        },
        positionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        },
        positionBadge: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        },
        positionBadgeWinner: {
          backgroundColor: '#27AE60', // Green for Winner
        },
        positionBadgeLoser: {
          backgroundColor: '#E74C3C', // Red for Loser/Runner
        },
        positionBadgeThird: {
          backgroundColor: '#C0C0C0', // Silver for 3rd
        },
        positionBadgeFourth: {
          backgroundColor: '#9B59B6', // Purple for 4th
        },
        positionBadgeFifth: {
          backgroundColor: '#3498DB', // Blue for 5th
        },
        positionBadgeText: {
          color: colors.textPrimary,
          fontWeight: '800',
          fontSize: 16,
        },
        positionName: {
          flex: 1,
          fontSize: 18,
          fontWeight: '700',
          color: colors.textPrimary,
          letterSpacing: -0.2,
        },
        positionDetails: {
          marginTop: 8,
        },
        detailRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        detailLabel: {
          fontSize: 14,
          color: colors.textSecondary,
          fontWeight: '600',
        },
        detailValue: {
          fontSize: 14,
          color: colors.textPrimary,
          fontWeight: '700',
        },
        partyBadge: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: `${colors.primary}20`,
          alignSelf: 'flex-start',
          marginTop: 8,
        },
        partyText: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.primary,
        },
        infoLabel: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.primary,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        },
        infoValue: {
          fontSize: 15,
          color: colors.textPrimary,
          fontWeight: '600',
          lineHeight: 24,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        },
        emptyState: {
          padding: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        emptyStateText: {
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          fontWeight: '600',
        },
      }),
    [colors],
  );

  // Render empty states or main content
  if (!assemblyName) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assembly Details</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No assembly selected</Text>
        </View>
      </View>
    );
  }

  if (!assemblyData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assembly Details</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Assembly data not found for: {assemblyName}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {assemblyData.assembly}
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Combined Section with All Information */}
        <View>
          <Text style={styles.sectionTitle}>📊 Assembly Information</Text>

          {/* Year Selection and More Info Button */}
          <View style={{ marginBottom: 20 }}>
            <View style={styles.yearButtonsContainer}>
              {availableYears.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearButton,
                    selectedYear === year && styles.yearButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowMoreInfo(false); // Hide more info when year is selected
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.yearButtonText,
                      selectedYear === year && styles.yearButtonTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.yearButton,
                  showMoreInfo && styles.yearButtonActive,
                ]}
                onPress={() => {
                  setShowMoreInfo(true);
                  setSelectedYear(null); // Clear year selection when more info is selected
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="info-outline"
                  size={16}
                  color={
                    showMoreInfo ? colors.textPrimary : colors.textSecondary
                  }
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.yearButtonText,
                    showMoreInfo && styles.yearButtonTextActive,
                  ]}
                >
                  More info
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Position Results - Winner, Runner, 3rd, 4th, 5th */}
          {selectedYear && !showMoreInfo && positionData.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              {positionData.map((position, index) => {
                // Get position label
                const getPositionLabel = (pos: number) => {
                  switch (pos) {
                    case 1:
                      return 'Winner';
                    case 2:
                      return 'Runner';
                    case 3:
                      return '3rd Position';
                    case 4:
                      return '4th Position';
                    case 5:
                      return '5th Position';
                    default:
                      return `Position ${pos}`;
                  }
                };

                // Get badge style based on position
                const getBadgeStyle = (pos: number) => {
                  switch (pos) {
                    case 1:
                      return styles.positionBadgeWinner; // Green for Winner
                    case 2:
                      return styles.positionBadgeLoser; // Red for Runner/Loser
                    case 3:
                      return styles.positionBadgeThird; // Silver for 3rd
                    case 4:
                      return styles.positionBadgeFourth; // Purple for 4th
                    case 5:
                      return styles.positionBadgeFifth; // Blue for 5th
                    default:
                      return {};
                  }
                };

                // Get text color for badge (white for colored badges, primary for others)
                const getBadgeTextColor = (pos: number) => {
                  return pos <= 5 ? '#FFFFFF' : colors.textPrimary;
                };

                // Party color mapping
                const partyName = (position.party || '').toLowerCase();
                let partyBg = `${colors.primary}20`;
                let partyTextColor = colors.primary;

                if (partyName.includes('congress')) {
                  // Indian National Congress
                  partyBg = '#E0F0FF'; // light blue
                  partyTextColor = '#1565C0';
                } else if (
                  partyName.includes('bharat rashtra samithi') ||
                  partyName.includes('telangana rashtra samithi') ||
                  partyName === 'brs' ||
                  partyName === 'trs'
                ) {
                  // BRS / TRS
                  partyBg = '#FFE0F0'; // light pink
                  partyTextColor = '#C2185B';
                } else if (
                  partyName.includes('bharatiya janata party') ||
                  partyName === 'bjp'
                ) {
                  // BJP - solid orange with white text
                  partyBg = '#FF9800';
                  partyTextColor = '#FFFFFF';
                }

                return (
                  <View
                    key={`${position.position}-${index}`}
                    style={{ marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  >
                    <View style={styles.positionHeader}>
                      <View
                        style={[
                          styles.positionBadge,
                          getBadgeStyle(position.position),
                        ]}
                      >
                        <Text
                          style={[
                            styles.positionBadgeText,
                            { color: getBadgeTextColor(position.position) },
                          ]}
                        >
                          {position.position}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.positionName}>
                          {getCleanCandidateName(position.name)}
                        </Text>
                        {position.position === 1 ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginTop: 2,
                            }}
                          >
                            <MaterialIcons
                              name="emoji-events"
                              size={14}
                              color={colors.primary}
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                color: colors.textSecondary,
                                fontWeight: '700',
                              }}
                            >
                              {getPositionLabel(position.position)}
                            </Text>
                          </View>
                        ) : (
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.textSecondary,
                              fontWeight: '600',
                              marginTop: 2,
                            }}
                          >
                            {getPositionLabel(position.position)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.positionDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Votes:</Text>
                        <Text style={styles.detailValue}>
                          {position.votes.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Vote Percentage:</Text>
                        <Text style={styles.detailValue}>
                          {position.votesPercent}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.partyBadge,
                          { backgroundColor: partyBg },
                        ]}
                      >
                        <Text
                          style={[styles.partyText, { color: partyTextColor }]}
                        >
                          {position.party}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Analysis Information - Shown when "More info" is selected */}
          {showMoreInfo && assemblyData?.analysis && (
            <>
              {/* Third Party Gained and Wave Seat - Side by Side */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 16,
                  marginBottom: 24,
                  paddingBottom: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                {/* Third Party Gained */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <MaterialIcons
                      name="trending-up"
                      size={18}
                      color={colors.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.infoLabel,
                        { fontSize: 12, marginBottom: 0 },
                      ]}
                    >
                      3rd Party (↑)
                    </Text>
                  </View>
                  <Text
                    style={[styles.infoValue, { fontSize: 15, lineHeight: 22 }]}
                  >
                    {assemblyData.analysis.ThirdPartyGained || 'N/A'}
                  </Text>
                </View>

                {/* Wave Seat with Red Flag */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <MaterialIcons
                      name="flag"
                      size={18}
                      color={colors.danger}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          fontSize: 12,
                          marginBottom: 0,
                          color: colors.danger,
                        },
                      ]}
                    >
                      Wave Seat
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        fontSize: 15,
                        lineHeight: 22,
                        color: colors.danger,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {assemblyData.analysis['Wave seat'] || 'N/A'}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <MaterialIcons
                    name="info"
                    size={18}
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.infoLabel,
                      { fontSize: 13, marginBottom: 0 },
                    ]}
                  >
                    Extra Information
                  </Text>
                </View>
                {(() => {
                  const extraInfo =
                    assemblyData.analysis['Extra Information'] || 'N/A';
                  // Split by bullet points or newlines
                  const bulletPoints = extraInfo
                    .split(/\n|•/)
                    .map((point: string) => point.trim())
                    .filter((point: string) => point.length > 0);

                  return bulletPoints.length > 1 ? (
                    <View style={{ gap: 8 }}>
                      {bulletPoints.map((point: string, index: number) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              color: colors.primary,
                              fontWeight: '700',
                              marginTop: 2,
                            }}
                          >
                            •
                          </Text>
                          <Text
                            style={[
                              styles.infoValue,
                              { fontSize: 16, lineHeight: 26, flex: 1 },
                            ]}
                          >
                            {point}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.infoValue,
                        { fontSize: 16, lineHeight: 26 },
                      ]}
                    >
                      {extraInfo}
                    </Text>
                  );
                })()}
              </View>

            </>
          )}

          {/* Show message if no analysis data available */}
          {showMoreInfo && !assemblyData?.analysis && (
            <View
              style={{
                marginTop: 0,
                marginBottom: 16,
                paddingVertical: 16,
              }}
            >
              <Text
                style={[styles.infoValue, { fontSize: 15, lineHeight: 24, color: colors.textSecondary }]}
              >
                Analysis information not available for this assembly.
              </Text>
            </View>
          )}

          {/* Wiki Results */}
          {assemblyData.analysis?.wiki_results && (
            <View style={{ marginTop: 20 }}>
              {Object.entries(assemblyData.analysis.wiki_results)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, result]: [string, any]) => (
                  <View
                    key={year}
                    style={{
                      marginTop: 0,
                      marginBottom: 20,
                      paddingBottom: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View style={styles.positionHeader}>
                      <View style={styles.positionBadge}>
                        <Text style={styles.positionBadgeText}>{year}</Text>
                      </View>
                      <Text style={styles.positionName}>{result.winner}</Text>
                    </View>
                    <View style={styles.positionDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Party:</Text>
                        <Text style={styles.detailValue}>{result.party}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Votes:</Text>
                        <Text style={styles.detailValue}>
                          {result.votes.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Percentage:</Text>
                        <Text style={styles.detailValue}>
                          {result.percent}%
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Majority:</Text>
                        <Text style={styles.detailValue}>
                          {result.majority.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
