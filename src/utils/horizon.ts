import { GLOBE_HORIZON, INTRO_BEATS } from '@/declarations/globe'
import type { GlobeCoordinate, GlobeFraming } from '@/types/globe'
import { clampUnit, easeInOutCubic, lerp } from '@/utils/motion'

const { radiusOfWidth, radiusOfHeight, worldRadius, skylineOfWidth, skylineOfHeight } =
  GLOBE_HORIZON
const { summitStart, summitNarrow, worldCenter, skylineTop, takeOffLift } = GLOBE_HORIZON
const { tiltDegrees, worldView, spinDegrees } = GLOBE_HORIZON

// Portrait screens keep more sky
const NARROW_RATIO = 1

/**
 * Eased share of one beat
 * @param {number} progress - Scroll share
 * @param {number} from - Beat start
 * @param {number} to - Beat end
 * @return {number} - Eased 0 to 1
 */

export const beatOf = (progress: number, from: number, to: number): number =>
  easeInOutCubic(clampUnit((progress - from) / (to - from)))

/**
 * Planet placement along the scroll
 * @param {Object} input - Stage state
 * @param {number} input.width - Stage width
 * @param {number} input.height - Stage height
 * @param {number} input.progress - Scroll share
 * @return {GlobeFraming} - Planet framing
 */

export const horizonFramingOf = ({
  width,
  height,
  progress,
}: {
  width: number
  height: number
  progress: number
}): GlobeFraming => {
  // Landing hill, whole world, horizon under the flight
  const landing = Math.max(width * radiusOfWidth, height * radiusOfHeight)
  const world = Math.min(width, height) * worldRadius
  const skyline = Math.max(width * skylineOfWidth, height * skylineOfHeight)
  const summit = width / height < NARROW_RATIO ? summitNarrow : summitStart
  const rise = beatOf(progress, 0, INTRO_BEATS.riseEnd)
  const sink = beatOf(progress, INTRO_BEATS.flightStart, INTRO_BEATS.sinkEnd)

  const radius = lerp(lerp(landing, world, rise), skyline, sink)
  const centerY = lerp(
    lerp(height * summit + landing, height * worldCenter, rise),
    height * skylineTop + skyline,
    sink
  )

  return {
    centerX: width / 2,
    centerY,
    radius,
    turnDegrees: spinDegrees * beatOf(progress, INTRO_BEATS.riseEnd, 1),
    towards: { view: worldView, share: rise },
  }
}

/**
 * Plane take-off point
 * @param {Object} input - Stage size
 * @param {number} input.width - Stage width
 * @param {number} input.height - Stage height
 * @return {Object} - Point, CSS pixels
 */

export const takeOffOf = ({ width, height }: { width: number; height: number }) => {
  const framing = horizonFramingOf({ width, height, progress: INTRO_BEATS.flightStart })

  return { x: framing.centerX, y: framing.centerY - framing.radius * takeOffLift }
}

/**
 * Camera putting a city near the summit
 * @param {GlobeCoordinate} place - City
 * @return {GlobeCoordinate} - Camera view
 */

export const summitViewOf = ({ longitude, latitude }: GlobeCoordinate): GlobeCoordinate => ({
  longitude,
  latitude: latitude - tiltDegrees,
})
