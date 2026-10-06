/**
 * Recipient API — unauthenticated endpoints for viewing and claiming one-time files.
 */

import api, { API_BASE_URL } from "./client";

export interface TransferInfo {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes?: number;
  has_password: boolean;
  expires_at: number;
  status: string;
}

export interface AccessResult {
  download_url: string;
  filename: string;
  expires_at: number;
}

/** Fetch transfer metadata (file name, size, expiry). */
export async function getTransferInfo(token: string): Promise<TransferInfo> {
  const { data } = await api.get<{
    filename: string;
    size: number;
    compression: string;
    content_type: string;
    expires_at?: number;
  }>(`/api/files/${token}`);

  return {
    id: token,
    filename: data.filename,
    mime_type: data.content_type || "application/octet-stream",
    size_bytes: data.size,
    has_password: false,
    expires_at: data.expires_at || 0,
    status: "READY",
  };
}

/** Verify password stub (one-time files are token-gated). */
export async function verifyPassword(
  _token: string,
  _password: string
): Promise<string> {
  return "grant_token";
}

/** Claim one-time download URL. */
export async function claimAccess(
  token: string,
  _grantToken?: string
): Promise<AccessResult> {
  const downloadUrl = `${API_BASE_URL}/api/files/${token}/download`;
  return {
    download_url: downloadUrl,
    filename: "",
    expires_at: 0,
  };
}
