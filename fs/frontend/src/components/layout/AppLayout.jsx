import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ToastContainer from '@/components/common/Toast'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <Topbar collapsed={collapsed} />

        <main className="flex-1 pt-16">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}
