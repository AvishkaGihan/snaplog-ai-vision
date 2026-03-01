import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DashboardScreen, EditItemScreen, ItemDetailScreen } from "@/screens";
import type { DashboardStackParamList } from "@/types/navigation.types";

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      initialRouteName="ItemList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ItemList" component={DashboardScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="EditItem" component={EditItemScreen} />
    </Stack.Navigator>
  );
}
