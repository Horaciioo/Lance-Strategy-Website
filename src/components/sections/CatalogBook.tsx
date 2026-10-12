'use client'

import { useCallback, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { useTranslations } from 'next-intl'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

import { IconButton } from '@/components/elements/actions/IconButton'
import { CatalogLeaf } from '@/components/sections/CatalogLeaf'
import { MOTION_SPRINGS } from '@/declarations/ui/motion'
import { CATALOG_BOOK_STYLES } from '@/declarations/ui/variants'
import type { CatalogBook as CatalogBookData } from '@/types/content'
import { cn } from '@/utils/classnames'

// Pointer tilt, degrees
const TILT_DEGREES = 7
const SHIFT_PERCENT = 25

export interface CatalogBookProps {
  book: CatalogBookData
}

/**
 * Flippable catalogue, two pages per spread
 * @param {CatalogBookProps} props - Book props
 * @return {JSX.Element} - Rendered book
 */

export const CatalogBook = ({ book }: CatalogBookProps) => {
  const t = useTranslations('sections.catalog')
  const isStill = useReducedMotion()
  const leaves = Math.ceil(book.pages.length / 2)
  // Turned leaves count
  const [view, setView] = useState(0)
  const [turning, setTurning] = useState<number | null>(null)
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

  const go = useCallback(
    (next: number) => {
      const target = Math.max(0, Math.min(leaves, next))
      if (target === view) return
      setTurning(target > view ? view : target)
      setView(target)
    },
    [leaves, view]
  )
  const settle = useCallback(() => setTurning(null), [])

  // Closed covers sit centred
  const shift = view === 0 ? -SHIFT_PERCENT : view === leaves ? SHIFT_PERCENT : 0
  const visible = [view * 2, view * 2 + 1].filter((page) => page >= 1 && page <= book.pages.length)
  const activeChapter = [...book.chapters]
    .reverse()
    .find((chapter) => chapter.page <= (visible.at(-1) ?? 1))

  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (isStill) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1)
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
  }
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') go(view + 1)
    if (event.key === 'ArrowLeft') go(view - 1)
  }

  return (
    <div className={CATALOG_BOOK_STYLES.layout}>
      <ol className={CATALOG_BOOK_STYLES.chapters}>
        {book.chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <button
              type="button"
              aria-current={chapter.id === activeChapter?.id || undefined}
              onClick={() => go(Math.floor(chapter.page / 2))}
              className={cn(
                CATALOG_BOOK_STYLES.chapter,
                chapter.id === activeChapter?.id && CATALOG_BOOK_STYLES.chapterActive
              )}>
              <span className={CATALOG_BOOK_STYLES.chapterIndex}>
                {String(index + 1).padStart(2, '0')}
              </span>
              {t(`chapters.${chapter.id}`)}
            </button>
          </li>
        ))}
      </ol>

      <div
        className={CATALOG_BOOK_STYLES.stage}
        onPointerMove={onPointer}
        onPointerLeave={() => {
          pointerX.set(0)
          pointerY.set(0)
        }}>
        <motion.div
          role="group"
          tabIndex={0}
          aria-roledescription={t('book')}
          aria-label={t('pageOf', { page: visible[0] ?? 1, total: book.pages.length })}
          onKeyDown={onKey}
          animate={{ x: `${shift}%` }}
          transition={isStill ? { duration: 0 } : MOTION_SPRINGS.shift}
          style={{
            rotateX: tiltX,
            rotateY: tiltY,
            aspectRatio: `${book.width * 2} / ${book.height}`,
          }}
          className={CATALOG_BOOK_STYLES.book}>
          {Array.from({ length: leaves }, (_, leaf) => {
            const isTurned = leaf < view
            const front = leaf * 2

            return (
              <CatalogLeaf
                key={book.pages[front]}
                front={book.pages[front] ?? ''}
                back={book.pages[front + 1]}
                frontAlt={t('pageAlt', { page: front + 1 })}
                backAlt={t('pageAlt', { page: front + 2 })}
                isTurned={isTurned}
                depth={leaf === turning ? leaves + 1 : isTurned ? leaf + 1 : leaves - leaf}
                onSettled={settle}
              />
            )
          })}
          {/* Halves turn the page */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={CATALOG_BOOK_STYLES.hitLeft}
            onClick={() => go(view - 1)}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={CATALOG_BOOK_STYLES.hitRight}
            onClick={() => go(view + 1)}
          />
        </motion.div>
      </div>

      <div className={CATALOG_BOOK_STYLES.controls}>
        <IconButton
          icon="chevronLeft"
          label={t('previous')}
          variant="onMediaOutline"
          disabled={view === 0}
          onClick={() => go(view - 1)}
        />
        <p aria-live="polite" className={CATALOG_BOOK_STYLES.counter}>
          {t('pageOf', { page: visible[0] ?? 1, total: book.pages.length })}
        </p>
        <IconButton
          icon="chevronRight"
          label={t('next')}
          variant="onMediaOutline"
          disabled={view === leaves}
          onClick={() => go(view + 1)}
        />
      </div>
    </div>
  )
}
