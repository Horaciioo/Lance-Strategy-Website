'use client'

import { useId, useState } from 'react'
import type { MouseEvent } from 'react'
import { motion } from 'motion/react'

import { MOTION_SPRINGS } from '@/declarations/ui/motion'
import { NAVIGATION_STYLES } from '@/declarations/ui/variants'
import { Link, useRouter } from '@/i18n/routing'
import { ConfigurationService } from '@/services/ConfigurationService'
import type { Styleable } from '@/types/common'
import type { NavigationEntry } from '@/types/navigation'
import { cn } from '@/utils/classnames'

const { navigationDelayMs } = ConfigurationService.timings

export interface NavigationListProps extends Styleable {
  entries: NavigationEntry[]
}

/**
 * Navigation list
 * @param {NavigationListProps} props - Navigation list props
 * @return {JSX.Element} - Rendered list
 */

export const NavigationList = ({ entries, className }: NavigationListProps) => {
  const highlightId = useId()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  // Hover first, then the current page
  const markedId = hoveredId ?? entries.find((entry) => entry.isActive)?.id
  const router = useRouter()

  // Highlight settles before the page turns
  const navigate = (event: MouseEvent<HTMLAnchorElement>, entry: NavigationEntry) => {
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    if (isModified || event.button !== 0 || entry.isActive || entry.href.includes('#')) return
    event.preventDefault()
    setHoveredId(entry.id)
    setTimeout(() => router.push(entry.href), navigationDelayMs)
  }

  return (
    <ul onMouseLeave={() => setHoveredId(null)} className={cn(NAVIGATION_STYLES.list, className)}>
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
              NAVIGATION_STYLES.link,
              (entry.isActive || entry.id === hoveredId) && NAVIGATION_STYLES.linkActive
            )}>
            {entry.id === markedId && (
              <motion.span
                layoutId={highlightId}
                transition={MOTION_SPRINGS.snappy}
                className={NAVIGATION_STYLES.highlight}
              />
            )}
            {entry.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
