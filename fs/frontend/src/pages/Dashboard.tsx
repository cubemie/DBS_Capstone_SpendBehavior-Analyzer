import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import quokkaImg from "../assets/quokka-dashboard.png";
import { useNavigate } from "react-router-dom";
import { Cake, Tv, DollarSign, Plus, RefreshCw } from "lucide-react";

const recentActivity = [
  { Icon: Cake, name: "Sweet Tooth Bakery", time: "Today, 09:41 AM", amount: -12.50, currency: "USD" },
  { Icon: Tv, name: "StreamFlix Subs", time: "Yesterday", amount: -15.99, currency: "USD" },
  { Icon: DollarSign, name: "Salary Deposit", time: "July 15", amount: 3240.00, currency: "USD" },
];

const budgets = [
  { label: "Food & Dining", used: 450, total: 600, color: "#8BDFDD" },
  { label: "Shopping", used: 320, total: 300, color: "#F28C6A", over: true },
  { label: "Transport", used: 80, total: 150, color: "#FFE394" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekSpend = [40, 65, 30, 80, 55, 90, 70];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <TopBar title="SpendQ" />
      <div className="page-content" style={{ padding: "0 16px 90px" }}>

        {/* YOUR VIBE Card */}
        <div className="card" style={{ marginBottom: 12, overflow: "hidden", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 4px" }}>YOUR VIBE</p>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", lineHeight: 1.2 }}>Rational Spender</h2>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px", lineHeight: 1.5 }}>
                You're making solid choices this week. Keep that logical energy flowing!
              </p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "var(--color-teal-bg)", borderRadius: 100,
                padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "var(--color-teal-dark)",
              }}>
                <span style={{ fontSize: 12 }}>🏆</span> Top 15% Savers
              </div>
            </div>
            <img src={quokkaImg} alt="Quokka" style={{
              width: 80, height: 80, objectFit: "cover", objectPosition: "top",
              borderRadius: "50%", marginLeft: 12, flexShrink: 0,
            }} />
          </div>
        </div>

        {/* Spending Rhythm Chart */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>SPENDING RHYTHM</p>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width="18" height="4" fill="none" viewBox="0 0 18 4">
                <circle cx="2" cy="2" r="2" fill="#9E9B95"/>
                <circle cx="9" cy="2" r="2" fill="#9E9B95"/>
                <circle cx="16" cy="2" r="2" fill="#9E9B95"/>
              </svg>
            </button>
          </div>
          {/* Mini bar chart */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, padding: "0 4px" }}>
            {weekDays.map((day, i) => (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%", borderRadius: 6,
                  background: day === "Sat" || day === "Sun" ? "var(--color-salmon)" : "var(--color-teal)",
                  height: `${(weekSpend[i] / 90) * 52}px`,
                  opacity: day === "Sat" || day === "Sun" ? 1 : 0.7,
                }} />
                <span style={{
                  fontSize: 10, fontWeight: day === "Sat" || day === "Sun" ? 700 : 400,
                  color: day === "Sat" || day === "Sun" ? "var(--color-salmon)" : "var(--color-text-muted)",
                }}>{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Recent Activity</h3>
            <button onClick={() => navigate("/riwayat")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-teal-dark)", fontWeight: 600, fontFamily: "var(--font-main)" }}>
              View all
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {recentActivity.map((tx, i) => {
              const IconComponent = tx.Icon;
              return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 14, background: "var(--color-bg)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>
                  <IconComponent size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{tx.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{tx.time}</p>
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: tx.amount > 0 ? "var(--color-green)" : "var(--color-text-primary)",
                }}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                </span>
              </div>
            );
            })}
          </div>
        </div>

        {/* Monthly Budget */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Monthly Budget</h3>
            <div style={{
              background: "var(--color-bg)", borderRadius: 100, padding: "4px 12px",
              fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)",
            }}>July</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {budgets.map((b, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    {b.label}
                    {b.over && <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.56 19C1.57 19.72 2 20.37 2.66 20.72C2.99 20.9 3.36 21 3.74 21H20.26C20.64 21 21.01 20.9 21.34 20.72C22 20.37 22.43 19.72 22.44 19C22.45 18.65 22.36 18.3 22.18 18L13.71 3.86C13.34 3.24 12.7 2.86 12 2.86C11.3 2.86 10.66 3.24 10.29 3.86Z" stroke="var(--color-salmon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: b.over ? "var(--color-salmon)" : "var(--color-text-secondary)",
                  }}>
                    ${b.used} / ${b.total}
                  </span>
                </div>
                <div style={{ height: 7, background: "#F0EDE8", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 100,
                    background: b.color,
                    width: `${Math.min((b.used / b.total) * 100, 100)}%`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 10px" }}>QUICK ACTIONS</p>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { Icon: Plus, label: "Add Entry" },
              { Icon: RefreshCw, label: "Transfer" },
            ].map((action) => {
              const IconComp = action.Icon;
              return (
              <button key={action.label} style={{
                flex: 1, background: "white", borderRadius: 18, border: "none", cursor: "pointer",
                padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                fontFamily: "var(--font-main)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <IconComp size={22} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{action.label}</span>
              </button>
            );
            })}
          </div>
        </div>

        {/* Impulse Alert */}
        <div style={{
          background: "#FFF3EE", border: "1.5px solid #FDDDD4", borderRadius: 18, padding: "16px 18px",
          display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", background: "var(--color-salmon-light)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M12 3C8.13 3 5 6.13 5 10V17H19V10C19 6.13 15.87 3 12 3Z" stroke="var(--color-salmon)" strokeWidth="1.8"/>
              <path d="M10 17V18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18V17" stroke="var(--color-salmon)" strokeWidth="1.8"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Impulse Alert</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
              You've spent 40% more on 'Coffee' this week compared to last. Consider brewing at home tomorrow?
            </p>
          </div>
        </div>

        {/* Leak Detected Banner */}
        <div style={{
          background: "var(--color-teal)", borderRadius: 20, padding: "20px",
          marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--color-text-primary)" }}>Leak Detected</h3>
            <span style={{
              fontSize: 12, fontWeight: 700, background: "rgba(0,0,0,0.1)",
              borderRadius: 100, padding: "3px 10px", color: "var(--color-text-primary)",
            }}>~$40/mo</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 16px" }}>
            Unused gym subscription identified.
          </p>
          <button style={{
            width: "100%", background: "white", border: "none", borderRadius: 12,
            padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            color: "var(--color-teal-dark)", fontFamily: "var(--font-main)",
          }}>
            Review Subs
          </button>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
