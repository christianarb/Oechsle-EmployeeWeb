import axios from 'axios';
import { APP_CONFIG } from '../config/AppConfig';
import { TokenStorage } from './TokenStorage';
import type { TokenResponse } from './../../core/domain/TokenResponse';

class AuthService {
  // Cliente separado para no caer en bucles con interceptores
  private client = axios.create({
    baseURL: APP_CONFIG.baseURL,
    headers: { 'X-API-Key': APP_CONFIG.apiKey }
  });

  private refreshPromise: Promise<void> | null = null;

  get token(): string | null {
    return TokenStorage.get();
  }

  async init() {
    if (TokenStorage.isExpired()) {
      await this.refresh();
    }
  }

  async refresh() {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      const { data } = await this.client.post<TokenResponse>('/api/Token', {
        apikey: APP_CONFIG.apiKey
      });
      TokenStorage.set(data.accessToken, data.expiration);
    })().finally(() => (this.refreshPromise = null));
    return this.refreshPromise;
  }
}

export const authService = new AuthService();
