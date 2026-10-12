'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { GLOBE_PLACES, GLOBE_ROUTES } from '@/declarations/globe'
import { GLOBE_STYLES } from '@/declarations/ui/variants'
import { GlobeService } from '@/services/GlobeService'
import { ViewportService } from '@/services/ViewportService'
import type { Styleable } from '@/types/common'
import type {
  GlobeCoordinate,
  GlobeHandle,
  GlobeLabel,
  GlobePlace,
  GlobeRoute,
} from '@/types/globe'
import { cn } from '@/utils/classnames'

export interface GlobeProps extends Styleable {
  // Accessible description
  label: string
  labels: Record<string, GlobeLabel>
  places?: Record<string, GlobePlace>
  routes?: GlobeRoute[]
  // Orbit ring drawn
  hasRing?: boolean
  // Steered from the start
  initialView?: GlobeCoordinate
  // Live controls for the parent
  handleRef?: RefObject<GlobeHandle | null>
}

/**
 * Engraved interactive globe
 * @param {GlobeProps} props - Globe props
 * @return {JSX.Element} - Rendered canvas
 */

export const Globe = ({
  label,
  labels,
  places = GLOBE_PLACES,
  routes = GLOBE_ROUTES,
  hasRing = true,
  initialView,
  handleRef,
  className,
}: GlobeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const planetRef = useRef<HTMLCanvasElement>(null)
  const isStill = ViewportService.usePrefers('reducedMotion')

  // Canvas lifecycle
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const handle = GlobeService.mount({
      canvas,
      places,
      routes,
      labels,
      isStill,
      hasRing,
      initialView,
      planetCanvas: planetRef.current,
    })
    if (handleRef) handleRef.current = handle

    return () => {
      handle.stop()
      if (handleRef) handleRef.current = null
    }
  }, [places, routes, labels, isStill, hasRing, initialView, handleRef])

  return (
    <div className={cn(GLOBE_STYLES.frame, className)}>
      <canvas ref={planetRef} aria-hidden="true" className={GLOBE_STYLES.planet} />
      <canvas ref={canvasRef} role="img" aria-label={label} className={GLOBE_STYLES.canvas} />
    </div>
  )
}
