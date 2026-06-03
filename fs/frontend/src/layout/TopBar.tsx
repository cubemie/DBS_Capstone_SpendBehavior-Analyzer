import { Bell, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import defaultAvatar from "../assets/budu-logo.png";

function TopBar() {
  const { user } = useAuth();

  const displayName = user?.name ? user.name.split(" ")[0] : "Pengguna";
  const avatarUrl = user?.avatarUrl || defaultAvatar;

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20 md:px-8 lg:px-10">
        <p className="text-lg font-black tracking-tight text-[var(--color-brand)] md:hidden">BUDU</p>

        <div className="hidden min-w-[260px] max-w-md flex-1 items-center rounded-full border border-[var(--color-border)] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(77,62,38,0.05)] lg:flex">
          <Search className="mr-3 h-5 w-5 text-[var(--color-text-muted)]" />
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Cari transaksi...</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:ml-auto">
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] transition hover:bg-[var(--color-soft)]"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--color-salmon)]" />
          </button>
          <div className="flex items-center gap-3 sm:border-l sm:border-[var(--color-border)] sm:pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-[var(--color-text-primary)]">{displayName}</p>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                {user?.persona || "Rational Spender"}
              </p>
            </div>
            <img
              src={avatarUrl}
              alt={user?.name || "User Avatar"}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
