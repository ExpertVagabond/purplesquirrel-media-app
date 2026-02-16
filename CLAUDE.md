# PurpleSquirrel.media Video App

## Project
- **Type:** Expo 54 / React Native 0.81 (Android-only)
- **Package:** com.purplesquirrelmedia.app
- **Backend:** Fastify API at `$VS/projects/purplesquirrel-media/` (NOT deployed yet)
- **Distribution:** Solana dApp Store (APK, not AAB)

## Commands
- `npm run check:types` — TypeScript validation
- `npm start` — Start Metro dev server
- `npx expo export --platform android` — Test Metro bundle

## Architecture
- **Auth:** MWA wallet → nonce → sign → verify → JWT (stored in expo-secure-store)
- **API Client:** `src/lib/api/` — typed fetch wrapper for PSM Fastify backend
- **State:** React Query (server), Context (auth/wallet)
- **Video:** expo-av HLS player, S3 presigned URL uploads
- **Navigation:** Stack (auth gate) → Bottom tabs (5) → Stack screens

## Key Files
- `App.tsx` — Providers, auth gate, navigation
- `src/lib/api/client.ts` — PSMClient singleton
- `src/lib/solana.ts` — MWA connect + signMessage
- `src/contexts/AuthContext.tsx` — JWT session management
- `src/hooks/useVideoUpload.ts` — Upload state machine
- `src/constants/config.ts` — API URL, Solana network

## Backend API (not deployed yet)
- Dev: `http://10.0.2.2:3000/v1` (Android emulator localhost)
- Prod: `https://api.purplesquirrel.media/v1`
- Auth: POST /v1/auth/nonce, POST /v1/auth/verify
- Videos: GET/POST/PATCH/DELETE /v1/videos
- Uploads: POST /v1/uploads, POST /v1/uploads/complete, GET /v1/uploads/:id/status
