import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { theme } from "@/constants/theme";

function CameraIllustration() {
  return (
    <Svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      accessible
      accessibilityLabel="Camera illustration"
    >
      <Rect
        x={20}
        y={35}
        width={80}
        height={55}
        rx={12}
        fill={theme.colors.surface}
        stroke={theme.colors.primary}
        strokeWidth={2}
      />
      <Circle
        cx={60}
        cy={62}
        r={16}
        fill={theme.colors.surfaceVariant}
        stroke={theme.colors.primary}
        strokeWidth={2}
      />
      <Circle
        cx={60}
        cy={62}
        r={10}
        fill={theme.colors.background}
        stroke={theme.colors.outline}
        strokeWidth={1}
      />
      <Rect
        x={35}
        y={28}
        width={20}
        height={10}
        rx={4}
        fill={theme.colors.surface}
        stroke={theme.colors.primary}
        strokeWidth={2}
      />
      <Path
        d="M95 25 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 z"
        fill={theme.colors.secondary}
      />
      <Path
        d="M15 45 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z"
        fill={theme.colors.secondary}
        opacity={0.7}
      />
      <Path
        d="M100 70 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z"
        fill={theme.colors.secondary}
        opacity={0.5}
      />
    </Svg>
  );
}

export default function EmptyStateCard() {
  return (
    <View
      style={styles.container}
      testID="empty-state-card"
      accessibilityLabel="No items yet. Tap the scan button to photograph any item."
    >
      <CameraIllustration />
      <Text style={styles.headline}>Your inventory starts here</Text>
      <Text style={styles.subtext}>
        Tap the scan button to photograph any item — AI fills in the details.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.space6,
    paddingVertical: theme.spacing.space8,
  },
  headline: {
    ...theme.typography.titleLarge,
    color: theme.colors.onBackground,
    textAlign: "center",
    marginTop: theme.spacing.space5,
    marginBottom: theme.spacing.space3,
  },
  subtext: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurface,
    textAlign: "center",
    maxWidth: 280,
  },
});
