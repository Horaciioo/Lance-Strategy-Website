import type { GlobeCoordinate, GlobeFocus } from '@/types/globe'
import { easeInOutCubic, lerp, progressOf } from '@/utils/motion'

/**
 * Eastward target view
 * @param {GlobeCoordinate} from - Current view
 * @param {GlobeCoordinate} to - Requested view
 * @return {GlobeCoordinate} - Target, longitude unwrapped
 */

export const turnTowards = (from: GlobeCoordinate, to: GlobeCoordinate): GlobeCoordinate => ({
  longitude: from.longitude + ((((to.longitude - from.longitude) % 360) + 360) % 360),
  latitude: to.latitude,
})

/**
 * Shortest blend of two views
 * @param {GlobeCoordinate} from - Start view
 * @param {GlobeCoordinate} to - Target view
 * @param {number} share - Progress
 * @return {GlobeCoordinate} - Blended view
 */

export const blendViews = (
  from: GlobeCoordinate,
  to: GlobeCoordinate,
  share: number
): GlobeCoordinate => ({
  longitude: from.longitude + (((to.longitude - from.longitude + 540) % 360) - 180) * share,
  latitude: lerp(from.latitude, to.latitude, share),
})

/**
 * View along a turn
 * @param {GlobeFocus} focus - Running turn
 * @param {number} now - Clock
 * @return {GlobeCoordinate} - Camera view
 */

export const focusedViewOf = ({ from, to, startedAt, durationMs }: GlobeFocus, now: number) => {
  const share = easeInOutCubic(progressOf(now, startedAt, durationMs))

  return {
    longitude: lerp(from.longitude, to.longitude, share),
    latitude: lerp(from.latitude, to.latitude, share),
  }
}
