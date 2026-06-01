import { useState } from "react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/quokka-login.png";

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{
      minHeight: "100dvh", background: "var(--color-bg)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "32px 24px",
    }}>
      {/* Quokka */}
      <div style={{ marginBottom: 16 }}>
        <img src={quokkaImg} alt="Quokka" style={{
          width: 120, height: 120, borderRadius: "50%",
          objectFit: "cover", objectPosition: "top",
          boxShadow: "0 8px 32px rgba(242,140,106,0.25)",
        }} />
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", textAlign: "center" }}>
        Halo Lagi!
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 32px", textAlign: "center" }}>
        Selamat datang kembali di SpendQuokka.
      </p>

      {/* Form */}
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Email */}
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Email</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="#9E9B95" strokeWidth="1.8"/>
                <path d="M2 8L12 14L22 8" stroke="#9E9B95" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </span>
            <input
              className="input-field"
              style={{ paddingLeft: 42 }}
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Kata Sandi</label>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-salmon)", fontFamily: "var(--font-main)", fontWeight: 500 }}>
              Lupa kata sandi?
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9E9B95" strokeWidth="1.8"/>
                <path d="M8 11V7C8 4.791 9.791 3 12 3C14.209 3 16 4.791 16 7V11" stroke="#9E9B95" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              className="input-field"
              style={{ paddingLeft: 42, paddingRight: 46 }}
              type={showPass ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                {showPass
                  ? <><path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z" stroke="#9E9B95" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="#9E9B95" strokeWidth="1.8"/></>
                  : <><path d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 1 12 1 12A18.45 18.45 0 015.06 5.06M9.9 4.24A9.12 9.12 0 0112 4C19 4 23 12 23 12A18.5 18.5 0 0120.25 16.25" stroke="#9E9B95" strokeWidth="1.8" strokeLinecap="round"/><path d="M1 1L23 23" stroke="#9E9B95" strokeWidth="1.8" strokeLinecap="round"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Login button */}
        <button
          className="btn-primary"
          style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={() => navigate("/dashboard")}
        >
          Masuk
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M5 12H19M13 6L19 12L13 18" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>atau masuk dengan</span>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        </div>

        {/* Social login */}
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-outline" style={{ flex: 1, justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21.805 10.023H21V10H12V14H17.651C16.827 16.344 14.614 18 12 18C8.686 18 6 15.314 6 12C6 8.686 8.686 6 12 6C13.529 6 14.921 6.576 15.981 7.519L18.809 4.691C17.023 3.034 14.634 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 11.341 21.931 10.698 21.805 10.023Z" fill="#9E9B95"/>
            </svg>
            Google
          </button>
          <button className="btn-outline" style={{ flex: 1, justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#9E9B95">
              <path d="M17.05 20.28C16.07 21.23 15 21.08 13.97 20.63C12.88 20.17 11.88 20.15 10.73 20.63C9.29 21.25 8.54 21.07 7.67 20.28C2.79 15.25 3.51 7.61 9.05 7.31C10.4 7.38 11.34 8.05 12.13 8.11C13.31 7.87 14.44 7.18 15.7 7.27C17.21 7.39 18.35 7.99 19.1 9.07C16.02 10.86 16.76 15.04 19.6 16.19C19.06 17.62 18.36 19.04 17.05 20.29ZM12.03 7.25C11.89 5.02 13.69 3.18 15.77 3C16.06 5.58 13.43 7.5 12.03 7.25Z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Register link */}
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-text-secondary)", marginTop: 8 }}>
          Belum punya akun?{" "}
          <button
            onClick={() => navigate("/daftar")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-salmon)", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-main)" }}
          >
            Daftar sekarang
          </button>
        </p>
      </div>
    </div>
  );
}
