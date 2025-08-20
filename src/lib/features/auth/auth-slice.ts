import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tokens } from '../../types';
import { setAuthCookies, clearAuthCookies } from '../../cookies';

interface AuthState {
  accessToken: string | null;
  authenticated: boolean;
  expiresIn: number | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  authenticated: false,
  expiresIn: null,
  refreshToken: null,
};

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
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresIn = null;
      state.authenticated = false;

      // Clear cookies for middleware authentication
      if (typeof window !== 'undefined') {
        clearAuthCookies();
      }
    },
  },
});

export const { setCredentials, updateAccessToken, logout } = authSlice.actions;
