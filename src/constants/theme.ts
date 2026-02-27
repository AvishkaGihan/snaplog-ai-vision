import {
  MD3DarkTheme,
  configureFonts,
  type MD3Theme,
} from "react-native-paper";

const typographyConfigMap = {
  displayLarge: {
    fontFamily: "Inter-Bold",
    fontSize: 28,
    fontWeight: "700" as const,
    lineHeight: 34,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: "Inter-SemiBold",
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelLarge: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelSmall: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
};

const typographyConfig = {
  fontFamily: "Inter-Regular",
  ...typographyConfigMap
}

export const spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 24,
  space6: 32,
  space8: 48,
} as const;

export const borderRadius = {
  cards: 12,
  buttons: 8,
  chips: 16,
  inputs: 8,
  fab: 16,
} as const;

export const semanticColors = {
  syncPending: "#F0A000",
  syncComplete: "#4CAF50",
  aiAccent: "#64DFDF",
} as const;

export type AppTheme = MD3Theme & {
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typographyConfig;
  semanticColors: typeof semanticColors;
};

export const theme: AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: "#0F0F13",
    surface: "#1A1A22",
    surfaceVariant: "#252530",
    primary: "#7C6EF8",
    primaryContainer: "#3A2E8A",
    secondary: "#64DFDF",
    error: "#FF6B6B",
    onBackground: "#EAEAF0",
    onSurface: "#C8C8D4",
    outline: "#3A3A48",
  },
  fonts: configureFonts({ config: typographyConfig }),
  spacing,
  borderRadius,
  typography: typographyConfig,
  semanticColors,
};
