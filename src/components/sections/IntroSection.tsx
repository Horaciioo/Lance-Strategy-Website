import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import Image from 'next/image'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { BilanBox } from '@/components/sections/BilanBox'
import { IntroScene } from '@/components/sections/IntroScene'
import type { IntroPerson } from '@/components/sections/IntroPeople'
import { HERO_COUNTRIES, INTRO_REACH, TEAM } from '@/declarations/content'
import { GLOBE_PLACES } from '@/declarations/globe'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { INTRO_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { NavigationService } from '@/services/NavigationService'
import type { TeamMember } from '@/types/content'
import { summitViewOf } from '@/utils/horizon'

const { wordmark } = ConfigurationService.site.logo

// Rich text chunk
const accent = (chunks: ReactNode) => <span className={INTRO_STYLES.accent}>{chunks}</span>

export interface IntroSectionProps {
  members?: TeamMember[]
}

/**
 * Landing scene section
 * @param {IntroSectionProps} props - Intro section props
 * @return {JSX.Element} - Rendered section
 */

export const IntroSection = ({ members = TEAM }: IntroSectionProps) => {
  const t = useTranslations('sections.hero')
  const team = useTranslations('sections.team')
  const actions = useTranslations('actions')
  const flight = useTranslations('sections.flight')
  const route = NavigationService.callToActionRoute()

  // Serializable card data
  const people: IntroPerson[] = members.map((member) => {
    const key = `items.${member.translationKey}`

    return {
      id: member.id,
      view: summitViewOf(GLOBE_PLACES[member.placeId]),
      name: team(`${key}.name`),
      role: team(`${key}.role`),
      place: team(`${key}.place`),
      flag: HERO_COUNTRIES.find((country) => country.id === member.countryId)?.flag ?? '',
      portrait: member.portrait,
      portraitAlt: team(`${key}.portraitAlt`),
      symbol: member.logo.symbol,
      tags: member.tags.map((tag) => team(`${key}.tags.${tag}`)),
    }
  })

  const heading = (
    <>
      <h1 className={INTRO_STYLES.title}>
        <Image
          src={wordmark.src}
          alt={t('logoAlt')}
          width={wordmark.width}
          height={wordmark.height}
          priority
          className={INTRO_STYLES.logo}
        />
      </h1>
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
        people={people}
        heading={heading}
        beat={team.rich('title', { accent })}
        reach={INTRO_REACH.map((key) => team(`reach.${key}`))}
        globeLabel={team('globe')}
        bannerText={flight('banner')}>
        <BilanBox />
      </IntroScene>
    </section>
  )
}
