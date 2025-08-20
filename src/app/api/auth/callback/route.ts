import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookiesAction } from '@/lib/auth-actions';

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ||
  'http://127.0.0.1:3000/callback';

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    if (!codeVerifier) {
      return NextResponse.json(
        { error: 'Code verifier is required' },
        { status: 400 }
      );
    }

    if (!CLIENT_ID) {
      console.error('Missing CLIENT_ID');
      return NextResponse.json(
        { error: 'Spotify client ID not configured' },
        { status: 500 }
      );
    }

    // Exchange authorization code for tokens using PKCE
    const requestBody = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody,
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));

      // Log error details for debugging (but not the full response)
      console.error('Spotify token exchange failed:', {
        status: tokenResponse.status,
        error: errorData.error,
        description: errorData.error_description,
      });

      return NextResponse.json(
        {
          error:
            errorData.error_description ||
            'Failed to exchange authorization code for tokens',
          details: errorData.error,
        },
        { status: 400 }
      );
    }

    const tokens = await tokenResponse.json();

    // Set cookies using server action
    await setAuthCookiesAction(tokens.access_token, tokens.refresh_token);

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
