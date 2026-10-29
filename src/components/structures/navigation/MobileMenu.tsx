'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { Icon } from '@/components/elements/media/Icon'
import { MOTION_EASINGS, MOTION_SPRINGS } from '@/declarations/ui/motion'
import { MOBILE_MENU_STYLES } from '@/declarations/ui/variants'
import { Link } from '@/i18n/routing'
import { NavigationService } from '@/services/NavigationService'
import { Overlay } from '@/structures/Overlay'
import type { NavigationEntry } from '@/types/navigation'
import { cn } from '@/utils/classnames'

// Panel grows from the toggle, top right
const CLOSED_CLIP = 'circle(0% at calc(100% - 2.25rem) 2.5rem)'
const OPEN_CLIP = 'circle(150% at calc(100% - 2.25rem) 2.5rem)'
// Reveal length, seconds
const REVEAL_S = 0.55
// Links follow the reveal, one after the other
const LINK_DELAY_S = 0.12
const LINK_STAGGER_S = 0.05

export interface MenuToggleProps {
  isOpen: boolean
  // Controlled panel
  controls: string
  label: string
  onToggle: () => void
  toggleRef: RefObject<HTMLButtonElement | null>
}

/**
 * Menu toggle, three bars folding into a cross
 * @param {MenuToggleProps} props - Toggle props
 * @return {JSX.Element} - Rendered button
 */

export const MenuToggle = ({ isOpen, controls, label, onToggle, toggleRef }: MenuToggleProps) => (
  <button
    ref={toggleRef}
    type="button"
    aria-label={label}
    aria-expanded={isOpen}
    aria-controls={controls}
    onClick={onToggle}
    className={MOBILE_MENU_STYLES.toggle}>
    <span aria-hidden="true" className={MOBILE_MENU_STYLES.bars}>
      <span className={cn(MOBILE_MENU_STYLES.bar, MOBILE_MENU_STYLES.barTop)} />
      <span className={cn(MOBILE_MENU_STYLES.bar, MOBILE_MENU_STYLES.barMiddle)} />
      <span className={cn(MOBILE_MENU_STYLES.bar, MOBILE_MENU_STYLES.barBottom)} />
    </span>
  </button>
)

export interface MobileMenuProps {
  id: string
  entries: NavigationEntry[]
  isOpen: boolean
  onClose: () => void
  // Focus goes back there on close
  toggleRef: RefObject<HTMLButtonElement | null>
}

/**
 * Phone navigation, a night panel growing from the toggle
 * @param {MobileMenuProps} props - Menu props
 * @return {JSX.Element} - Rendered panel
 */

export const MobileMenu = ({ id, entries, isOpen, onClose, toggleRef }: MobileMenuProps) => {
  const navigation = useTranslations('navigation')
  const actions = useTranslations('actions')
  const isStill = useReducedMotion()
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const route = NavigationService.callToActionRoute()

  // Escape and scroll lock, focus in then back on the toggle
  useEffect(() => {
    if (!isOpen) return undefined
    const toggle = toggleRef.current
    const release = new Overlay(onClose).open()
    firstLinkRef.current?.focus({ preventScroll: true })

    return () => {
      release()
      toggle?.focus({ preventScroll: true })
    }
  }, [isOpen, onClose, toggleRef])

  // One entry rising after the other
  const riseOf = (index: number) =>
    isStill
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 12 },
          transition: { ...MOTION_SPRINGS.soft, delay: LINK_DELAY_S + index * LINK_STAGGER_S },
        }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          id={id}
          data-scheme="dark"
          aria-label={navigation('primary')}
          className={MOBILE_MENU_STYLES.panel}
          initial={isStill ? { opacity: 0 } : { clipPath: CLOSED_CLIP }}
          animate={isStill ? { opacity: 1 } : { clipPath: OPEN_CLIP }}
          exit={isStill ? { opacity: 0 } : { clipPath: CLOSED_CLIP }}
          transition={{ duration: REVEAL_S, ease: MOTION_EASINGS.inOut }}>
          <ul className={MOBILE_MENU_STYLES.list}>
            {entries.map((entry, index) => (
              <motion.li key={entry.id} className={MOBILE_MENU_STYLES.item} {...riseOf(index)}>
                <Link
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={entry.href}
                  onClick={onClose}
                  aria-current={entry.isActive ? 'page' : undefined}
                  className={cn(
                    MOBILE_MENU_STYLES.link,
                    entry.isActive && MOBILE_MENU_STYLES.linkActive
                  )}>
                  {entry.icon && (
                    <span className={MOBILE_MENU_STYLES.chip}>
                      <Icon name={entry.icon} />
                    </span>
                  )}
                  <span className={MOBILE_MENU_STYLES.label}>{entry.label}</span>
                  <Icon name="arrowRight" className={MOBILE_MENU_STYLES.arrow} />
                </Link>
              </motion.li>
            ))}
          </ul>

          <motion.div className={MOBILE_MENU_STYLES.footer} {...riseOf(entries.length)}>
            <ActionLink route={route} size="lg" fullWidth icon="arrowRight" iconPosition="right">
              {actions(NavigationService.ctaActionOf(route))}
            </ActionLink>
          </motion.div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
