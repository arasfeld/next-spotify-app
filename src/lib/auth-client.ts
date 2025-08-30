const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

if (!CLIENT_ID) {
  throw new Error(
    'NEXT_PUBLIC_SPOTIFY_CLIENT_ID environment variable is required'
  );
}

export const refreshTokens = async (
  refreshToken: string
): Promise<{ access_token: string; expires_in: number } | null> => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Token refresh failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return null;
    }

    const data = await response.json();

    if (!data.access_token) {
      console.warn('Token refresh response missing access_token:', data);
      return null;
    }

    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 3600, // Default to 1 hour if not provided
    };
  } catch (error) {
    console.error('Token refresh network error:', error);
    return null;
  }
};
