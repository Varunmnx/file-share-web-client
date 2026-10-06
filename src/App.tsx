import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { authApi } from "./api";
import Spinner from "./components/Spinner";

import LandingPage   from "./pages/LandingPage";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import DownloadPage  from "./pages/DownloadPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return (
    <div className="loading-page">
      <Spinner size={36} />
      <p className="text-secondary">Loading…</p>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { fetchMe, initialized } = useAuthStore();

  useEffect(() => {
    // Handle Google OAuth callback tokens that land on the root URL
    const handled = authApi.handleOAuthCallback();
    // Always fetch me (no-op if not authenticated)
    if (!handled) fetchMe();
    else fetchMe();
  }, []);

  if (!initialized) {
    return (
      <div className="loading-page">
        <Spinner size={36} />
        <p className="text-secondary">Loading FileDrop…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/s/:token"  element={<DownloadPage />} />
        <Route path="/f/:token"  element={<DownloadPage />} />
        <Route path="/dashboard" element={
          <PrivateRoute><DashboardPage /></PrivateRoute>
        } />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
