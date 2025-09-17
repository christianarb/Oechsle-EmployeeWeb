export interface ApiConfig {
  baseURL: string;
  timeout: number;
  apiKey: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}