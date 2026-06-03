import { APP_NAME } from '@/utils/constants'

export default function Footer() {
  return (
    <footer className="text-center py-3 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
      © {new Date().getFullYear()} {APP_NAME} · v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
    </footer>
  )
}
