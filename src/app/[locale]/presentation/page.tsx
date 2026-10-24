import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { PresentationSection } from '@/components/sections/PresentationSection'
import { PageHeader } from '@/components/structures/layout/PageHeader'
import { Breadcrumb } from '@/components/structures/navigation/Breadcrumb'
import { NavigationService } from '@/services/NavigationService'
import { Page } from '@/structures/Page'
import type { PageRenderContext } from '@/structures/Page'

export interface PresentationPageProps {
  params: Promise<{ locale: string }>
}

class PresentationPage extends Page {
  constructor() {
    super('presentation')
  }

  render({ translate, breadcrumb }: PageRenderContext): ReactNode {
    return (
      <>
        <PageHeader
          title={translate('label')}
          description={translate('metaDescription')}
          breadcrumb={breadcrumb}
        />
        <PresentationSection />
      </>
    )
  }
}

const page = new PresentationPage()

/**
 * Generate page metadata
 * @param {PresentationPageProps} props - Page props
 * @return {Promise<Metadata>} - Metadata for the page
 */

export const generateMetadata = async ({ params }: PresentationPageProps): Promise<Metadata> => {
  const { locale } = await params

  return page.metadata({ locale, translate: await getTranslations() })
}

/**
 * Presentation page
 * @return {Promise<JSX.Element>} - Rendered page
 */

export default async function PresentationPageRoute() {
  const navigationTranslate = await getTranslations()

  return page.render({
    translate: await getTranslations('routes.presentation'),
    breadcrumb: (
      <Breadcrumb
        entries={NavigationService.breadcrumbOf('presentation', navigationTranslate)}
        label={navigationTranslate('navigation.breadcrumb')}
      />
    ),
  })
}
