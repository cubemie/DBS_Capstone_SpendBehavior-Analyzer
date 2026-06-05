import { useCallback, useState, useEffect, useRef } from "react";
import {
  Camera,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import PageHeader from "../components/PageHeader";
import PredictionStatusCard from "../components/PredictionStatusCard";
import { useAuth } from "../hooks/useAuth";
import { getPersonaDescription } from "../services/predictionService";
import { analyticsService } from "../services/analyticsService";
import { authService } from "../services/authService";
import { useApi } from "../hooks/useApi";
import { usePredictionRefresh } from "../hooks/usePredictionRefresh";
import defaultAvatar from "../assets/budu-logo.png";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function Profil() {
  const { user, updateUser, uploadAvatar, setPredictionPersona } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const fetchDashboard = useCallback(() => analyticsService.getDashboard(), []);
  const {
    data: dashboard,
    isLoading: isLoadingDashboard,
    error: dashboardError,
    refetch,
  } = useApi(fetchDashboard);
  const {
    refreshAnalysis,
    goToAddTransaction,
    isRefreshing,
    refreshError,
  } = usePredictionRefresh(refetch);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setPredictionPersona(dashboard?.persona?.persona ?? null);
  }, [dashboard, setPredictionPersona]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage("");
    try {
      await updateUser({ fullName: name, phone });
      setProfileMessage("Profil berhasil diperbarui!");
    } catch {
      setProfileMessage("Gagal memperbarui profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setProfileMessage("");

    try {
      await uploadAvatar(file);
      setProfileMessage("Foto profil berhasil diperbarui!");
    } catch (err: unknown) {
      setProfileMessage(getErrorMessage(err, "Gagal mengunggah foto profil."));
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsChangingPassword(true);
    setPasswordMessage("");
    setPasswordError("");
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setPasswordMessage("Kata sandi berhasil diperbarui!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      setPasswordError(getErrorMessage(err, "Gagal memperbarui kata sandi."));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const displayName = user?.name || "Pengguna";
  const userEmail = user?.email || "";
  const avatarUrl = user?.avatarUrl || defaultAvatar;
  const persona = dashboard?.persona ?? null;
  const predictionStatus = dashboard?.predictionStatus;

  return (
    <div className="space-y-6">
      <PageHeader title="Profil Saya" description="Atur akun dan preferensimu." />

      <section className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="min-w-0 space-y-5">
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
                    {persona?.persona || "Belum ada persona"}
                  </Badge>
                </div>
                <div className="mt-4 flex justify-center sm:justify-start">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    buttonSize="sm"
                    iconLeft={<Camera className="h-4 w-4" />}
                    isLoading={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    Ganti Foto
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-6 flex items-center gap-3">
              <UserRoundCog className="h-6 w-6 text-[var(--color-teal-ink)]" />
              <h2 className="text-xl font-black text-[var(--color-text-primary)]">Pengaturan Akun</h2>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input label="Nama" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" name="email" type="email" defaultValue={userEmail} readOnly />
              <Input label="No. Telepon" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              {profileMessage && <p className="text-sm font-semibold text-[var(--color-teal-ink)]">{profileMessage}</p>}
              <Button type="submit" isLoading={isSavingProfile} fullWidth>
                Simpan Perubahan
              </Button>
            </form>
          </Card>

          <Card>
            <div className="mb-6 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[var(--color-teal-ink)]" />
              <h2 className="text-xl font-black text-[var(--color-text-primary)]">Ubah Kata Sandi</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input label="Kata Sandi Lama" name="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
              <Input label="Kata Sandi Baru" name="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              {passwordMessage && <p className="text-sm font-semibold text-[var(--color-teal-ink)]">{passwordMessage}</p>}
              {passwordError && <p className="text-sm font-semibold text-[var(--color-salmon-dark)]">{passwordError}</p>}
              <Button type="submit" isLoading={isChangingPassword} fullWidth variant="outline">
                Perbarui Sandi
              </Button>
            </form>
          </Card>
        </div>

        <aside className="min-w-0 space-y-5">
          {isLoadingDashboard ? (
            <Card className="!border-[var(--color-yellow)] !bg-[var(--color-yellow-bg)]">
              <div className="animate-pulse py-4 text-center text-sm text-[var(--color-text-secondary)]">
                Memuat analisis periode ini...
              </div>
            </Card>
          ) : dashboardError ? (
            <Card className="!border-[var(--color-salmon-light)] !bg-[var(--color-salmon-bg)]">
              <p className="text-sm font-semibold text-[var(--color-salmon-dark)]">
                {dashboardError}
              </p>
            </Card>
          ) : predictionStatus ? (
            <>
              <PredictionStatusCard
                status={predictionStatus}
                persona={persona}
                onRefresh={refreshAnalysis}
                onAddTransaction={goToAddTransaction}
                isRefreshing={isRefreshing}
                error={refreshError}
              />
              {persona && (
                <Card className="!border-[var(--color-yellow)] !bg-[var(--color-yellow-bg)]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-yellow-ink)]">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div className="space-y-2">
                      <h2 className="text-xl font-black text-[var(--color-text-primary)]">
                        Persona: {persona.persona}
                      </h2>
                      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                        {getPersonaDescription(persona.persona)}
                      </p>
                      {dashboard?.warnings && dashboard.warnings.length > 0 && (
                        <div className="mt-4 border-t border-[rgba(0,0,0,0.05)] pt-4">
                          <p className="mb-2 text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                            Tips Keuangan
                          </p>
                          <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--color-text-secondary)]">
                            {dashboard.warnings.map((warning) => (
                              <li key={warning.id}>{warning.description}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
