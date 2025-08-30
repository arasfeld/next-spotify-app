import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { authSlice } from './features/auth/auth-slice';
import { spotifyApi } from './features/spotify/spotify-api';
import themeReducer from './features/theme/theme-slice';

const reducer = combineReducers({
  [authSlice.reducerPath]: authSlice.reducer,
  [spotifyApi.reducerPath]: spotifyApi.reducer,
  theme: themeReducer,
});

// Create a makeStore function that returns a new store for each request
export const makeStore = () => {
  const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Disable immutability check for RTK Query compatibility
        immutableCheck: false,
      }).concat(spotifyApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  setupListeners(store.dispatch);

  return store;
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
// Define a reusable type describing thunk functions
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
