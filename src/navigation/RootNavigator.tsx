import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { theme } from "@/constants/theme";
import DashboardStack from "./DashboardStack";
import { CameraScreen, ReviewFormScreen, SettingsScreen } from "@/screens";
import type {
  RootStackParamList,
  RootTabParamList,
} from "@/types/navigation.types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarTestID: `tab-${route.name.toLowerCase()}`,
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === "Dashboard" ? "view-dashboard" : "cog";

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <RootStack.Screen
        name="ReviewForm"
        component={ReviewFormScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
    </RootStack.Navigator>
  );
}
