import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/classNames'

/**
 * Pagination component
 * @param {number} page - current page (1-based)
 * @param {number} totalPages
 * @param {number} total - total items
 * @param {number} limit - items per page
 * @param {function} onPageChange
 */
export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (totalPages <= 1) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  // Generate page numbers with ellipsis
  const getPages = () => {
    const delta = 2
    const pages = []
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      pages.push(i)
    }
    if (pages[0] > 1) {
      if (pages[0] > 2) pages.unshift('...')
      pages.unshift(1)
    }
    if (pages[pages.length - 1] < totalPages) {
      if (pages[pages.length - 1] < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-between gap-4 mt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
        {from}–{to} dari {total} data
      </p>
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400',
            'hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
          )}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors',
                p === page
                  ? 'bg-primary-500 text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400',
            'hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
          )}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
