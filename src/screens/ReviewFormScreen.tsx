import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";
import { useRootStackRoute } from "@/types/navigation.types";

export default function ReviewFormScreen() {
  const insets = useSafeAreaInsets();
  const route = useRootStackRoute<"ReviewForm">();
  const { imageUri } = route.params;

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      testID="review-form-screen"
      accessibilityLabel="Review Form Screen"
    >
      <Text style={styles.text}>Review Form (URI: {imageUri})</Text>
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
