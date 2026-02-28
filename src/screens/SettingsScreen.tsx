import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useShallow } from "zustand/react/shallow";
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  Portal,
  Text,
} from "react-native-paper";
import Constants from "expo-constants";

import { theme } from "@/constants/theme";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SettingsScreen(): React.ReactElement {
  const { user, signOut } = useAuthStore(
    useShallow((state) => ({ user: state.user, signOut: state.signOut })),
  );
  const { promptAsync, isReady, loading: googleLoading } = useGoogleAuth();
  const [dialogVisible, setDialogVisible] = useState(false);

  const initials = useMemo(() => {
    const source = user?.displayName ?? user?.email ?? "Anonymous User";
    return source.charAt(0).toUpperCase();
  }, [user?.displayName, user?.email]);

  const displayName = user?.displayName ?? "Anonymous User";
  const emailText = user?.email ?? "No email — sign in with Google";
  const isAnonymous = user?.isAnonymous ?? true;

  const handleGoogleSignIn = async () => {
    await promptAsync();
  };

  const handleConfirmSignOut = async () => {
    setDialogVisible(false);
    await signOut();
  };

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View
      style={styles.screen}
      testID="settings-screen"
      accessibilityLabel="Settings Screen"
    >
      <Text variant="displayLarge" style={styles.title}>
        Settings
      </Text>

      <View style={styles.userCard}>
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
            <Text variant="titleMedium" style={styles.userName}>
              {displayName}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
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

      <Text variant="bodyMedium" style={styles.versionText}>
        App Version: {appVersion}
      </Text>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          testID="settings-sign-out-dialog"
        >
          <Dialog.Title>Sign out?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.space4,
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
    color: theme.colors.onBackground,
  },
  userEmail: {
    color: theme.colors.onBackground,
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
  versionText: {
    color: theme.colors.onSurface,
  },
});
