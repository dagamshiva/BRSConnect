import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryTooltip,
} from "victory-native";

import type { HighlightedSegment } from "../types";
import { colors } from "../theme/colors";

interface Props {
  segment: HighlightedSegment;
}

export const WinningSegmentChart = ({ segment }: Props): JSX.Element => {
  const data = useMemo(
    () => [
      { x: "Win", y: segment.counts.win, fill: colors.success },
      { x: "Lose", y: segment.counts.lose, fill: colors.danger },
      { x: "Can't Say", y: segment.counts.cantSay, fill: colors.warning },
    ],
    [segment],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{segment.segmentName}</Text>
      <Text style={styles.candidate}>Candidate: {segment.candidate}</Text>

      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={40}
        height={250}
        padding={{ top: 40, bottom: 60, left: 60, right: 40 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: colors.border },
            tickLabels: { fill: colors.textSecondary, fontSize: 14 },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(value) => `${value}`}
          style={{
            axis: { stroke: colors.border },
            grid: { stroke: colors.border, strokeDasharray: "4 4" },
            tickLabels: { fill: colors.textSecondary, fontSize: 12 },
          }}
        />
        <VictoryBar
          data={data}
          labels={({ datum }) => `${datum.x}: ${datum.y}`}
          labelComponent={
            <VictoryTooltip
              flyoutStyle={{ fill: colors.surface, stroke: colors.border }}
              style={{ fill: colors.textPrimary, fontSize: 12 }}
            />
          }
          style={{
            data: {
              fill: ({ datum }) => datum.fill,
              width: 36,
              borderRadius: 6,
            },
          }}
        />
      </VictoryChart>

      <View style={styles.metaRow}>
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
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  candidate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  updated: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
import { StyleSheet, Text, View } from "react-native";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
} from "victory-native";

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
        theme={VictoryTheme.material}
        domainPadding={40}
        height={240}
        padding={{ top: 36, bottom: 48, left: 56, right: 24 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: colors.border },
            tickLabels: { fill: colors.textSecondary, fontSize: 12 },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: colors.border },
            grid: { stroke: "#2a2a2a" },
            tickLabels: { fill: colors.textSecondary, fontSize: 12 },
          }}
        />
        <VictoryBar
          data={data}
          style={{
            data: {
              fill: ({ datum }) => datum.fill,
              width: 32,
              borderRadius: 6,
            },
          }}
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

