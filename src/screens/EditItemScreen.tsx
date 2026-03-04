import React, { useCallback, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { Timestamp } from "firebase/firestore";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import type { TextInput as RNTextInput } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SNACKBAR_DURATION_MS } from "@/constants/config";
import { theme } from "@/constants/theme";
import { updateItem } from "@/services/firestoreService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemStore } from "@/stores/useItemStore";
import type { ItemDocument } from "@/types/item.types";
import {
  useDashboardNavigation,
  useDashboardStackRoute,
} from "@/types/navigation.types";

export default function EditItemScreen() {
  const navigation = useDashboardNavigation();
  const insets = useSafeAreaInsets();
  const route = useDashboardStackRoute<"EditItem">();
  const { itemId } = route.params;

  const item = useItemStore(
    useCallback(
      (state) => state.items.find((storeItem) => storeItem.id === itemId),
      [itemId]
    )
  );

  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [color, setColor] = useState(item?.color ?? "");
  const [condition, setCondition] = useState(item?.condition ?? "");
  const [tags, setTags] = useState(item?.tags.join(", ") ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const titleRef = useRef<RNTextInput>(null);
  const categoryRef = useRef<RNTextInput>(null);
  const colorRef = useRef<RNTextInput>(null);
  const conditionRef = useRef<RNTextInput>(null);
  const tagsRef = useRef<RNTextInput>(null);
  const notesRef = useRef<RNTextInput>(null);

  const isFormValid = title.trim().length > 0;

  const handleCancel = useCallback(() => {
    if (isSaving) {
      return;
    }

    navigation.goBack();
  }, [isSaving, navigation]);

  const handleSave = useCallback(async () => {
    if (!item || !isFormValid || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const userId = useAuthStore.getState().user?.uid;
      if (!userId) {
        setSnackbarMessage("Please sign in to save changes");
        setSnackbarVisible(true);
        setIsSaving(false);
        return;
      }

      const parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const updates: Partial<Omit<ItemDocument, "id">> = {
        title: title.trim(),
        category: category.trim(),
        color: color.trim(),
        condition: (condition.trim() || "Good") as ItemDocument["condition"],
        tags: parsedTags,
        notes: notes.trim(),
      };

      await updateItem(userId, item.id, updates);
      useItemStore.getState().updateItem(item.id, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      setSnackbarMessage("Item updated");
      setSnackbarVisible(true);

      setTimeout(() => {
        navigation.goBack();
      }, SNACKBAR_DURATION_MS);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update item";
      setSnackbarMessage(message);
      setSnackbarVisible(true);
      setIsSaving(false);
    }
  }, [
    item,
    isFormValid,
    isSaving,
    tags,
    title,
    category,
    color,
    condition,
    notes,
    navigation,
  ]);

  if (!item) {
    return (
      <View
        style={styles.missingItemScreen}
        testID="edit-item-missing-screen"
        accessibilityLabel="Edit item not found screen"
      >
        <Text
          style={styles.missingItemText}
          accessibilityLabel="Item not found message"
        >
          Item not found.
        </Text>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={styles.backButton}
          contentStyle={styles.buttonContent}
          testID="edit-item-missing-back"
          accessibilityLabel="Go back"
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      testID="edit-item-screen"
      accessibilityLabel="Edit Item Screen"
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      pointerEvents={isSaving ? "none" : "auto"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + theme.spacing.space4,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          testID="edit-item-image"
          accessibilityLabel="Saved item image"
        />

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label} accessibilityLabel="Title field label">
              Title
            </Text>
          </View>
          <TextInput
            ref={titleRef}
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => categoryRef.current?.focus()}
            testID="edit-item-title-input"
            accessibilityLabel="Title"
          />
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text
              style={styles.label}
              accessibilityLabel="Category field label"
            >
              Category
            </Text>
          </View>
          <TextInput
            ref={categoryRef}
            value={category}
            onChangeText={setCategory}
            mode="outlined"
            style={styles.input}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => colorRef.current?.focus()}
            testID="edit-item-category-input"
            accessibilityLabel="Category"
          />
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label} accessibilityLabel="Color field label">
              Color
            </Text>
          </View>
          <TextInput
            ref={colorRef}
            value={color}
            onChangeText={setColor}
            mode="outlined"
            style={styles.input}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => conditionRef.current?.focus()}
            testID="edit-item-color-input"
            accessibilityLabel="Color"
          />
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text
              style={styles.label}
              accessibilityLabel="Condition field label"
            >
              Condition
            </Text>
          </View>
          <TextInput
            ref={conditionRef}
            value={condition}
            onChangeText={setCondition}
            mode="outlined"
            style={styles.input}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => tagsRef.current?.focus()}
            testID="edit-item-condition-input"
            accessibilityLabel="Condition"
          />
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label} accessibilityLabel="Tags field label">
              Tags
            </Text>
          </View>
          <TextInput
            ref={tagsRef}
            value={tags}
            onChangeText={setTags}
            mode="outlined"
            style={styles.input}
            placeholder="e.g. vintage, leather, designer"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => notesRef.current?.focus()}
            testID="edit-item-tags-input"
            accessibilityLabel="Tags, comma separated"
          />
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label} accessibilityLabel="Notes field label">
              Notes
            </Text>
          </View>
          <TextInput
            ref={notesRef}
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={[styles.input, styles.notesInput]}
            placeholder="Additional details about this item..."
            multiline
            numberOfLines={4}
            returnKeyType="done"
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            testID="edit-item-notes-input"
            accessibilityLabel="Notes"
          />
        </View>

        <Button
          mode="contained"
          disabled={!isFormValid || isSaving}
          loading={isSaving}
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.buttonContent}
          testID="edit-item-save-changes"
          accessibilityLabel="Save changes"
        >
          Save Changes
        </Button>

        <Button
          mode="outlined"
          onPress={handleCancel}
          disabled={isSaving}
          style={styles.backButton}
          contentStyle={styles.buttonContent}
          testID="edit-item-cancel"
          accessibilityLabel="Cancel edit"
        >
          Cancel
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={SNACKBAR_DURATION_MS}
        testID="edit-item-snackbar"
        accessibilityLabel="Edit status notification"
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.space4,
    gap: theme.spacing.space3,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: theme.borderRadius.cards,
    marginBottom: theme.spacing.space2,
  },
  fieldContainer: {
    gap: theme.spacing.space1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space1,
  },
  label: {
    ...theme.typography.labelLarge,
    color: theme.colors.onBackground,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    borderRadius: theme.borderRadius.buttons,
    marginTop: theme.spacing.space2,
  },
  backButton: {
    borderRadius: theme.borderRadius.buttons,
  },
  buttonContent: {
    minHeight: 44,
  },
  missingItemScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    padding: theme.spacing.space4,
    gap: theme.spacing.space4,
  },
  missingItemText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onBackground,
    textAlign: "center",
  },
});
