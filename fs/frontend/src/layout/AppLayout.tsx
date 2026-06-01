import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

function AppLayout() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] md:grid md:grid-cols-[88px_minmax(0,1fr)] xl:grid-cols-[288px_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6 md:px-8 md:pb-12 md:pt-7 lg:px-10">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

export default AppLayout;
