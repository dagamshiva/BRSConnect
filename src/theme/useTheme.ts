import { useAppSelector } from '../store/hooks';
import { selectTheme } from '../store/slices/themeSlice';
import { darkTheme, whiteTheme } from './themeColors';
import type { ThemeColors } from './themeColors';

export const useTheme = (): ThemeColors => {
  try {
    const themeMode = useAppSelector(selectTheme);
    return themeMode === 'dark' ? darkTheme : whiteTheme;
  } catch (error) {
    // Fallback to white theme if there's any issue with the store
    console.warn('Theme hook error, using default white theme:', error);
    return whiteTheme;
  }
};

