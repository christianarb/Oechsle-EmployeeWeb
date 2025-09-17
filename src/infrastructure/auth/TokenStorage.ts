const T_KEY = 'auth.token';
const E_KEY = 'auth.exp'; // epoch millis

export const TokenStorage = {
  get(): string | null {
    return localStorage.getItem(T_KEY);
  },
  set(token: string, expIso: string) {
    localStorage.setItem(T_KEY, token);
    localStorage.setItem(E_KEY, String(new Date(expIso).getTime()));
  },
  clear() {
    localStorage.removeItem(T_KEY);
    localStorage.removeItem(E_KEY);
  },
  isExpired(skewMs = 30_000): boolean {
    const exp = Number(localStorage.getItem(E_KEY) ?? 0);
    return !exp || Date.now() + skewMs >= exp;
  }
};
