import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';

interface Props {
  percentage: number; // 0-100 (percentage of "Happy")
  title?: string;
  size?: number;
}

export const GaugeChart = ({
  percentage,
  title = 'BRS Satisfaction',
  size = 200,
}: Props): React.ReactElement => {
  const colors = useTheme();
  
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const notHappyPercentage = 100 - clampedPercentage;

  const radius = size * 0.35;
  const centerX = size / 2;
  const centerY = size * 0.65;
  const strokeWidth = size * 0.08;

  // Helper to convert degrees to radians
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Create semi-circle arc path
  const createArc = (
    startAngle: number,
    endAngle: number,
  ): string => {
    const startRad = toRadians(startAngle);
    const endRad = toRadians(endAngle);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Happy arc (green) - from -180 to calculated happy angle
  const happyAngle = -180 + (clampedPercentage / 100) * 180;
  const happyArc = clampedPercentage > 0 ? createArc(-180, happyAngle) : null;
  
  // Not Happy arc (red) - from happy angle to 0 degrees
  const notHappyArc = notHappyPercentage > 0 ? createArc(happyAngle, 0) : null;

  const dynamicStyles = StyleSheet.create({
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 16,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    legendText: {
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '600',
      letterSpacing: -0.1,
    },
  });

  return (
    <View style={styles.container}>
      {title && <Text style={dynamicStyles.title}>{title}</Text>}
      <View style={styles.chartContainer}>
        <Svg width={size} height={size * 0.8} viewBox={`0 0 ${size} ${size * 0.8}`}>
          {/* Happy arc (green) */}
          {happyArc && clampedPercentage > 0 && (
            <Path
              d={happyArc}
              fill="none"
              stroke={colors.success}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
          {/* Not Happy arc (red) */}
          {notHappyArc && notHappyPercentage > 0 && (
            <Path
              d={notHappyArc}
              fill="none"
              stroke={colors.danger}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
          {/* Percentage text - positioned in the center of the semi-circle */}
          <SvgText
            x={centerX}
            y={centerY + radius * 0.35}
            fontSize={size * 0.2}
            fontWeight="800"
            fill={colors.textPrimary}
            textAnchor="middle"
          >
            {clampedPercentage}%
          </SvgText>
        </Svg>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text style={dynamicStyles.legendText}>Happy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.danger }]} />
          <Text style={dynamicStyles.legendText}>Not Happy</Text>
        </View>
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
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
