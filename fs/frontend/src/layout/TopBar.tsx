import { Bell, HelpCircle, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { currentUser, navigationItems } from "../services/mockData";
import { cn } from "../utils/cn";

function TopBar() {
  const { pathname } = useLocation();
  const activeItem = navigationItems.find((item) => item.path === pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20 md:px-8 lg:px-10">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)] md:hidden">
            SpendQ
          </p>
          <p className="truncate text-lg font-black text-[var(--color-text-primary)] md:text-xl">
            {activeItem?.label ?? "SpendQ"}
          </p>
        </div>

        <div className="hidden min-w-[280px] max-w-md flex-1 items-center rounded-full border border-[var(--color-border)] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(77,62,38,0.05)] lg:flex">
          <Search className="mr-3 h-5 w-5 text-[var(--color-text-muted)]" />
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Cari transaksi atau insight...</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {[Bell, HelpCircle].map((Icon, index) => (
            <button
              key={index}
              type="button"
              aria-label={index === 0 ? "Notifikasi" : "Bantuan"}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] transition hover:bg-[var(--color-soft)]"
            >
              <Icon className="h-5 w-5" />
              {index === 0 ? (
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--color-salmon)]" />
              ) : null}
            </button>
          ))}
          <div className="hidden items-center gap-3 border-l border-[var(--color-border)] pl-4 sm:flex">
            <div className="text-right">
              <p className="text-sm font-black text-[var(--color-text-primary)]">{currentUser.name.split(" ")[0]}</p>
              <p className="flex items-center justify-end gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal-dark)]" />
                Optimis
              </p>
            </div>
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className={cn("h-10 w-10 rounded-full object-cover ring-2 ring-white")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
