import { NavLink } from "react-router-dom";
import { navigationItems } from "../utils/navigation";
import { cn } from "../utils/cn";

function BottomNav() {
  const mobilePaths = ["/dashboard", "/analisis", "/tambah", "/peringatan", "/profil"];
  const mobileItems = navigationItems.filter((item) => mobilePaths.includes(item.path));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(77,62,38,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] font-bold text-[var(--color-text-muted)] transition",
                  isActive && !item.isAction && "bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)]",
                  item.isAction && "-mt-6",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-2xl",
                      item.isAction
                        ? "h-14 w-14 bg-[var(--color-salmon)] text-white shadow-[0_12px_24px_rgba(242,140,106,0.35)]"
                        : "h-8 w-8",
                      isActive && !item.isAction && "text-[var(--color-teal-ink)]",
                    )}
                  >
                    <Icon className={cn(item.isAction ? "h-7 w-7" : "h-5 w-5")} />
                  </span>
                  {!item.isAction ? <span>{item.shortLabel}</span> : <span className="sr-only">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
