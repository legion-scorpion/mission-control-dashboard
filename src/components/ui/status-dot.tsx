import { cn } from '@/lib/utils'

interface StatusDotProps {
  status: 'up' | 'down' | 'warning' | 'unknown'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

const sizeMap = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
}

const colorMap = {
  up: 'bg-emerald-500',
  down: 'bg-red-500',
  warning: 'bg-amber-500',
  unknown: 'bg-zinc-500',
}

export function StatusDot({ status, size = 'md', pulse = false }: StatusDotProps) {
  return (
    <span 
      className={cn(
        'rounded-full',
        sizeMap[size],
        colorMap[status],
        pulse && 'animate-pulse'
      )} 
    />
  )
}
