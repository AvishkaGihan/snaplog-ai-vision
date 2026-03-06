import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  Portal,
  Snackbar,
  Text,
} from "react-native-paper";
import Constants from "expo-constants";

import { SNACKBAR_DURATION_MS } from "@/constants/config";
import { theme } from "@/constants/theme";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { exportAndShareCsv } from "@/services/csvService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemStore } from "@/stores/useItemStore";

export default function SettingsScreen(): React.ReactElement {
  const { user, signOut } = useAuthStore(
    useShallow((state) => ({ user: state.user, signOut: state.signOut })),
  );
  const { signIn, isReady, loading: googleLoading } = useGoogleAuth();
  const { items, drafts } = useItemStore(
    useShallow((state) => ({ items: state.items, drafts: state.drafts })),
  );
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const initials = useMemo(() => {
    const source = user?.displayName ?? user?.email ?? "Anonymous User";
    return source.charAt(0).toUpperCase();
  }, [user?.displayName, user?.email]);

  const displayName = user?.displayName ?? "Anonymous User";
  const emailText = user?.email ?? "No email — sign in with Google";
  const isAnonymous = user?.isAnonymous ?? true;

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("[SettingsScreen] Error signing in with Google:", error);
      showSnackbar("Couldn't sign in with Google. Please try again.");
    }
  };

  const handleConfirmSignOut = async () => {
    setDialogVisible(false);
    try {
      await signOut();
    } catch (error) {
      console.error("[SettingsScreen] Error signing out:", error);
      showSnackbar("Couldn't sign out. Please try again.");
    }
  };

  const showSnackbar = (message: string): void => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleExportCsv = async () => {
    if (isExporting) {
      return;
    }

    if (items.length === 0 && drafts.length === 0) {
      showSnackbar("No items to export");
      return;
    }

    setIsExporting(true);

    try {
      await exportAndShareCsv(items, drafts);
    } catch (error) {
      console.error("[SettingsScreen] Error exporting CSV:", error);
      showSnackbar("Couldn't export items. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView
      style={styles.screen}
      testID="settings-screen"
      accessibilityLabel="Settings Screen"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="displayLarge" style={styles.title}>
          Settings
        </Text>

        <View
          style={styles.userCard}
          testID="settings-user-card"
          accessibilityLabel="User account information"
        >
          <View style={styles.userRow}>
            {user?.photoURL ? (
              <Avatar.Image
                size={theme.spacing.space8}
                source={{ uri: user.photoURL }}
                testID="settings-user-avatar-image"
                accessibilityLabel="User avatar image"
              />
            ) : (
              <Avatar.Text
                size={theme.spacing.space8}
                label={initials}
                testID="settings-user-avatar-fallback"
                accessibilityLabel="User avatar initials"
              />
            )}

            <View style={styles.userTextContainer}>
              <Text
                variant="titleMedium"
                style={styles.userName}
                testID="settings-user-display-name"
                accessibilityLabel={`Display name: ${displayName}`}
              >
                {displayName}
              </Text>
              <Text
                variant="bodyMedium"
                style={styles.userEmail}
                testID="settings-user-email"
                accessibilityLabel={`Email: ${emailText}`}
              >
                {emailText}
              </Text>
            </View>
          </View>

          {isAnonymous ? (
            <Button
              mode="contained"
              onPress={handleGoogleSignIn}
              disabled={!isReady || googleLoading}
              loading={googleLoading}
              testID="settings-google-sign-in-button"
              accessibilityLabel="Sign in with Google"
              style={styles.primaryButton}
            >
              Sign in with Google
            </Button>
          ) : (
            <Button
              mode="outlined"
              onPress={() => setDialogVisible(true)}
              testID="settings-sign-out-button"
              accessibilityLabel="Sign out"
              style={styles.signOutButton}
            >
              Sign Out
            </Button>
          )}
        </View>

        <Divider style={styles.divider} />

        <Button
          mode="contained"
          onPress={handleExportCsv}
          disabled={isExporting}
          loading={isExporting}
          icon="file-export"
          testID="settings-export-csv-button"
          accessibilityLabel="Export CSV"
          style={styles.exportButton}
        >
          Export CSV
        </Button>

        <Text variant="bodyMedium" style={styles.versionText}>
          App Version: {appVersion}
        </Text>
      </ScrollView>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          testID="settings-sign-out-dialog"
        >
          <Dialog.Title accessibilityLabel="Sign out question">
            Sign out?
          </Dialog.Title>
          <Dialog.Content>
            <Text
              variant="bodyMedium"
              accessibilityLabel="Sign out detail message"
            >
              You&apos;ll be signed in as an anonymous user.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDialogVisible(false)}
              testID="settings-sign-out-cancel-button"
              accessibilityLabel="Cancel sign out"
            >
              Cancel
            </Button>
            <Button
              onPress={handleConfirmSignOut}
              testID="settings-sign-out-confirm-button"
              accessibilityLabel="Confirm sign out"
            >
              Sign Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={SNACKBAR_DURATION_MS}
        testID="settings-snackbar"
        accessibilityLabel={snackbarMessage || "Settings notification"}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.space4,
    flexGrow: 1,
  },
  title: {
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.space4,
  },
  userCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.cards,
    padding: theme.spacing.space4,
    gap: theme.spacing.space4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space3,
  },
  userTextContainer: {
    flex: 1,
    gap: theme.spacing.space1,
  },
  userName: {
    color: theme.colors.onSurface,
  },
  userEmail: {
    color: theme.colors.onSurface,
  },
  primaryButton: {
    borderRadius: theme.borderRadius.buttons,
  },
  signOutButton: {
    borderRadius: theme.borderRadius.buttons,
    borderColor: theme.colors.outline,
  },
  divider: {
    marginVertical: theme.spacing.space4,
    backgroundColor: theme.colors.outline,
  },
  exportButton: {
    borderRadius: theme.borderRadius.buttons,
    marginBottom: theme.spacing.space4,
  },
  versionText: {
    color: theme.colors.onSurface,
  },
});
