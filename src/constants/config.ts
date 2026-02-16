import { clusterApiUrl } from '@solana/web3.js';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/v1';

export const SOLANA_NETWORK =
  (process.env.EXPO_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta') ??
  'devnet';

export const RPC_ENDPOINT = clusterApiUrl(SOLANA_NETWORK);

export const APP_IDENTITY = {
  name: 'Purple Squirrel Media',
  uri: 'https://purplesquirrel.media',
  icon: 'favicon.ico',
} as const;

export const UPLOAD_MAX_SIZE_MB = 500;
export const UPLOAD_POLL_INTERVAL_MS = 5000;
