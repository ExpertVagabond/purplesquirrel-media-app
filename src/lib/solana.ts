import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { SOLANA_NETWORK, APP_IDENTITY } from '../constants/config';

export const connection = new Connection(
  clusterApiUrl(SOLANA_NETWORK),
  'confirmed',
);

export interface WalletConnectResult {
  publicKey: string;
  authToken: string;
}

/**
 * Connect to a Solana wallet via Mobile Wallet Adapter
 */
export async function connectWallet(): Promise<WalletConnectResult> {
  const result = await transact(async (wallet) => {
    const authorization = await wallet.authorize({
      cluster: SOLANA_NETWORK,
      identity: APP_IDENTITY,
    });

    return {
      publicKey: authorization.accounts[0].address,
      authToken: authorization.auth_token,
    };
  });

  return result;
}

/**
 * Sign an arbitrary message via MWA for backend auth
 * Returns base58-encoded signature
 */
export async function signMessage(message: string): Promise<string> {
  const bs58 = await import('bs58');
  const encode = bs58.default?.encode ?? bs58.encode;

  const result = await transact(async (wallet) => {
    await wallet.authorize({
      cluster: SOLANA_NETWORK,
      identity: APP_IDENTITY,
    });

    const messageBytes = new TextEncoder().encode(message);
    const signedMessages = await wallet.signMessages({
      addresses: [],
      payloads: [messageBytes],
    });

    return encode(signedMessages[0]);
  });

  return result;
}

/**
 * Get SOL balance for a wallet
 */
export async function getBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}
