import { forwardRef } from 'react'
import { cn } from '@/utils/classNames'
import { ChevronDown } from 'lucide-react'

/**
 * Select component
 * @param {string} label
 * @param {string} error
 * @param {Array} options - [{value, label}]
 * @param {string} placeholder
 */
const Select = forwardRef(function Select(
  { label, error, helper, options = [], placeholder, className, id, required, ...props },
  ref
) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label-base">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'input-base appearance-none pr-10 cursor-pointer',
            error && 'input-error',
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
      {!error && helper && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{helper}</p>
      )}
    </div>
  )
})

export default Select
