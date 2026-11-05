import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api";
import { useAuthStore } from "../store/auth";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import BrandLogo from "../components/BrandLogo";

// Lazy-loaded visual effects
const PipelineShader = lazy(() => import("../components/PipelineShader"));
const DotGridCanvas  = lazy(() => import("../components/DotGridCanvas"));

export default function RegisterPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { fetchMe, user }        = useAuthStore();
  const navigate                 = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.register(email, password);
      await fetchMe();
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ─── WebGL Pipeline Background Shader ─── */}
      <Suspense fallback={null}>
        <PipelineShader />
      </Suspense>
      <div className="pipeline-ambient-overlay" aria-hidden="true" />

      {/* ─── SVG Liquid Glass Distortion Filter ─── */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.035"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* ─── Glassmorphism Side-by-Side Container ─── */}
      <div className="glass-container auth-glass-shell">
        <div className="glass-filter" aria-hidden="true" />
        <div className="glass-overlay" aria-hidden="true" />
        <div className="glass-specular" aria-hidden="true" />

        <div className="glass-content auth-shell-content">
          {/* Left Column: Animated Dot Grid Canvas */}
          <aside className="auth-visual" aria-hidden="true">
            <Suspense fallback={null}>
              <DotGridCanvas className="auth-canvas" />
            </Suspense>
            <div className="auth-visual-overlay" />
            <div className="auth-visual-body">
              <span className="auth-visual-brand">
                <BrandLogo size={24} />
                T Share
              </span>
              <h2 className="auth-visual-title">
                Start sharing in under a minute.
              </h2>
              <p className="auth-visual-sub">
                End-to-end encrypted sharing, link controls, and verifiable downloads.
              </p>
            </div>
          </aside>

          {/* Right Column: Register Card */}
          <div className="auth-card">
            <div className="auth-logo">
              <div className="logo-icon">
                <BrandLogo size={28} />
              </div>
              <span className="auth-brand-name">T Share</span>
            </div>

            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">Free forever — no credit card required</p>

            {error && <Alert type="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email
                </label>
                <input
                  id="reg-email"
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password
                </label>
                <input
                  id="reg-password"
                  className="form-input"
                  type="password"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  className="form-input"
                  type="password"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <button
                id="btn-register-submit"
                type="submit"
                className="btn auth-submit"
                disabled={loading}
                style={{ marginTop: 4, justifyContent: "center" }}
              >
                {loading ? <Spinner size={18} /> : "Create account"}
              </button>
            </form>

            <div className="auth-divider">or</div>

            <button
              id="btn-google-register"
              className="btn btn-google"
              onClick={() => authApi.initiateGoogleLogin()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
