import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  {
    path: "/dashboard",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
          fill={active ? "var(--color-salmon)" : "none"}
          stroke={active ? "var(--color-salmon)" : "var(--color-text-muted)"}
          strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: "/analisis",
    label: "Insights",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M4 20L8 14L12 16L16 9L20 12" stroke={active ? "var(--color-teal-dark)" : "var(--color-text-muted)"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: "/tambah",
    label: "Add",
    icon: (_active: boolean) => (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
        <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    isAdd: true,
  },
  {
    path: "/peringatan",
    label: "Alerts",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M12 3C8.13 3 5 6.13 5 10V17H19V10C19 6.13 15.87 3 12 3Z" stroke={active ? "var(--color-salmon)" : "var(--color-text-muted)"} strokeWidth="2"/>
        <path d="M10 17V18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18V17" stroke={active ? "var(--color-salmon)" : "var(--color-text-muted)"} strokeWidth="2"/>
      </svg>
    ),
  },
  {
    path: "/profil",
    label: "Profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" stroke={active ? "var(--color-salmon)" : "var(--color-text-muted)"} strokeWidth="2"/>
        <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke={active ? "var(--color-salmon)" : "var(--color-text-muted)"} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 4px 10px" }}>
        {navItems.map((item) => {
          const active = pathname === item.path;
          if (item.isAdd) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "var(--color-salmon)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(242,140,106,0.5)",
                  marginTop: -18,
                }}
              >
                {item.icon(active)}
              </button>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 2, background: "none", border: "none", cursor: "pointer",
                padding: "4px 10px", minWidth: 52,
              }}
            >
              {item.icon(active)}
              <span style={{
                fontSize: 10, fontFamily: "var(--font-main)",
                color: active ? "var(--color-salmon)" : "var(--color-text-muted)",
                fontWeight: active ? 600 : 400,
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
