import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility untuk merge Tailwind classes dengan clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
