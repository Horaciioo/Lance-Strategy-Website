'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { CatalogBook } from '@/components/sections/CatalogBook'
import { GroupBuild } from '@/components/sections/GroupBuild'
import { Container } from '@/components/structures/layout/Container'
import {
  CATALOG_BOOKS,
  CATALOG_DEFAULT_EDITION,
  CATALOG_LOCALE_EDITIONS,
} from '@/declarations/content'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { CATALOG_PANEL_VARIABLES } from '@/declarations/ui/shapes'
import { SECTION_SPACING } from '@/declarations/ui/tokens'
import { CATALOG_STYLES } from '@/declarations/ui/variants'
import { NavigationService } from '@/services/NavigationService'
import { cn } from '@/utils/classnames'

// Build order, top to bottom
const stepOf = (step: number): CSSProperties => ({ '--build-step': step }) as CSSProperties

// Accent chunk
const accent = (chunks: ReactNode) => <span className={CATALOG_STYLES.accent}>{chunks}</span>

/**
 * Printed catalogue in the visitor language, turned page by page
 * @return {JSX.Element} - Rendered section
 */

export const CatalogSection = () => {
  const t = useTranslations('sections.catalog')
  const locale = useLocale()
  // Locale edition, English without one
  const book = CATALOG_BOOKS[CATALOG_LOCALE_EDITIONS[locale] ?? CATALOG_DEFAULT_EDITION]

  return (
    <section id={SECTION_ANCHORS.catalog} className={SECTION_SPACING.md}>
      <Container>
        <GroupBuild
          className={CATALOG_STYLES.stage}
          style={CATALOG_PANEL_VARIABLES as CSSProperties}>
          <div data-scheme="dark" className={cn(CATALOG_STYLES.panel, 'build-zoom')}>
            <div className={cn(CATALOG_STYLES.head, 'build-wipe')} style={stepOf(1)}>
              <div className={CATALOG_STYLES.intro}>
                <h2 className={CATALOG_STYLES.title}>{t.rich('title', { accent })}</h2>
              </div>
              <p className={CATALOG_STYLES.aside}>{t('description')}</p>
            </div>

            <div className="build-rise" style={stepOf(2)}>
              <CatalogBook key={book.id} book={book} />
            </div>
            <p className={CATALOG_STYLES.hint}>{t('hint')}</p>
          </div>

          <div className={cn(CATALOG_STYLES.actions, 'build-rise')} style={stepOf(3)}>
            <ActionLink href={book.file} download icon="download">
              {t('download')}
            </ActionLink>
            <ActionLink
              href={NavigationService.anchorOf('booking')}
              icon="arrowRight"
              iconPosition="right"
              variant="outline">
              {t('cta')}
            </ActionLink>
          </div>
        </GroupBuild>
      </Container>
    </section>
  )
}
