import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { recipientApi } from "../api";
import type { TransferInfo } from "../api/recipient";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "Unknown size";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getFileIcon(mime: string): string {
  if (mime.startsWith("image/")) return "🖼️";
  if (mime.startsWith("video/")) return "🎬";
  if (mime.startsWith("audio/")) return "🎵";
  if (mime.includes("pdf")) return "📄";
  if (mime.includes("zip") || mime.includes("compressed")) return "📦";
  return "📁";
}

export default function DownloadPage() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<TransferInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"not_found" | "expired" | "general" | null>(null);

  // Password unlock state
  const [password, setPassword] = useState("");
  const [grantToken, setGrantToken] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  // Download state
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No share token provided.");
      setErrorType("not_found");
      setLoading(false);
      return;
    }

    const loadInfo = async () => {
      setLoading(true);
      setError("");
      setErrorType(null);
      try {
        const data = await recipientApi.getTransferInfo(token);
        setInfo(data);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 410) {
          setError("This transfer has expired or has already been downloaded (one-time link).");
          setErrorType("expired");
        } else if (status === 404) {
          setError("Transfer not found. The link may be incorrect or has been deleted.");
          setErrorType("not_found");
        } else {
          setError(err?.response?.data?.error?.message ?? "Unable to load transfer info.");
          setErrorType("general");
        }
      } finally {
        setLoading(false);
      }
    };

    loadInfo();
  }, [token]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password) return;
    setUnlocking(true);
    setUnlockError("");
    try {
      const grant = await recipientApi.verifyPassword(token, password);
      setGrantToken(grant);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        setUnlockError("Incorrect password. Please try again.");
      } else if (status === 429) {
        setUnlockError("Too many password attempts. Please wait 1 minute.");
      } else {
        setUnlockError(err?.response?.data?.error?.message ?? "Failed to verify password.");
      }
    } finally {
      setUnlocking(false);
    }
  };

  const handleDownload = async () => {
    if (!token) return;
    setDownloading(true);
    setError("");
    try {
      const res = await recipientApi.claimAccess(token, grantToken || undefined);
      setDownloadSuccess(true);

      // Trigger browser download via invisible link
      const a = document.createElement("a");
      a.href = res.download_url;
      a.download = res.filename || info?.filename || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 410) {
        setError("This transfer has expired or has already been claimed.");
        setErrorType("expired");
      } else if (status === 403) {
        setError("Password grant expired or invalid. Please re-enter your password.");
        setGrantToken(null);
      } else {
        setError(err?.response?.data?.error?.message ?? "Download failed. Please try again.");
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-wrapper" style={{ maxWidth: 640, margin: "40px auto 80px", padding: "0 20px" }}>
        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
            <Spinner size={36} />
            <p className="text-secondary" style={{ marginTop: 16 }}>Loading secure transfer…</p>
          </div>
        ) : errorType ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>
              {errorType === "expired" ? "⌛" : "🔍"}
            </div>
            <h2 style={{ marginBottom: 12 }}>
              {errorType === "expired" ? "Transfer Unavailable" : "Transfer Not Found"}
            </h2>
            <p className="text-secondary" style={{ marginBottom: 28 }}>{error}</p>
            <Link to="/" className="btn btn-primary" style={{ display: "inline-flex" }}>
              Send your own files with FileDrop 📤
            </Link>
          </div>
        ) : info ? (
          <div className="card" style={{ padding: "32px 28px" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>
                {getFileIcon(info.mime_type)}
              </div>
              <h2 style={{ wordBreak: "break-word", marginBottom: 6 }}>
                {info.filename}
              </h2>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                <span>💾 {formatBytes(info.size_bytes)}</span>
                <span>•</span>
                <span>⏱️ Expires {formatDate(info.expires_at)}</span>
              </div>
            </div>

            {error && <div style={{ marginBottom: 20 }}><Alert type="error">{error}</Alert></div>}

            {downloadSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🎉</div>
                <h3 style={{ marginBottom: 6 }}>Download Started!</h3>
                <p className="text-secondary" style={{ fontSize: "0.9rem", marginBottom: 20 }}>
                  Your secure one-time download is in progress.
                </p>
                <Link to="/" className="btn btn-outline btn-sm">
                  Try FileDrop to share your files
                </Link>
              </div>
            ) : info.has_password && !grantToken ? (
              <form onSubmit={handleUnlock} style={{ marginTop: 20 }}>
                <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, color: "var(--accent-hover)", marginBottom: 4 }}>
                    🔒 Password Protected
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                    The sender has protected this transfer. Please enter the password to unlock.
                  </p>
                </div>

                {unlockError && <div style={{ marginBottom: 16 }}><Alert type="error">{unlockError}</Alert></div>}

                <div className="form-group">
                  <label className="form-label" htmlFor="recipient-password">Transfer Password</label>
                  <input
                    id="recipient-password"
                    type="password"
                    className="form-input"
                    placeholder="Enter password…"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={unlocking || !password}
                  style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
                >
                  {unlocking ? <Spinner size={20} /> : "🔓 Unlock File"}
                </button>
              </form>
            ) : (
              <div style={{ marginTop: 24, textAlign: "center" }}>
                {info.has_password && grantToken && (
                  <div style={{ marginBottom: 20 }}>
                    <Alert type="success">Password verified! Ready to download.</Alert>
                  </div>
                )}

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: 24, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  ⚡ <strong>Note:</strong> This is a secure, single-claim transfer link. Once claimed, the link cannot be reused.
                </div>

                <button
                  id="btn-claim-download"
                  className="btn btn-primary btn-lg"
                  disabled={downloading}
                  onClick={handleDownload}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {downloading ? (
                    <>
                      <Spinner size={20} />
                      <span style={{ marginLeft: 8 }}>Preparing download…</span>
                    </>
                  ) : (
                    "📥 Download File"
                  )}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
