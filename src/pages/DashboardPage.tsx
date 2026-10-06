import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { transfersApi, usageApi, billingApi, authApi } from "../api";
import { useAuthStore } from "../store/auth";
import type { Transfer, Usage } from "../types";
import StatusBadge from "../components/Badge";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import Navbar from "../components/Navbar";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getFileIcon(mime: string): string {
  if (mime.startsWith("image/")) return "🖼️";
  if (mime.startsWith("video/")) return "🎬";
  if (mime.startsWith("audio/")) return "🎵";
  if (mime.includes("pdf"))      return "📄";
  if (mime.includes("zip") || mime.includes("compressed")) return "📦";
  return "📁";
}

function UploadPanel({ onUploaded }: { onUploaded: () => void }) {
  const fileInputRef             = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver]  = useState(false);
  const [progress, setProgress]  = useState<number | null>(null);
  const [error, setError]        = useState("");
  const [lastUploaded, setLastUploaded] = useState<{ name: string; shareUrl: string } | null>(null);
  const [copied, setCopied]      = useState(false);
  const [password, setPassword]  = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setLastUploaded(null);
    setProgress(0);
    try {
      const res = await transfersApi.fullUpload(
        file,
        { password: password || undefined },
        (p) => setProgress(p)
      );
      
      // Store share URL in localStorage so the table can display it
      const existing = JSON.parse(localStorage.getItem("fd_share_urls") || "{}");
      existing[res.transfer.id] = res.share_url;
      localStorage.setItem("fd_share_urls", JSON.stringify(existing));

      setLastUploaded({ name: file.name, shareUrl: res.share_url });
      setPassword("");
      setProgress(null);
      onUploaded();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? "Upload failed. Try again.";
      setError(msg);
      setProgress(null);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const copyLastUrl = () => {
    if (!lastUploaded) return;
    navigator.clipboard.writeText(lastUploaded.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ marginBottom: 32 }}>
      <h3 style={{ marginBottom: 20 }}>📤 Upload & Share a File</h3>

      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" onChange={onInputChange} style={{ display: "none" }} />
        <div className="upload-zone-icon">📁</div>
        <h3>Drop your file here</h3>
        <p>or click to browse — any file type supported</p>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="upload-password">Password Protection (optional)</label>
          <input
            id="upload-password"
            className="form-input"
            type="password"
            placeholder="Set a password for recipient (optional)"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
      </div>

      {progress !== null && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="text-sm text-secondary">Uploading directly to storage…</span>
            <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{progress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && <div style={{ marginTop: 16 }}><Alert type="error">{error}</Alert></div>}

      {lastUploaded && (
        <div style={{
          marginTop: 20,
          padding: "20px",
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: "var(--radius-md)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700, color: "var(--accent-hover)" }}>
            ✨ Transfer Ready to Share!
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12 }}>
            "{lastUploaded.name}" is uploaded. Send this one-time link to your recipient:
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              readOnly
              value={lastUploaded.shareUrl}
              className="form-input"
              style={{ fontSize: "0.85rem", cursor: "pointer", background: "rgba(0,0,0,0.3)" }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button className="btn btn-primary" onClick={copyLastUrl} style={{ whiteSpace: "nowrap" }}>
              {copied ? "✅ Copied" : "📋 Copy Link"}
            </button>
            <a
              href={lastUploaded.shareUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ whiteSpace: "nowrap" }}
            >
              🔗 Open
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function TransferList({ transfers, onDelete }: { transfers: Transfer[]; onDelete: (id: string) => void }) {
  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const getShareUrl = (transfer: Transfer) => {
    const saved = JSON.parse(localStorage.getItem("fd_share_urls") || "{}");
    return saved[transfer.id] || null;
  };

  const copyLink = (transfer: Transfer) => {
    const url = getShareUrl(transfer);
    if (!url) {
      alert("This transfer's one-time link was generated on creation. For security, raw tokens are not stored in the database.");
      return;
    }
    navigator.clipboard.writeText(url);
    setCopiedId(transfer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transfer? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await transfersApi.deleteTransfer(id);
      onDelete(id);
    } catch {
      alert("Failed to delete transfer.");
    } finally {
      setDeleting(null);
    }
  };

  const list = Array.isArray(transfers) ? transfers : [];

  if (list.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <h3>No transfers yet</h3>
        <p>Upload a file above to create your first transfer.</p>
      </div>
    );
  }

  return (
    <div className="transfer-list">
      {list.map(t => {
        const shareUrl = getShareUrl(t);
        return (
          <div key={t.id} className="transfer-item">
            <div className="transfer-icon">{getFileIcon(t.mime_type)}</div>
            <div className="transfer-info">
              <div className="transfer-name">{t.filename}</div>
              <div className="transfer-meta">
                <span>{formatBytes(t.actual_size_bytes ?? t.declared_size_bytes)}</span>
                <span>Expires {formatDate(t.expires_at)}</span>
                <StatusBadge status={t.status} />
              </div>
              {t.status === "READY" && shareUrl && (
                <div className="copy-link-row" style={{ marginTop: 8 }}>
                  <span className="copy-link-text">{shareUrl}</span>
                  <button className="btn btn-sm btn-outline" onClick={() => copyLink(t)}>
                    {copiedId === t.id ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>
              )}
            </div>
            <div className="transfer-actions">
              <button
                className="btn btn-sm btn-danger btn-icon"
                title="Delete"
                disabled={deleting === t.id}
                onClick={() => handleDelete(t.id)}
              >
                {deleting === t.id ? <Spinner size={14} /> : "🗑️"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { user, setUser }              = useAuthStore();
  const navigate                       = useNavigate();
  const [transfers, setTransfers]      = useState<Transfer[]>([]);
  const [usage, setUsage]              = useState<Usage | null>(null);
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState("");
  const [upgrading, setUpgrading]      = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ts, u] = await Promise.all([
        transfersApi.listTransfers(),
        usageApi.getUsage(),
      ]);
      setTransfers(ts);
      setUsage(u);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? "Failed to load data.";
      setError(msg);
      if (err?.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    load();

    // Check payment callback status
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get("payment") === "success";
    const paymentLinkId =
      params.get("razorpay_payment_link_id") ||
      params.get("payment_link_id") ||
      undefined;
    const paymentId =
      params.get("razorpay_payment_id") ||
      params.get("payment_id") ||
      undefined;

    if (paymentSuccess || paymentLinkId || paymentId) {
      setPaymentNotice("⚡ Verifying payment with Razorpay and updating your account to Pro...");
      billingApi
        .verifyPayment({ payment_link_id: paymentLinkId, payment_id: paymentId })
        .then((res) => {
          if (res.user) {
            setUser(res.user);
          }
          if (res.usage) {
            setUsage(res.usage);
          }
          setPaymentNotice(
            "🎉 Congratulations! Payment confirmed. Your account is upgraded to FileDrop Pro with 100 GB storage & 1 GB uploads."
          );
          load();
        })
        .catch(() => {
          // Fallback to getMe
          authApi
            .getMe()
            .then((updatedUser) => {
              setUser(updatedUser);
              load();
              setPaymentNotice("🎉 Payment completed! Your Pro privileges are active.");
            })
            .catch(console.error);
        });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("payment") === "cancelled") {
      setPaymentNotice("Payment was cancelled. You can upgrade anytime.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, load, navigate, setUser]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await billingApi.createCheckoutSession();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? "Failed to initiate Razorpay checkout.");
      setUpgrading(false);
    }
  };

  const onDelete = (id: string) => setTransfers(prev => prev.filter(t => t.id !== id));

  const storagePercent = usage
    ? Math.round((usage.active_storage_bytes / usage.max_storage_bytes) * 100)
    : 0;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-wrapper">
        <div className="dashboard-header">
          <h1>
            Good to see you{user?.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
          </h1>
          <p style={{ marginTop: 6 }}>Manage your file transfers below.</p>
        </div>

        {paymentNotice && (
          <div style={{ marginBottom: 20 }}>
            <Alert type="info">{paymentNotice}</Alert>
          </div>
        )}

        {/* Pro Upgrade Banner for Free Users */}
        {user?.plan === "free" && (
          <div className="card" style={{
            marginBottom: 28,
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Upgrade to FileDrop Pro</h3>
                <span className="badge plan-badge-pro" style={{ fontSize: "0.75rem" }}>₹499/month</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-secondary, #94a3b8)" }}>
                Get 100 GB storage, up to 10,000 transfers, 1 GB file sizes, and 30-day link expiration. Powered by Razorpay.
              </p>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="btn btn-primary"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)",
                fontWeight: 600
              }}
            >
              {upgrading ? "Opening Razorpay..." : "Upgrade to Pro"}
            </button>
          </div>
        )}

        {/* Stats */}
        {usage && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Transfers</span>
              <span className="stat-value">{usage.active_transfer_count}</span>
              <span className="stat-sub">of {usage.max_transfers} max</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Storage Used</span>
              <span className="stat-value">{formatBytes(usage.active_storage_bytes)}</span>
              <span className="stat-sub">of {formatBytes(usage.max_storage_bytes)}</span>
            </div>
            <div className="stat-card" style={{ gridColumn: "1 / -1" }}>
              <span className="stat-label">Storage Usage</span>
              <div className="progress-bar-track" style={{ marginTop: 8 }}>
                <div className="progress-bar-fill" style={{ width: `${storagePercent}%` }} />
              </div>
              <span className="stat-sub" style={{ marginTop: 4 }}>{storagePercent}% used</span>
            </div>
          </div>
        )}

        {/* Upload panel */}
        <UploadPanel onUploaded={load} />

        {/* Transfer list */}
        <div className="section-title">
          <h3>Your Transfers</h3>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            🔄 Refresh
          </button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spinner size={32} />
          </div>
        ) : (
          <TransferList transfers={transfers} onDelete={onDelete} />
        )}
      </main>
    </div>
  );
}
