import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { authStorage } from '../../localStorage';
import { setAuthCookies, clearAuthCookies } from '../../cookies';
import type { Tokens } from '../../types';

interface AuthState {
  accessToken: string | null;
  authenticated: boolean;
  expiresIn: number | null;
  refreshToken: string | null;
}

// Load initial state from localStorage (only on client side)
const loadInitialState = (): AuthState => {
  // Only try to load from localStorage on the client side
  if (typeof window !== 'undefined') {
    const stored = authStorage.load();
    if (stored) {
      return {
        accessToken: stored.accessToken,
        authenticated: stored.authenticated,
        expiresIn: stored.expiresIn,
        refreshToken: stored.refreshToken,
      };
    }
  }
  return {
    accessToken: null,
    authenticated: false,
    expiresIn: null,
    refreshToken: null,
  };
};

const initialState: AuthState = loadInitialState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<Tokens>) => {
      const { access_token, refresh_token, expires_in } = action.payload;
      state.accessToken = access_token;
      state.refreshToken = refresh_token;
      state.expiresIn = expires_in;
      state.authenticated = true;

      // Save to localStorage
      authStorage.save(state);

      // Set cookies for middleware authentication
      if (typeof window !== 'undefined') {
        setAuthCookies(access_token, refresh_token);
      }
    },
    updateAccessToken: (
      state,
      action: PayloadAction<{ access_token: string; expires_in: number }>
    ) => {
      const { access_token, expires_in } = action.payload;
      state.accessToken = access_token;
      state.expiresIn = expires_in;

      // Save to localStorage
      authStorage.save(state);

      // Update cookies for middleware authentication
      if (typeof window !== 'undefined' && state.refreshToken) {
        setAuthCookies(access_token, state.refreshToken);
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresIn = null;
      state.authenticated = false;

      // Clear localStorage
      authStorage.clear();

      // Clear cookies for middleware authentication
      if (typeof window !== 'undefined') {
        clearAuthCookies();
      }
    },
  },
});

export const { setCredentials, updateAccessToken, logout } = authSlice.actions;
