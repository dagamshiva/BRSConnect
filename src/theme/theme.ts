import { DarkTheme, LightTheme, Theme } from "@react-navigation/native";
import type { ThemeColors } from "./themeColors";
import { darkTheme, whiteTheme } from "./themeColors";

export const getNavigationTheme = (colors: ThemeColors): Theme => {
  // Check if it's dark theme by comparing background color
  const isDark = colors.background === darkTheme.background;
  const baseTheme = isDark ? DarkTheme : LightTheme;
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
  };
};

// Default theme (light/white) for backward compatibility
export const CombinedDefaultTheme = getNavigationTheme(whiteTheme);

