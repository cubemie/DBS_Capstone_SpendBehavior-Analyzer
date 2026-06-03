import { LogOut } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { navigationItems } from "../utils/navigation";
import { cn } from "../utils/cn";

import buduLogo from "../assets/budu-logo.png";

// ... inside the component
function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh border-r border-[var(--color-border)] bg-white/70 px-3 py-6 backdrop-blur md:flex md:flex-col xl:px-5">
      <Link to="/dashboard" className="flex items-center justify-center gap-3 px-2 xl:justify-start">
        <img src={buduLogo} alt="BUDU Logo" className="h-12 w-12 object-contain" />
        <div className="hidden xl:block">
          <p className="text-2xl font-black tracking-tight text-[var(--color-brand)]">BUDU</p>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">Butuh Duit</p>
        </div>
      </Link>

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

      <NavLink
        to="/"
        className="flex items-center justify-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-soft)] xl:justify-start xl:px-4"
      >
        <LogOut className="h-5 w-5" />
        <span className="hidden xl:inline">Keluar</span>
      </NavLink>
    </aside>
  );
}

export default Sidebar;
