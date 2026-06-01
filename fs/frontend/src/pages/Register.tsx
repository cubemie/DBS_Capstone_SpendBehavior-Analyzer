import { useState } from "react";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/quokka-register.png";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/Button";
import Input from "../components/Input";
import { cn } from "../utils/cn";

export default function Register() {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);

  return (
    <AuthLayout
      image={quokkaImg}
      title="Mulai perjalanan finansial yang lebih tenang"
      subtitle="Buat akun BUDU dan biarkan Quokka membantu mencatat, membaca, dan memberi saran pengeluaran."
      mode="register"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-teal-ink)]">
          Daftar BUDU
        </p>
        <h2 className="mt-2 text-2xl font-black text-[var(--color-text-primary)]">Buat akun baru</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Hanya butuh beberapa detail untuk menyiapkan dashboard pertamamu.
        </p>
      </div>

      <div className="mt-7 space-y-4">
        <Input
          label="Nama Lengkap"
          name="name"
          placeholder="Masukkan nama lengkap"
          iconLeft={<User className="h-5 w-5" />}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="contoh@email.com"
          iconLeft={<Mail className="h-5 w-5" />}
        />
        <Input
          label="Kata Sandi"
          name="password"
          type="password"
          placeholder="Minimal 8 karakter"
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
            Saya setuju dengan <strong className="text-[var(--color-salmon-dark)]">Syarat</strong> dan{" "}
            <strong className="text-[var(--color-salmon-dark)]">Ketentuan</strong> BUDU.
          </span>
        </button>

        <Button
          fullWidth
          variant="secondary"
          buttonSize="lg"
          iconRight={<ArrowRight className="h-5 w-5" />}
          disabled={!agree}
          onClick={() => navigate("/dashboard")}
        >
          Buat Akun
        </Button>

        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-black text-[var(--color-salmon-dark)]"
          >
            Masuk di sini
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
