'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

// Share on screen before building
const BUILD_THRESHOLD = 0.2

export interface GroupBuildProps {
  className: string
  style?: CSSProperties
  // Rebuilds when a link to this anchor is followed
  replayAnchor?: string
  children: ReactNode
}

/**
 * Builds its pieces once on screen
 * @param {GroupBuildProps} props - Build props
 * @return {JSX.Element} - Rendered stage
 */

export const GroupBuild = ({ className, style, replayAnchor, children }: GroupBuildProps) => {
  const stageRef = useRef<HTMLDivElement>(null)
  const [isArmed, setIsArmed] = useState(false)
  const [isBuilt, setIsBuilt] = useState(false)
  const [round, setRound] = useState(0)

  // Hide again, built anew on arrival
  useEffect(() => {
    if (!replayAnchor) return undefined
    const replay = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a[href]')
      if (!link?.getAttribute('href')?.endsWith(`#${replayAnchor}`)) return
      setIsBuilt(false)
      setRound((current) => current + 1)
    }
    document.addEventListener('click', replay)

    return () => document.removeEventListener('click', replay)
  }, [replayAnchor])

  // Hidden only once script runs
  useEffect(() => {
    const target = stageRef.current
    if (!target) return undefined
    setIsArmed(true)
    const watching = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setIsBuilt(true)
        watching.disconnect()
      },
      { threshold: BUILD_THRESHOLD }
    )
    watching.observe(target)

    return () => watching.disconnect()
  }, [round])

  return (
    <div
      ref={stageRef}
      data-armed={isArmed || undefined}
      data-built={isBuilt || undefined}
      className={className}
      style={style}>
      {children}
    </div>
  )
}
