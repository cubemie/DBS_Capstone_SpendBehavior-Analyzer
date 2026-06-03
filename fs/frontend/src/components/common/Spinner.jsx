import { cn } from '@/utils/classNames'

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
  xl: 'w-14 h-14 border-4',
}

export default function Spinner({ size = 'md', className }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full border-gray-200 border-t-primary-500 animate-spin',
        sizes[size],
        className
      )}
    />
  )
}
