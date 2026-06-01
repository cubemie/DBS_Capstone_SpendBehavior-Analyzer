import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analisis from "./pages/Analisis";
import RiwayatTransaksi from "./pages/RiwayatTransaksi";
import Peringatan from "./pages/Peringatan";
import Profil from "./pages/Profil";
import TambahTransaksi from "./pages/TambahTransaksi";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/daftar" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analisis" element={<Analisis />} />
      <Route path="/riwayat" element={<RiwayatTransaksi />} />
      <Route path="/peringatan" element={<Peringatan />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/tambah" element={<TambahTransaksi />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
