import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import Image from 'next/image'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { BilanBox } from '@/components/sections/BilanBox'
import { IntroScene } from '@/components/sections/IntroScene'
import { GLOBE_PLACES } from '@/declarations/globe'
import { HERO_LOGO_ATTRIBUTE, SECTION_ANCHORS } from '@/declarations/routes'
import { INTRO_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { NavigationService } from '@/services/NavigationService'
import { summitViewOf } from '@/utils/horizon'

const { wordmark } = ConfigurationService.site.logo

// Rich text chunk
const accent = (chunks: ReactNode) => <span className={INTRO_STYLES.accent}>{chunks}</span>

export interface IntroSectionProps {
  // Page body over the planet
  children: ReactNode
}

/**
 * Landing scene section
 * @param {IntroSectionProps} props - Intro section props
 * @return {JSX.Element} - Rendered section
 */

export const IntroSection = ({ children }: IntroSectionProps) => {
  const t = useTranslations('sections.hero')
  const team = useTranslations('sections.team')
  const actions = useTranslations('actions')
  const route = NavigationService.callToActionRoute()

  const title = (
    <h1 className={INTRO_STYLES.title}>
      <Image
        src={wordmark.src}
        alt={t('logoAlt')}
        width={wordmark.width}
        height={wordmark.height}
        priority
        unoptimized
        {...{ [HERO_LOGO_ATTRIBUTE]: '' }}
        className={INTRO_STYLES.logo}
      />
    </h1>
  )

  const heading = (
    <>
      <p className={INTRO_STYLES.subtitle}>{t('subtitle')}</p>
      <ActionLink
        route={route}
        variant="onMedia"
        size="lg"
        icon="arrowRight"
        iconPosition="right"
        className={INTRO_STYLES.cta}>
        {actions(NavigationService.ctaActionOf(route))}
      </ActionLink>
    </>
  )

  return (
    <section id={SECTION_ANCHORS.hero}>
      <IntroScene
        initialView={summitViewOf(GLOBE_PLACES.paris)}
        title={title}
        heading={heading}
        beat={team.rich('title', { accent })}
        globeLabel={team('globe')}
        sheet={children}>
        <BilanBox />
      </IntroScene>
    </section>
  )
}
