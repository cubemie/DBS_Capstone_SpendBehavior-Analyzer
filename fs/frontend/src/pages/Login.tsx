import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/quokka-login.png";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout
      image={quokkaImg}
      title="Halo lagi, siap cek ritme uangmu?"
      subtitle="Masuk untuk melihat dashboard pengeluaran, peringatan pintar, dan insight dari Quokka."
      mode="login"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-teal-ink)]">
          Masuk akun
        </p>
        <h2 className="mt-2 text-2xl font-black text-[var(--color-text-primary)]">Selamat datang kembali</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          SpendQ siap bantu Anda membaca pola belanja tanpa terasa menggurui.
        </p>
      </div>

      <div className="mt-7 space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Masukkan email Anda"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          iconLeft={<Mail className="h-5 w-5" />}
        />

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Kata Sandi</span>
            <button
              type="button"
              className="text-sm font-bold text-[var(--color-salmon-dark)]"
            >
              Lupa kata sandi?
            </button>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              iconLeft={<Lock className="h-5 w-5" />}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button fullWidth buttonSize="lg" iconRight={<ArrowRight className="h-5 w-5" />} onClick={() => navigate("/dashboard")}>
          Masuk
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-xs font-medium text-[var(--color-text-muted)]">atau masuk dengan</span>
          <span className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline">Google</Button>
          <Button variant="outline">Apple</Button>
        </div>

        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Belum punya akun?{" "}
          <button
            type="button"
            onClick={() => navigate("/daftar")}
            className="font-black text-[var(--color-salmon-dark)]"
          >
            Daftar sekarang
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
