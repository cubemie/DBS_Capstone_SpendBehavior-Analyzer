import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/classNames'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-4xl',
}

/**
 * Modal component
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title
 * @param {string} size - sm | md | lg | xl | 2xl | full
 * @param {boolean} hideClose
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideClose = false,
  className,
}) {
  const dialogRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full bg-white dark:bg-gray-900 rounded-2xl shadow-modal',
          'animate-slide-in',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white font-display">
                {title}
              </h2>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
