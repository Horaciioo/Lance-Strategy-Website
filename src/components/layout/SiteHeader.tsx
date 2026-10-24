'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { IconButton } from '@/components/elements/actions/IconButton'
import { HeaderBrand } from '@/components/layout/HeaderBrand'
import { LanguagePicker } from '@/components/structures/navigation/LanguagePicker'
import { NavigationList } from '@/components/structures/navigation/NavigationList'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { LAYERS } from '@/declarations/ui/tokens'
import { NAVIGATION_STYLES } from '@/declarations/ui/variants'
import { usePathname } from '@/i18n/routing'
import { ConfigurationService } from '@/services/ConfigurationService'
import { NavigationService } from '@/services/NavigationService'
import { ScrollService } from '@/services/ScrollService'
import { cn } from '@/utils/classnames'

const hasLanguagePicker = ConfigurationService.isEnabled('languageSwitcher')

/**
 * Site header
 * @return {JSX.Element} - Rendered header
 */

export const SiteHeader = () => {
  const pathname = usePathname()
  const t = useTranslations()
  const navigation = useTranslations('navigation')
  const actions = useTranslations('actions')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Unknown until measured, night first
  const [sceneEnd, setSceneEnd] = useState(Number.POSITIVE_INFINITY)
  const [introEnd, setIntroEnd] = useState(Number.POSITIVE_INFINITY)
  const { offset } = ScrollService.use()

  // Night scene and animation height, home only
  useEffect(() => {
    const measure = () => {
      const scene = document.getElementById(SECTION_ANCHORS.hero)
      setSceneEnd(scene ? scene.offsetHeight - window.innerHeight * 1.05 : 0)
      setIntroEnd(ScrollService.introEnd())
    }
    measure()
    window.addEventListener('resize', measure)

    return () => window.removeEventListener('resize', measure)
  }, [pathname])

  const isOverScene = offset < sceneEnd
  const isOverIntro = offset < introEnd
  const entries = NavigationService.headerEntries({ pathname, translate: t })
  const callToAction = NavigationService.callToActionRoute()
  const callToActionLabel = actions(NavigationService.ctaActionOf(callToAction))

  return (
    <header
      data-scheme={isOverScene ? 'dark' : undefined}
      className={cn(NAVIGATION_STYLES.header, LAYERS.header)}>
      <div className={NAVIGATION_STYLES.shell}>
        <div className={NAVIGATION_STYLES.bar}>
          <span
            aria-hidden="true"
            className={cn(
              NAVIGATION_STYLES.backdrop,
              isOverIntro && NAVIGATION_STYLES.backdropHidden
            )}
          />
          <HeaderBrand />

          <nav aria-label={navigation('primary')}>
            <NavigationList entries={entries} />
          </nav>

          <div className={NAVIGATION_STYLES.actions}>
            <ActionLink
              route={callToAction}
              icon="arrowRight"
              iconPosition="right"
              variant={isOverIntro ? 'onMedia' : 'primary'}
              className={NAVIGATION_STYLES.wide}>
              {callToActionLabel}
            </ActionLink>
            {hasLanguagePicker && <LanguagePicker />}
            <IconButton
              icon="menu"
              label={actions('open')}
              className={NAVIGATION_STYLES.narrow}
              onClick={() => setIsMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      <Drawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        name="navigation"
        title={navigation('primary')}
        closeLabel={actions('close')}>
        <NavigationList
          entries={entries}
          direction="vertical"
          withIcons
          onNavigate={() => setIsMenuOpen(false)}
        />
        <div className="mt-6 flex flex-col gap-3">
          <ActionLink route={callToAction} fullWidth>
            {callToActionLabel}
          </ActionLink>
        </div>
      </Drawer>
    </header>
  )
}
