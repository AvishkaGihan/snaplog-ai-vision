import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider, ActivityIndicator } from "react-native-paper";
import { registerRootComponent } from "expo";
import { enableScreens } from "react-native-screens";
import { useFonts } from "expo-font";

import RootNavigator from "@/navigation/RootNavigator";
import { theme } from "@/constants/theme";

enableScreens();

export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter/Inter-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.background,
              card: theme.colors.surface,
              text: theme.colors.onBackground,
              border: theme.colors.outline,
              notification: theme.colors.secondary,
            },
            fonts: {
              regular: {
                fontFamily: "Inter-Regular",
                fontWeight: "400",
              },
              medium: {
                fontFamily: "Inter-Medium",
                fontWeight: "500",
              },
              bold: {
                fontFamily: "Inter-Bold",
                fontWeight: "700",
              },
              heavy: {
                fontFamily: "Inter-SemiBold",
                fontWeight: "600",
              },
            },
          }}
        >
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});

registerRootComponent(App);
