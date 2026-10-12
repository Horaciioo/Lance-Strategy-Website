'use client'

import { useEffect } from 'react'
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'

import Image from 'next/image'

import { MOTION_SPRINGS } from '@/declarations/ui/motion'
import { CATALOG_BOOK_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Half the spread on desktop
const PAGE_SIZES = '(min-width: 1024px) 28rem, 46vw'
const TURNED_DEGREES = -180

export interface CatalogLeafProps {
  front: string
  back?: string
  frontAlt: string
  backAlt: string
  isTurned: boolean
  // Stacking order
  depth: number
  onSettled: () => void
}

/**
 * Two sided catalogue leaf, turns on the spine
 * @param {CatalogLeafProps} props - Leaf props
 * @return {JSX.Element} - Rendered leaf
 */

export const CatalogLeaf = ({
  front,
  back,
  frontAlt,
  backAlt,
  isTurned,
  depth,
  onSettled,
}: CatalogLeafProps) => {
  const isStill = useReducedMotion()
  const rotate = useSpring(isTurned ? TURNED_DEGREES : 0, MOTION_SPRINGS.page)
  // Shade peaks when the leaf stands up
  const frontShade = useTransform(rotate, [0, -90], [0, 0.45])
  const backShade = useTransform(rotate, [-90, TURNED_DEGREES], [0.45, 0])
  // Lifts off the spine mid turn
  const lift = useTransform(rotate, [0, -90, TURNED_DEGREES], [0, 28, 0])

  // Turn towards the target side
  useEffect(() => {
    const target = isTurned ? TURNED_DEGREES : 0
    if (isStill) rotate.jump(target)
    else rotate.set(target)
  }, [isTurned, isStill, rotate])

  // Report the end of a turn
  useEffect(() => rotate.on('animationComplete', onSettled), [rotate, onSettled])

  return (
    <motion.div
      style={{ rotateY: rotate, z: lift, zIndex: depth }}
      className={CATALOG_BOOK_STYLES.leaf}>
      <div className={cn(CATALOG_BOOK_STYLES.face, CATALOG_BOOK_STYLES.front)}>
        <Image
          src={front}
          alt={frontAlt}
          fill
          sizes={PAGE_SIZES}
          className={CATALOG_BOOK_STYLES.picture}
        />
        <span className={CATALOG_BOOK_STYLES.spineRight} />
        <motion.span style={{ opacity: frontShade }} className={CATALOG_BOOK_STYLES.shade} />
      </div>
      <div className={cn(CATALOG_BOOK_STYLES.face, CATALOG_BOOK_STYLES.back)}>
        {back && (
          <Image
            src={back}
            alt={backAlt}
            fill
            sizes={PAGE_SIZES}
            className={CATALOG_BOOK_STYLES.picture}
          />
        )}
        <span className={CATALOG_BOOK_STYLES.spineLeft} />
        <motion.span style={{ opacity: backShade }} className={CATALOG_BOOK_STYLES.shade} />
      </div>
    </motion.div>
  )
}
