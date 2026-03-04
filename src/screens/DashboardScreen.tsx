import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { FAB, Snackbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyStateCard from "@/components/EmptyStateCard";
import ItemCard, { ITEM_CARD_HEIGHT } from "@/components/ItemCard";
import { ITEM_THUMBNAIL_SIZE, SNACKBAR_DURATION_MS } from "@/constants/config";
import { theme } from "@/constants/theme";
import { fetchItems } from "@/services/firestoreService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemStore } from "@/stores/useItemStore";
import {
  useDashboardNavigation,
  useRootStackNavigation,
} from "@/types/navigation.types";
import type { ItemDocument } from "@/types/item.types";

const SKELETON_COUNT = 3;
const ITEM_SEPARATOR_HEIGHT = theme.spacing.space2;
const ITEM_LIST_ROW_HEIGHT = ITEM_CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT;

function DashboardSkeleton({
  shimmerOpacity,
}: {
  shimmerOpacity: Animated.Value;
}) {
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <View key={`dashboard-skeleton-${index}`} style={styles.skeletonCard}>
          <Animated.View
            style={[styles.skeletonThumbnail, { opacity: shimmerOpacity }]}
          />
          <View style={styles.skeletonContent}>
            <Animated.View
              style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}
            />
            <Animated.View
              style={[styles.skeletonChip, { opacity: shimmerOpacity }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const rootNavigation = useRootStackNavigation();
  const navigation = useDashboardNavigation();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((state) => state.user?.uid);
  const items = useItemStore((state) => state.items);
  const isLoading = useItemStore((state) => state.isLoading);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerAnim]);

  const fetchDashboardItems = useCallback(async () => {
    if (!userId) {
      useItemStore.getState().setItems([]);
      return;
    }

    useItemStore.getState().setLoading(true);

    try {
      const fetchedItems = await fetchItems(userId);
      useItemStore.getState().setItems(fetchedItems);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load dashboard items";
      setSnackbarMessage(message);
      setSnackbarVisible(true);
    } finally {
      useItemStore.getState().setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchDashboardItems();
  }, [fetchDashboardItems]);

  const onRefresh = useCallback(async () => {
    if (!userId) {
      return;
    }

    setRefreshing(true);

    try {
      const fetchedItems = await fetchItems(userId);
      useItemStore.getState().setItems(fetchedItems);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to refresh dashboard items";
      setSnackbarMessage(message);
      setSnackbarVisible(true);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const renderItem = useCallback(
    ({ item }: { item: ItemDocument }) => (
      <ItemCard
        item={item}
        onPress={() => navigation.navigate("ItemDetail", { itemId: item.id })}
      />
    ),
    [navigation],
  );

  return (
    <View
      style={styles.screen}
      testID="dashboard-screen"
      accessibilityLabel="Dashboard Screen"
    >
      {isLoading ? (
        <DashboardSkeleton shimmerOpacity={shimmerAnim} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          getItemLayout={(_, index) => ({
            length: ITEM_LIST_ROW_HEIGHT,
            offset: ITEM_LIST_ROW_HEIGHT * index,
            index,
          })}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={EmptyStateCard}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: insets.top + theme.spacing.space4,
              paddingBottom:
                insets.bottom + theme.spacing.space4 + theme.spacing.space8 + theme.spacing.space6,
            },
            { flexGrow: 1 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          testID="dashboard-item-list"
          accessibilityLabel="Dashboard item list"
        />
      )}

      <FAB
        icon="camera"
        onPress={() => rootNavigation.navigate("Camera")}
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

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={SNACKBAR_DURATION_MS}
        testID="dashboard-snackbar"
        accessibilityLabel="Dashboard status notification"
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: theme.spacing.space4,
  },
  separator: {
    height: ITEM_SEPARATOR_HEIGHT,
  },
  fab: {
    position: "absolute",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.fab,
  },
  skeletonContainer: {
    padding: theme.spacing.space4,
    gap: theme.spacing.space2,
  },
  skeletonCard: {
    minHeight: ITEM_CARD_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.cards,
    padding: theme.spacing.space2,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space3,
  },
  skeletonThumbnail: {
    width: ITEM_THUMBNAIL_SIZE,
    height: ITEM_THUMBNAIL_SIZE,
    borderRadius: theme.borderRadius.cards,
    backgroundColor: theme.colors.surfaceVariant,
  },
  skeletonContent: {
    flex: 1,
    gap: theme.spacing.space2,
  },
  skeletonTitle: {
    width: "70%",
    height: theme.spacing.space4,
    borderRadius: theme.borderRadius.buttons,
    backgroundColor: theme.colors.surfaceVariant,
  },
  skeletonChip: {
    width: "35%",
    height: theme.spacing.space4,
    borderRadius: theme.borderRadius.chips,
    backgroundColor: theme.colors.surfaceVariant,
  },
});
