/**
 * Transfers / One-Time Files API.
 */

import api from "./client";
import type {
  CreateTransferPayload,
  CreateTransferResponse,
  Transfer,
} from "../types";

export interface InitiateUploadResponse {
  id: string;
  part_size: number;
}

export interface CompleteUploadResponse {
  download_url: string;
  expires_at: number;
  stored_size: number;
}

export async function createTransfer(
  payload: CreateTransferPayload
): Promise<CreateTransferResponse> {
  const { data } = await api.post<InitiateUploadResponse>("/api/uploads", {
    filename: payload.filename,
    size: payload.declared_size_bytes,
    content_type: payload.mime_type,
  });

  return {
    id: data.id,
    raw_token: "",
    share_url: "",
    upload_url_endpoint: "",
    status: "CREATING",
    expires_at: 0,
  };
}

export async function fullUpload(
  file: File,
  _options?: { password?: string },
  onProgress?: (percent: number) => void
): Promise<{ transfer: Transfer; share_url: string }> {
  // 1. Initiate upload
  const { data: initData } = await api.post<InitiateUploadResponse>("/api/uploads", {
    filename: file.name,
    size: file.size,
    content_type: file.type || "application/octet-stream",
  });

  const uploadId = initData.id;
  const partSize = initData.part_size || 52428800; // 50 MiB
  const totalParts = Math.max(1, Math.ceil(file.size / partSize));
  const parts: Array<{ part_number: number; etag: string }> = [];

  // 2. Stream chunk parts
  for (let i = 0; i < totalParts; i++) {
    const start = i * partSize;
    const end = Math.min(start + partSize, file.size);
    const chunk = file.slice(start, end);
    const partNumber = i + 1;

    const res = await api.put<{ part_number: number; etag: string }>(
      `/api/uploads/${uploadId}/parts/${partNumber}`,
      chunk,
      {
        headers: { "Content-Type": "application/octet-stream" },
        onUploadProgress: (evt) => {
          if (onProgress && file.size > 0) {
            const uploadedSoFar = start + (evt.loaded || 0);
            onProgress(Math.min(99, Math.round((uploadedSoFar / file.size) * 100)));
          }
        },
      }
    );

    parts.push({
      part_number: res.data.part_number,
      etag: res.data.etag,
    });
  }

  // 3. Complete upload
  const { data: completeData } = await api.post<CompleteUploadResponse>(
    `/api/uploads/${uploadId}/complete`,
    { parts }
  );

  if (onProgress) onProgress(100);

  const transfer: Transfer = {
    id: uploadId,
    filename: file.name,
    mime_type: file.type || "application/octet-stream",
    declared_size_bytes: file.size,
    actual_size_bytes: completeData.stored_size,
    status: "READY",
    expires_at: completeData.expires_at,
    created_at: Math.floor(Date.now() / 1000),
    share_url: completeData.download_url,
  };

  // Cache in local storage for the dashboard table
  try {
    const existing = JSON.parse(localStorage.getItem("fd_share_urls") || "{}");
    existing[uploadId] = completeData.download_url;
    localStorage.setItem("fd_share_urls", JSON.stringify(existing));

    const list: Transfer[] = JSON.parse(
      localStorage.getItem("fd_transfers_history") || "[]"
    );
    list.unshift(transfer);
    localStorage.setItem("fd_transfers_history", JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error(e);
  }

  return {
    transfer,
    share_url: completeData.download_url,
  };
}

export async function listTransfers(): Promise<Transfer[]> {
  try {
    return JSON.parse(localStorage.getItem("fd_transfers_history") || "[]");
  } catch {
    return [];
  }
}

export async function getTransfer(_id: string): Promise<Transfer> {
  throw new Error("Transfers are ephemeral single-use links.");
}

export async function deleteTransfer(id: string): Promise<void> {
  try {
    await api.delete(`/api/uploads/${id}`);
  } catch {}
  try {
    const list: Transfer[] = JSON.parse(
      localStorage.getItem("fd_transfers_history") || "[]"
    );
    const updated = list.filter((t) => t.id !== id);
    localStorage.setItem("fd_transfers_history", JSON.stringify(updated));
  } catch {}
}
