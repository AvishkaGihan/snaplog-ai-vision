import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type NavigatorScreenParams,
  type RouteProp,
} from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type DashboardStackParamList = {
  ItemList: undefined;
  ItemDetail: { itemId: string };
  EditItem: { itemId: string };
};

export type RootTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList> | undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<RootTabParamList>;
  Camera: undefined;
  ReviewForm: { imageUri: string };
};

export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
export type RootTabNavigationProp = BottomTabNavigationProp<RootTabParamList>;
export type DashboardStackNavigationProp =
  NativeStackNavigationProp<DashboardStackParamList>;

export type DashboardNavigationProp = CompositeNavigationProp<
  DashboardStackNavigationProp,
  CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

export type RootStackRouteProp<RouteName extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, RouteName>;
export type RootTabRouteProp<RouteName extends keyof RootTabParamList> =
  RouteProp<RootTabParamList, RouteName>;
export type DashboardStackRouteProp<
  RouteName extends keyof DashboardStackParamList,
> = RouteProp<DashboardStackParamList, RouteName>;

export const useRootStackNavigation = () =>
  useNavigation<RootStackNavigationProp>();
export const useRootTabNavigation = () =>
  useNavigation<RootTabNavigationProp>();
export const useDashboardNavigation = () =>
  useNavigation<DashboardNavigationProp>();

export const useRootStackRoute = <
  RouteName extends keyof RootStackParamList,
>() => useRoute<RootStackRouteProp<RouteName>>();
export const useRootTabRoute = <RouteName extends keyof RootTabParamList>() =>
  useRoute<RootTabRouteProp<RouteName>>();
export const useDashboardStackRoute = <
  RouteName extends keyof DashboardStackParamList,
>() => useRoute<DashboardStackRouteProp<RouteName>>();
