import React, { createContext, useState, useContext, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { connectWallet, getBalance } from '../lib/solana';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WalletState {
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number;
  connecting: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const CACHE_KEY = 'wallet_public_key';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: 0,
    connecting: false,
  });

  useEffect(() => {
    loadCachedWallet();
  }, []);

  useEffect(() => {
    if (state.connected && state.publicKey) {
      refreshBalance();
    }
  }, [state.connected]);

  async function loadCachedWallet() {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const publicKey = new PublicKey(cached);
        const balance = await getBalance(publicKey);
        setState({ connected: true, publicKey, balance, connecting: false });
      }
    } catch {
      // No cached wallet
    }
  }

  async function connect(): Promise<string> {
    setState((prev) => ({ ...prev, connecting: true }));
    try {
      const result = await connectWallet();
      const publicKey = new PublicKey(result.publicKey);
      const balance = await getBalance(publicKey);
      await AsyncStorage.setItem(CACHE_KEY, publicKey.toString());
      setState({ connected: true, publicKey, balance, connecting: false });
      return result.publicKey;
    } catch (error) {
      setState((prev) => ({ ...prev, connecting: false }));
      throw error;
    }
  }

  async function disconnect() {
    await AsyncStorage.removeItem(CACHE_KEY);
    setState({ connected: false, publicKey: null, balance: 0, connecting: false });
  }

  async function refreshBalance() {
    if (state.publicKey) {
      const balance = await getBalance(state.publicKey);
      setState((prev) => ({ ...prev, balance }));
    }
  }

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
