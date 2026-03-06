import React from "react";
import { StyleSheet } from "react-native";
import { Chip } from "react-native-paper";

import { theme } from "@/constants/theme";

interface CategoryChipProps {
  category: string;
  selected: boolean;
  onPress: () => void;
}

const CategoryChip = React.memo(function CategoryChip({
  category,
  selected,
  onPress,
}: CategoryChipProps) {
  return (
    <Chip
      mode={selected ? "flat" : "outlined"}
      onPress={onPress}
      selected={selected}
      style={[styles.chip, selected ? styles.chipSelected : null]}
      textStyle={[styles.chipText, selected ? styles.chipTextSelected : null]}
      compact
      testID={`category-chip-${category}`}
      accessibilityLabel={`Filter by ${category}`}
    >
      {category}
    </Chip>
  );
});

export default CategoryChip;

const styles = StyleSheet.create({
  chip: {
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.chips,
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primaryContainer,
  },
  chipText: {
    ...theme.typography.labelSmall,
    color: theme.colors.onSurface,
  },
  chipTextSelected: {
    color: theme.colors.onBackground,
  },
});
