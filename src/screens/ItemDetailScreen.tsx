import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StyleProp, TextStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Dialog, Portal, Snackbar, Text } from "react-native-paper";

import { SNACKBAR_DURATION_MS } from "@/constants/config";
import { theme } from "@/constants/theme";
import { deleteItem as deleteItemFromFirestore } from "@/services/firestoreService";
import { deleteItemImage } from "@/services/storageService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemStore } from "@/stores/useItemStore";
import {
  useDashboardNavigation,
  useDashboardStackRoute,
} from "@/types/navigation.types";
import { formatDate } from "@/utils/formatters";

type SyncStatus = "synced" | "pending" | "error";

const SYNC_STATUS_CONFIG = {
  synced: {
    icon: "check-circle",
    color: theme.semanticColors.syncComplete,
    label: "Synced",
  },
  pending: {
    icon: "clock-outline",
    color: theme.semanticColors.syncPending,
    label: "Pending sync",
  },
  error: {
    icon: "alert-circle",
    color: theme.colors.error,
    label: "Sync failed",
  },
} as const;

function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config = SYNC_STATUS_CONFIG[status];

  return (
    <View
      style={styles.syncBadge}
      testID="sync-status-badge"
      accessibilityLabel={`Sync status: ${config.label}`}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={14}
        color={config.color}
        accessibilityLabel={`Sync status icon: ${config.label}`}
      />
      <Text style={[styles.syncLabel, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

function DetailField({
  label,
  value,
  testID,
  valueStyle,
}: {
  label: string;
  value: string;
  testID: string;
  valueStyle?: StyleProp<TextStyle>;
}) {
  const displayValue = value || "—";

  return (
    <View
      style={styles.fieldRow}
      testID={testID}
      accessibilityLabel={`${label}: ${displayValue}`}
    >
      <Text style={styles.fieldLabel} accessibilityLabel={`${label} label`}>
        {label}
      </Text>
      <Text
        style={[
          styles.fieldValue,
          !value ? styles.emptyValue : null,
          valueStyle,
        ]}
        accessibilityLabel={`${label} value`}
      >
        {displayValue}
      </Text>
    </View>
  );
}

export default function ItemDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useDashboardNavigation();
  const route = useDashboardStackRoute<"ItemDetail">();
  const { itemId } = route.params;
  const item = useItemStore(
    useCallback(
      (state) => state.items.find((storeItem) => storeItem.id === itemId),
      [itemId],
    ),
  );

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = useCallback(async () => {
    if (isDeleting || !item) {
      return;
    }

    setIsDeleting(true);

    try {
      const userId = useAuthStore.getState().user?.uid;
      if (!userId) {
        setSnackbarMessage("Please sign in to delete items");
        setSnackbarVisible(true);
        setIsDeleting(false);
        setDeleteDialogVisible(false);
        return;
      }

      await deleteItemFromFirestore(userId, itemId);

      if (item.imagePath) {
        void deleteItemImage(item.imagePath);
      }

      setSnackbarMessage("Item deleted");
      setSnackbarVisible(true);
      setDeleteDialogVisible(false);

      navigationTimeoutRef.current = setTimeout(() => {
        useItemStore.getState().deleteItem(itemId);
        navigation.popToTop();
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete item";
      setSnackbarMessage(message);
      setSnackbarVisible(true);
      setIsDeleting(false);
      setDeleteDialogVisible(false);
    }
  }, [isDeleting, item, itemId, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  if (!item) {
    return (
      <View
        style={styles.missingScreen}
        testID="item-detail-missing-screen"
        accessibilityLabel="Item detail not found screen"
      >
        <Text
          style={styles.missingText}
          accessibilityLabel="Item not found message"
        >
          Item not found.
        </Text>
        <Button
          mode="outlined"
          onPress={handleGoBack}
          style={styles.backButton}
          contentStyle={styles.buttonContent}
          testID="item-detail-go-back"
          accessibilityLabel="Go back to dashboard"
        >
          Go Back
        </Button>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={SNACKBAR_DURATION_MS}
          testID="delete-snackbar"
          accessibilityLabel="Status notification"
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    );
  }

  const tagsDisplay = item.tags?.length > 0 ? item.tags.join(", ") : "—";
  const title = item.title?.trim() ? item.title : "—";
  const category = item.category?.trim() ? item.category : "—";
  const color = item.color?.trim() ? item.color : "—";
  const condition = item.condition?.trim() ? item.condition : "—";
  const notes = item.notes?.trim() ? item.notes : "—";

  return (
    <View
      style={styles.screen}
      testID="item-detail-screen"
      accessibilityLabel="Item detail screen"
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: theme.spacing.space8 + insets.bottom },
        ]}
        testID="item-detail-scroll-view"
        accessibilityLabel="Item detail content"
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.photo}
            resizeMode="cover"
            testID="item-detail-photo"
            accessibilityLabel="Item photo"
          />
        ) : (
          <View
            style={styles.photoFallback}
            testID="item-detail-photo-fallback"
            accessibilityLabel="No item photo available"
          >
            <MaterialCommunityIcons
              name="camera-off"
              size={48}
              color={theme.colors.outline}
            />
          </View>
        )}

        <View style={styles.contentSection}>
          <View style={styles.headerRow}>
            <Text
              style={styles.titleText}
              testID="item-title"
              accessibilityLabel={`Title: ${title}`}
            >
              {title}
            </Text>
            <SyncStatusBadge status={item.syncStatus} />
          </View>

          <View
            style={styles.datesRow}
            testID="item-dates"
            accessibilityLabel="Item dates"
          >
            <Text
              style={styles.dateText}
              accessibilityLabel={`Created: ${formatDate(item.createdAt)}`}
            >
              Created: {formatDate(item.createdAt)}
            </Text>
            <Text
              style={styles.dateText}
              accessibilityLabel={`Updated: ${formatDate(item.updatedAt)}`}
            >
              Updated: {formatDate(item.updatedAt)}
            </Text>
          </View>

          <View style={styles.fieldsSection}>
            <DetailField
              label="Category"
              value={category}
              testID="item-field-category"
            />
            <DetailField
              label="Color"
              value={color}
              testID="item-field-color"
            />
            <DetailField
              label="Condition"
              value={condition}
              testID="item-field-condition"
            />
            <DetailField
              label="Tags"
              value={tagsDisplay}
              testID="item-field-tags"
            />
            <DetailField
              label="Notes"
              value={notes}
              testID="item-field-notes"
              valueStyle={styles.notesValue}
            />
          </View>

          <View style={styles.actionsSection}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("EditItem", { itemId })}
              style={styles.editButton}
              contentStyle={styles.buttonContent}
              testID="edit-item-button"
              accessibilityLabel="Edit this item"
            >
              Edit
            </Button>

            <Button
              mode="text"
              textColor={theme.colors.error}
              onPress={() => setDeleteDialogVisible(true)}
              disabled={isDeleting}
              style={styles.deleteButton}
              contentStyle={styles.buttonContent}
              testID="delete-item-button"
              accessibilityLabel="Delete this item"
            >
              Delete
            </Button>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
          testID="delete-confirmation-dialog"
        >
          <Dialog.Title style={styles.dialogTitle}>
            Delete this item?
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogBody}>
              This item and its photo will be permanently deleted. This action
              cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDeleteDialogVisible(false)}
              disabled={isDeleting}
              testID="delete-cancel-button"
              accessibilityLabel="Cancel deletion"
            >
              Cancel
            </Button>
            <Button
              onPress={handleDelete}
              textColor={theme.colors.error}
              loading={isDeleting}
              disabled={isDeleting}
              testID="delete-confirm-button"
              accessibilityLabel="Confirm delete item"
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={SNACKBAR_DURATION_MS}
        testID="delete-snackbar"
        accessibilityLabel="Delete status notification"
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
  scrollContent: {
    paddingBottom: theme.spacing.space8,
  },
  photo: {
    width: "100%",
    height: 280,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.borderRadius.cards,
    borderBottomRightRadius: theme.borderRadius.cards,
  },
  photoFallback: {
    width: "100%",
    height: 280,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: theme.borderRadius.cards,
    borderBottomRightRadius: theme.borderRadius.cards,
  },
  contentSection: {
    padding: theme.spacing.space4,
    gap: theme.spacing.space3,
  },
  titleText: {
    ...theme.typography.titleLarge,
    color: theme.colors.onBackground,
    flexShrink: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.space2,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space1,
  },
  syncLabel: {
    ...theme.typography.labelSmall,
  },
  dateText: {
    ...theme.typography.labelSmall,
    color: theme.colors.onSurface,
  },
  datesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.space4,
  },
  fieldsSection: {
    gap: theme.spacing.space3,
    paddingTop: theme.spacing.space2,
  },
  fieldRow: {
    gap: theme.spacing.space1,
  },
  fieldLabel: {
    ...theme.typography.labelLarge,
    color: theme.colors.onSurface,
  },
  fieldValue: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onBackground,
  },
  notesValue: {
    ...theme.typography.bodyMedium,
  },
  emptyValue: {
    color: theme.colors.onSurface,
  },
  actionsSection: {
    gap: theme.spacing.space3,
    paddingTop: theme.spacing.space4,
  },
  editButton: {
    borderRadius: theme.borderRadius.buttons,
    borderColor: theme.colors.primary,
  },
  deleteButton: {
    borderRadius: theme.borderRadius.buttons,
  },
  buttonContent: {
    minHeight: 44,
  },
  missingScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.space4,
    gap: theme.spacing.space4,
  },
  missingText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onBackground,
    textAlign: "center",
  },
  backButton: {
    borderRadius: theme.borderRadius.buttons,
  },
  dialog: {
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    color: theme.colors.onBackground,
  },
  dialogBody: {
    color: theme.colors.onSurface,
  },
});
