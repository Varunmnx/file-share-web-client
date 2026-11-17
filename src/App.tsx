import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { authApi } from "./api";
import BrandLoader from "./components/BrandLoader";

// Lazy-loaded page routes
const LandingPage   = lazy(() => import("./pages/LandingPage"));
const LoginPage     = lazy(() => import("./pages/LoginPage"));
const RegisterPage  = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DownloadPage  = lazy(() => import("./pages/DownloadPage"));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) {
    return <BrandLoader fullScreen message="Verifying session…" />;
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { fetchMe, initialized } = useAuthStore();

  useEffect(() => {
    // Handle Google OAuth callback tokens that land on the root URL
    const handled = authApi.handleOAuthCallback();
    if (!handled) fetchMe();
    else fetchMe();
  }, [fetchMe]);

  if (!initialized) {
    return <BrandLoader fullScreen message="Loading T Share…" />;
  }

  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Suspense fallback={<BrandLoader fullScreen message="Loading…" />}>
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="/s/:token"  element={<DownloadPage />} />
          <Route path="/f/:token"  element={<DownloadPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
