import { Outlet } from 'react-router-dom'
import { APP_NAME } from '@/utils/constants'
import ToastContainer from '@/components/common/Toast'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-primary-600 font-display tracking-tight">
              {APP_NAME}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Spend Behavior Analytics
            </p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-modal border border-gray-100 dark:border-gray-800 p-8">
            <Outlet />
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>

      <ToastContainer />
    </div>
  )
}
