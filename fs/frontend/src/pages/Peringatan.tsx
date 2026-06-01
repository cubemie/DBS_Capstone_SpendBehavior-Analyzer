import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import quokkaImg from "../assets/quokka-alert.png";
import { ShoppingBag, Calendar, CreditCard } from "lucide-react";

export default function Peringatan() {
  return (
    <div className="app-shell">
      <TopBar title="SpendQ" />
      <div className="page-content" style={{ padding: "0 16px 90px" }}>

        {/* Hero */}
        <div style={{
          background: "var(--color-bg)", borderRadius: 20, padding: "20px",
          textAlign: "center", marginBottom: 20,
        }}>
          <img src={quokkaImg} alt="Quokka" style={{
            width: 90, height: 90, borderRadius: "50%", objectFit: "cover",
            objectPosition: "top", marginBottom: 12,
            boxShadow: "0 4px 16px rgba(242,140,106,0.2)",
          }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.3 }}>
            Halo! Ada yang<br />perlu kita cek.
          </h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>
            Saya perhatikan ada beberapa tren pengeluaran bulan ini. Yuk, kita lihat bersama Peringatan Pintar dan Deteksi Kebocoran agar tabunganmu tetap aman dan sesuai target.
          </p>
        </div>

        {/* Peringatan Pintar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M3 20L8 13L12 16L18 8L21 11" stroke="var(--color-salmon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Peringatan Pintar</h3>
        </div>

        {/* Alert 1 - Impulsif */}
        <div className="card" style={{ marginBottom: 12, position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18 }}>☕</span>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "var(--color-salmon)",
              background: "#FFF3EE", borderRadius: 100, padding: "3px 10px",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.56 19C1.57 19.72 2 20.37 2.66 20.72C2.99 20.9 3.36 21 3.74 21H20.26C20.64 21 21.01 20.9 21.34 20.72C22 20.37 22.43 19.72 22.44 19C22.45 18.65 22.36 18.3 22.18 18L13.71 3.86C13.34 3.24 12.7 2.86 12 2.86C11.3 2.86 10.66 3.24 10.29 3.86Z" stroke="var(--color-salmon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              IMPULSIF
            </span>
          </div>
          <h4 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Pengeluaran Kopi Meningkat</h4>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 14px", lineHeight: 1.6 }}>
            Kamu sudah jajan kopi <strong style={{ color: "var(--color-salmon)" }}>6 kali</strong> minggu ini dengan total{" "}
            <strong style={{ color: "var(--color-salmon)" }}>Rp 320.000</strong>. Yuk, coba sesekali buat sendiri hemat!
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn-primary" style={{ flex: 1, fontSize: 14, padding: "12px", borderRadius: 12 }}>
              Lihat Detail
            </button>
            <button style={{
              width: 40, height: 40, borderRadius: 12, border: "1.5px solid var(--color-border)",
              background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6L18 18" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Alert 2 - Tak Biasa */}
        <div className="card" style={{ marginBottom: 20, position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-teal-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={20} />
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)",
              background: "var(--color-bg)", borderRadius: 100, padding: "3px 10px",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-text-muted)", display: "inline-block" }} />
              TAK BIASA
            </span>
          </div>
          <h4 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Transaksi Nominal Besar</h4>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 14px", lineHeight: 1.6 }}>
            Ada pengeluaran sebesar <strong>Rp 2.500.000</strong> di TechStore. Apakah ini benar transaksimu? Pastikan untuk mengkategorikannya.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn-outline" style={{ flex: 1, justifyContent: "center", borderRadius: 12, padding: "12px" }}>
              Kategorikan
            </button>
            <button style={{
              width: 40, height: 40, borderRadius: 12, border: "1.5px solid var(--color-teal)",
              background: "var(--color-teal-bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M20 6L9 17L4 12" stroke="var(--color-teal-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Deteksi Kebocoran */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M12 2.69L5.75 8.95C4.03 10.67 3 13.01 3 15.5C3 20.19 6.81 24 11.5 24S20 20.19 20 15.5C20 13.01 18.97 10.67 17.25 8.95L12 2.69Z" fill="var(--color-teal)" stroke="var(--color-teal-dark)" strokeWidth="0.5"/>
          </svg>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Deteksi Kebocoran</h3>
        </div>

        {/* Leak 1 */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3EE", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <Calendar size={20} />
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>Langganan Pasif</h4>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 14px", lineHeight: 1.5 }}>
            Kamu membayar Rp 120.000/bulan untuk MovieFlix, tapi belum digunakan selama 2 bulan.
          </p>
          <button style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            color: "var(--color-salmon)", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-main)",
          }}>Batalkan Langganan</button>
        </div>

        {/* Leak 2 */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <CreditCard size={20} />
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>Biaya Admin Kecil</h4>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 14px", lineHeight: 1.5 }}>
            Sering top-up nominal kecil membuatmu rugi Rp 45.000 bulan ini untuk biaya admin.
          </p>
          <button className="btn-primary" style={{ fontSize: 14, padding: "11px", borderRadius: 12 }}>
            Lihat Tips Hemat
          </button>
        </div>

        {/* All Clear */}
        <div style={{
          textAlign: "center", padding: "24px 20px",
          background: "white", borderRadius: 20, marginBottom: 8,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: "var(--color-teal-bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="var(--color-teal-dark)" strokeWidth="1.8"/>
              <path d="M8 12L11 15L16 9" stroke="var(--color-teal-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Semua Aman!</h4>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>
            Tidak ada kebocoran lain yang terdeteksi saat ini.
          </p>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
