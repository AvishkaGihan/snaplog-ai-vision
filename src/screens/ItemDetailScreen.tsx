import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { theme } from "@/constants/theme";
import { useDashboardStackRoute } from "@/types/navigation.types";

export default function ItemDetailScreen() {
  const route = useDashboardStackRoute<"ItemDetail">();
  const { itemId } = route.params;

  return (
    <View
      style={styles.screen}
      testID="item-detail-screen"
      accessibilityLabel="Item Detail Screen"
    >
      <Text style={styles.text}>Item Detail (ID: {itemId})</Text>
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
