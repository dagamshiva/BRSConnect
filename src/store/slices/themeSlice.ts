import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootState } from '../index';
import type { ThemeMode } from '../../theme/themeColors';

const THEME_STORAGE_KEY = '@brsconnect_theme_mode';

interface ThemeState {
  mode: ThemeMode;
  loading: boolean;
}

// Load theme from storage
export const loadTheme = createAsyncThunk('theme/loadTheme', async () => {
  try {
    const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme as ThemeMode;
    }
    return 'light' as ThemeMode; // Default to light
  } catch (error) {
    console.warn('Failed to load theme from storage:', error);
    return 'light' as ThemeMode;
  }
});

// Save theme to storage
const saveThemeToStorage = async (mode: ThemeMode) => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.warn('Failed to save theme to storage:', error);
  }
};

const initialState: ThemeState = {
  mode: 'light', // Default to white/light theme
  loading: true, // Loading state until we check storage
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      // Save to storage
      saveThemeToStorage(action.payload);
    },
    toggleTheme: (state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      // Save to storage
      saveThemeToStorage(newMode);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTheme.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadTheme.fulfilled, (state, action) => {
        state.mode = action.payload;
        state.loading = false;
      })
      .addCase(loadTheme.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme.mode;
export const selectThemeLoading = (state: RootState) => state.theme.loading;

export default themeSlice.reducer;

