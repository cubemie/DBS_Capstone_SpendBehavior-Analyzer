import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Languages,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundCog,
} from "lucide-react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import PageHeader from "../components/PageHeader";
import SettingsRow from "../components/SettingsRow";
import { currentUser } from "../services/mockData";
import { cn } from "../utils/cn";

interface ToggleProps {
  checked: boolean;
  onClick: () => void;
}

function Toggle({ checked, onClick }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full transition",
        checked ? "bg-[var(--color-teal-dark)]" : "bg-[var(--color-track)]",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
          checked ? "left-7" : "left-1",
        )}
      />
    </button>
  );
}

export default function Profil() {
  const [notifPush, setNotifPush] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Profil Saya" description="Atur akun dan preferensimu." />

      <Card>
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="h-24 w-24 rounded-full object-cover ring-8 ring-[var(--color-soft)]"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-[var(--color-text-primary)]">{currentUser.name}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{currentUser.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="coral">{currentUser.persona}</Badge>
              <Badge variant="teal" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                BUDU {currentUser.membership}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <UserRoundCog className="h-6 w-6 text-[var(--color-teal-ink)]" />
            <h2 className="text-xl font-black text-[var(--color-text-primary)]">Pengaturan Akun</h2>
          </div>
          <div className="space-y-4">
            <Input label="Nama" name="name" defaultValue={currentUser.name} />
            <Input label="Email" name="email" type="email" defaultValue={currentUser.email} />
            <Input label="No. Telepon" name="phone" defaultValue={currentUser.phone} />
          </div>
          <Button className="mt-5 w-full sm:w-auto">Simpan</Button>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <SlidersHorizontal className="h-6 w-6 text-[var(--color-teal-ink)]" />
              <h2 className="text-xl font-black text-[var(--color-text-primary)]">Preferensi Aplikasi</h2>
            </div>
            <div className="space-y-3">
              <SettingsRow
                icon={<Languages className="h-5 w-5" />}
                title="Bahasa"
                description="Tampilan aplikasi"
                trailing={
                  <span className="rounded-full bg-[var(--color-soft)] px-3 py-1.5 text-sm font-bold text-[var(--color-text-secondary)]">
                    Indonesia
                  </span>
                }
              />
              <SettingsRow
                icon={<Bell className="h-5 w-5" />}
                title="Notifikasi"
                description="Peringatan penting saja"
                trailing={<Toggle checked={notifPush} onClick={() => setNotifPush((value) => !value)} />}
              />
              <SettingsRow
                icon={<Moon className="h-5 w-5" />}
                title="Mode Gelap"
                description="Preferensi tampilan"
                trailing={<Toggle checked={darkMode} onClick={() => setDarkMode((value) => !value)} />}
              />
            </div>
          </Card>

          <Card className="!border-[var(--color-yellow)] !bg-[var(--color-yellow-bg)]">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-yellow-ink)]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">Persona Keuangan</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Kamu cenderung mikir dulu sebelum belanja. Pertahankan ritme ini, sambil tetap kasih batas jajan mingguan.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-[var(--color-teal-ink)]" />
              <h2 className="text-xl font-black text-[var(--color-text-primary)]">Langganan</h2>
            </div>
            <SettingsRow
              icon={<CreditCard className="h-5 w-5" />}
              title={`BUDU ${currentUser.membership}`}
              description="Status akun saat ini"
              trailing={<Badge variant="teal">Aktif</Badge>}
            />
          </Card>
        </div>
      </section>
    </div>
  );
}
