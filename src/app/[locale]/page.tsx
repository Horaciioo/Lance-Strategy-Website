import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { BilanBox } from '@/components/sections/BilanBox'
import { AppointmentSection } from '@/components/sections/AppointmentSection'
import { CatalogSection } from '@/components/sections/CatalogSection'
import { DialogueSection } from '@/components/sections/DialogueSection'
import { FeatureSection } from '@/components/sections/FeatureSection'
import { GroupSection } from '@/components/sections/GroupSection'
import { IntroSection } from '@/components/sections/IntroSection'
import { INTRO_STYLES, LAYOUT } from '@/declarations/ui/variants'
import { Page } from '@/structures/Page'

export interface HomePageProps {
  params: Promise<{ locale: string }>
}

class HomePage extends Page {
  constructor() {
    super('home')
  }

  render(): ReactNode {
    return (
      <>
        <IntroSection />
        <div className={LAYOUT.sheet}>
          <div data-bilan-dock className={INTRO_STYLES.dock}>
            <BilanBox />
          </div>
          <AppointmentSection />
          <CatalogSection />
          <DialogueSection />
          <FeatureSection />
          <GroupSection />
        </div>
      </>
    )
  }
}

const page = new HomePage()

/**
 * Generate page metadata
 * @param {HomePageProps} props - Page props
 * @return {Promise<Metadata>} - Metadata for the page
 */

export const generateMetadata = async ({ params }: HomePageProps): Promise<Metadata> => {
  const { locale } = await params

  return page.metadata({ locale, translate: await getTranslations() })
}

/**
 * Landing page
 * @return {ReactNode} - Page
 */

export default function HomePageRoute() {
  return page.render()
}
