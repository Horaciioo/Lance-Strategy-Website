import { useId } from 'react'
import type { Ref } from 'react'

import { FLIGHT_COLORS } from '@/declarations/flight'
import { FLIGHT_STYLES } from '@/declarations/ui/variants'

// Top view, nose up, 100 unit box
export const PLANE_BODY =
  'M50 3C54 3 56 14 56 28V40L96 62V70L56 60V80L68 90V95L50 91L32 95V90L44 80V60L4 70V62L44 40V28C44 14 46 3 50 3Z'
export const PLANE_TAIL_STRIPE = 'M44 80L56 80L68 90V95L50 91L32 95V90Z'

// Detailed glyph, 200 unit box, starboard half mirrored
const FUSELAGE =
  'M100 6C106 6 108.5 17 108.5 31V150C108.5 168 104.5 184 100 195C95.5 184 91.5 168 91.5 150V31C91.5 17 94 6 100 6Z'
const WING = 'M107 74L187 113Q192 116 191 120L186 121L129 108L112 113L107 113Z'
const FLAPS = 'M112 111L129 106L184 118'
const WINGLET = 'M185 113.5Q191 116 191 120L186 121Z'
const NACELLE = { x: 123, y: 72, width: 11, height: 27 }
const STABILISER = 'M105 158L139 175Q142 177 141 181L105 181Z'
const COCKPIT = 'M94.5 23Q100 19.5 105.5 23L104.6 26.5Q100 24 95.4 26.5Z'
const FIN = { x: 98.6, y: 148, width: 2.8, height: 45 }
const FIN_STRIPE = { x: 98.6, y: 172, width: 2.8, height: 6 }
const MIRROR = 'translate(200 0) scale(-1 1)'

export interface PlaneGlyphProps {
  glyphRef: Ref<SVGSVGElement>
}

/**
 * Flat airliner, used when the 3D scene is out of reach
 * @param {PlaneGlyphProps} props - Glyph props
 * @return {JSX.Element} - Rendered plane
 */

export const PlaneGlyph = ({ glyphRef }: PlaneGlyphProps) => {
  // Safe inside url()
  const id = `plane${useId().replace(/\W/g, '')}`
  const [hull, skin, half] = [`${id}-hull`, `${id}-skin`, `${id}-half`]

  return (
    <svg ref={glyphRef} viewBox="0 0 200 200" aria-hidden="true" className={FLIGHT_STYLES.glyph}>
      <defs>
        {/* Round body, lit from the left */}
        <linearGradient id={hull} x1="0" x2="1">
          <stop offset="0" stopColor={FLIGHT_COLORS.belly} />
          <stop offset="0.35" stopColor={FLIGHT_COLORS.body} />
          <stop offset="0.6" stopColor={FLIGHT_COLORS.body} />
          <stop offset="1" stopColor={FLIGHT_COLORS.metal} />
        </linearGradient>
        <linearGradient id={skin} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={FLIGHT_COLORS.body} />
          <stop offset="1" stopColor={FLIGHT_COLORS.wing} />
        </linearGradient>
        <g id={half} stroke={FLIGHT_COLORS.seamStrong} strokeWidth="0.6">
          <rect {...NACELLE} rx="5" fill={`url(#${hull})`} />
          <path d={WING} fill={`url(#${skin})`} />
          <path d={FLAPS} fill="none" />
          <path d={WINGLET} fill={FLIGHT_COLORS.accent} stroke="none" />
          <path d={STABILISER} fill={`url(#${skin})`} />
        </g>
      </defs>
      <use href={`#${half}`} />
      <use href={`#${half}`} transform={MIRROR} />
      <path
        d={FUSELAGE}
        fill={`url(#${hull})`}
        stroke={FLIGHT_COLORS.seamStrong}
        strokeWidth="0.6"
      />
      <path d={COCKPIT} fill={FLIGHT_COLORS.glass} />
      <rect {...FIN} rx="1.4" fill={FLIGHT_COLORS.ink} />
      <rect {...FIN_STRIPE} fill={FLIGHT_COLORS.accent} />
    </svg>
  )
}
