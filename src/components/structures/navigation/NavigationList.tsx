'use client'

import { useId, useState } from 'react'
import type { MouseEvent } from 'react'
import { motion } from 'motion/react'

import { Icon } from '@/components/elements/media/Icon'
import { MOTION_SPRINGS } from '@/declarations/ui/motion'
import { NAVIGATION_STYLES } from '@/declarations/ui/variants'
import { Link, useRouter } from '@/i18n/routing'
import { ConfigurationService } from '@/services/ConfigurationService'
import type { Direction, Styleable } from '@/types/common'
import type { NavigationEntry } from '@/types/navigation'
import { cn } from '@/utils/classnames'

const { navigationDelayMs } = ConfigurationService.timings

export interface NavigationListProps extends Styleable {
  entries: NavigationEntry[]
  direction?: Direction
  withIcons?: boolean
  onNavigate?: () => void
}

/**
 * Navigation list
 * @param {NavigationListProps} props - Navigation list props
 * @return {JSX.Element} - Rendered list
 */

export const NavigationList = ({
  entries,
  direction = 'horizontal',
  withIcons = false,
  onNavigate,
  className,
}: NavigationListProps) => {
  const isVertical = direction === 'vertical'
  const highlightId = useId()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  // Hover first, then the current page
  const markedId = hoveredId ?? entries.find((entry) => entry.isActive)?.id
  const router = useRouter()

  // Highlight settles before the page turns
  const navigate = (event: MouseEvent<HTMLAnchorElement>, entry: NavigationEntry) => {
    onNavigate?.()
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    if (isModified || event.button !== 0 || entry.isActive || entry.href.includes('#')) return
    event.preventDefault()
    setHoveredId(entry.id)
    setTimeout(() => router.push(entry.href), navigationDelayMs)
  }

  return (
    <ul
      onMouseLeave={() => setHoveredId(null)}
      className={cn(isVertical ? NAVIGATION_STYLES.mobileList : NAVIGATION_STYLES.list, className)}>
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <Link
            href={entry.href}
            onClick={(event) => navigate(event, entry)}
            onMouseEnter={() => setHoveredId(entry.id)}
            onFocus={() => setHoveredId(entry.id)}
            aria-current={entry.isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2',
              isVertical ? NAVIGATION_STYLES.mobileLink : NAVIGATION_STYLES.link,
              (entry.isActive || entry.id === hoveredId) && NAVIGATION_STYLES.linkActive
            )}>
            {!isVertical && entry.id === markedId && (
              <motion.span
                layoutId={highlightId}
                transition={MOTION_SPRINGS.snappy}
                className={NAVIGATION_STYLES.highlight}
              />
            )}
            {withIcons && entry.icon && <Icon name={entry.icon} size="sm" />}
            {entry.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
