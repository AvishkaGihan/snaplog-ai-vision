import React from "react";
import { View, StyleSheet } from "react-native";
import { FAB, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";
import { useRootStackNavigation } from "@/types/navigation.types";

export default function DashboardScreen() {
  const navigation = useRootStackNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={styles.screen}
      testID="dashboard-screen"
      accessibilityLabel="Dashboard Screen"
    >
      <Text style={styles.text}>Dashboard</Text>

      <FAB
        icon="camera"
        onPress={() => navigation.navigate("Camera")}
        style={[
          styles.fab,
          {
            right: theme.spacing.space4,
            bottom: insets.bottom + theme.spacing.space4,
          },
        ]}
        customSize={56}
        color={theme.colors.onBackground}
        testID="scan-fab"
        accessibilityLabel="Scan item"
      />
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
  fab: {
    position: "absolute",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.fab,
  },
});
