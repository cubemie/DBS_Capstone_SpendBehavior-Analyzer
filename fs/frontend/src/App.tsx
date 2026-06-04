import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analisis from "./pages/Analisis";
import RiwayatTransaksi from "./pages/RiwayatTransaksi";
import Peringatan from "./pages/Peringatan";
import Profil from "./pages/Profil";
import TambahTransaksi from "./pages/TambahTransaksi";
import AppLayout from "./layout/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";

// Redirect ke login jika belum authenticated
function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-teal)] border-t-[var(--color-teal-dark)]" />
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/daftar" element={<Register />} />

          {/* Protected — dilapisi AppLayout + PrivateRoute */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analisis" element={<Analisis />} />
              <Route path="/riwayat" element={<RiwayatTransaksi />} />
              <Route path="/peringatan" element={<Peringatan />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/tambah" element={<TambahTransaksi />} />
              <Route path="/transaksi/:id/edit" element={<TambahTransaksi />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  );
}
