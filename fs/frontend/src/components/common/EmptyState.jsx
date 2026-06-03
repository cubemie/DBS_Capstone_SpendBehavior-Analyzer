import { cn } from '@/utils/classNames'

/**
 * EmptyState component
 * @param {ReactNode} icon - Lucide icon component
 * @param {string} title
 * @param {string} description
 * @param {ReactNode} action - CTA button or element
 */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      {Icon && (
        <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
          <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
