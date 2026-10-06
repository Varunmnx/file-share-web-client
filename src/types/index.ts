// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  plan: "free" | "pro";
  created_at: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────────────────────────────────────

export interface Usage {
  user_id: string;
  active_transfer_count: number;
  active_storage_bytes: number;
  max_transfers: number;
  max_storage_bytes: number;
  updated_at: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transfer
// ─────────────────────────────────────────────────────────────────────────────

export type TransferStatus =
  | "CREATING"
  | "UPLOADING"
  | "PROCESSING"
  | "READY"
  | "CONSUMED"
  | "EXPIRED"
  | "FAILED"
  | "DELETED";

export interface Transfer {
  id: string;
  filename: string;
  mime_type: string;
  declared_size_bytes: number;
  actual_size_bytes?: number;
  status: TransferStatus;
  expires_at: number;
  created_at: number;
  share_url?: string;
}

export interface CreateTransferPayload {
  filename: string;
  mime_type: string;
  declared_size_bytes: number;
  password?: string;
}

export interface CreateTransferResponse {
  id: string;
  raw_token: string;
  share_url: string;
  upload_url_endpoint: string;
  status: TransferStatus;
  expires_at: number;
}

export interface UploadUrlResponse {
  upload_url: string;
  transfer: Transfer;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plans
// ─────────────────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  price_monthly_usd: number;
  max_file_bytes: number;
  max_storage_bytes: number;
  max_transfers: number;
  transfer_ttl_days: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Error shape
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
