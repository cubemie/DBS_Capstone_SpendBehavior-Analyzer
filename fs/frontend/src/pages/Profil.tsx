import { useState, useEffect } from "react";
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
import { cn } from "../utils/cn";
import { useAuth } from "../contexts/AuthContext";
import { predictionService } from "../services/predictionService";
import type { ApiPrediction } from "../types/models";
import defaultAvatar from "../assets/avatar-user.png";

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
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<ApiPrediction | null>(null);
  const [isLoadingPred, setIsLoadingPred] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    predictionService
      .getLatestPrediction()
      .then((res) => {
        setPrediction(res);
      })
      .finally(() => {
        setIsLoadingPred(false);
      });
  }, []);

  const handleGeneratePrediction = async () => {
    setIsGenerating(true);
    try {
      const res = await predictionService.createPersonaPrediction({ force: true });
      setPrediction(res);
    } catch (err) {
      console.error("Gagal membuat prediksi persona", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const displayName = user?.name || "Pengguna";
  const userEmail = user?.email || "";
  const userPhone = user?.phone || "";
  const avatarUrl = user?.avatarUrl || defaultAvatar;

  return (
    <div className="space-y-6">
      <PageHeader title="Profil Saya" description="Atur akun dan preferensimu." />

      <Card>
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-24 w-24 rounded-full object-cover ring-8 ring-[var(--color-soft)]"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-[var(--color-text-primary)]">{displayName}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{userEmail}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="coral">
                {prediction?.persona || "Belum ada Persona"}
              </Badge>
              <Badge variant="teal" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                BUDU Member
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
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <Input label="Nama" name="name" defaultValue={displayName} readOnly />
            <Input label="Email" name="email" type="email" defaultValue={userEmail} readOnly />
            <Input label="No. Telepon" name="phone" defaultValue={userPhone} readOnly />
          </form>
          <p className="mt-3 text-xs text-[var(--color-text-muted)] italic">
            Perubahan profil dinonaktifkan di server.
          </p>
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
            {isLoadingPred ? (
              <div className="text-center py-4 text-sm text-[var(--color-text-secondary)] animate-pulse">
                Memuat persona keuangan...
              </div>
            ) : prediction ? (
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-yellow-ink)]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-[var(--color-text-primary)]">
                    Persona: {prediction.persona}
                  </h2>
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    {prediction.description}
                  </p>
                  {prediction.tips && prediction.tips.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.05)]">
                      <p className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                        Tips Keuangan
                      </p>
                      <ul className="list-disc pl-5 text-xs text-[var(--color-text-secondary)] space-y-1">
                        {prediction.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    onClick={handleGeneratePrediction}
                    isLoading={isGenerating}
                    variant="outline"
                    className="mt-4 w-full"
                  >
                    Perbarui Analisis
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-yellow-ink)]">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-[var(--color-text-primary)]">
                      Persona Keuangan
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      BUDU belum menganalisis pola belanjamu. Silakan klik tombol di bawah untuk mengetahui persona keuanganmu serta tips khusus.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleGeneratePrediction}
                  isLoading={isGenerating}
                  className="w-full"
                >
                  Analisis Persona Sekarang
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-[var(--color-teal-ink)]" />
              <h2 className="text-xl font-black text-[var(--color-text-primary)]">Langganan</h2>
            </div>
            <SettingsRow
              icon={<CreditCard className="h-5 w-5" />}
              title="BUDU Member"
              description="Status akun saat ini"
              trailing={<Badge variant="teal">Aktif</Badge>}
            />
          </Card>
        </div>
      </section>
    </div>
  );
}

