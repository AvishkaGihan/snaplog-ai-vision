import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      testID="camera-screen"
      accessibilityLabel="Camera Screen"
    >
      <Text style={styles.text}>Camera</Text>
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
