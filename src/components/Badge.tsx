import type { TransferStatus } from "../types";

const STATUS_DOT: Record<TransferStatus, string> = {
  READY:      "🟢",
  UPLOADING:  "🔵",
  PROCESSING: "🔵",
  CREATING:   "⚪",
  CONSUMED:   "⚫",
  EXPIRED:    "🟡",
  FAILED:     "🔴",
  DELETED:    "⚫",
};

export default function StatusBadge({ status }: { status: TransferStatus }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      {STATUS_DOT[status]} {status}
    </span>
  );
}
