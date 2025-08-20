import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const initialState: ThemeState = {
  mode: 'system',
  primaryColor: 'green',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<MantineColor>) => {
      state.primaryColor = action.payload;
    },
  },
});

export const { setThemeMode, setPrimaryColor } = themeSlice.actions;
export default themeSlice.reducer;
