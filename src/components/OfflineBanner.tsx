import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";

import { semanticColors, theme } from "@/constants/theme";

const BANNER_HEIGHT = 36;
const ANIMATION_DURATION = 200;

interface OfflineBannerProps {
  visible: boolean;
}

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(heightAnim, {
        toValue: BANNER_HEIGHT,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start();
      return;
    }

    Animated.timing(heightAnim, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setShouldRender(false);
      }
    });
  }, [heightAnim, visible]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.bannerContainer, { height: heightAnim }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel="You are offline. Items will sync when reconnected"
      testID="offline-banner"
    >
      <View style={styles.bannerContent}>
        <MaterialCommunityIcons
          name="cloud-off-outline"
          size={16}
          color={theme.colors.onBackground}
        />
        <Text style={styles.bannerText}>
          You're offline — items will sync when reconnected
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: semanticColors.syncPending,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bannerContent: {
    height: BANNER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.space2,
    paddingHorizontal: theme.spacing.space4,
  },
  bannerText: {
    ...theme.typography.labelSmall,
    color: theme.colors.onBackground,
    fontWeight: "600",
  },
});
