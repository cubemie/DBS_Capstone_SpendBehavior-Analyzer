import { useState } from "react";
import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import { UtensilsCrossed, Car, DollarSign, ShoppingBag } from "lucide-react";

const transactions = [
  { date: "24 Nov", time: "14:30", Icon: UtensilsCrossed, name: "Makan Siang Kopi Kenangan", method: "Kartu Debit", category: "Makanan", amount: -85000 },
  { date: "23 Nov", time: "09:15", Icon: Car, name: "Isi Bensin Shell", method: "E-Wallet", category: "Transport", amount: -200000 },
  { date: "22 Nov", time: "10:00", Icon: DollarSign, name: "Gaji Bulanan", method: "Transfer Bank", category: "Pendapatan", amount: 25000000 },
  { date: "20 Nov", time: "19:45", Icon: ShoppingBag, name: "Belanja Bulanan Supermarket", method: "Kartu Kredit", category: "Belanja", amount: -850000 },
];

const categories = ["Semua", "Makanan", "Transportasi", "Belanja", "Pendapatan"];

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Math.abs(n));
}

export default function RiwayatTransaksi() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter(tx => {
    const matchCat = activeFilter === "Semua" || tx.category.toLowerCase().includes(activeFilter.toLowerCase());
    const matchSearch = tx.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="app-shell">
      <TopBar title="SpendQ" />
      <div className="page-content" style={{ padding: "0 16px 90px" }}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>Riwayat Transaksi</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 14px" }}>
            Pantau arus kas Anda bulan ini.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-outline" style={{ flex: 1, justifyContent: "center", borderRadius: 12, padding: "10px 14px" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M3 6H21M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Filter
            </button>
            <button className="btn-primary" style={{ flex: 1, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M12 15L12 3M12 15L8 11M12 15L16 11M3 21H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ekspor
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="card" style={{ marginBottom: 10, display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="15" rx="3" stroke="var(--color-text-muted)" strokeWidth="1.8"/>
              <path d="M2 10H22" stroke="var(--color-text-muted)" strokeWidth="1.8"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 2px" }}>Total Saldo</p>
            <p style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Rp 12.500.000</p>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>Nov 2023</div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Pemasukan", amount: 25000000, color: "var(--color-teal-dark)", bg: "var(--color-teal-bg)", icon: "↓" },
            { label: "Pengeluaran", amount: 12500000, color: "var(--color-salmon)", bg: "#FFF3EE", icon: "↑" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ flex: 1, padding: "14px" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: s.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: s.color, marginBottom: 8,
              }}>{s.icon}</div>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 2px" }}>{s.label}</p>
              <p style={{ fontSize: 16, fontWeight: 800, margin: 0, color: s.color }}>
                {formatRp(s.amount)}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="#9E9B95" strokeWidth="1.8"/>
              <path d="M21 21L16.65 16.65" stroke="#9E9B95" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            className="input-field"
            style={{ paddingLeft: 42, borderRadius: 100 }}
            placeholder="Cari transaksi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                flexShrink: 0, borderRadius: 100, padding: "6px 16px",
                border: "1.5px solid",
                borderColor: activeFilter === cat ? "var(--color-text-primary)" : "var(--color-border)",
                background: activeFilter === cat ? "var(--color-text-primary)" : "white",
                color: activeFilter === cat ? "white" : "var(--color-text-primary)",
                fontSize: 13, fontWeight: activeFilter === cat ? 700 : 400,
                fontFamily: "var(--font-main)", cursor: "pointer",
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Transactions table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "80px 1fr 100px",
            padding: "12px 16px", borderBottom: "1px solid var(--color-border)",
          }}>
            {["Tanggal", "Deskripsi", "Kategori"].map(h => (
              <span key={h} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>{h}</span>
            ))}
          </div>

          {filtered.map((tx, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "80px 1fr 100px",
              padding: "14px 16px",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none",
              alignItems: "center",
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{tx.date}</p>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>{tx.time}</p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {(() => {
                  const IconComp = tx.Icon;
                  return <IconComp size={20} />;
                })()}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{tx.name}</p>
                  <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>{tx.method}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: "2px 0 0", color: tx.amount > 0 ? "var(--color-green)" : "var(--color-text-primary)" }}>
                    {tx.amount > 0 ? "+" : "-"}{formatRp(tx.amount)}
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, background: "var(--color-bg)",
                borderRadius: 100, padding: "3px 10px", textAlign: "center",
                color: "var(--color-text-secondary)",
              }}>{tx.category}</span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 4px" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Menampilkan 1-4 dari 45</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {["<", "1", "2", "3", ">"].map((p, i) => (
              <button key={i} style={{
                width: 30, height: 30, borderRadius: 8, border: "none",
                background: p === "1" ? "var(--color-teal)" : "white",
                color: p === "1" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                fontSize: 13, fontWeight: p === "1" ? 700 : 400,
                cursor: "pointer", fontFamily: "var(--font-main)",
              }}>{p}</button>
            ))}
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
