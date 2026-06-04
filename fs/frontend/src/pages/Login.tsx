import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/budu-logo.png";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/ApiError";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login gagal. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      image={quokkaImg}
      title="Catat uang tanpa ribet"
      subtitle="BUDU bantu kamu cek pengeluaran dengan santai."
      mode="login"
    >
      <div>
        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Selamat datang kembali</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Masuk untuk melihat pengeluaran dan insight harianmu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="contoh@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          iconLeft={<Mail className="h-5 w-5" />}
        />

        <div>
          <span className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">Kata Sandi</span>
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

        {error && (
          <p className="rounded-xl bg-[var(--color-salmon-bg)] px-4 py-3 text-sm font-semibold text-[var(--color-salmon-dark)]">
            {error}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          buttonSize="lg"
          iconRight={isLoading ? undefined : <ArrowRight className="h-5 w-5" />}
          disabled={isLoading}
        >
          {isLoading ? "Masuk..." : "Masuk"}
        </Button>

        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Belum punya akun?{" "}
          <button
            type="button"
            onClick={() => navigate("/daftar")}
            className="font-black text-[var(--color-salmon-dark)]"
          >
            Daftar
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

