import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { theme } from "@/constants/theme";

type PermissionCardProps = {
  icon?: string;
  title: string;
  description: string;
  onAllow: () => void;
  allowLabel?: string;
  onOpenSettings: () => void;
  showSettingsButton?: boolean;
  testID?: string;
  allowButtonTestID?: string;
  settingsButtonTestID?: string;
  allowAccessibilityLabel?: string;
  settingsAccessibilityLabel?: string;
};

export default function PermissionCard({
  icon = "camera",
  title,
  description,
  onAllow,
  allowLabel = "Allow Access",
  onOpenSettings,
  showSettingsButton = true,
  testID,
  allowButtonTestID,
  settingsButtonTestID,
  allowAccessibilityLabel,
  settingsAccessibilityLabel,
}: PermissionCardProps) {
  return (
    <Card style={styles.card} testID={testID} accessibilityLabel={title}>
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon}
            size={40}
            color={theme.colors.primary}
          />
        </View>

        <Text variant="titleLarge" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>

        <Button
          mode="contained"
          onPress={onAllow}
          style={styles.allowButton}
          contentStyle={styles.buttonContent}
          testID={allowButtonTestID}
          accessibilityLabel={allowAccessibilityLabel ?? allowLabel}
        >
          {allowLabel}
        </Button>

        {showSettingsButton ? (
          <Button
            mode="text"
            onPress={onOpenSettings}
            style={styles.settingsButton}
            contentStyle={styles.buttonContent}
            testID={settingsButtonTestID}
            accessibilityLabel={
              settingsAccessibilityLabel ?? "Open device settings"
            }
          >
            Open Settings
          </Button>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.cards,
    borderColor: theme.colors.outline,
    borderWidth: 1,
  },
  content: {
    padding: theme.spacing.space5,
    alignItems: "center",
    gap: theme.spacing.space3,
  },
  iconContainer: {
    marginBottom: theme.spacing.space2,
  },
  title: {
    color: theme.colors.onBackground,
    textAlign: "center",
  },
  description: {
    color: theme.colors.onBackground,
    textAlign: "center",
    marginBottom: theme.spacing.space2,
  },
  allowButton: {
    width: "100%",
    borderRadius: theme.borderRadius.buttons,
  },
  settingsButton: {
    width: "100%",
    borderRadius: theme.borderRadius.buttons,
  },
  buttonContent: {
    minHeight: 44,
  },
});
