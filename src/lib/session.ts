'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey =
  process.env.SESSION_SECRET || 'fallback-secret-key-for-development';
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  [key: string]: unknown; // Allow additional string keys for JWT compatibility
}

// Encrypt session data into a JWT
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

// Decrypt session JWT
export async function decrypt(session: string | undefined = '') {
  // Return null early for empty or undefined sessions
  if (!session || session.trim() === '') {
    return null;
  }

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    // Only log actual errors, not expected invalid sessions
    if (
      error instanceof Error &&
      (error as { code?: string }).code !== 'ERR_JWS_INVALID'
    ) {
      console.log('Failed to verify session:', error);
    }
    return null;
  }
}

// Create a new session
export async function createSession(
  userId: string,
  accessToken: string,
  refreshToken: string
) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({
    userId,
    accessToken,
    refreshToken,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

// Update session with new tokens
export async function updateSession(
  accessToken: string,
  refreshToken?: string
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  const payload = await decrypt(sessionCookie);
  if (!payload) {
    return null;
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const newSession = await encrypt({
    userId: payload.userId,
    accessToken,
    refreshToken: refreshToken || payload.refreshToken,
    expiresAt,
  });

  cookieStore.set('session', newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

// Delete session
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Get session data
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  return await decrypt(session);
}
