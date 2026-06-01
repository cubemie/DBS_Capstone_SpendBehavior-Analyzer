import { useState } from "react";
import avatarImg from "../assets/avatar-user.png";
import BottomNav from "../components/layout/BottomNav";

export default function Profil() {
  const [notifPush, setNotifPush] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="app-shell">
      {/* Custom header */}
      <div style={{ padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Profile Settings</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M12 3C8.13 3 5 6.13 5 10V17H19V10C19 6.13 15.87 3 12 3Z" stroke="var(--color-text-primary)" strokeWidth="1.8"/>
              <path d="M10 17V18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18V17" stroke="var(--color-text-primary)" strokeWidth="1.8"/>
              <circle cx="17" cy="6" r="3.5" fill="var(--color-salmon)" stroke="white" strokeWidth="1.5"/>
            </svg>
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" stroke="var(--color-text-primary)" strokeWidth="1.8"/>
              <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="var(--color-text-primary)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
          <img src={avatarImg} alt="Avatar" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
        </div>
      </div>

      <div className="page-content" style={{ padding: "0 16px 90px" }}>

        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>Profil Saya</h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>
          Kelola informasi personal, preferensi aplikasi, dan detail langganan Anda.
        </p>

        {/* Profile card */}
        <div className="card" style={{ marginBottom: 16, textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
            <img src={avatarImg} alt="Mutia" style={{
              width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
              border: "3px solid var(--color-bg)",
            }} />
            <button style={{
              position: "absolute", bottom: 0, right: 0,
              width: 26, height: 26, borderRadius: "50%",
              background: "var(--color-salmon)", border: "2px solid white",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                <path d="M16 3L21 8L8 21H3V16L16 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Mutia</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 12px" }}>mutia.spender@example.com</p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--color-bg)", borderRadius: 100, padding: "6px 16px",
            fontSize: 13, fontWeight: 600,
          }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden" }}>
              <img src={avatarImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            Rational Spender
          </div>
        </div>

        {/* Pengaturan Akun */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" stroke="var(--color-text-primary)" strokeWidth="1.8"/>
              <path d="M4 20C4 16.686 7.582 14 12 14" stroke="var(--color-text-primary)" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M16 18L18 20L22 16" stroke="var(--color-teal-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Pengaturan Akun</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Nama Lengkap", value: "Mutia Rahmawati" },
              { label: "Email", value: "mutia.spender@example.com" },
              { label: "No. Telepon", value: "+62 812 3456 7890" },
            ].map(field => (
              <div key={field.label}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--color-text-muted)", marginBottom: 6 }}>{field.label}</label>
                <input className="input-field" defaultValue={field.value} style={{ fontSize: 14 }}/>
              </div>
            ))}
          </div>
          <button style={{
            background: "none", border: "none", cursor: "pointer", padding: "8px 0",
            color: "var(--color-salmon)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-main)",
            display: "flex", alignItems: "center", gap: 6, marginTop: 4,
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" stroke="var(--color-salmon)" strokeWidth="1.8"/>
              <path d="M12 8V12L14 14" stroke="var(--color-salmon)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Ganti Password
          </button>
          <button className="btn-primary" style={{ marginTop: 12, fontSize: 14, padding: "13px" }}>
            Simpan Perubahan
          </button>
        </div>

        {/* Persona Keuangan */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="var(--color-salmon)" stroke="var(--color-salmon)" strokeWidth="1"/>
            </svg>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Persona Keuangan</h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 14px", lineHeight: 1.6 }}>
            Sebagai <strong>Rational Spender</strong>, Anda cenderung menganalisis setiap pengeluaran dan jarang melakukan pembelian impulsif. Pertahankan kebiasaan baik ini!
          </p>
          <div style={{
            background: "var(--color-yellow-bg)", border: "1.5px solid var(--color-yellow)",
            borderRadius: 14, padding: "14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" stroke="#C9A227" strokeWidth="1.8"/>
              <path d="M12 8V12M12 16H12.01" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 2px", color: "#7A5C00" }}>Tips Quokka</p>
              <p style={{ fontSize: 12, color: "#7A5C00", margin: 0, lineHeight: 1.5 }}>
                Sesekali berikan 'reward' untuk diri sendiri agar rutinitas menabung tidak terasa membebani.
              </p>
            </div>
          </div>
          <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13 }}>Progress Tabungan Liburan</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-teal-dark)" }}>75%</span>
          </div>
          <div style={{ height: 8, background: "#F0EDE8", borderRadius: 100 }}>
            <div style={{ height: "100%", width: "75%", background: "var(--color-teal-dark)", borderRadius: 100 }} />
          </div>
        </div>

        {/* Preferensi Aplikasi */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M3 6H21M6 12H18M9 18H15" stroke="var(--color-text-primary)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Preferensi Aplikasi</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Bahasa */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--color-border)" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Bahasa</p>
                <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "2px 0 0" }}>Pilih bahasa utama aplikasi.</p>
              </div>
              <select style={{
                border: "1.5px solid var(--color-border)", borderRadius: 10, padding: "6px 12px",
                fontSize: 13, fontFamily: "var(--font-main)", cursor: "pointer", background: "white",
              }}>
                <option>Indonesia</option>
                <option>English</option>
              </select>
            </div>
            {/* Notifikasi */}
            {[
              { label: "Notifikasi Push", sub: "Peringatan anggaran & tips harian.", state: notifPush, toggle: () => setNotifPush(!notifPush) },
              { label: "Mode Gelap", sub: "Kurangi ketegangan mata.", state: darkMode, toggle: () => setDarkMode(!darkMode) },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--color-border)" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "2px 0 0" }}>{item.sub}</p>
                </div>
                <button
                  onClick={item.toggle}
                  style={{
                    width: 48, height: 27, borderRadius: 100, border: "none", cursor: "pointer",
                    background: item.state ? "var(--color-teal-dark)" : "#D0CCC5",
                    transition: "background 0.2s", position: "relative", flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 21, height: 21, borderRadius: "50%", background: "white",
                    position: "absolute", top: 3,
                    left: item.state ? "calc(100% - 24px)" : "3px",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Langganan & Billing */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="15" rx="3" stroke="var(--color-text-primary)" strokeWidth="1.8"/>
              <path d="M2 10H22" stroke="var(--color-text-primary)" strokeWidth="1.8"/>
            </svg>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Langganan & Billing</h3>
          </div>
          <div style={{
            background: "var(--color-bg)", borderRadius: 14, padding: "14px",
            marginBottom: 12, display: "flex", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 4px" }}>Status Saat Ini</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="var(--color-teal-dark)"/>
                  <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-teal-dark)" }}>SpendQ Pro</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 4px" }}>Perpanjangan</p>
              <span style={{ fontSize: 13, fontWeight: 600 }}>12 Okt 2024</span>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "var(--color-bg)", borderRadius: 14, padding: "14px", marginBottom: 14,
          }}>
            <div style={{ width: 36, height: 36, background: "white", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="15" rx="3" stroke="#6B6760" strokeWidth="1.8"/>
                <path d="M2 10H22" stroke="#6B6760" strokeWidth="1.8"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Bank BCA •••• 1234</p>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0 }}>Metode pembayaran utama</p>
            </div>
          </div>
          <button style={{
            width: "100%", background: "none", border: "1.5px solid var(--color-teal-dark)",
            borderRadius: 14, padding: "12px", fontSize: 14, fontWeight: 700,
            color: "var(--color-teal-dark)", fontFamily: "var(--font-main)", cursor: "pointer",
          }}>
            Kelola Langganan
          </button>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
