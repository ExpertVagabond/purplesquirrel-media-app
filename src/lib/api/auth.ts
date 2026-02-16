import { apiClient } from './client';
import type { AuthNonceResponse, AuthVerifyResponse } from './types';

export async function getNonce(
  publicKey: string,
): Promise<AuthNonceResponse | null> {
  const res = await apiClient.post<AuthNonceResponse>('/auth/nonce', {
    publicKey,
  });
  return res.data;
}

export async function verifySignature(
  publicKey: string,
  signature: string,
  nonce: string,
): Promise<AuthVerifyResponse | null> {
  const res = await apiClient.post<AuthVerifyResponse>('/auth/verify', {
    publicKey,
    signature,
    nonce,
  });

  if (res.data) {
    await apiClient.setToken(res.data.token);
  }

  return res.data;
}

export async function getMe() {
  return apiClient.get<{ user: import('./types').User }>('/auth/me');
}
