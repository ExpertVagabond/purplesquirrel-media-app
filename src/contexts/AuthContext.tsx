import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { apiClient } from '../lib/api/client';
import * as authApi from '../lib/api/auth';
import { signMessage } from '../lib/solana';
import type { User } from '../lib/api/types';

interface AuthState {
  authenticated: boolean;
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const [state, setState] = useState<AuthState>({
    authenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const token = await apiClient.loadToken();
      if (token) {
        const res = await authApi.getMe();
        if (res.data) {
          setState({ authenticated: true, user: res.data.user, loading: false });
          return;
        }
      }
    } catch {
      // Token expired or invalid
    }
    await apiClient.clearToken();
    setState({ authenticated: false, user: null, loading: false });
  }

  async function signIn() {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      // 1. Connect wallet if needed
      let walletAddress: string;
      if (wallet.connected && wallet.publicKey) {
        walletAddress = wallet.publicKey.toString();
      } else {
        walletAddress = await wallet.connect();
      }

      // 2. Get nonce from backend
      const nonceResponse = await authApi.getNonce(walletAddress);
      if (!nonceResponse) throw new Error('Failed to get auth nonce');

      // 3. Sign message via MWA
      const signature = await signMessage(nonceResponse.message);

      // 4. Verify and get JWT
      const verifyResponse = await authApi.verifySignature(
        walletAddress,
        signature,
        nonceResponse.nonce,
      );
      if (!verifyResponse) throw new Error('Signature verification failed');

      setState({ authenticated: true, user: verifyResponse.user, loading: false });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }

  async function signOut() {
    await apiClient.clearToken();
    await wallet.disconnect();
    setState({ authenticated: false, user: null, loading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
