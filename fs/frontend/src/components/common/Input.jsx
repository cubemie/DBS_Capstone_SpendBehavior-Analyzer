import { forwardRef } from 'react'
import { cn } from '@/utils/classNames'

/**
 * Input component
 * @param {string} label
 * @param {string} error - error message
 * @param {string} helper - helper text
 * @param {ReactNode} prefix - prefix icon/element
 * @param {ReactNode} suffix - suffix icon/element
 */
const Input = forwardRef(function Input(
  { label, error, helper, prefix, suffix, className, id, required, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-base">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'input-base',
            prefix && 'pl-10',
            suffix && 'pr-10',
            error && 'input-error',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 text-gray-400 dark:text-gray-500">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {helper}
        </p>
      )}
    </div>
  )
})

export default Input
