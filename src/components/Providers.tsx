'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

import { ThemeProvider } from './ThemeProvider';
import { makeStore, AppStore } from '../lib/store';

// Simple loading component that works consistently on server and client
const LoadingComponent = () => (
  <div
    style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      backgroundColor: 'var(--mantine-color-body, #ffffff)',
      color: 'var(--mantine-color-text, #1a1b1e)',
    }}
  >
    Loading...
  </div>
);

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  const persistor = storeRef.current ? persistStore(storeRef.current) : null;

  return (
    <Provider store={storeRef.current}>
      {persistor ? (
        <PersistGate loading={<LoadingComponent />} persistor={persistor}>
          <ThemeProvider>{children}</ThemeProvider>
        </PersistGate>
      ) : (
        <ThemeProvider>{children}</ThemeProvider>
      )}
    </Provider>
  );
}
