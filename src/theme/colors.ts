import { darkTheme, whiteTheme } from './themeColors';
import type { ThemeColors } from './themeColors';

// Default export for backward compatibility (uses light theme by default)
export const colors: ThemeColors = whiteTheme;

// Export theme colors for direct access
export { darkTheme, whiteTheme };

