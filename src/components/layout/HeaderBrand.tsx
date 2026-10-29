'use client'

import { useEffect, useRef, useState } from 'react'

import { Logo } from '@/components/elements/media/Logo'
import { HERO_LOGO_ATTRIBUTE } from '@/declarations/routes'
import { LOGO_STYLES, NAVIGATION_STYLES } from '@/declarations/ui/variants'
import { Link, usePathname } from '@/i18n/routing'
import { IntroSceneService } from '@/services/IntroSceneService'
import { NavigationService } from '@/services/NavigationService'
import { ScrollService } from '@/services/ScrollService'
import type { BrandFlight } from '@/types/brand'
import { brandFlightOf } from '@/utils/brandFlight'

const homePath = NavigationService.pathOf('home')
// Frames waited for the landing after a client navigation
const MEASURE_FRAMES = 120

/**
 * Navbar logo, flies in from the landing title
 * @return {JSX.Element} - Rendered brand link
 */

export const HeaderBrand = () => {
  const pathname = usePathname()
  const progress = IntroSceneService.use()
  const imageRef = useRef<HTMLImageElement>(null)
  // Measured per route, null without a landing title
  const [measured, setMeasured] = useState<{ path: string; flight: BrandFlight | null } | null>(
    null
  )

  // Title to bar distance
  useEffect(() => {
    let frame = 0
    let attempts = 0
    const measure = () => {
      const image = imageRef.current
      const title = document.querySelector<HTMLElement>(`[${HERO_LOGO_ATTRIBUTE}]`)
      const end = ScrollService.introEnd()
      const parent = image?.offsetParent
      if (!image || !title || !parent || end <= 0) {
        // Landing not mounted yet on a client navigation
        if (pathname === homePath && attempts++ < MEASURE_FRAMES) {
          frame = requestAnimationFrame(measure)

          return
        }

        return setMeasured({ path: pathname, flight: null })
      }

      // Layout position, blind to the flight transform
      const bounds = parent.getBoundingClientRect()
      const from = title.getBoundingClientRect()
      setMeasured({
        path: pathname,
        flight: {
          dx: from.left - (bounds.left + image.offsetLeft),
          dy: from.top - (bounds.top + image.offsetTop),
          scale: from.width / image.offsetWidth,
        },
      })
    }
    measure()
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
    }
  }, [pathname])

  const flight = measured?.path === pathname ? measured.flight : null
  const isPending = pathname === homePath && measured?.path !== pathname
  const placed = flight ? brandFlightOf({ flight, progress }) : null

  return (
    <Link href={homePath} className={NAVIGATION_STYLES.brand}>
      <Logo
        imageRef={imageRef}
        backdrop={placed ? (placed.share - 0.7) / 0.3 : 1}
        imageClassName={flight ? LOGO_STYLES.flying : undefined}
        imageStyle={{
          transform: placed?.transform,
          opacity: isPending ? 0 : undefined,
        }}
      />
    </Link>
  )
}
