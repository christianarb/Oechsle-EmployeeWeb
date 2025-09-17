// src/infrastructure/http/AxiosHttpClient.ts
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { HttpClient, RequestConfig } from '../../core/ports/HttpClient';
import { APP_CONFIG } from '../config/AppConfig';
import { authService } from '../auth/AuthService';
import { TokenStorage } from '../auth/TokenStorage';

export class AxiosHttpClient implements HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: APP_CONFIG.baseURL,
      timeout: APP_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': APP_CONFIG.apiKey,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // REQUEST
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (!config.url?.includes('/api/Token')) {
          if (TokenStorage.isExpired()) {
            await authService.refresh();
          }
          const t = authService.token;
          if (t) {
            // Axios v1: headers puede ser AxiosHeaders (tiene .set)
            const h: any = config.headers ?? {};
            if (typeof h.set === 'function') {
              h.set('Authorization', `Bearer ${t}`);
            } else {
              h['Authorization'] = `Bearer ${t}`;
            }
            config.headers = h;
          }
        }

        // log simple
        const method = (config.method ?? 'GET').toUpperCase();
        console.log(`→ ${method} ${config.baseURL ?? ''}${config.url ?? ''}`);
        return config; // OBLIGATORIO devolver InternalAxiosRequestConfig
      }
    );

    // RESPONSE (refresh y reintento)
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const status = error.response?.status;
        const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        if ((status === 401 || status === 403) && original && !original._retry) {
          original._retry = true;
          try {
            await authService.refresh();
            const h: any = original.headers ?? {};
            if (typeof h.set === 'function') {
              h.set('Authorization', `Bearer ${authService.token}`);
            } else {
              h['Authorization'] = `Bearer ${authService.token}`;
            }
            original.headers = h;
            return this.client.request(original);
          } catch {
            TokenStorage.clear();
          }
        }

        console.error('API Error:', error.response?.data ?? error.message);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, this.transformConfig(config));
    return response.data;
  }
  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, this.transformConfig(config));
    return response.data;
  }
  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, this.transformConfig(config));
    return response.data;
  }
  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, this.transformConfig(config));
    return response.data;
  }

  private transformConfig(config?: RequestConfig): AxiosRequestConfig {
    return {
      headers: config?.headers,
      params: config?.params,
      timeout: config?.timeout,
      signal: config?.signal,
    };
  }
}
