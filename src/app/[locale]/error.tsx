'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { Button } from '@/components/elements/actions/Button'
import { PLANE_BODY } from '@/components/elements/media/PlaneGlyph'
import { Container } from '@/components/structures/layout/Container'
import { SECTION_SPACING } from '@/declarations/ui/tokens'
import { ERROR_STYLES } from '@/declarations/ui/variants'
import { LoggerService } from '@/services/LoggerService'

// Dotted route, cut where the air pocket hit
const ROUTE_BEFORE = 'M8 104C40 104 62 60 104 52'
const ROUTE_AFTER = 'M150 46C180 44 200 40 214 34'
const POCKET = 'M112 44l8 -6l6 8l8 -8l6 6'

export interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary, a plane through turbulence
 * @param {ErrorPageProps} props - Error and retry handler
 * @return {JSX.Element} - Boundary
 */

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('errors.turbulence')
  const actions = useTranslations('actions')
  const routes = useTranslations('routes')

  useEffect(() => LoggerService.error('route.render', error), [error])

  return (
    <div className={SECTION_SPACING.lg}>
      <Container width="narrow">
        <div className={ERROR_STYLES.frame}>
          <svg viewBox="0 0 240 120" aria-hidden="true" className={ERROR_STYLES.figure}>
            <path d={ROUTE_BEFORE} className={ERROR_STYLES.route} />
            <path d={POCKET} className={ERROR_STYLES.break} />
            <path d={ROUTE_AFTER} className={ERROR_STYLES.route} />
            <g className={ERROR_STYLES.plane}>
              <path
                d={PLANE_BODY}
                fill="currentColor"
                transform="translate(206 4) rotate(70 0 0) scale(0.3)"
              />
            </g>
          </svg>
          <p className={ERROR_STYLES.kicker}>{t('kicker')}</p>
          <h1 className={ERROR_STYLES.title}>{t('title')}</h1>
          <p className={ERROR_STYLES.text}>{t('text')}</p>
          <div className={ERROR_STYLES.actions}>
            <Button icon="arrowRight" onClick={reset}>
              {actions('retry')}
            </Button>
            <ActionLink route="home" variant="secondary" icon="home">
              {routes('home.label')}
            </ActionLink>
          </div>
        </div>
      </Container>
    </div>
  )
}
