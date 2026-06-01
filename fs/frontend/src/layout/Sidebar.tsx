import { HelpCircle, LogOut, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigationItems } from "../services/mockData";
import { cn } from "../utils/cn";

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh border-r border-[var(--color-border)] bg-white/70 px-3 py-6 backdrop-blur md:flex md:flex-col xl:px-5">
      <NavLink to="/dashboard" className="flex items-center justify-center gap-3 px-2 xl:justify-start">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-yellow)] text-[var(--color-text-primary)]">
          <Sparkles className="h-6 w-6" />
        </span>
        <div className="hidden xl:block">
          <p className="text-2xl font-black tracking-tight text-[var(--color-brand)]">BUDU</p>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">Your financial pal</p>
        </div>
      </NavLink>

      <nav className="mt-9 flex flex-1 flex-col gap-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[var(--color-text-secondary)] transition",
                  "md:justify-center md:px-3 xl:justify-start xl:px-4",
                  isActive && "bg-[var(--color-teal)] text-[var(--color-teal-ink)] shadow-[inset_4px_0_0_var(--color-teal-dark)]",
                  !isActive && "hover:bg-[var(--color-soft)] hover:text-[var(--color-text-primary)]",
                  item.isAction && !isActive && "text-[var(--color-salmon-dark)]",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden truncate xl:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-3">
        <div className="hidden rounded-3xl bg-[var(--color-soft)] p-4 xl:block">
          <p className="text-sm font-black text-[var(--color-text-primary)]">Butuh arahan?</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
            Tanya Quokka untuk membaca kebiasaan belanjamu minggu ini.
          </p>
          <NavLink
            to="/analisis"
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-2xl bg-[var(--color-salmon)] px-4 text-sm font-bold text-white"
          >
            Tanya Quokka
          </NavLink>
        </div>
        <NavLink
          to="/profil"
          className="flex items-center justify-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-soft)] xl:justify-start xl:px-4"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="hidden xl:inline">Help Center</span>
        </NavLink>
        <NavLink
          to="/"
          className="flex items-center justify-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-soft)] xl:justify-start xl:px-4"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden xl:inline">Keluar</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
