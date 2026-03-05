import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { FAB, Searchbar, Snackbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryChip from "@/components/CategoryChip";
import EmptyStateCard from "@/components/EmptyStateCard";
import ItemCard, { ITEM_CARD_HEIGHT } from "@/components/ItemCard";
import { OfflineBanner } from "@/components";
import {
  ITEM_THUMBNAIL_SIZE,
  SEARCH_DEBOUNCE_MS,
  SNACKBAR_DURATION_MS,
} from "@/constants/config";
import { theme } from "@/constants/theme";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchItems } from "@/services/firestoreService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemStore } from "@/stores/useItemStore";
import { useNetworkStore } from "@/stores/useNetworkStore";
import {
  useDashboardNavigation,
  useRootStackNavigation,
} from "@/types/navigation.types";
import type { ItemDocument, LocalDraft } from "@/types/item.types";

const SKELETON_COUNT = 3;
const ITEM_SEPARATOR_HEIGHT = theme.spacing.space2;

function SearchEmptyState({
  searchQuery,
  categoryFilter,
  onClearSearch,
  onClearFilter,
}: {
  searchQuery: string;
  categoryFilter: string | null;
  onClearSearch: () => void;
  onClearFilter: () => void;
}) {
  const hasSearchQuery = searchQuery.length > 0;
  const hasCategoryFilter = categoryFilter !== null;

  return (
    <View
      style={styles.searchEmptyState}
      accessibilityRole="alert"
      testID="search-empty-state"
    >
      <Text style={styles.searchEmptyText}>
        {hasSearchQuery && !hasCategoryFilter
          ? `No items found for '${searchQuery}'`
          : hasCategoryFilter && !hasSearchQuery
            ? "No items in this category"
            : `No items found for '${searchQuery}' in this category`}
      </Text>
      {hasSearchQuery ? (
        <Text
          style={styles.clearLink}
          onPress={onClearSearch}
          testID="clear-search-link"
          accessibilityLabel="Clear search"
          accessibilityRole="link"
        >
          Clear search
        </Text>
      ) : null}
      {hasCategoryFilter ? (
        <Text
          style={styles.clearLink}
          onPress={onClearFilter}
          testID="clear-filter-link"
          accessibilityLabel="Clear filter"
          accessibilityRole="link"
        >
          Clear filter
        </Text>
      ) : null}
    </View>
  );
}

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
  const drafts = useItemStore((state) => state.drafts);
  const isLoading = useItemStore((state) => state.isLoading);
  const searchQuery = useItemStore((state) => state.searchQuery);
  const categoryFilter = useItemStore((state) => state.categoryFilter);
  const isOnline = useNetworkStore((state) => state.isOnline);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchText, setSearchText] = useState(searchQuery);
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;
  const debouncedSearchText = useDebounce(searchText, SEARCH_DEBOUNCE_MS);

  const draftToDisplayItem = useCallback((draft: LocalDraft): ItemDocument => {
    return {
      id: draft.localId,
      title: draft.item.title ?? "",
      category: draft.item.category ?? "",
      color: draft.item.color ?? "",
      condition: (draft.item.condition as ItemDocument["condition"]) ?? "Good",
      tags: draft.item.tags ?? [],
      notes: draft.item.notes ?? "",
      imageUrl: draft.localImageUri,
      imagePath: "",
      aiGenerated: draft.item.aiGenerated ?? false,
      syncStatus: "pending",
      createdAt: draft.createdAt,
      updatedAt: draft.createdAt,
    };
  }, []);

  const createdAtToMillis = useCallback(
    (createdAt: ItemDocument["createdAt"]) => {
      if (typeof createdAt === "string") {
        const value = new Date(createdAt).getTime();
        return Number.isNaN(value) ? 0 : value;
      }

      return createdAt.seconds * 1000;
    },
    [],
  );

  const combinedItems = useMemo(() => {
    // Filter drafts for current user and map to display items
    const currentUserDrafts = drafts.filter((d) => d.userId === userId);
    const draftItems = currentUserDrafts.map(draftToDisplayItem);

    return [...items, ...draftItems].sort((left, right) => {
      return (
        createdAtToMillis(right.createdAt) - createdAtToMillis(left.createdAt)
      );
    });
  }, [createdAtToMillis, draftToDisplayItem, drafts, items, userId]);

  const categories = useMemo(() => {
    const unique = new Set(
      combinedItems
        .map((item) => item.category.trim())
        .filter((category) => category.length > 0),
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [combinedItems]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return combinedItems.filter((item) => {
      const title = item.title.toLowerCase();
      const category = item.category.toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        title.includes(normalizedSearch) ||
        category.includes(normalizedSearch);
      const matchesCategory =
        categoryFilter === null || item.category.trim() === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, combinedItems, searchQuery]);

  const isFilterActive = searchQuery.length > 0 || categoryFilter !== null;

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

  useEffect(() => {
    useItemStore.getState().setSearchQuery(debouncedSearchText.trim());
  }, [debouncedSearchText]);

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

  const onClearSearch = useCallback(() => {
    setSearchText("");
    useItemStore.getState().setSearchQuery("");
  }, []);

  const onClearFilter = useCallback(() => {
    useItemStore.getState().setCategoryFilter(null);
  }, []);

  const listEmptyComponent = useMemo(() => {
    if (!isFilterActive) {
      return <EmptyStateCard />;
    }

    return (
      <SearchEmptyState
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        onClearSearch={onClearSearch}
        onClearFilter={onClearFilter}
      />
    );
  }, [
    categoryFilter,
    isFilterActive,
    onClearFilter,
    onClearSearch,
    searchQuery,
  ]);

  const listHeaderComponent = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search items..."
          value={searchText}
          onChangeText={setSearchText}
          onClearIconPress={onClearSearch}
          style={styles.searchBar}
          inputStyle={styles.searchBarInput}
          iconColor={theme.colors.onSurface}
          placeholderTextColor={theme.colors.outline}
          testID="search-bar"
          accessibilityLabel="Search items"
        />
        {categories.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.chipRow}
            testID="category-chip-row"
            accessibilityLabel="Category filters"
          >
            {categories.map((category) => (
              <CategoryChip
                key={category}
                category={category}
                selected={categoryFilter === category}
                onPress={() =>
                  useItemStore
                    .getState()
                    .setCategoryFilter(
                      categoryFilter === category ? null : category,
                    )
                }
              />
            ))}
          </ScrollView>
        ) : null}
      </View>
    ),
    [categories, categoryFilter, onClearSearch, searchText],
  );

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top }]}
      testID="dashboard-screen"
      accessibilityLabel="Dashboard Screen"
    >
      <OfflineBanner visible={!isOnline} />
      {isLoading ? (
        <DashboardSkeleton shimmerOpacity={shimmerAnim} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={listHeaderComponent}
          ListEmptyComponent={listEmptyComponent}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: theme.spacing.space4,
              paddingBottom:
                insets.bottom +
                theme.spacing.space4 +
                theme.spacing.space8 +
                theme.spacing.space6,
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
          keyboardShouldPersistTaps="handled"
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
  headerContainer: {
    gap: theme.spacing.space2,
    marginBottom: theme.spacing.space3,
  },
  searchBar: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.inputs,
  },
  searchBarInput: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onBackground,
  },
  chipRow: {
    gap: theme.spacing.space2,
    paddingVertical: theme.spacing.space1,
  },
  separator: {
    height: ITEM_SEPARATOR_HEIGHT,
  },
  searchEmptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.space8,
    gap: theme.spacing.space3,
  },
  searchEmptyText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurface,
    textAlign: "center",
  },
  clearLink: {
    ...theme.typography.labelLarge,
    color: theme.colors.primary,
    textAlign: "center",
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
