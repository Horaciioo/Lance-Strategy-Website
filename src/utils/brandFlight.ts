import type { BrandFlight } from '@/types/brand'
import { clampUnit, easeInOutCubic, lerp } from '@/utils/motion'

/**
 * Logo flight from the title to the bar
 * @param {Object} input - Flight and scroll
 * @param {BrandFlight} input.flight - Measured flight
 * @param {number} input.offset - Scroll offset
 * @return {Object} - Transform and arrival share
 */

export const brandFlightOf = ({ flight, offset }: { flight: BrandFlight; offset: number }) => {
  const share = easeInOutCubic(clampUnit(offset / flight.travel))
  const left = lerp(flight.dx, 0, share)
  const top = lerp(flight.dy, 0, share)

  return {
    share,
    transform: `translate3d(${left}px, ${top}px, 0) scale(${lerp(flight.scale, 1, share)})`,
  }
}
