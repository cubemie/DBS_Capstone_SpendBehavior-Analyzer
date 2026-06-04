import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import defaultAvatar from "../assets/budu-logo.png";

function TopBar() {
  const { user, predictionPersona } = useAuth();
  const navigate = useNavigate();
  const [transactionSearch, setTransactionSearch] = useState("");

  const displayName = user?.name ? user.name.split(" ")[0] : "Pengguna";
  const avatarUrl = user?.avatarUrl || defaultAvatar;
  const personaLabel = predictionPersona ?? "Belum ada persona";

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = transactionSearch.trim();
    if (!query) {
      navigate("/riwayat");
      return;
    }

    const params = new URLSearchParams({ search: query });
    navigate(`/riwayat?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20 md:px-8 lg:px-10">
        <p className="text-lg font-black tracking-tight text-[var(--color-brand)] md:hidden">BUDU</p>

        <form
          className="hidden min-w-[260px] max-w-md flex-1 items-center rounded-full border border-[var(--color-border)] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(77,62,38,0.05)] transition focus-within:border-[var(--color-teal-dark)] focus-within:ring-4 focus-within:ring-[var(--color-teal-bg)] lg:flex"
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <Search className="mr-3 h-5 w-5 text-[var(--color-text-muted)]" />
          <input
            value={transactionSearch}
            onChange={(event) => setTransactionSearch(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            placeholder="Cari transaksi..."
            aria-label="Cari transaksi"
          />
        </form>

        <div className="flex items-center gap-2 sm:gap-3 md:ml-auto">
          <button
            type="button"
            aria-label="Buka peringatan"
            onClick={() => navigate("/peringatan")}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] transition hover:bg-[var(--color-soft)]"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 sm:border-l sm:border-[var(--color-border)] sm:pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-[var(--color-text-primary)]">{displayName}</p>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                {personaLabel}
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
