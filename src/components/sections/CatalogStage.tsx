'use client'

import type { KeyboardEvent, PointerEvent } from 'react'
import { useTranslations } from 'next-intl'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

import { CatalogLeaf } from '@/components/sections/CatalogLeaf'
import { MOTION_SPRINGS } from '@/declarations/ui/motion'
import { CATALOG_BOOK_STYLES } from '@/declarations/ui/variants'
import { catalogNumberOf } from '@/utils/catalog'

// Pointer tilt, degrees
const TILT_DEGREES = 7
const SHIFT_PERCENT = 25
// Leaves kept drawn on each side of the spine
const NEAR_LEAVES = 3

export interface CatalogStageProps {
  slots: Array<string | null>
  // Turned leaves count
  view: number
  // Page ratio, width over height
  ratio: number
  label: string
  onGo: (view: number) => void
}

/**
 * Bound book, leaves on a spine
 * @param {CatalogStageProps} props - Stage props
 * @return {JSX.Element} - Rendered book
 */

export const CatalogStage = ({ slots, view, ratio, label, onGo }: CatalogStageProps) => {
  const t = useTranslations('sections.catalog')
  const isStill = useReducedMotion()
  const leaves = slots.length / 2
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const tiltX = useSpring(
    useTransform(pointerY, [-1, 1], [TILT_DEGREES, -TILT_DEGREES]),
    MOTION_SPRINGS.tilt
  )
  const tiltY = useSpring(
    useTransform(pointerX, [-1, 1], [-TILT_DEGREES, TILT_DEGREES]),
    MOTION_SPRINGS.tilt
  )

  // Closed covers sit centred
  const shift = view === 0 ? -SHIFT_PERCENT : view === leaves ? SHIFT_PERCENT : 0

  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (isStill) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1)
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
  }
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') onGo(view + 1)
    if (event.key === 'ArrowLeft') onGo(view - 1)
  }

  const altOf = (slot: number) => t('pageAlt', { page: catalogNumberOf(slots, slot) })

  return (
    <div
      className={CATALOG_BOOK_STYLES.stage}
      onPointerMove={onPointer}
      onPointerLeave={() => {
        pointerX.set(0)
        pointerY.set(0)
      }}>
      <span aria-hidden="true" className={CATALOG_BOOK_STYLES.table} />
      <motion.div
        role="group"
        tabIndex={0}
        aria-roledescription={t('book')}
        aria-label={label}
        onKeyDown={onKey}
        animate={{ x: `${shift}%` }}
        transition={isStill ? { duration: 0 } : MOTION_SPRINGS.shift}
        style={{ rotateX: tiltX, rotateY: tiltY, aspectRatio: `${ratio * 2}` }}
        className={CATALOG_BOOK_STYLES.book}>
        {Array.from({ length: leaves }, (_, leaf) => {
          const isTurned = leaf < view

          return (
            <CatalogLeaf
              key={leaf}
              front={slots[leaf * 2] ?? null}
              back={slots[leaf * 2 + 1] ?? null}
              frontAlt={altOf(leaf * 2)}
              backAlt={altOf(leaf * 2 + 1)}
              isTurned={isTurned}
              isNear={leaf >= view - NEAR_LEAVES && leaf < view + NEAR_LEAVES}
              depth={isTurned ? leaf + 1 : leaves - leaf}
              liftDepth={leaves + 1}
            />
          )
        })}
        {/* Halves turn the page, none over a closed side */}
        {view > 0 && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={CATALOG_BOOK_STYLES.hitLeft}
            onClick={() => onGo(view - 1)}
          />
        )}
        {view < leaves && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={CATALOG_BOOK_STYLES.hitRight}
            onClick={() => onGo(view + 1)}
          />
        )}
      </motion.div>
    </div>
  )
}
