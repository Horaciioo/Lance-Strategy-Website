'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'

import Image from 'next/image'

import { MOTION_SPRINGS } from '@/declarations/ui/motion'
import { CATALOG_BOOK_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { cn } from '@/utils/classnames'

const { wordmark } = ConfigurationService.site.logo

// Half the spread on desktop
const PAGE_SIZES = '(min-width: 1024px) 28rem, 46vw'
const TURNED_DEGREES = -180
// Gap between stacked leaves, pixels
const STACK_STEP = 2

export interface CatalogLeafProps {
  // Null is the logo page
  front: string | null
  back: string | null
  frontAlt: string
  backAlt: string
  isTurned: boolean
  // Close enough to the spread to be drawn
  isNear: boolean
  // Resting order in the stack
  depth: number
  // Offset lifting a turning leaf above the stacks
  liftDepth: number
}

interface CatalogFaceProps {
  src: string | null
  alt: string
  side: 'front' | 'back'
  shade: ReturnType<typeof useTransform<number, number>>
}

// One side of the paper
const CatalogFace = ({ src, alt, side, shade }: CatalogFaceProps) => (
  <div
    className={cn(
      CATALOG_BOOK_STYLES.face,
      side === 'front' ? CATALOG_BOOK_STYLES.front : CATALOG_BOOK_STYLES.back
    )}>
    {src ? (
      <Image
        src={src}
        alt={alt}
        fill
        loading="eager"
        sizes={PAGE_SIZES}
        className={CATALOG_BOOK_STYLES.picture}
      />
    ) : (
      <div aria-hidden="true" className={CATALOG_BOOK_STYLES.blank}>
        <Image
          src={wordmark.src}
          alt=""
          width={wordmark.width}
          height={wordmark.height}
          loading="eager"
          unoptimized
          className={CATALOG_BOOK_STYLES.blankLogo}
        />
      </div>
    )}
    <span
      className={side === 'front' ? CATALOG_BOOK_STYLES.spineRight : CATALOG_BOOK_STYLES.spineLeft}
    />
    <motion.span style={{ opacity: shade }} className={CATALOG_BOOK_STYLES.shade} />
  </div>
)

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
  isNear,
  depth,
  liftDepth,
}: CatalogLeafProps) => {
  const isStill = useReducedMotion()
  const rotate = useSpring(isTurned ? TURNED_DEGREES : 0, MOTION_SPRINGS.page)
  // Side the paper last came to rest on
  const [settled, setSettled] = useState(isTurned)
  // Shade peaks when the leaf stands up
  const frontShade = useTransform(rotate, [0, -90], [0, 0.45])
  const backShade = useTransform(rotate, [-90, TURNED_DEGREES], [0.45, 0])
  // Lifts off the spine mid turn
  const lift = useTransform(rotate, [0, -90, TURNED_DEGREES], [0, 28, 0])
  // Known in the same render as the new side, no late frame
  const isMoving = !isStill && settled !== isTurned

  // Turn towards the target side
  useEffect(() => {
    const target = isTurned ? TURNED_DEGREES : 0
    if (isStill) {
      rotate.jump(target)
      setSettled(isTurned)
    } else if (rotate.get() !== target) rotate.set(target)
  }, [isTurned, isStill, rotate])

  // Back in the stack once settled
  useEffect(() => rotate.on('animationComplete', () => setSettled(isTurned)), [rotate, isTurned])

  return (
    <div
      className={cn(
        CATALOG_BOOK_STYLES.hinge,
        !isNear && !isMoving && CATALOG_BOOK_STYLES.hingeFar
      )}
      style={{ transform: `translateZ(${(isMoving ? depth + liftDepth : depth) * STACK_STEP}px)` }}>
      <motion.div style={{ rotateY: rotate, z: lift }} className={CATALOG_BOOK_STYLES.leaf}>
        <CatalogFace src={front} alt={frontAlt} side="front" shade={frontShade} />
        <CatalogFace src={back} alt={backAlt} side="back" shade={backShade} />
      </motion.div>
    </div>
  )
}
