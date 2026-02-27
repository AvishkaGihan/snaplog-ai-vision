export type RootTabParamList = {
  Dashboard: undefined;
  Settings: undefined;
};

export type DashboardStackParamList = {
  ItemList: undefined;
  ItemDetail: { itemId: string };
  EditItem: { itemId: string };
};

export type RootModalParamList = {
  Camera: undefined;
  ReviewForm: { imageUri: string };
};
