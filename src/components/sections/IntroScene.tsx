'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { Globe } from '@/components/elements/media/Globe'
import { PlaneGlyph } from '@/components/elements/media/PlaneGlyph'
import { Starfield } from '@/components/elements/media/Starfield'
import { IntroPeople } from '@/components/sections/IntroPeople'
import type { IntroPerson } from '@/components/sections/IntroPeople'
import { FLIGHT_STYLES, INTRO_STYLES } from '@/declarations/ui/variants'
import { IntroSceneService } from '@/services/IntroSceneService'
import { ViewportService } from '@/services/ViewportService'
import type { GlobeHandle, GlobeLabel } from '@/types/globe'
import type { StarfieldHandle } from '@/types/sky'

const NO_LABELS: Record<string, GlobeLabel> = {}

export interface IntroSceneProps {
  people: IntroPerson[]
  heading: ReactNode
  // World caption
  beat: ReactNode
  // Lines under the caption
  reach: string[]
  globeLabel: string
  bannerText: string
  // Box traced behind the banner
  children: ReactNode
}

/**
 * Pinned landing scene, one planet from landing to the free assessment
 * @param {IntroSceneProps} props - Scene props
 * @return {JSX.Element} - Rendered scene
 */

export const IntroScene = ({
  people,
  heading,
  beat,
  reach,
  globeLabel,
  bannerText,
  children,
}: IntroSceneProps) => {
  const isStill = ViewportService.usePrefers('reducedMotion')
  // Flat plane when WebGL is out of reach
  const [isSketched, setIsSketched] = useState(false)
  const [initialView] = useState(() => people[0]?.view)
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sketchRefs = {
    plane: useRef<SVGSVGElement>(null),
    trail: useRef<SVGPolylineElement>(null),
    banner: useRef<HTMLDivElement>(null),
  }
  const globeRef = useRef<GlobeHandle | null>(null)
  const starfieldRef = useRef<StarfieldHandle | null>(null)

  // Scroll choreography
  useEffect(() => {
    const [track, stage, box] = [trackRef.current, stageRef.current, boxRef.current]
    const [plane, trail, banner] = [
      sketchRefs.plane.current,
      sketchRefs.trail.current,
      sketchRefs.banner.current,
    ]
    if (isStill && stage) return IntroSceneService.still(stage, globeRef)
    if (!track || !stage || !box) return undefined

    return IntroSceneService.mount({
      track,
      stage,
      box,
      globe: globeRef,
      starfield: starfieldRef,
      canvas: isSketched ? null : canvasRef.current,
      sketch: isSketched && plane && trail && banner ? { plane, trail, banner } : null,
      bannerText,
      onFallback: () => setIsSketched(true),
    })
  }, [isStill, isSketched, bannerText])

  return (
    <>
      <div ref={trackRef} className={INTRO_STYLES.track}>
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

          <div className={INTRO_STYLES.heading}>{heading}</div>
          <div className={INTRO_STYLES.people}>
            <IntroPeople people={people} globeRef={globeRef} />
          </div>
          <div className={INTRO_STYLES.beat}>
            <h2 className={INTRO_STYLES.beatTitle}>{beat}</h2>
            <ul className={INTRO_STYLES.reach}>
              {reach.map((line, index) => (
                <li
                  key={line}
                  className={INTRO_STYLES.reachItem}
                  style={{ '--step': index } as CSSProperties}>
                  <span className={INTRO_STYLES.reachDot} />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {!isStill && (
            <div ref={boxRef} className={INTRO_STYLES.box}>
              {children}
            </div>
          )}

          {isSketched ? (
            <>
              <svg aria-hidden="true" className={FLIGHT_STYLES.trail}>
                <polyline ref={sketchRefs.trail} className={FLIGHT_STYLES.trailLine} />
              </svg>
              <div ref={sketchRefs.banner} aria-hidden="true" className={FLIGHT_STYLES.banner}>
                {bannerText}
              </div>
              <PlaneGlyph glyphRef={sketchRefs.plane} />
            </>
          ) : (
            !isStill && (
              <canvas ref={canvasRef} aria-hidden="true" className={FLIGHT_STYLES.plane} />
            )
          )}

          <div className={INTRO_STYLES.shade} />
        </div>
      </div>
    </>
  )
}
