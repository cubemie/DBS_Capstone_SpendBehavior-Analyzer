import type { ReactNode } from "react";
import { Sparkles, WalletCards, Bell, BarChart3 } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  image: string;
  title: string;
  subtitle: string;
  mode: "login" | "register";
}

function AuthLayout({ children, image, title, subtitle, mode }: AuthLayoutProps) {
  return (
    <main className="min-h-dvh bg-[var(--color-bg)] px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.72fr)] lg:gap-10 lg:px-10 lg:py-10 xl:px-16">
      <section className="mx-auto mb-6 flex w-full max-w-md flex-col items-center text-center lg:mb-0 lg:max-w-none lg:items-start lg:justify-center lg:text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-yellow)] text-[var(--color-text-primary)]">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <p className="text-3xl font-black tracking-tight text-[var(--color-brand)]">BUDU</p>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">Butuh Duit</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 lg:mt-10 lg:flex-row lg:items-center">
          <img
            src={image}
            alt="Quokka BUDU"
            className="h-20 w-20 rounded-full object-cover object-top shadow-[0_14px_36px_rgba(242,140,106,0.20)] ring-4 ring-white sm:h-28 sm:w-28 lg:h-36 lg:w-36 lg:ring-8"
          />
          <div>
            <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-teal-ink)] lg:block">
              {mode === "login" ? "Masuk" : "Daftar"}
            </p>
            <h1 className="mt-2 max-w-xl text-3xl font-black leading-tight text-[var(--color-text-primary)] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mt-8 hidden w-full max-w-xl gap-3 lg:grid lg:grid-cols-3">
          {[
            { icon: WalletCards, title: "Catat", text: "Pengeluaran harian." },
            { icon: BarChart3, title: "Pahami", text: "Pola belanjamu." },
            { icon: Bell, title: "Waspada", text: "Bocor kecil." },
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

      <section className="mx-auto flex w-full max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_70px_rgba(77,62,38,0.10)] sm:p-7">
          {children}
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
