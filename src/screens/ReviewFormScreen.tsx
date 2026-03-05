import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Haptics from "expo-haptics";
import { Timestamp } from "firebase/firestore";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import type { TextInput as RNTextInput } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AIFieldBadge } from "@/components";
import { SNACKBAR_DURATION_MS } from "@/constants/config";
import { theme } from "@/constants/theme";
import { saveItem } from "@/services/firestoreService";
import { cleanupTempImage } from "@/services/imageService";
import { deleteItemImage, uploadItemImage } from "@/services/storageService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemStore } from "@/stores/useItemStore";
import { useNetworkStore } from "@/stores/useNetworkStore";
import type { ItemDocument, LocalDraft } from "@/types/item.types";
import { useRootStackNavigation } from "@/types/navigation.types";
import { useRootStackRoute } from "@/types/navigation.types";
import { generateDraftId } from "@/utils/generateId";

export default function ReviewFormScreen() {
  const navigation = useRootStackNavigation();
  const insets = useSafeAreaInsets();
  const route = useRootStackRoute<"ReviewForm">();
  const {
    imageUri,
    aiResult,
    storagePath: existingStoragePath,
    downloadUrl: existingDownloadUrl,
  } = route.params;

  const [title, setTitle] = useState(aiResult?.title ?? "");
  const [category, setCategory] = useState(aiResult?.category ?? "");
  const [color, setColor] = useState(aiResult?.color ?? "");
  const [condition, setCondition] = useState(aiResult?.condition ?? "");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const titleRef = useRef<RNTextInput>(null);
  const categoryRef = useRef<RNTextInput>(null);
  const colorRef = useRef<RNTextInput>(null);
  const conditionRef = useRef<RNTextInput>(null);
  const tagsRef = useRef<RNTextInput>(null);
  const notesRef = useRef<RNTextInput>(null);

  const aiFieldMap = useMemo(() => {
    return {
      title: Boolean(aiResult?.title),
      category: Boolean(aiResult?.category),
      color: Boolean(aiResult?.color),
      condition: Boolean(aiResult?.condition),
    };
  }, [aiResult]);

  const isFormValid = title.trim().length > 0;

  const handleDiscard = useCallback(() => {
    void cleanupTempImage(imageUri);

    if (existingStoragePath) {
      void deleteItemImage(existingStoragePath);
    }

    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  }, [navigation, imageUri, existingStoragePath]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Always allow programmatic reset (post-save navigation)
      if (e.data.action.type === "RESET") {
        return;
      }

      // Prevent back navigation if we are currently saving
      if (isSaving) {
        e.preventDefault();
        return;
      }

      // If user uses hardware back or swipe back, ensure we run discard cleanup and reset
      if (e.data.action.type === "GO_BACK") {
        e.preventDefault();
        handleDiscard();
      }
    });

    return unsubscribe;
  }, [navigation, isSaving, handleDiscard]);

  const handleConfirmSave = async () => {
    if (!isFormValid || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const userId = useAuthStore.getState().user?.uid;
      if (!userId) {
        setSnackbarMessage("Please sign in to save items");
        setSnackbarVisible(true);
        setIsSaving(false);
        return;
      }

      const isOnline = useNetworkStore.getState().isOnline;

      const parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (!isOnline) {
        const draft: LocalDraft = {
          localId: generateDraftId(),
          userId,
          item: {
            title: title.trim(),
            category: category.trim(),
            color: color.trim(),
            condition: (condition.trim() ||
              "Good") as ItemDocument["condition"],
            tags: parsedTags,
            notes: notes.trim(),
            imageUrl: "",
            imagePath: "",
            aiGenerated: Boolean(aiResult),
            syncStatus: "pending",
          },
          localImageUri: imageUri,
          syncStatus: "pending",
          retryCount: 0,
          createdAt: new Date().toISOString(),
        };

        useItemStore.getState().addDraft(draft);

        setSnackbarMessage("Saved offline — will sync when connected");
        setSnackbarVisible(true);
        // Note: Keep isSaving true until navigation reset to prevent double-taps

        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "Main" }] });
        }, 1500);

        return;
      }

      let finalStoragePath = existingStoragePath;
      let finalDownloadUrl = existingDownloadUrl;

      if (!finalStoragePath || !finalDownloadUrl) {
        const uploadResult = await uploadItemImage(imageUri, userId);
        finalStoragePath = uploadResult.storagePath;
        finalDownloadUrl = uploadResult.downloadUrl;
      }

      const now = Timestamp.now();
      const itemData: Omit<ItemDocument, "id"> = {
        title: title.trim(),
        category: category.trim(),
        color: color.trim(),
        condition: (condition.trim() || "Good") as ItemDocument["condition"],
        tags: parsedTags,
        notes: notes.trim(),
        imageUrl: finalDownloadUrl,
        imagePath: finalStoragePath,
        aiGenerated: Boolean(aiResult),
        syncStatus: "synced",
        createdAt: now,
        updatedAt: now,
      };

      try {
        const savedItem = await saveItem(userId, itemData);
        useItemStore.getState().addItem(savedItem);

        // Clean up the temporary image after successful upload and save
        void cleanupTempImage(imageUri);

        setSnackbarMessage("Item saved");
        setSnackbarVisible(true);
        // Note: Keep isSaving true until navigation reset to prevent double-taps

        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "Main" }] });
        }, 1500);
      } catch (saveError) {
        if (!existingStoragePath && finalStoragePath) {
          await deleteItemImage(finalStoragePath);
        }
        throw saveError;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save item";
      setSnackbarMessage(message);
      setSnackbarVisible(true);
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
        testID="review-form-screen"
        accessibilityLabel="Review Form Screen"
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          testID="review-form-image"
          accessibilityLabel="Captured item image"
        />

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label} accessibilityLabel="Title field label">
              Title
            </Text>
            {aiFieldMap.title ? <AIFieldBadge testID="ai-badge-title" /> : null}
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
            testID="review-form-title-input"
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
            {aiFieldMap.category ? (
              <AIFieldBadge testID="ai-badge-category" />
            ) : null}
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
            testID="review-form-category-input"
            accessibilityLabel="Category"
          />
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label} accessibilityLabel="Color field label">
              Color
            </Text>
            {aiFieldMap.color ? <AIFieldBadge testID="ai-badge-color" /> : null}
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
            testID="review-form-color-input"
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
            {aiFieldMap.condition ? (
              <AIFieldBadge testID="ai-badge-condition" />
            ) : null}
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
            testID="review-form-condition-input"
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
            testID="review-form-tags-input"
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
            returnKeyType="default"
            testID="review-form-notes-input"
            accessibilityLabel="Notes"
          />
        </View>

        <Button
          mode="contained"
          disabled={!isFormValid || isSaving}
          loading={isSaving}
          onPress={handleConfirmSave}
          style={styles.confirmButton}
          contentStyle={styles.buttonContent}
          testID="review-form-confirm-save"
          accessibilityLabel="Confirm and save"
        >
          Confirm & Save
        </Button>

        <Button
          mode="outlined"
          onPress={handleDiscard}
          disabled={isSaving}
          style={styles.backButton}
          contentStyle={styles.buttonContent}
          testID="review-form-back"
          accessibilityLabel="Discard and return to dashboard"
        >
          Back
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={SNACKBAR_DURATION_MS}
        testID="review-form-snackbar"
        accessibilityLabel="Save status notification"
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
  confirmButton: {
    borderRadius: theme.borderRadius.buttons,
    marginTop: theme.spacing.space2,
  },
  backButton: {
    borderRadius: theme.borderRadius.buttons,
  },
  buttonContent: {
    minHeight: 44,
  },
});
