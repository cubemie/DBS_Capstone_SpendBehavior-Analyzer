import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Target, BarChart2,
  User, Settings, LogOut, ChevronLeft, Menu,
  ShieldCheck, Users
} from 'lucide-react'
import { cn } from '@/utils/classNames'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import Avatar from '@/components/common/Avatar'
import { APP_NAME } from '@/utils/constants'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
  { to: '/budget', icon: Target, label: 'Budget' },
  { to: '/reports', icon: BarChart2, label: 'Laporan' },
  { to: '/profile', icon: User, label: 'Profil' },
]

const adminItems = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Kelola User' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin } = useAuth()
  const { toast } = useNotification()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login')
    } catch {
      toast.error('Gagal logout, silakan coba lagi')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white dark:bg-gray-900',
        'border-r border-gray-100 dark:border-gray-800',
        'flex flex-col transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-gray-800">
        {!collapsed && (
          <span className="text-xl font-bold text-primary-600 font-display">{APP_NAME}</span>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  )
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}

          {isAdmin && (
            <>
              <li className="pt-4 pb-1">
                {!collapsed && (
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                    Admin
                  </p>
                )}
              </li>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      )
                    }
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </NavLink>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex justify-center p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  )
}
