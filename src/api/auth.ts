/**
 * Auth API — register, login, logout, Google OAuth initiation.
 */

import api, { saveAuth, clearAuth, API_BASE_URL } from "./client";
import type { AuthTokens, User } from "../types";

export async function register(email: string, password: string): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/auth/register", { email, password });
  saveAuth(data.access_token, data.refresh_token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/auth/login", { email, password });
  saveAuth(data.access_token, data.refresh_token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAuth();
  }
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/me");
  return data;
}

/**
 * Redirect the browser to the Google OAuth consent screen.
 * The worker handles the redirect — no Axios call needed,
 * we navigate directly so cookies are handled correctly.
 */
export function initiateGoogleLogin(): void {
  window.location.href = `${API_BASE_URL}/auth/google`;
}

/**
 * After Google OAuth callback, the worker redirects to:
 *   APP_BASE_URL/?access_token=...&refresh_token=...
 * Call this on app mount to extract & store tokens from the URL.
 * Returns true if tokens were found and saved.
 */
export function handleOAuthCallback(): boolean {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken && refreshToken) {
    saveAuth(accessToken, refreshToken);
    // Clean the tokens from the URL bar
    const clean = window.location.pathname;
    window.history.replaceState({}, document.title, clean);
    return true;
  }
  return false;
}
