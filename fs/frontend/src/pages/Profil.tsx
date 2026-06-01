import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Languages,
  Moon,
  Pencil,
  Shield,
  SlidersHorizontal,
  UserRoundCog,
} from "lucide-react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import ProgressBar from "../components/ProgressBar";
import SectionHeader from "../components/SectionHeader";
import { currentUser } from "../services/mockData";
import { cn } from "../utils/cn";

export default function Profil() {
  const [notifPush, setNotifPush] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Profile settings"
        title="Profil Saya"
        description="Kelola informasi personal, preferensi aplikasi, persona keuangan, dan detail langganan Anda."
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-28 w-28 rounded-full object-cover ring-8 ring-[var(--color-soft)] sm:h-32 sm:w-32"
            />
            <button
              type="button"
              aria-label="Edit foto profil"
              className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[var(--color-teal)] text-[var(--color-teal-ink)]"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-black text-[var(--color-text-primary)]">{currentUser.name.split(" ")[0]}</h2>
            <p className="mt-1 text-base text-[var(--color-text-secondary)]">{currentUser.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="coral">{currentUser.persona}</Badge>
              <Badge variant="teal" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                SpendQ {currentUser.membership}
              </Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full sm:w-auto" iconLeft={<Shield className="h-4 w-4" />}>
            Keamanan Akun
          </Button>
        </div>
      </Card>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <UserRoundCog className="h-6 w-6 text-[var(--color-teal-ink)]" />
            <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Pengaturan Akun</h2>
          </div>
          <div className="space-y-4">
            <Input label="Nama Lengkap" name="name" defaultValue={currentUser.name} />
            <Input label="Email" name="email" type="email" defaultValue={currentUser.email} />
            <Input label="No. Telepon" name="phone" defaultValue={currentUser.phone} />
          </div>
          <button type="button" className="mt-4 text-sm font-black text-[var(--color-salmon-dark)]">
            Ganti Password
          </button>
          <Button className="mt-5 w-full sm:w-auto">Simpan Perubahan</Button>
        </Card>

        <Card className="!border-[var(--color-yellow)] !bg-[var(--color-yellow-bg)]">
          <div className="mb-5 flex items-center gap-3">
            <BadgeCheck className="h-6 w-6 text-[var(--color-salmon-dark)]" />
            <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Persona Keuangan</h2>
          </div>
          <p className="text-base leading-7 text-[var(--color-text-secondary)]">
            Sebagai <strong className="text-[var(--color-text-primary)]">{currentUser.persona}</strong>, Anda cenderung menganalisis setiap pengeluaran dan jarang melakukan pembelian impulsif. Pertahankan kebiasaan baik ini.
          </p>
          <div className="mt-5 rounded-3xl bg-white/70 p-5">
            <p className="font-black text-[var(--color-yellow-ink)]">Tips Quokka</p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              Sesekali berikan reward untuk diri sendiri agar rutinitas menabung tidak terasa membebani.
            </p>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-bold text-[var(--color-text-primary)]">Progress Tabungan Liburan</span>
              <span className="font-black text-[var(--color-teal-ink)]">75%</span>
            </div>
            <ProgressBar value={75} />
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center gap-3">
            <SlidersHorizontal className="h-6 w-6 text-[var(--color-teal-ink)]" />
            <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Preferensi Aplikasi</h2>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-start gap-3">
                <Languages className="mt-1 h-5 w-5 text-[var(--color-text-muted)]" />
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">Bahasa</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Pilih bahasa utama aplikasi.</p>
                </div>
              </div>
              <select className="h-11 rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)] px-4 text-sm font-bold outline-none">
                <option>Indonesia</option>
                <option>English</option>
              </select>
            </div>

            {[
              {
                label: "Notifikasi Push",
                helper: "Peringatan anggaran dan tips harian.",
                state: notifPush,
                onToggle: () => setNotifPush((value) => !value),
                icon: Bell,
              },
              {
                label: "Mode Gelap",
                helper: "Kurangi ketegangan mata.",
                state: darkMode,
                onToggle: () => setDarkMode((value) => !value),
                icon: Moon,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-1 h-5 w-5 text-[var(--color-text-muted)]" />
                    <div>
                      <p className="font-bold text-[var(--color-text-primary)]">{item.label}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{item.helper}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={item.onToggle}
                    className={cn(
                      "relative h-8 w-14 shrink-0 rounded-full transition",
                      item.state ? "bg-[var(--color-teal-dark)]" : "bg-[var(--color-track)]",
                    )}
                    aria-pressed={item.state}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                        item.state ? "left-7" : "left-1",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-[var(--color-teal-ink)]" />
            <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Langganan & Billing</h2>
          </div>
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-soft)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                  Status Saat Ini
                </p>
                <p className="mt-2 text-xl font-black text-[var(--color-teal-ink)]">SpendQ Pro</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                  Perpanjangan
                </p>
                <p className="mt-2 font-black text-[var(--color-text-primary)]">12 Okt 2026</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 rounded-3xl bg-[var(--color-soft)] p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--color-text-secondary)]">
              <CreditCard className="h-6 w-6" />
            </span>
            <div>
              <p className="font-black text-[var(--color-text-primary)]">Bank BCA **** 1234</p>
              <p className="text-sm text-[var(--color-text-muted)]">Metode pembayaran utama</p>
            </div>
          </div>
          <Button variant="outline" fullWidth className="mt-5">
            Kelola Langganan
          </Button>
        </Card>
      </section>
    </div>
  );
}
