import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { authApi } from "../api";

export default function LandingPage() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{
          padding: "100px 24px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
            width: 800, height: 800,
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "var(--radius-full)", padding: "6px 14px",
              fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-hover)",
              marginBottom: 28,
            }}>
              ✨ Secure • Expiring • Private
            </div>

            <h1 style={{ maxWidth: 680, margin: "0 auto 24px" }}>
              Share files with{" "}
              <span className="text-gradient">zero friction</span>
            </h1>

            <p style={{ fontSize: "1.15rem", maxWidth: 520, margin: "0 auto 40px", color: "var(--text-secondary)" }}>
              FileDrop lets you send files securely with expiring links, password protection,
              and optional one-time access. No sign-up needed to receive.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg" onClick={() => authApi.initiateGoogleLogin()}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
                </svg>
                Start with Google
              </button>
              <Link to="/register" className="btn btn-outline btn-lg">Create free account</Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: "40px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { icon: "🔐", title: "Password Protected", desc: "Optionally lock your transfer behind a password that recipients must enter before downloading." },
              { icon: "⏱️", title: "Expiring Links",      desc: "Set links to expire after 1, 3, or 7 days. Expired files are automatically cleaned up." },
              { icon: "🚀", title: "Direct R2 Upload",    desc: "Files go straight to Cloudflare R2 via pre-signed URLs — your bandwidth isn't touched." },
              { icon: "📊", title: "Usage Dashboard",     desc: "Track storage usage, active transfers, and quota remaining all in one place." },
              { icon: "🌐", title: "Works Everywhere",    desc: "The backend runs on Cloudflare Workers at the edge — sub-100ms response times globally." },
              { icon: "✨", title: "Google Login",        desc: "One-click sign in with Google OAuth. No password to remember, no friction." },
            ].map(f => (
              <div key={f.title} className="card" style={{ transition: "all 0.2s" }}>
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: "0.9rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
