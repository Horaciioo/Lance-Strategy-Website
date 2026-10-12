'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { STARFIELD_STYLES } from '@/declarations/ui/variants'
import { StarfieldService } from '@/services/StarfieldService'
import { ViewportService } from '@/services/ViewportService'
import type { Styleable } from '@/types/common'
import type { StarfieldHandle } from '@/types/sky'
import { cn } from '@/utils/classnames'

export interface StarfieldProps extends Styleable {
  // Scroll controls for the parent
  handleRef?: RefObject<StarfieldHandle | null>
}

/**
 * 3D starfield backdrop
 * @param {StarfieldProps} props - Starfield props
 * @return {JSX.Element} - Rendered canvas
 */

export const Starfield = ({ handleRef, className }: StarfieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isStill = ViewportService.usePrefers('reducedMotion')

  // Engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    let handle: StarfieldHandle | null = null
    let isStopped = false

    StarfieldService.mount({ canvas, isStill }).then((mounted) => {
      if (isStopped) return mounted.stop()
      handle = mounted
      if (handleRef) handleRef.current = mounted
    })

    return () => {
      isStopped = true
      handle?.stop()
      if (handleRef) handleRef.current = null
    }
  }, [isStill, handleRef])

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={cn(STARFIELD_STYLES.canvas, className)} />
  )
}
