import { ApiConfig } from '../../core/domain/ApiConfig';

export const APP_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'https://localhost:7025',
  timeout: 10000,
  apiKey: import.meta.env.VITE_REACT_APP_API_KEY || 'kz6Vb3QFf8m9P2rWz4t7yAGHq3Xc9JpM5R8U1Z3Y6B8D1F2H4J6L8N0Q2S4U6'
};