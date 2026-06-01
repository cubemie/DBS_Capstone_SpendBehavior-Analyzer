import { useState } from "react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/quokka-register.png";

export default function Register() {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);

  return (
    <div style={{
      minHeight: "100dvh", background: "var(--color-bg)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "32px 24px",
    }}>
      {/* Quokka small */}
      <div style={{ marginBottom: 16 }}>
        <img src={quokkaImg} alt="Quokka" style={{
          width: 88, height: 88, borderRadius: "50%",
          objectFit: "cover", objectPosition: "top",
          boxShadow: "0 6px 20px rgba(242,140,106,0.2)",
        }} />
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", textAlign: "center" }}>
        Mulai Perjalananmu
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 28px", textAlign: "center" }}>
        Bersama Quokka, kelola uang lebih mudah.
      </p>

      {/* Card form */}
      <div style={{
        width: "100%", maxWidth: 380,
        background: "white", borderRadius: 24, padding: "24px 20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Nama */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nama Lengkap</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" stroke="#9E9B95" strokeWidth="1.8"/>
                  <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke="#9E9B95" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="input-field" style={{ paddingLeft: 40, fontSize: 14 }} type="text" placeholder="Masukkan nama lengkap"/>
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="#9E9B95" strokeWidth="1.8"/>
                  <path d="M2 8L12 14L22 8" stroke="#9E9B95" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </span>
              <input className="input-field" style={{ paddingLeft: 40, fontSize: 14 }} type="email" placeholder="contoh@email.com"/>
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9E9B95" strokeWidth="1.8"/>
                  <path d="M8 11V7C8 4.791 9.791 3 12 3C14.209 3 16 4.791 16 7V11" stroke="#9E9B95" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="input-field" style={{ paddingLeft: 40, fontSize: 14 }} type="password" placeholder="Minimal 8 karakter"/>
            </div>
          </div>

          {/* Checkbox */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13 }}>
            <div
              onClick={() => setAgree(!agree)}
              style={{
                width: 20, height: 20, borderRadius: 6, border: "2px solid",
                borderColor: agree ? "var(--color-salmon)" : "var(--color-border)",
                background: agree ? "var(--color-salmon)" : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1, transition: "all 0.15s",
              }}
            >
              {agree && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              Saya setuju dengan{" "}
              <span style={{ color: "var(--color-salmon)", fontWeight: 600 }}>Syarat</span>{" "}dan{" "}
              <span style={{ color: "var(--color-salmon)", fontWeight: 600 }}>Ketentuan</span>{" "}yang berlaku.
            </span>
          </label>

          {/* Register button */}
          <button
            className="btn-primary btn-teal"
            style={{ marginTop: 4 }}
            onClick={() => navigate("/dashboard")}
          >
            Buat Akun
          </button>
        </div>
      </div>

      {/* Login link */}
      <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-text-secondary)", marginTop: 24 }}>
        Sudah punya akun?{" "}
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-salmon)", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-main)" }}
        >
          Masuk di sini
        </button>
      </p>
    </div>
  );
}
