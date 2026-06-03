import { useState } from "react";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/budu-logo.png";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/Button";
import Input from "../components/Input";
import { cn } from "../utils/cn";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/ApiError";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [agree, setAgree] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    setError(null);

    if (!fullName.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
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
      await register(fullName, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registrasi gagal. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      image={quokkaImg}
      title="Mulai kenal pola belanjamu"
      subtitle="Catat transaksi, lihat pola, lalu ambil keputusan lebih tenang."
      mode="register"
    >
      <div>
        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Buat akun baru</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Mulai catat pengeluaran dan kenali pola belanjamu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <Input
          label="Nama"
          name="fullName"
          placeholder="Nama lengkap"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          iconLeft={<User className="h-5 w-5" />}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="contoh@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          iconLeft={<Mail className="h-5 w-5" />}
        />
        <Input
          label="Kata Sandi"
          name="password"
          type="password"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          iconLeft={<Lock className="h-5 w-5" />}
        />

        <button
          type="button"
          onClick={() => setAgree((value) => !value)}
          className="flex w-full items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)] p-4 text-left"
        >
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition",
              agree
                ? "border-[var(--color-salmon)] bg-[var(--color-salmon)]"
                : "border-[var(--color-border)] bg-white",
            )}
          >
            {agree ? (
              <span className="h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-white" />
            ) : null}
          </span>
          <span className="text-sm leading-6 text-[var(--color-text-secondary)]">
            Saya setuju dengan Syarat dan Ketentuan BUDU.
          </span>
        </button>

        {error && (
          <p className="rounded-xl bg-[var(--color-salmon-bg)] px-4 py-3 text-sm font-semibold text-[var(--color-salmon-dark)]">
            {error}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          variant="secondary"
          buttonSize="lg"
          iconRight={isLoading ? undefined : <ArrowRight className="h-5 w-5" />}
          disabled={!agree || isLoading}
        >
          {isLoading ? "Membuat akun..." : "Buat Akun"}
        </Button>

        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-black text-[var(--color-salmon-dark)]"
          >
            Masuk
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

