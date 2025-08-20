export const AUTH_COOKIE_NAME = 'spotify_auth_token';
export const REFRESH_COOKIE_NAME = 'spotify_refresh_token';

// Client-side cookie utilities (fallback for when server actions aren't available)
export function setAuthCookies(accessToken: string, refreshToken: string) {
  if (typeof document === 'undefined') return;

  // Set cookies with appropriate options using document.cookie as fallback
  const secureFlag = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${AUTH_COOKIE_NAME}=${accessToken}; path=/; max-age=3600; samesite=strict${secureFlag}`;
  document.cookie = `${REFRESH_COOKIE_NAME}=${refreshToken}; path=/; max-age=2592000; samesite=strict${secureFlag}`; // 30 days
}

export function clearAuthCookies() {
  if (typeof document === 'undefined') return;

  // Clear cookies by setting them to expire in the past
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${REFRESH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getAuthTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const authCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`)
  );

  return authCookie ? authCookie.split('=')[1] : null;
}

export function getRefreshTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const refreshCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${REFRESH_COOKIE_NAME}=`)
  );

  return refreshCookie ? refreshCookie.split('=')[1] : null;
}

// Server-side cookie utilities (for use in server components)
export async function getServerSideAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

export async function getServerSideRefreshToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}
