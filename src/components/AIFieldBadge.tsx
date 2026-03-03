import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";

import { theme } from "@/constants/theme";

interface AIFieldBadgeProps {
  testID?: string;
}

export default function AIFieldBadge({
  testID = "ai-field-badge",
}: AIFieldBadgeProps) {
  return (
    <View
      style={styles.badge}
      testID={testID}
      accessibilityLabel="AI-generated field"
      accessibilityRole="image"
    >
      <Icon source="auto-fix" size={14} color={theme.semanticColors.aiAccent} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginLeft: theme.spacing.space1,
  },
});
