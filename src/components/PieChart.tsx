import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: PieChartData[];
  title?: string;
  size?: number;
}

// Helper function to create arc path
const createArc = (
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
  centerX: number,
  centerY: number,
): string => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const startRad = toRadians(startAngle);
  const endRad = toRadians(endAngle);

  const x1 = centerX + outerRadius * Math.cos(startRad);
  const y1 = centerY + outerRadius * Math.sin(startRad);
  const x2 = centerX + outerRadius * Math.cos(endRad);
  const y2 = centerY + outerRadius * Math.sin(endRad);

  const x3 = centerX + innerRadius * Math.cos(endRad);
  const y3 = centerY + innerRadius * Math.sin(endRad);
  const x4 = centerX + innerRadius * Math.cos(startRad);
  const y4 = centerY + innerRadius * Math.sin(startRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
};

export const PieChart = ({
  data,
  title = 'Party Distribution',
  size = 200,
}: Props): React.ReactElement => {
  const colors = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const dynamicStyles = StyleSheet.create({
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 16,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 20,
      fontWeight: '600',
      letterSpacing: -0.1,
    },
    legendText: {
      fontSize: 13,
      color: colors.textPrimary,
      flex: 1,
      fontWeight: '600',
      letterSpacing: -0.1,
    },
  });

  if (total === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={dynamicStyles.title}>{title}</Text>}
        <Text style={dynamicStyles.emptyText}>No data available</Text>
      </View>
    );
  }

  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.35;
  const innerRadius = size * 0.15;
  const labelRadius = outerRadius * 0.65;

  // Convert data to paths
  let currentAngle = -90; // Start from top
  const segments: Array<{
    path: string;
    color: string;
    label: string;
    value: number;
    percentage: number;
    midAngle: number;
  }> = [];

  data.forEach((item) => {
    if (item.value === 0) return;

    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const midAngle = currentAngle + angle / 2;

    const path = createArc(
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
      centerX,
      centerY,
    );

    segments.push({
      path,
      color: item.color,
      label: item.label,
      value: item.value,
      percentage: Math.round(percentage),
      midAngle,
    });

    currentAngle = endAngle;
  });

  // Helper to get label position
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const getLabelPosition = (angle: number) => {
    const rad = toRadians(angle);
    return {
      x: centerX + labelRadius * Math.cos(rad),
      y: centerY + labelRadius * Math.sin(rad),
    };
  };

  return (
    <View style={styles.container}>
      {title && <Text style={dynamicStyles.title}>{title}</Text>}
      <View style={styles.chartContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G>
            {segments.map((segment, index) => (
              <Path
                key={index}
                d={segment.path}
                fill={segment.color}
                stroke={colors.surface}
                strokeWidth={2}
              />
            ))}
          </G>
          {/* Labels for segments with > 5% */}
          {segments
            .filter((segment) => segment.percentage > 5)
            .map((segment, index) => {
              const pos = getLabelPosition(segment.midAngle);
              return (
                <SvgText
                  key={`label-${index}`}
                  x={pos.x}
                  y={pos.y}
                  fontSize={size * 0.055}
                  fontWeight="700"
                  fill={colors.textPrimary}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {segment.percentage}%
                </SvgText>
              );
            })}
        </Svg>
      </View>
      <View style={styles.legend}>
        {data.map((item, index) => {
          const percentage =
            total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Text style={dynamicStyles.legendText}>
                {item.label}: {item.value} ({percentage}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 160,
  },
  legend: {
    width: '100%',
    marginTop: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
