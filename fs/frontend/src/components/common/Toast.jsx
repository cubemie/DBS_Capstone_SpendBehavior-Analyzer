import { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { useNotification } from '@/hooks/useNotification'

const config = {
  success: {
    icon: CheckCircle2,
    className: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    iconClass: 'text-green-500',
    titleClass: 'text-green-800 dark:text-green-200',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    iconClass: 'text-red-500',
    titleClass: 'text-red-800 dark:text-red-200',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    iconClass: 'text-amber-500',
    titleClass: 'text-amber-800 dark:text-amber-200',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    iconClass: 'text-blue-500',
    titleClass: 'text-blue-800 dark:text-blue-200',
  },
}

function ToastItem({ notification }) {
  const { removeNotification } = useNotification()
  const cfg = config[notification.type] || config.info
  const Icon = cfg.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-md min-w-[280px] max-w-sm animate-slide-in',
        cfg.className
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', cfg.iconClass)} />
      <p className={cn('text-sm font-medium flex-1', cfg.titleClass)}>{notification.message}</p>
      <button
        onClick={() => removeNotification(notification.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-1 shrink-0"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { notifications } = useNotification()

  if (!notifications.length) return null

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notifikasi"
    >
      {notifications.map((n) => (
        <ToastItem key={n.id} notification={n} />
      ))}
    </div>
  )
}
