'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession, updateSession } from './session';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from './cookies';

// Server action to create session (replaces setAuthCookiesAction)
export async function createSessionAction(
  userId: string,
  accessToken: string,
  refreshToken: string
) {
  await createSession(userId, accessToken, refreshToken);
}

// Legacy function for backward compatibility
export async function setAuthCookiesAction(
  accessToken: string,
  refreshToken: string
) {
  // For Spotify, we'll use the user's Spotify ID as userId
  // This will be set properly when we get user data
  await createSession('spotify_user', accessToken, refreshToken);
}

// Server action to clear authentication cookies
export async function clearAuthCookiesAction() {
  await deleteSession();
}

// Server action to update access token
export async function updateAccessTokenAction(
  accessToken: string,
  refreshToken?: string
) {
  await updateSession(accessToken, refreshToken);
}

// Server action for logout with redirect
export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
