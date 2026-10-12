import { ConfigurationService } from '@/services/ConfigurationService'
import { bindWindowEvent, createStore } from '@/services/core/StoreService'
import { Service } from '@/structures/Service'
import { isBrowser } from '@/utils/guards'

export interface ScrollState {
  offset: number
  // Scroll threshold flag
  isScrolled: boolean
  direction: 'up' | 'down'
}

const { scrollThresholdPx } = ConfigurationService.timings

const initialState: ScrollState = { offset: 0, isScrolled: false, direction: 'up' }

// Scroll lock count
let lockCount = 0

const store = createStore<ScrollState>(initialState, {
  activate: (setState) => {
    if (!isBrowser()) return () => undefined

    let previous = window.scrollY

    return bindWindowEvent('scroll', () => {
      const offset = window.scrollY
      const direction = offset > previous ? 'down' : 'up'
      previous = offset

      setState({ offset, isScrolled: offset > scrollThresholdPx, direction })
    })
  },
})

class ScrollServiceClass extends Service {
  store = store

  /**
   * Follow the scroll position
   * @return {ScrollState} - Offset, threshold flag and direction
   */

  use = (): ScrollState => store.use()

  /**
   * Pinned track progress
   * @param {HTMLElement} track - Tall scroll track
   * @param {Function} onProgress - Receives 0 to 1
   * @return {() => void} - Stop tracking
   */

  track = (track: HTMLElement, onProgress: (progress: number) => void): (() => void) => {
    if (!isBrowser()) return () => undefined
    let frameId = 0

    // One measure per frame
    const measure = () => {
      frameId = 0
      const box = track.getBoundingClientRect()
      const travel = box.height - window.innerHeight
      onProgress(travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0)
    }
    const schedule = () => {
      if (frameId === 0) frameId = requestAnimationFrame(measure)
    }
    const unbindScroll = bindWindowEvent('scroll', schedule)
    const unbindResize = bindWindowEvent('resize', schedule)
    measure()

    return () => {
      cancelAnimationFrame(frameId)
      unbindScroll()
      unbindResize()
    }
  }

  /**
   * Scroll to top
   * @return {void}
   */

  toTop = (): void => {
    if (!isBrowser()) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Lock scroll
   * @return {() => void} - Release
   */

  lock = (): (() => void) => {
    if (!isBrowser()) return () => undefined

    lockCount += 1
    document.body.style.overflow = 'hidden'

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) document.body.style.overflow = ''
    }
  }

  /**
   * Scroll to anchor
   * @param {string} anchor - Anchor ID
   * @return {boolean} - Found
   */

  toAnchor = (anchor: string): boolean => {
    if (!isBrowser()) return false
    const target = document.getElementById(anchor)
    if (!target) return false

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })

    return true
  }
}

// Scroll position
export const ScrollService = new ScrollServiceClass('scroll')
