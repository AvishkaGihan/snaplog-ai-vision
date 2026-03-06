import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { ActivityIndicator, ProgressBar, Text } from "react-native-paper";
import { useShallow } from "zustand/react/shallow";

import { theme } from "@/constants/theme";
import { useItemStore } from "@/stores/useItemStore";

export default function SyncStatusBar() {
  const { isSyncing, syncTotal, syncCompleted, syncComplete } = useItemStore(
    useShallow((state) => ({
      isSyncing: state.isSyncing,
      syncTotal: state.syncTotal,
      syncCompleted: state.syncCompleted,
      syncComplete: state.syncComplete,
    })),
  );

  const visibilityAnimation = useRef(new Animated.Value(0)).current;
  const isVisible = isSyncing || syncComplete;
  const [shouldRender, setShouldRender] = React.useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
    Animated.timing(visibilityAnimation, {
      toValue: isVisible ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      if (!isVisible) {
        setShouldRender(false);
      }
    });
  }, [isVisible, visibilityAnimation]);

  const progress = useMemo(() => {
    if (syncTotal <= 0) {
      return 0;
    }

    return syncCompleted / syncTotal;
  }, [syncCompleted, syncTotal]);

  if (!shouldRender) {
    return null;
  }

  const remaining = Math.max(syncTotal - syncCompleted, 0);
  const label = syncComplete
    ? "All synced ✓"
    : `Syncing ${remaining} item${remaining === 1 ? "" : "s"}...`;
  const containerColor = syncComplete
    ? theme.semanticColors.syncComplete
    : theme.semanticColors.syncPending;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: containerColor,
          opacity: visibilityAnimation,
          transform: [
            {
              translateY: visibilityAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-28, 0],
              }),
            },
          ],
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      accessibilityLabel={label}
      testID="sync-status-bar"
    >
      <View style={styles.row}>
        {isSyncing ? (
          <ActivityIndicator size="small" color={theme.colors.onBackground} />
        ) : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      {isSyncing ? (
        <ProgressBar
          progress={progress}
          color={theme.colors.onBackground}
          style={styles.progressBar}
          testID="sync-progress-bar"
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.buttons,
    paddingHorizontal: theme.spacing.space3,
    paddingVertical: theme.spacing.space2,
    gap: theme.spacing.space2,
    marginTop: theme.spacing.space2,
    marginBottom: theme.spacing.space1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.space2,
  },
  label: {
    ...theme.typography.labelLarge,
    color: theme.colors.onBackground,
  },
  progressBar: {
    height: 6,
    borderRadius: theme.borderRadius.buttons,
    backgroundColor: theme.colors.surface,
  },
});
