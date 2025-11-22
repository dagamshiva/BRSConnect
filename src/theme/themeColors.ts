// Modern theme color definitions
export const darkTheme = {
  background: "#121212",
  surface: "#1E1E1E",
  card: "#2A2A2A",
  primary: "#E80089",
  primaryLight: "#FF5C8D",
  primaryDark: "#B0003A",
  accent: "#FFC107",
  textPrimary: "#FFFFFF",
  textSecondary: "#D0D0D0",
  border: "#3A3A3A",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.3)",
} as const;

export const whiteTheme = {
  background: "#FAFAFA",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  primary: "#E80089",
  primaryLight: "#FF5C8D",
  primaryDark: "#B0003A",
  accent: "#FFC107",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  border: "#E5E7EB",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  overlay: "rgba(0, 0, 0, 0.4)",
  shadow: "rgba(0, 0, 0, 0.1)",
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof darkTheme | typeof whiteTheme;

