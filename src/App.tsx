import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { enableScreens } from "react-native-screens";

import type { RootTabParamList } from "@/types/navigation.types";

enableScreens();

const Tab = createBottomTabNavigator<RootTabParamList>();

function DashboardPlaceholder() {
  return (
    <View style={styles.screen}>
      <Text>Dashboard</Text>
    </View>
  );
}

function SettingsPlaceholder() {
  return (
    <View style={styles.screen}>
      <Text>Settings</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Dashboard" component={DashboardPlaceholder} />
            <Tab.Screen name="Settings" component={SettingsPlaceholder} />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

import { registerRootComponent } from "expo";
registerRootComponent(App);
