import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Moon, Sun, Search, X } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useClickOutside } from '@/hooks/useClickOutside'
import Avatar from '@/components/common/Avatar'

export default function Topbar({ collapsed }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setDropdownOpen(false))

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 z-20 flex items-center px-4 gap-3 transition-all duration-300"
      style={{ left: sidebarWidth }}
    >
      {/* Search bar */}
      <div className={cn('flex-1 max-w-xs transition-all', searchOpen ? 'block' : 'hidden sm:block')}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Cari transaksi..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Mobile search toggle */}
      <button
        className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setSearchOpen(!searchOpen)}
      >
        {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      </button>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
              {user?.name}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-modal animate-slide-in">
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Profil Saya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
