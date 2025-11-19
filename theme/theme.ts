import { DarkTheme, Theme } from "@react-navigation/native";

import { colors } from "./colors";

const AppTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

export const CombinedDefaultTheme = AppTheme;

