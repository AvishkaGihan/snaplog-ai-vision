import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AIFieldBadge } from "@/components";
import { theme } from "@/constants/theme";
import { useRootStackNavigation } from "@/types/navigation.types";
import { useRootStackRoute } from "@/types/navigation.types";

export default function ReviewFormScreen() {
  const navigation = useRootStackNavigation();
  const insets = useSafeAreaInsets();
  const route = useRootStackRoute<"ReviewForm">();
  const { imageUri, aiResult } = route.params;

  const [title, setTitle] = useState(aiResult?.title ?? "");
  const [category, setCategory] = useState(aiResult?.category ?? "");
  const [color, setColor] = useState(aiResult?.color ?? "");
  const [condition, setCondition] = useState(aiResult?.condition ?? "");

  const aiFieldMap = useMemo(() => {
    return {
      title: Boolean(aiResult?.title),
      category: Boolean(aiResult?.category),
      color: Boolean(aiResult?.color),
      condition: Boolean(aiResult?.condition),
    };
  }, [aiResult]);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + theme.spacing.space4 },
      ]}
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
          <Text style={styles.label}>Title</Text>
          {aiFieldMap.title ? <AIFieldBadge testID="ai-badge-title" /> : null}
        </View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          testID="review-form-title-input"
          accessibilityLabel="Title"
        />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Category</Text>
          {aiFieldMap.category ? (
            <AIFieldBadge testID="ai-badge-category" />
          ) : null}
        </View>
        <TextInput
          value={category}
          onChangeText={setCategory}
          mode="outlined"
          style={styles.input}
          testID="review-form-category-input"
          accessibilityLabel="Category"
        />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Color</Text>
          {aiFieldMap.color ? <AIFieldBadge testID="ai-badge-color" /> : null}
        </View>
        <TextInput
          value={color}
          onChangeText={setColor}
          mode="outlined"
          style={styles.input}
          testID="review-form-color-input"
          accessibilityLabel="Color"
        />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Condition</Text>
          {aiFieldMap.condition ? (
            <AIFieldBadge testID="ai-badge-condition" />
          ) : null}
        </View>
        <TextInput
          value={condition}
          onChangeText={setCondition}
          mode="outlined"
          style={styles.input}
          testID="review-form-condition-input"
          accessibilityLabel="Condition"
        />
      </View>

      <Button
        mode="contained"
        disabled
        style={styles.confirmButton}
        contentStyle={styles.buttonContent}
        testID="review-form-confirm-save"
        accessibilityLabel="Confirm and save"
      >
        Confirm & Save
      </Button>

      <Button
        mode="outlined"
        onPress={handleBack}
        style={styles.backButton}
        contentStyle={styles.buttonContent}
        testID="review-form-back"
        accessibilityLabel="Back to camera"
      >
        Back
      </Button>
    </ScrollView>
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
  },
  label: {
    ...theme.typography.labelLarge,
    color: theme.colors.onBackground,
  },
  input: {
    backgroundColor: theme.colors.surface,
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
