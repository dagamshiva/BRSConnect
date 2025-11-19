import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { VictoryBar, VictoryChart } from "victory-native";

import { HighlightedSegment } from "../types";
import { colors } from "../theme/colors";

interface Props {
  segment: HighlightedSegment;
}

export const WinningSegmentChart = ({ segment }: Props): JSX.Element => {
  const data = [
    { x: "Win", y: segment.counts.win, fill: colors.success },
    { x: "Lose", y: segment.counts.lose, fill: colors.danger },
    { x: "Can't Say", y: segment.counts.cantSay, fill: colors.warning },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{segment.segmentName}</Text>
      <Text style={styles.subtitle}>Candidate: {segment.candidate}</Text>

      <VictoryChart
        domainPadding={40}
        height={240}
        padding={{ top: 36, bottom: 48, left: 40, right: 24 }}
      >
        <VictoryBar
          data={data}
          style={{
            data: {
              fill: ({ datum }) => datum.fill,
              width: 32,
              borderRadius: 6,
            },
          }}
          labels={({ datum }) => `${datum.y}`}
          animate={{ duration: 600 }}
        />
      </VictoryChart>

      <View style={styles.footer}>
        <Text style={styles.infoText}>
          Sample Size: {segment.sampleSize.toLocaleString()}
        </Text>
        <Text style={styles.infoText}>Source: {segment.source}</Text>
      </View>
      <Text style={styles.updated}>
        Last Updated: {new Date(segment.lastUpdated).toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  updated: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});

