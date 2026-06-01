import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/layout/BottomNav";
import { UtensilsCrossed, Car, ShoppingBag, Film, Pill, BookOpen, Wallet, Plus } from "lucide-react";

const categories = [
  { Icon: UtensilsCrossed, label: "Makanan" },
  { Icon: Car, label: "Transport" },
  { Icon: ShoppingBag, label: "Belanja" },
  { Icon: Film, label: "Hiburan" },
  { Icon: Pill, label: "Kesehatan" },
  { Icon: BookOpen, label: "Pendidikan" },
  { Icon: Wallet, label: "Tabungan" },
  { Icon: Plus, label: "Lainnya" },
];

export default function TambahTransaksi() {
  const navigate = useNavigate();
  const [type, setType] = useState<"pengeluaran" | "pemasukan">("pengeluaran");
  const [selectedCat, setSelectedCat] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="app-shell">
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Tambah Transaksi</h2>
      </div>

      <div style={{ padding: "0 16px 90px" }}>
        {/* Type toggle */}
        <div style={{
          display: "flex", background: "white", borderRadius: 16, padding: 4,
          marginBottom: 20, gap: 4,
        }}>
          {["pengeluaran", "pemasukan"].map(t => (
            <button key={t} onClick={() => setType(t as any)} style={{
              flex: 1, padding: "10px", borderRadius: 12, border: "none",
              background: type === t ? (t === "pengeluaran" ? "var(--color-salmon)" : "var(--color-teal-dark)") : "transparent",
              color: type === t ? "white" : "var(--color-text-muted)",
              fontSize: 14, fontWeight: 600, fontFamily: "var(--font-main)", cursor: "pointer",
              transition: "all 0.2s", textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>

        {/* Amount input */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 8px" }}>Jumlah</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text-muted)" }}>Rp</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: 40, fontWeight: 800, fontFamily: "var(--font-main)",
                color: type === "pengeluaran" ? "var(--color-salmon)" : "var(--color-teal-dark)",
                width: "60%", textAlign: "center",
              }}
            />
          </div>
          <div style={{ height: 2, background: "var(--color-border)", borderRadius: 2, margin: "8px auto 0", width: "80%" }} />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Deskripsi</label>
          <input className="input-field" placeholder="Contoh: Makan siang bersama tim..." />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Kategori</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {categories.map(cat => {
              const IconComp = cat.Icon;
              return (
              <button
                key={cat.label}
                onClick={() => setSelectedCat(cat.label)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 8px", borderRadius: 14, border: "1.5px solid",
                  borderColor: selectedCat === cat.label ? "var(--color-salmon)" : "var(--color-border)",
                  background: selectedCat === cat.label ? "#FFF3EE" : "white",
                  cursor: "pointer", fontFamily: "var(--font-main)",
                }}
              >
                <IconComp size={22} />
                <span style={{
                  fontSize: 11, fontWeight: selectedCat === cat.label ? 700 : 400,
                  color: selectedCat === cat.label ? "var(--color-salmon)" : "var(--color-text-secondary)",
                }}>{cat.label}</span>
              </button>
            );
            })}
          </div>
        </div>

        {/* Date */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Tanggal</label>
          <input className="input-field" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>

        {/* Submit */}
        <button className="btn-primary" style={{ fontSize: 16, padding: "16px" }}>
          Simpan Transaksi
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
