// LocalStorage utilities for auth and theme persistence

const AUTH_STORAGE_KEY = 'spotify_auth';
const THEME_STORAGE_KEY = 'spotify_theme';

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Auth storage utilities
export const authStorage = {
  save: (authData: {
    accessToken: string | null;
    authenticated: boolean;
    expiresIn: number | null;
    refreshToken: string | null;
  }) => {
    if (isBrowser) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      } catch (error) {
        console.warn('Failed to save auth data to localStorage:', error);
      }
    }
  },

  load: () => {
    if (isBrowser) {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.warn('Failed to load auth data from localStorage:', error);
        return null;
      }
    }
    return null;
  },

  clear: () => {
    if (isBrowser) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear auth data from localStorage:', error);
      }
    }
  },
};

// Theme storage utilities
export const themeStorage = {
  save: (themeData: {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
  }) => {
    if (isBrowser) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeData));
      } catch (error) {
        console.warn('Failed to save theme data to localStorage:', error);
      }
    }
  },

  load: () => {
    if (isBrowser) {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.warn('Failed to load theme data from localStorage:', error);
        return null;
      }
    }
    return null;
  },

  clear: () => {
    if (isBrowser) {
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear theme data from localStorage:', error);
      }
    }
  },
};
