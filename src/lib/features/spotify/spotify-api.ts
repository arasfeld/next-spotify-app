import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

import { refreshTokens } from '@/lib/auth-client';
import type { RootState } from '@/lib/store';
import type {
  Album,
  Artist,
  PlaylistsResponse,
  RecentlyPlayedItem,
  SpotifyApiResponse,
  Track,
  User,
} from '@/lib/types';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://api.spotify.com/v1/',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Token expired, try to refresh
    const state = api.getState() as RootState;
    const { refreshToken } = state.auth;

    if (refreshToken) {
      const refreshResult = await refreshTokens(refreshToken);
      if (refreshResult) {
        // Update the store with new tokens
        api.dispatch({
          type: 'auth/updateAccessToken',
          payload: refreshResult,
        });
        // Retry the original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        api.dispatch({ type: 'auth/logout' });
      }
    } else {
      // No refresh token, logout user
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

export const spotifyApi = createApi({
  reducerPath: 'spotifyApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getCurrentUserProfile: builder.query<User, void>({
      query: () => `me`,
    }),
    getTopArtists: builder.query<
      SpotifyApiResponse<Artist>,
      { timeRange?: string }
    >({
      query: ({ timeRange = 'medium_term' }) =>
        `me/top/artists?time_range=${timeRange}`,
    }),
    getTopTracks: builder.query<
      SpotifyApiResponse<Track>,
      { timeRange?: string }
    >({
      query: ({ timeRange = 'medium_term' }) =>
        `me/top/tracks?time_range=${timeRange}`,
    }),
    // Note: Using 'any' for these endpoints is acceptable as they represent
    // dynamic Spotify API responses that can vary in structure
    getUserPlaylists: builder.query<PlaylistsResponse, void>({
      query: () => `me/playlists`,
    }),
    search: builder.query<
      any,
      {
        query: string;
        type?: string;
        limit?: number;
        offset?: number;
        market?: string;
      }
    >({
      query: ({
        query,
        type = 'track,artist,album,playlist',
        limit = 20,
        offset = 0,
        market = 'US',
      }) => ({
        url: 'search',
        params: {
          q: query,
          type,
          limit,
          offset,
          market,
        },
      }),
    }),
    getCurrentlyPlaying: builder.query<any, void>({
      query: () => `me/player/currently-playing`,
    }),
    getRecentlyPlayed: builder.query<
      SpotifyApiResponse<RecentlyPlayedItem>,
      void
    >({
      query: () => `me/player/recently-played`,
    }),
    getPlaylist: builder.query<any, string>({
      query: (playlistId) => `playlists/${playlistId}`,
    }),
    getPlaylistTracks: builder.query<
      any,
      { playlistId: string; limit?: number; offset?: number }
    >({
      query: ({ playlistId, limit = 100, offset = 0 }) => ({
        url: `playlists/${playlistId}/tracks`,
        params: { limit, offset },
      }),
    }),
    getSavedTracks: builder.query<
      SpotifyApiResponse<{ added_at: string; track: Track }>,
      { limit?: number; offset?: number }
    >({
      query: ({ limit = 50, offset = 0 }) => ({
        url: 'me/tracks',
        params: { limit, offset },
      }),
    }),
    getSavedAlbums: builder.query<
      SpotifyApiResponse<{ added_at: string; album: Album }>,
      { limit?: number; offset?: number }
    >({
      query: ({ limit = 50, offset = 0 }) => ({
        url: 'me/albums',
        params: { limit, offset },
      }),
    }),
    getSavedArtists: builder.query<
      SpotifyApiResponse<Artist>,
      { limit?: number; offset?: number }
    >({
      query: ({ limit = 50, offset = 0 }) => ({
        url: 'me/following',
        params: { limit, offset, type: 'artist' },
      }),
    }),
    getBrowseCategories: builder.query<any, void>({
      query: () => 'browse/categories?limit=50&country=US',
    }),
    getFeaturedPlaylists: builder.query<
      any,
      { limit?: number; offset?: number }
    >({
      query: ({ limit = 20, offset = 0 }) => ({
        url: 'browse/categories',
        params: { limit, offset, country: 'US' },
      }),
    }),
    getNewReleases: builder.query<any, { limit?: number; offset?: number }>({
      query: ({ limit = 20, offset = 0 }) => ({
        url: 'browse/new-releases',
        params: { limit, offset, country: 'US' },
      }),
    }),
  }),
});

export const {
  useGetBrowseCategoriesQuery,
  useGetCurrentUserProfileQuery,
  useGetCurrentlyPlayingQuery,
  useGetFeaturedPlaylistsQuery,
  useGetNewReleasesQuery,
  useGetPlaylistQuery,
  useGetPlaylistTracksQuery,
  useGetRecentlyPlayedQuery,
  useGetSavedAlbumsQuery,
  useGetSavedArtistsQuery,
  useGetSavedTracksQuery,
  useGetTopArtistsQuery,
  useGetTopTracksQuery,
  useGetUserPlaylistsQuery,
  useSearchQuery,
} = spotifyApi;
