import { INTRO_BEATS } from '@/declarations/globe'
import type { BrandFlight } from '@/types/brand'
import { clampUnit, easeInOutCubic, lerp } from '@/utils/motion'

/**
 * Logo flight from the title to the bar
 * @param {Object} input - Flight and scene timeline
 * @param {BrandFlight} input.flight - Measured flight
 * @param {number} input.progress - Landing scene timeline, 0 to 1
 * @return {Object} - Transform and arrival share
 */

export const brandFlightOf = ({ flight, progress }: { flight: BrandFlight; progress: number }) => {
  const share = easeInOutCubic(clampUnit(progress / INTRO_BEATS.leaveEnd))
  const left = lerp(flight.dx, 0, share)
  const top = lerp(flight.dy, 0, share)

  return {
    share,
    transform: `translate3d(${left}px, ${top}px, 0) scale(${lerp(flight.scale, 1, share)})`,
  }
}
