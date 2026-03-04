import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
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

export default function ItemDetailScreen() {
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
    setDeleteDialogVisible(false);

    try {
      const userId = useAuthStore.getState().user?.uid;
      if (!userId) {
        setSnackbarMessage("Please sign in to delete items");
        setSnackbarVisible(true);
        setIsDeleting(false);
        return;
      }

      await deleteItemFromFirestore(userId, itemId);

      if (item.imagePath) {
        void deleteItemImage(item.imagePath);
      }

      setSnackbarMessage("Item deleted");
      setSnackbarVisible(true);

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
    }
  }, [isDeleting, item, itemId, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  if (!item) {
    return (
      <View
        style={styles.screen}
        testID="item-detail-missing-screen"
        accessibilityLabel="Item detail not found screen"
      >
        <Text style={styles.text} accessibilityLabel="Item not found message">
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

  return (
    <View
      style={styles.screen}
      testID="item-detail-screen"
      accessibilityLabel="Item Detail Screen"
    >
      <Text style={styles.title} accessibilityLabel="Item title">
        {item.title || `Item Detail (ID: ${itemId})`}
      </Text>

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
        Delete Item
      </Button>

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
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.space4,
    gap: theme.spacing.space4,
  },
  text: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onBackground,
    textAlign: "center",
  },
  title: {
    ...theme.typography.titleLarge,
    color: theme.colors.onBackground,
    textAlign: "center",
  },
  deleteButton: {
    borderRadius: theme.borderRadius.buttons,
  },
  backButton: {
    borderRadius: theme.borderRadius.buttons,
  },
  buttonContent: {
    minHeight: 44,
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
