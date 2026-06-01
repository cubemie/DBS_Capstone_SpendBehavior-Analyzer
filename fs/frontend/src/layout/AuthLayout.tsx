import type { ReactNode } from "react";
import { ShieldCheck, Sparkles, WalletCards } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  image: string;
  title: string;
  subtitle: string;
  mode: "login" | "register";
}

function AuthLayout({
  children,
  image,
  title,
  subtitle,
  mode,
}: AuthLayoutProps) {
  return (
    <main className="min-h-dvh bg-[var(--color-bg)] px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)] lg:gap-8 lg:px-10 lg:py-10 xl:px-16">
      <section className="mx-auto flex w-full max-w-xl flex-col items-center justify-center text-center lg:max-w-none lg:items-start lg:text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-yellow)] text-[var(--color-text-primary)]">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <p className="text-3xl font-black tracking-tight text-[var(--color-brand)]">BUDU</p>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">Butuh Duit</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 lg:flex-row lg:items-center">
          <img
            src={image}
            alt="Quokka financial coach"
            className="h-32 w-32 rounded-full object-cover object-top shadow-[0_18px_50px_rgba(242,140,106,0.24)] ring-8 ring-white sm:h-40 sm:w-40"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-teal-ink)]">
              {mode === "login" ? "Welcome back" : "Mulai lebih sadar uang"}
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight text-[var(--color-text-primary)] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-[var(--color-text-secondary)]">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          {[
            { icon: WalletCards, title: "Cashflow jelas", text: "Pantau pengeluaran harian tanpa ribet." },
            { icon: ShieldCheck, title: "Smart warning", text: "Peringatan terasa seperti coach, bukan alarm." },
            { icon: Sparkles, title: "Persona finansial", text: "Kenali ritme belanja dan kebiasaanmu." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-[var(--color-border)] bg-white/75 p-4 text-left">
                <Icon className="h-5 w-5 text-[var(--color-teal-ink)]" />
                <p className="mt-3 text-sm font-black text-[var(--color-text-primary)]">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-md items-center lg:mt-0">
        <div className="w-full rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_70px_rgba(77,62,38,0.10)] sm:p-7">
          {children}
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
