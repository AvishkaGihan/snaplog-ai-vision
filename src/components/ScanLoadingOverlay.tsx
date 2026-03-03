import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AI_LOADING_COPY_INTERVAL_MS, AI_TIMEOUT_MS } from "@/constants/config";
import { theme } from "@/constants/theme";

const LOADING_MESSAGES = [
  "Analyzing image...",
  "Identifying item...",
  "Almost done...",
] as const;

interface ScanLoadingOverlayProps {
  visible: boolean;
  onTimeout?: () => void;
}

export default function ScanLoadingOverlay({
  visible,
  onTimeout,
}: ScanLoadingOverlayProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      rotateAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [rotateAnim, visible]);

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      return;
    }

    const intervalId = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, AI_LOADING_COPY_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !onTimeout) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onTimeout();
    }, AI_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onTimeout, visible]);

  if (!visible) {
    return null;
  }

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={styles.overlay}
      testID="scan-loading-overlay"
      accessibilityLabel="AI analysis in progress"
    >
      <View style={styles.overlayTint} testID="scan-loading-overlay-blur" />
      <Animated.View
        style={[styles.ring, { transform: [{ rotate }] }]}
        testID="scan-loading-ring"
      />
      <Text
        style={styles.message}
        accessibilityLiveRegion="polite"
        testID="scan-loading-message"
      >
        {LOADING_MESSAGES[messageIndex]}
      </Text>
    </View>
  );
}

const RING_SIZE = 64;
const RING_BORDER = 4;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  overlayTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 15, 19, 0.6)",
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_BORDER,
    borderColor: theme.colors.primary,
    borderTopColor: "transparent",
    marginBottom: theme.spacing.space4,
  },
  message: {
    color: theme.colors.onBackground,
    ...theme.typography.bodyLarge,
    textAlign: "center",
  },
});
