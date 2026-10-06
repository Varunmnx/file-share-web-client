import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { billingApi } from "../api";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">📤</span>
        FileDrop
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">
              Dashboard
            </Link>
            <span
              className={`badge ml-2 ${user.plan === "pro" ? "plan-badge-pro" : "plan-badge-free"}`}
              style={{ marginRight: 8 }}
            >
              {user.plan.toUpperCase()}
            </span>

            {user.plan === "free" && (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="btn btn-primary btn-sm"
                style={{ marginRight: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {upgrading ? "Loading..." : "⚡ Upgrade to Pro"}
              </button>
            )}

            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
