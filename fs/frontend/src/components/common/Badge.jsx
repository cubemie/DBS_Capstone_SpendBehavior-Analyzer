import { cn } from '@/utils/classNames'

const colorMap = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

/**
 * Badge component
 * @param {string} color - green | red | yellow | blue | purple | gray | teal
 * @param {string} size - sm | md | lg
 * @param {boolean} dot - show dot indicator
 */
export default function Badge({ children, color = 'gray', size = 'md', dot = false, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        colorMap[color],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full bg-current')} aria-hidden="true" />
      )}
      {children}
    </span>
  )
}
