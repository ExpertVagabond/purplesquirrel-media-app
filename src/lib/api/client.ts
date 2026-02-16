import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../constants/config';
import type { APIResponse, APIError } from './types';

const TOKEN_KEY = 'psm_auth_token';

class PSMClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async loadToken(): Promise<string | null> {
    if (this.token) return this.token;
    try {
      this.token = await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      this.token = null;
    }
    return this.token;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<APIResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      const body = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            error: body.error ?? 'Request failed',
            message: body.message,
            statusCode: response.status,
          },
        };
      }

      return { data: body as T, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          error: 'Network error',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      };
    }
  }

  async get<T>(path: string): Promise<APIResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<APIResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body: unknown): Promise<APIResponse<T>> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<APIResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new PSMClient();
export { PSMClient };
