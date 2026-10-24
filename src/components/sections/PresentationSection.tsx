import { useTranslations } from 'next-intl'

import { ProfileCard } from '@/components/structures/data/ProfileCard'
import { Section } from '@/components/structures/layout/Section'
import { HERO_COUNTRIES, TEAM } from '@/declarations/content'
import { PRESENTATION_STYLES } from '@/declarations/ui/variants'
import type { TeamMember } from '@/types/content'

export interface PresentationSectionProps {
  members?: TeamMember[]
}

/**
 * Team presentation
 * @param {PresentationSectionProps} props - Presentation props
 * @return {JSX.Element} - Rendered section
 */

export const PresentationSection = ({ members = TEAM }: PresentationSectionProps) => {
  const team = useTranslations('sections.team')

  return (
    <Section anchor="team">
      <div className={PRESENTATION_STYLES.grid}>
        {members.map((member) => {
          const key = `items.${member.translationKey}`

          return (
            <article key={member.id} className={PRESENTATION_STYLES.member}>
              <ProfileCard
                name={team(`${key}.name`)}
                role={team(`${key}.role`)}
                place={team(`${key}.place`)}
                flag={HERO_COUNTRIES.find((country) => country.id === member.countryId)?.flag ?? ''}
                portrait={member.portrait}
                portraitAlt={team(`${key}.portraitAlt`)}
                symbol={member.logo.symbol}
                className={PRESENTATION_STYLES.card}
              />
              <ul className={PRESENTATION_STYLES.tags}>
                {member.tags.map((tag) => (
                  <li key={tag} className={PRESENTATION_STYLES.tag}>
                    {team(`${key}.tags.${tag}`)}
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
