import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { themeStorage } from '../../localStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

// Mantine color options - using valid Mantine v7 color keys
export const MANTINE_COLORS = [
  'blue',
  'cyan',
  'gray',
  'green',
  'indigo',
  'orange',
  'pink',
  'red',
  'teal',
  'violet',
  'yellow',
] as const;

export type MantineColor = (typeof MANTINE_COLORS)[number];

interface ThemeState {
  mode: ThemeMode;
  primaryColor: MantineColor;
}

// Load initial state from localStorage (only on client side)
const loadInitialState = (): ThemeState => {
  // Only try to load from localStorage on the client side
  if (typeof window !== 'undefined') {
    const stored = themeStorage.load();
    if (stored) {
      return {
        mode: stored.mode,
        primaryColor: stored.primaryColor,
      };
    }
  }
  return {
    mode: 'system',
    primaryColor: 'green',
  };
};

const initialState: ThemeState = loadInitialState();

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      // Save to localStorage
      themeStorage.save(state);
    },
    setPrimaryColor: (state, action: PayloadAction<MantineColor>) => {
      state.primaryColor = action.payload;
      // Save to localStorage
      themeStorage.save(state);
    },
  },
});

export const { setThemeMode, setPrimaryColor } = themeSlice.actions;
export default themeSlice.reducer;
