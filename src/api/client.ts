/**
 * Centralized Axios API client for FileDrop backend.
 *
 * Features:
 * - Base URL pointed at the Workers dev server (proxied via Vite)
 * - Request interceptor: injects Bearer token from localStorage
 * - Response interceptor: on 401, attempts silent token refresh,
 *   then retries once; if refresh fails, clears auth and redirects to /login
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8787";

const BASE_URL = API_BASE_URL;

// Keys used in localStorage
export const TOKEN_KEYS = {
  ACCESS: "fd_access_token",
  REFRESH: "fd_refresh_token",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Create instance
// ─────────────────────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

// ─────────────────────────────────────────────────────────────────────────────
// Request interceptor — attach access token
// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// Response interceptor — silent token refresh on 401
// ─────────────────────────────────────────────────────────────────────────────

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token as string);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    // Only attempt refresh on 401 and if we haven't retried yet
    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
      if (!refreshToken) {
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>)[
              "Authorization"
            ] = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{
          access_token: string;
          refresh_token: string;
        }>(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });

        localStorage.setItem(TOKEN_KEYS.ACCESS, data.access_token);
        localStorage.setItem(TOKEN_KEYS.REFRESH, data.refresh_token);

        processQueue(null, data.access_token);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)[
            "Authorization"
          ] = `Bearer ${data.access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function saveAuth(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEYS.ACCESS);
}

export default api;
