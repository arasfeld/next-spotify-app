# Next.js Spotify App

A modern Spotify client built with Next.js, featuring a beautiful UI powered by Mantine and robust state management with Redux Toolkit.

## 🎵 Features

- **Spotify Integration**: Full OAuth 2.0 authentication with PKCE flow
- **Music Discovery**: Browse new releases, top tracks, and artists
- **Personal Library**: Access your saved songs, albums, and followed artists
- **Playlist Management**: View and explore your playlists with infinite scroll
- **Advanced Search**: Search across tracks, artists, albums, and playlists
- **Responsive Design**: Beautiful UI that works on all devices
- **Theme Support**: Light, dark, and system theme modes
- **Real-time Data**: Live Spotify API integration with RTK Query

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Spotify Developer Account
- Spotify App credentials

### Environment Setup

1. Create a `.env.local` file in the root directory:

```env
# Spotify API Configuration
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback

# Session Management (Generate with: openssl rand -base64 32)
SESSION_SECRET=your_secret_key_here
```

2. Set up your Spotify App:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://127.0.0.1:3000/callback` to Redirect URIs
   - Copy Client ID and Client Secret to your `.env.local`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) to view the app.

## 🏗️ Architecture

- **Next.js 15**: App Router with server and client components
- **Mantine 7**: Modern React UI library with theme support
- **Redux Toolkit**: State management with RTK Query for API calls
- **TypeScript**: Full type safety throughout the application
- **Spotify Web API**: Complete integration with all major endpoints

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for authentication
│   ├── login/             # Spotify OAuth login
│   ├── search/            # Search functionality
│   └── [other pages]/     # Music library pages
├── components/            # Reusable UI components
├── lib/                   # Core utilities and Redux logic
│   ├── features/          # Redux slices and API
│   │   ├── auth/         # Authentication state
│   │   ├── spotify/      # Spotify API integration
│   │   └── theme/        # Theme management
│   ├── types/            # TypeScript type definitions
│   ├── store.ts          # Redux store configuration
│   ├── hooks.ts          # Typed Redux hooks
│   ├── session.ts        # JWT session management
│   ├── auth-client.ts    # Spotify authentication client
│   ├── auth-actions.ts   # Server actions for auth
│   └── cookies.ts        # Cookie utilities
└── middleware.ts         # Authentication middleware
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🎨 UI Components

- **Layout**: Responsive app shell with navigation
- **Search**: Global search with filters
- **Music Cards**: Beautiful album/track displays
- **Playlist View**: Full playlist browsing with infinite scroll
- **Theme Provider**: Dynamic theme switching

## 🔐 Authentication

The app uses Spotify's OAuth 2.0 Authorization Code flow with PKCE for secure authentication:

1. User clicks "Login with Spotify"
2. Redirects to Spotify for authorization
3. Returns with authorization code
4. Exchanges code for access/refresh tokens
5. Stores tokens securely in HTTP-only cookies
6. Uses JWT for session management

## 📱 Responsive Design

- **Desktop**: Full-featured layout with sidebar navigation
- **Tablet**: Adaptive layout with collapsible navigation
- **Mobile**: Mobile-first design with touch-friendly controls

## 🚀 Deployment

The app is ready for deployment on Vercel, Netlify, or any Node.js hosting platform. Make sure to:

1. Set environment variables in your hosting platform
2. Update Spotify app redirect URIs for production
3. Generate a secure `SESSION_SECRET`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
