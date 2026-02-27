import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { theme } from "@/constants/theme";

export default function DashboardScreen() {
  return (
    <View
      style={styles.screen}
      testID="dashboard-screen"
      accessibilityLabel="Dashboard Screen"
    >
      <Text style={styles.text}>Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.space4,
  },
  text: {
    color: theme.colors.onBackground,
  },
});
