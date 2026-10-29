'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Globe } from '@/components/elements/media/Globe'
import { PlaneGlyph } from '@/components/elements/media/PlaneGlyph'
import { Starfield } from '@/components/elements/media/Starfield'
import { FLIGHT_STYLES, INTRO_STYLES, LAYOUT } from '@/declarations/ui/variants'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { IntroSceneService } from '@/services/IntroSceneService'
import { ViewportService } from '@/services/ViewportService'
import type { GlobeCoordinate, GlobeHandle, GlobeLabel } from '@/types/globe'
import type { StarfieldHandle } from '@/types/sky'

const NO_LABELS: Record<string, GlobeLabel> = {}

export interface IntroSceneProps {
  // Camera putting the landing city on top
  initialView: GlobeCoordinate
  // Landing logo, stays put
  title: ReactNode
  heading: ReactNode
  // World caption
  beat: ReactNode
  globeLabel: string
  // Free assessment box, first screen of the page
  children: ReactNode
  // Page body riding over the pinned planet
  sheet: ReactNode
}

/**
 * Pinned landing scene, one planet from landing to the free assessment
 * @param {IntroSceneProps} props - Scene props
 * @return {JSX.Element} - Rendered scene
 */

export const IntroScene = ({
  initialView,
  title,
  heading,
  beat,
  globeLabel,
  children,
  sheet,
}: IntroSceneProps) => {
  const isStill = ViewportService.usePrefers('reducedMotion')
  // Flat plane when WebGL is out of reach
  const [isSketched, setIsSketched] = useState(false)
  const runwayRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sketchRefs = {
    plane: useRef<SVGSVGElement>(null),
    trail: useRef<SVGPolylineElement>(null),
  }
  const globeRef = useRef<GlobeHandle | null>(null)
  const starfieldRef = useRef<StarfieldHandle | null>(null)

  // Landing choreography, played then scrolled
  useEffect(() => {
    const [runway, stage, box] = [runwayRef.current, stageRef.current, boxRef.current]
    const [plane, trail] = [sketchRefs.plane.current, sketchRefs.trail.current]
    if (isStill && stage) return IntroSceneService.still(stage, globeRef)
    if (!runway || !stage || !box) return undefined

    return IntroSceneService.mount({
      track: runway,
      stage,
      box,
      globe: globeRef,
      starfield: starfieldRef,
      canvas: isSketched ? null : canvasRef.current,
      sketch: isSketched && plane && trail ? { plane, trail } : null,
      onFallback: () => setIsSketched(true),
    })
  }, [isStill, isSketched])

  return (
    <>
      <div className={INTRO_STYLES.track}>
        <div ref={stageRef} className={INTRO_STYLES.stage}>
          <div className={INTRO_STYLES.sky} />
          <Starfield handleRef={starfieldRef} />

          <div data-scheme="light" className={INTRO_STYLES.planet}>
            <Globe
              label={globeLabel}
              labels={NO_LABELS}
              hasRing={false}
              initialView={initialView}
              handleRef={globeRef}
              className={INTRO_STYLES.globe}
            />
          </div>

          <div className={INTRO_STYLES.heading}>
            {title}
            <div className={INTRO_STYLES.headingBody}>{heading}</div>
          </div>
          <div className={INTRO_STYLES.beat}>
            <h2 className={INTRO_STYLES.beatTitle}>{beat}</h2>
          </div>

          {isSketched ? (
            <>
              <svg aria-hidden="true" className={FLIGHT_STYLES.trail}>
                <polyline ref={sketchRefs.trail} className={FLIGHT_STYLES.trailLine} />
              </svg>
              <PlaneGlyph glyphRef={sketchRefs.plane} />
            </>
          ) : (
            !isStill && (
              <canvas ref={canvasRef} aria-hidden="true" className={FLIGHT_STYLES.plane} />
            )
          )}

          <div className={INTRO_STYLES.shade} />
        </div>
        <div
          ref={runwayRef}
          id={SECTION_ANCHORS.intro}
          aria-hidden="true"
          className={INTRO_STYLES.runway}
        />
        <div data-scheme="dark" className={LAYOUT.sheet}>
          <div ref={boxRef} className={INTRO_STYLES.dock}>
            {children}
          </div>
          {sheet}
        </div>
      </div>
    </>
  )
}
