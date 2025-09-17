export interface TokenResponse{
  accessToken: string;     // JWT
  expiration: string;      // ISO date (del backend)
  tokenType: string;       // "Bearer"
}
