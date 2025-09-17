import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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
        'X-API-Key': APP_CONFIG.apiKey       // si tu API sigue validando la api-key
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // REQUEST: asegura token y lo agrega como Bearer
    this.client.interceptors.request.use(async (config: AxiosRequestConfig) => {
      // no intentes obtener token si estás pidiendo el propio token
      if (!config.url?.includes('/api/Token')) {
        if (TokenStorage.isExpired()) {
          await authService.refresh();
        }
        const t = authService.token;
        if (t) {
          config.headers = { ...(config.headers ?? {}), Authorization: `Bearer ${t}` };
        }
      }

      console.log(`→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    });

    // RESPONSE: si vence (401/403), renueva una vez y reintenta
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const original: any = error.config;
        const status = error.response?.status;

        if ((status === 401 || status === 403) && !original?._retry) {
          original._retry = true;
          try {
            await authService.refresh();
            original.headers = {
              ...(original.headers ?? {}),
              Authorization: `Bearer ${authService.token}`
            };
            return this.client(original); // reintento
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
    return { headers: config?.headers, params: config?.params, timeout: config?.timeout,    signal: config?.signal};
  }
}
