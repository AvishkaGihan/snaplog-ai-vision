import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator, Button, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PermissionCard } from "@/components";
import { theme } from "@/constants/theme";
import { compressImage } from "@/services/imageService";
import { useRootStackNavigation } from "@/types/navigation.types";

export default function CameraScreen() {
  const navigation = useRootStackNavigation();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [showGalleryPermission, setShowGalleryPermission] = useState(false);
  const showGalleryPermissionRef = useRef(false);
  const isMounted = useRef(true);
  const isNavigating = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    showGalleryPermissionRef.current = showGalleryPermission;
  }, [showGalleryPermission]);

  const handleTakePicture = useCallback(async () => {
    if (!cameraRef.current || !cameraReady || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (isMounted.current && picture?.uri) {
        setCapturedImageUri(picture.uri);
      }
    } catch (error) {
      console.warn("Failed to capture image", error);
    } finally {
      if (isMounted.current) {
        setIsCapturing(false);
      }
    }
  }, [cameraReady, isCapturing]);

  const navigateToReviewForm = useCallback(
    (imageUri: string) => {
      isNavigating.current = true;
      navigation.navigate("ReviewForm", { imageUri });

      setTimeout(() => {
        if (isMounted.current) {
          isNavigating.current = false;
        }
      }, 500);
    },
    [navigation],
  );

  const handleUsePhoto = useCallback(async () => {
    if (!capturedImageUri || isNavigating.current || isCompressing) {
      return;
    }

    try {
      setIsCompressing(true);
      const compressed = await compressImage(capturedImageUri);

      if (!isMounted.current) {
        return;
      }

      navigateToReviewForm(compressed.uri);
    } catch (error) {
      console.warn("Failed to compress image", error);

      if (!isMounted.current) {
        return;
      }

      Alert.alert(
        "Compression Failed",
        "Couldn't compress the image. Retry, or continue with the original photo.",
        [
          {
            text: "Retry",
            onPress: () => {
              void handleUsePhoto();
            },
          },
          {
            text: "Use Original",
            onPress: () => {
              if (!capturedImageUri) {
                return;
              }

              navigateToReviewForm(capturedImageUri);
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    } finally {
      if (isMounted.current) {
        setIsCompressing(false);
      }
    }
  }, [capturedImageUri, isCompressing, navigateToReviewForm]);

  const handleRetake = useCallback(() => {
    setCapturedImageUri(null);
  }, []);

  const handleRequestPermission = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  const openGalleryPicker = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!isMounted.current) return;

    if (!result.canceled && result.assets[0]) {
      setCapturedImageUri(result.assets[0].uri);
    }
  }, []);

  const handlePickFromGallery = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!isMounted.current) return;

      if (status !== "granted") {
        setShowGalleryPermission(true);
        return;
      }

      setShowGalleryPermission(false);
      await openGalleryPicker();
    } catch (error) {
      console.warn("Failed to pick image from gallery", error);
      Alert.alert(
        "Gallery Error",
        "Failed to open the photo gallery. Please try again.",
      );
    }
  }, [openGalleryPicker]);

  const handleAllowGalleryPermission = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!isMounted.current) return;

      if (status !== "granted") {
        setShowGalleryPermission(true);
        return;
      }

      setShowGalleryPermission(false);
      await openGalleryPicker();
    } catch (error) {
      console.warn("Failed to request gallery permission", error);
      Alert.alert(
        "Permission Error",
        "Failed to request photo gallery access. Please try again.",
      );
    }
  }, [openGalleryPicker]);

  const handleDismissGalleryPermission = useCallback(() => {
    setShowGalleryPermission(false);
  }, []);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const handleAppForegroundPermissionRecheck = useCallback(async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.warn(
        "Failed to re-check camera permission after app foreground",
        error,
      );
    }

    if (!showGalleryPermissionRef.current) {
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!isMounted.current) return;

      if (status === "granted") {
        setShowGalleryPermission(false);
        await openGalleryPicker();
      }
    } catch (error) {
      console.warn(
        "Failed to re-check gallery permission after app foreground",
        error,
      );
    }
  }, [openGalleryPicker, requestPermission]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isChecking = false;

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        // Only run check if we are transitioning FROM background TO active
        const isComingToForeground =
          appState.current.match(/inactive|background/) &&
          nextAppState === "active";

        if (isComingToForeground && !isChecking) {
          isChecking = true;
          // Debounce the check slightly to let the OS permission dialogs settle
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            if (isMounted.current) {
              void handleAppForegroundPermissionRecheck().finally(() => {
                isChecking = false;
              });
            } else {
              isChecking = false;
            }
          }, 500);
        }

        appState.current = nextAppState;
      },
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.remove();
    };
  }, [handleAppForegroundPermissionRecheck]);

  if (!permission) {
    return (
      <View style={styles.loadingContainer} testID="camera-screen-loading">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.permissionContainer,
          { paddingTop: insets.top + theme.spacing.space4 },
        ]}
        accessibilityLiveRegion="polite"
      >
        <PermissionCard
          icon="camera"
          title="Camera Access Needed"
          description="SnapLog needs camera access to photograph items for your inventory. Your photos are processed securely."
          onAllow={handleRequestPermission}
          allowLabel="Allow Camera Access"
          onOpenSettings={handleOpenSettings}
          showSettingsButton
          testID="camera-permission-card"
          allowButtonTestID="camera-permission-allow"
          settingsButtonTestID="camera-permission-settings"
          allowAccessibilityLabel="Allow camera access"
          settingsAccessibilityLabel="Open device settings"
        />
      </View>
    );
  }

  if (capturedImageUri) {
    return (
      <View style={styles.screen}>
        <Image
          source={{ uri: capturedImageUri }}
          style={styles.previewImage}
          resizeMode="cover"
          accessibilityLabel="Captured photo preview"
        />

        <IconButton
          icon="close"
          size={24}
          mode="contained"
          onPress={() => navigation.goBack()}
          style={[
            styles.closeButton,
            { top: insets.top + theme.spacing.space2 },
          ]}
          iconColor={theme.colors.onBackground}
          containerColor={theme.colors.surface}
          testID="camera-close"
          accessibilityLabel="Close camera"
        />

        <View
          style={[
            styles.previewActions,
            { paddingBottom: insets.bottom + theme.spacing.space4 },
          ]}
        >
          <Button
            mode="outlined"
            onPress={handleRetake}
            disabled={isCompressing}
            style={styles.previewButton}
            contentStyle={styles.previewButtonContent}
            testID="camera-retake"
            accessibilityLabel="Retake photo"
          >
            Retake
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              void handleUsePhoto();
            }}
            disabled={isCompressing}
            style={styles.previewButton}
            contentStyle={styles.previewButtonContent}
            testID="camera-use-photo"
            accessibilityLabel="Use photo"
          >
            {isCompressing ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.onPrimary}
                testID="camera-compressing-indicator"
                accessibilityLabel="Compressing image"
              />
            ) : (
              "Use Photo"
            )}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.screen}
      testID="camera-screen"
      accessibilityLabel="Camera Screen"
    >
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        animateShutter
        onCameraReady={() => setCameraReady(true)}
        accessibilityLabel="Camera viewfinder"
      />

      <IconButton
        icon="close"
        size={24}
        mode="contained"
        onPress={() => navigation.goBack()}
        style={[styles.closeButton, { top: insets.top + theme.spacing.space2 }]}
        iconColor={theme.colors.onBackground}
        containerColor={theme.colors.surface}
        testID="camera-close"
        accessibilityLabel="Close camera"
      />

      <View
        style={[
          styles.shutterContainer,
          { paddingBottom: insets.bottom + theme.spacing.space4 },
        ]}
      >
        <IconButton
          icon="image-multiple"
          size={24}
          mode="contained"
          onPress={handlePickFromGallery}
          style={styles.galleryButton}
          iconColor={theme.colors.onBackground}
          containerColor="rgba(26, 26, 34, 0.6)"
          testID="camera-gallery-picker"
          accessibilityRole="button"
          accessibilityLabel="Pick from gallery"
        />

        <Pressable
          onPress={handleTakePicture}
          disabled={!cameraReady || isCapturing}
          style={[
            styles.shutterButton,
            (!cameraReady || isCapturing) && styles.shutterButtonDisabled,
          ]}
          testID="camera-shutter"
          accessibilityRole="button"
          accessibilityLabel="Take photo"
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color={theme.colors.onBackground} />
          ) : null}
        </Pressable>

        <View style={styles.shutterSpacer} />
      </View>

      {showGalleryPermission ? (
        <View
          style={styles.galleryPermissionOverlay}
          accessibilityLiveRegion="polite"
        >
          <PermissionCard
            icon="image-multiple"
            title="Photo Library Access Needed"
            description="SnapLog needs access to your photo library so you can select existing photos for cataloging."
            onAllow={handleAllowGalleryPermission}
            allowLabel="Allow Photo Access"
            onOpenSettings={handleOpenSettings}
            showSettingsButton
            testID="gallery-permission-card"
            allowButtonTestID="gallery-permission-allow"
            settingsButtonTestID="gallery-permission-settings"
            allowAccessibilityLabel="Allow photo library access"
            settingsAccessibilityLabel="Open device settings"
          />

          <Button
            mode="text"
            onPress={handleDismissGalleryPermission}
            style={styles.galleryPermissionDismissButton}
            contentStyle={styles.previewButtonContent}
            testID="gallery-permission-dismiss"
            accessibilityLabel="Dismiss gallery permission message"
          >
            Dismiss
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.space4,
  },
  closeButton: {
    position: "absolute",
    left: theme.spacing.space3,
    zIndex: 2,
  },
  shutterContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.space4,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 0,
  },
  shutterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterButtonDisabled: {
    opacity: 0.6,
  },
  shutterSpacer: {
    width: 44,
    height: 44,
  },
  previewImage: {
    flex: 1,
    width: "100%",
  },
  previewActions: {
    position: "absolute",
    left: theme.spacing.space4,
    right: theme.spacing.space4,
    bottom: 0,
    gap: theme.spacing.space3,
  },
  previewButton: {
    borderRadius: theme.borderRadius.buttons,
  },
  previewButtonContent: {
    minHeight: 44,
  },
  galleryPermissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 15, 19, 0.85)",
    justifyContent: "center",
    padding: theme.spacing.space4,
    gap: theme.spacing.space3,
    zIndex: 10,
  },
  galleryPermissionDismissButton: {
    borderRadius: theme.borderRadius.buttons,
  },
});
