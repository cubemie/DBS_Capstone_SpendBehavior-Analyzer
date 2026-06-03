import { cn } from '@/utils/classNames'

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

const colors = [
  'bg-red-100 text-red-600',
  'bg-orange-100 text-orange-600',
  'bg-amber-100 text-amber-600',
  'bg-green-100 text-green-600',
  'bg-teal-100 text-teal-600',
  'bg-blue-100 text-blue-600',
  'bg-indigo-100 text-indigo-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
]

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function getColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Avatar component
 * @param {string} src - image URL
 * @param {string} name - user name (for initials fallback)
 * @param {string} size - xs | sm | md | lg | xl
 */
export default function Avatar({ src, name, size = 'md', className }) {
  const initials = getInitials(name)
  const colorClass = getColor(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0 font-display',
        sizes[size],
        colorClass,
        className
      )}
      aria-label={name}
    >
      {initials || '?'}
    </div>
  )
}
