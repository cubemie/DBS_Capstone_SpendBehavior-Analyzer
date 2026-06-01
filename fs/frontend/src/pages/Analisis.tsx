import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import { UtensilsCrossed, Landmark } from "lucide-react";

const weeklyData = [
  { label: "M1", value: 3200000 },
  { label: "M2", value: 5800000 },
  { label: "M3", value: 3500000 },
  { label: "M4", value: 8500000 },
];

const kategori = [
  { label: "Makanan", pct: 45, color: "#F28C6A" },
  { label: "Transportasi", pct: 25, color: "#8BDFDD" },
  { label: "Hiburan", pct: 15, color: "#FFE394" },
];

export default function Analisis() {
  return (
    <div className="app-shell">
      <TopBar title="BUDU" />
      <div className="page-content" style={{ padding: "0 16px 90px" }}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>Analisis Pengeluaran</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
            Bulan ini, Anda lebih hemat 15% dari rata-rata.
          </p>
          <select style={{
            background: "white", border: "1.5px solid var(--color-border)", borderRadius: 12,
            padding: "8px 32px 8px 14px", fontSize: 13, fontWeight: 600,
            fontFamily: "var(--font-main)", cursor: "pointer", color: "var(--color-text-primary)",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%236B6760' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
          }}>
            <option>Bulan Ini</option>
            <option>Bulan Lalu</option>
            <option>3 Bulan</option>
          </select>
        </div>

        {/* Tren Pengeluaran */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Tren Pengeluaran</h3>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M3 20L8 13L12 16L18 8L21 11" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Area chart */}
          <div style={{ position: "relative", height: 140 }}>
            {/* Y labels */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>10Jt</span>
              <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>5Jt</span>
              <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>0</span>
            </div>

            {/* SVG chart */}
            <svg width="100%" height="120" viewBox="0 0 280 100" preserveAspectRatio="none"
              style={{ marginLeft: 28, width: "calc(100% - 28px)" }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F28C6A" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#F28C6A" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Area */}
              <path d="M0 90 L70 55 L140 75 L210 40 L280 10 L280 100 L0 100 Z" fill="url(#chartGrad)"/>
              {/* Line */}
              <path d="M0 90 L70 55 L140 75 L210 40 L280 10" fill="none" stroke="#F28C6A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Dots */}
              {[
                [0, 90], [70, 55], [140, 75], [210, 40], [280, 10]
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i === 2 ? 5 : 4} fill="#F28C6A" stroke="white" strokeWidth="2"/>
              ))}
              {/* Tooltip */}
              <rect x="95" y="32" width="90" height="32" rx="8" fill="white" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.12))"/>
              <text x="140" y="46" textAnchor="middle" fontSize="9" fill="#6B6760" fontFamily="Poppins, sans-serif">Minggu ke-3</text>
              <text x="140" y="58" textAnchor="middle" fontSize="10" fill="#F28C6A" fontWeight="700" fontFamily="Poppins, sans-serif">Rp 3.500.000</text>
            </svg>

            {/* X labels */}
            <div style={{ display: "flex", justifyContent: "space-around", marginLeft: 28, marginTop: 4 }}>
              {weeklyData.map(d => (
                <span key={d.label} style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 500 }}>{d.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Kategori */}
        <div className="card" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Top Kategori</h3>
          {/* Donut chart */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ position: "relative", width: 130, height: 130 }}>
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: 130, height: 130 }}>
                {(() => {
                  const result = kategori.reduce((acc: { offset: number; elements: any[] }, k, i) => {
                    const circumference = 2 * Math.PI * 15.9;
                    const dash = (k.pct / 100) * circumference;
                    const gap = circumference - dash;
                    const currentOffset = acc.offset;
                    const el = (
                      <circle key={i} cx="18" cy="18" r="15.9" fill="none"
                        stroke={k.color} strokeWidth="3.6"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-currentOffset}/>
                    );
                    acc.elements.push(el);
                    acc.offset += dash;
                    return acc;
                  }, { offset: 0, elements: [] });
                  return result.elements;
                })()}
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>Rp 8.2Jt</span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {kategori.map((k) => (
              <div key={k.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: k.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14 }}>{k.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{k.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hari Kerja vs Akhir Pekan */}
        <div className="card" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Hari Kerja vs Akhir Pekan</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {["Hari Kerja", "Akhir Pekan"].map((label, i) => (
              <div key={label} style={{
                flex: 1, background: "var(--color-bg)", borderRadius: 14, padding: "12px",
                border: i === 1 ? "2px solid var(--color-salmon)" : "2px solid transparent",
              }}>
                <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontSize: 18, fontWeight: 800, margin: 0, color: i === 1 ? "var(--color-salmon)" : "var(--color-text-primary)" }}>
                  {i === 0 ? "Rp 200rb" : "Rp 400rb"}
                </p>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "2px 0 0" }}>per hari rata-rata</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>
            Pengeluaran akhir pekan <strong style={{ color: "var(--color-salmon)" }}>2x lebih besar</strong>.
          </p>
        </div>

        {/* Rekomendasi Cerdas */}
        <div style={{
          background: "var(--color-teal-bg)", border: "1.5px solid var(--color-teal)",
          borderRadius: 20, padding: "18px", marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "var(--color-teal-dark)", fontWeight: 600 }}>psychology</span>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--color-teal-dark)" }}>Rekomendasi Cerdas</h3>
          </div>
          {[
            { Icon: UtensilsCrossed, title: "Kurangi Jajan Kopi", desc: "Anda menghabiskan Rp 800rb minggu ini untuk kopi. Coba buat sendiri di rumah." },
            { Icon: Landmark, title: "Peluang Menabung", desc: "Sisa budget transportasi (Rp 300rb) bisa dialihkan ke tabungan darurat." },
          ].map((tip, i) => {
            const TipIcon = tip.Icon;
            return (
            <div key={i} style={{
              background: "white", borderRadius: 14, padding: "12px 14px",
              marginBottom: i === 0 ? 10 : 0, display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <TipIcon size={20} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{tip.title}</p>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{tip.desc}</p>
              </div>
            </div>
            );
          })}
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
