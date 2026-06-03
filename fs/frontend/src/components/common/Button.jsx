import { cn } from '@/utils/classNames'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white focus:ring-primary-500',
  secondary:
    'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:ring-gray-300',
  ghost:
    'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-300',
  danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white focus:ring-red-500',
  'danger-ghost':
    'bg-transparent hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 focus:ring-red-300',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

/**
 * Button component
 * @param {string} variant - primary | secondary | ghost | danger | danger-ghost
 * @param {string} size - sm | md | lg
 * @param {boolean} loading - show spinner
 * @param {boolean} fullWidth - w-full
 * @param {ReactNode} icon - icon element
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  className,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className="border-current border-t-transparent" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  )
}
