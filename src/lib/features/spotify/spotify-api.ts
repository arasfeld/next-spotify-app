import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

import { refreshTokens } from '@/lib/auth-client';
import { setAuthCookies } from '@/lib/cookies';
import type { RootState } from '@/lib/store';
import type {
  Album,
  Artist,
  Image,
  Playlist,
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

  // Check if this is a retry attempt to prevent infinite loops
  const isRetry = (extraOptions as { retry?: boolean })?.retry;

  if (result.error && result.error.status === 401 && !isRetry) {
    // Token expired, try to refresh
    const state = api.getState() as RootState;
    const { refreshToken } = state.auth;

    if (refreshToken) {
      try {
        const refreshResult = await refreshTokens(refreshToken);
        if (refreshResult) {
          // Update the store with new tokens
          api.dispatch({
            type: 'auth/updateAccessToken',
            payload: refreshResult,
          });

          // Update cookies for middleware authentication
          if (typeof window !== 'undefined') {
            setAuthCookies(refreshResult.access_token, refreshToken);
          }

          // Retry the original request with new token
          result = await baseQuery(args, api, { ...extraOptions, retry: true });
        } else {
          // Refresh failed, logout user
          console.warn('Token refresh failed, logging out user');
          api.dispatch({ type: 'auth/logout' });
        }
      } catch (error) {
        // Refresh failed with exception, logout user
        console.error('Token refresh error:', error);
        api.dispatch({ type: 'auth/logout' });
      }
    } else {
      // No refresh token, logout user
      console.warn('No refresh token available, logging out user');
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
      {
        tracks?: SpotifyApiResponse<Track>;
        artists?: SpotifyApiResponse<Artist>;
        albums?: SpotifyApiResponse<Album>;
        playlists?: SpotifyApiResponse<Playlist>;
      },
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
    getCurrentlyPlaying: builder.query<
      {
        item: Track;
        is_playing: boolean;
        progress_ms: number;
        context: {
          uri: string;
          type: string;
        };
      } | null,
      void
    >({
      query: () => `me/player/currently-playing`,
    }),
    getRecentlyPlayed: builder.query<
      SpotifyApiResponse<RecentlyPlayedItem>,
      void
    >({
      query: () => `me/player/recently-played`,
    }),
    getPlaylist: builder.query<Playlist, string>({
      query: (playlistId) => `playlists/${playlistId}`,
    }),
    getPlaylistTracks: builder.query<
      SpotifyApiResponse<{ added_at: string; track: Track }>,
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
    getBrowseCategories: builder.query<
      {
        categories: {
          items: Array<{
            id: string;
            name: string;
            icons: Image[];
          }>;
          total: number;
        };
      },
      void
    >({
      query: () => 'browse/categories?limit=50&country=US',
    }),
    getFeaturedPlaylists: builder.query<
      SpotifyApiResponse<Playlist>,
      { limit?: number; offset?: number }
    >({
      query: ({ limit = 20, offset = 0 }) => ({
        url: 'browse/categories',
        params: { limit, offset, country: 'US' },
      }),
    }),
    getNewReleases: builder.query<
      SpotifyApiResponse<Album>,
      { limit?: number; offset?: number }
    >({
      query: ({ limit = 20, offset = 0 }) => ({
        url: 'browse/new-releases',
        params: { limit, offset, country: 'US' },
      }),
    }),

    // Infinite Query Endpoints
    getSavedArtistsInfinite: builder.infiniteQuery<
      SpotifyApiResponse<Artist>,
      { limit?: number },
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: 'me/following',
        params: {
          limit: queryArg.limit || 50,
          offset: pageParam,
          type: 'artist',
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
          const total = lastPage.total || 0;
          const nextOffset = lastPageParam + (lastPage.limit || 50);
          return nextOffset < total ? nextOffset : undefined;
        },
        getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
          const prevOffset = firstPageParam - (firstPage.limit || 50);
          return prevOffset >= 0 ? prevOffset : undefined;
        },
        maxPages: 10, // Keep up to 10 pages in cache
      },
    }),

    getSavedAlbumsInfinite: builder.infiniteQuery<
      SpotifyApiResponse<{ added_at: string; album: Album }>,
      { limit?: number },
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: 'me/albums',
        params: {
          limit: queryArg.limit || 50,
          offset: pageParam,
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
          const total = lastPage.total || 0;
          const nextOffset = lastPageParam + (lastPage.limit || 50);
          return nextOffset < total ? nextOffset : undefined;
        },
        getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
          const prevOffset = firstPageParam - (firstPage.limit || 50);
          return prevOffset >= 0 ? prevOffset : undefined;
        },
        maxPages: 10, // Keep up to 10 pages in cache
      },
    }),

    getSavedTracksInfinite: builder.infiniteQuery<
      SpotifyApiResponse<{ added_at: string; track: Track }>,
      { limit?: number },
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: 'me/tracks',
        params: {
          limit: queryArg.limit || 50,
          offset: pageParam,
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
          const total = lastPage.total || 0;
          const nextOffset = lastPageParam + (lastPage.limit || 50);
          return nextOffset < total ? nextOffset : undefined;
        },
        getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
          const prevOffset = firstPageParam - (firstPage.limit || 50);
          return prevOffset >= 0 ? prevOffset : undefined;
        },
        maxPages: 10, // Keep up to 10 pages in cache
      },
    }),

    getPlaylistTracksInfinite: builder.infiniteQuery<
      SpotifyApiResponse<{ added_at: string; track: Track }>,
      { playlistId: string; limit?: number },
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: `playlists/${queryArg.playlistId}/tracks`,
        params: {
          limit: queryArg.limit || 100,
          offset: pageParam,
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
          const total = lastPage.total || 0;
          const nextOffset = lastPageParam + (lastPage.limit || 100);
          return nextOffset < total ? nextOffset : undefined;
        },
        getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
          const prevOffset = firstPageParam - (firstPage.limit || 100);
          return prevOffset >= 0 ? prevOffset : undefined;
        },
        maxPages: 20, // Keep up to 20 pages in cache for playlists
      },
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
