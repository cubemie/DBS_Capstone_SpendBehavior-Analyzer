interface TopBarProps {
  title?: string;
  showMenu?: boolean;
  showBell?: boolean;
  onMenu?: () => void;
}

export default function TopBar({ title = "SpendQ", showMenu = true, showBell = true, onMenu }: TopBarProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px 12px", background: "var(--color-bg)",
    }}>
      {showMenu ? (
        <button onClick={onMenu} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M3 7H21M3 12H21M3 17H15" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      ) : <div style={{ width: 30 }} />}

      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-main)", color: "var(--color-text-primary)" }}>
        {title}
      </span>

      {showBell ? (
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, position: "relative" }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M12 3C8.13 3 5 6.13 5 10V17H19V10C19 6.13 15.87 3 12 3Z" stroke="var(--color-text-primary)" strokeWidth="1.8"/>
            <path d="M10 17V18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18V17" stroke="var(--color-text-primary)" strokeWidth="1.8"/>
            <circle cx="17" cy="6" r="3.5" fill="var(--color-salmon)" stroke="white" strokeWidth="1.5"/>
          </svg>
        </button>
      ) : <div style={{ width: 30 }} />}
    </div>
  );
}
