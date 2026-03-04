import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Chip, Text, TouchableRipple } from "react-native-paper";

import { ITEM_THUMBNAIL_SIZE } from "@/constants/config";
import { theme } from "@/constants/theme";
import type { ItemDocument } from "@/types/item.types";

interface ItemCardProps {
  item: ItemDocument;
  onPress: () => void;
}

export const ITEM_CARD_HEIGHT = ITEM_THUMBNAIL_SIZE + theme.spacing.space4;

function getSyncStatusMeta(syncStatus: ItemDocument["syncStatus"]) {
  switch (syncStatus) {
    case "synced":
      return { symbol: "✓", color: theme.semanticColors.syncComplete };
    case "pending":
      return { symbol: "⏳", color: theme.semanticColors.syncPending };
    case "error":
      return { symbol: "!", color: theme.colors.error };
    default:
      return { symbol: "!", color: theme.colors.error };
  }
}

const ItemCard = React.memo(function ItemCard({
  item,
  onPress,
}: ItemCardProps) {
  const syncStatus = getSyncStatusMeta(item.syncStatus);
  const hasImage = item.imageUrl?.trim()?.length > 0;

  return (
    <TouchableRipple
      onPress={onPress}
      style={styles.card}
      borderless={false}
      testID={`item-card-${item.id}`}
      accessibilityLabel={`Item: ${item.title}`}
    >
      <>
        {hasImage ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailFallback]}>
            <Text style={styles.thumbnailFallbackText}>📷</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Chip
            mode="outlined"
            textStyle={styles.chipText}
            style={styles.chip}
            compact
          >
            {item.category}
          </Chip>
        </View>

        <View style={[styles.syncBadge, { borderColor: syncStatus.color }]}>
          <Text style={[styles.syncBadgeText, { color: syncStatus.color }]}>
            {syncStatus.symbol}
          </Text>
        </View>
      </>
    </TouchableRipple>
  );
});

export default ItemCard;

const styles = StyleSheet.create({
  card: {
    height: ITEM_CARD_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.cards,
    padding: theme.spacing.space2,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space3,
  },
  thumbnail: {
    width: ITEM_THUMBNAIL_SIZE,
    height: ITEM_THUMBNAIL_SIZE,
    borderRadius: theme.borderRadius.cards,
    backgroundColor: theme.colors.surfaceVariant,
  },
  thumbnailFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailFallbackText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurface,
  },
  content: {
    flex: 1,
    gap: theme.spacing.space1,
  },
  title: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onBackground,
  },
  chip: {
    alignSelf: "flex-start",
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.chips,
    backgroundColor: theme.colors.surface,
  },
  chipText: {
    fontSize: 11,
    color: theme.colors.onSurface,
  },
  syncBadge: {
    width: theme.spacing.space6,
    height: theme.spacing.space6,
    borderRadius: theme.borderRadius.chips,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  syncBadgeText: {
    ...theme.typography.labelLarge,
  },
});
