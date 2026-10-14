'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { LANGUAGE_PICKER_STYLES } from '@/declarations/ui/variants'
import { usePathname, useRouter } from '@/i18n/routing'
import { AnalyticsService } from '@/services/AnalyticsService'
import { I18nService } from '@/services/I18nService'
import type { Styleable } from '@/types/common'
import { cn } from '@/utils/classnames'

export interface LanguagePickerProps extends Styleable {
  onPick?: () => void
}

/**
 * Language picker
 * @param {LanguagePickerProps} props - Picker props
 * @return {JSX.Element | null} - Flag and options
 */

export const LanguagePicker = ({ onPick, className }: LanguagePickerProps) => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('navigation')
  const [isOpen, setIsOpen] = useState(false)

  if (I18nService.locales.length < 2) return null

  // Swap locale on same route
  const handlePick = (next: string) => {
    setIsOpen(false)
    onPick?.()
    if (next === locale) return
    AnalyticsService.track('localeChanged', { locale: next })
    router.replace(pathname, { locale: next })
  }

  return (
    <div className={cn(LANGUAGE_PICKER_STYLES.root, className)}>
      <button
        type="button"
        aria-label={t('language')}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={LANGUAGE_PICKER_STYLES.trigger}>
        <span aria-hidden="true">{I18nService.flagOf(locale)}</span>
      </button>

      {isOpen && (
        <ul className={LANGUAGE_PICKER_STYLES.list}>
          {I18nService.locales.map((option) => (
            <li key={option}>
              <button
                type="button"
                lang={option}
                aria-current={option === locale}
                onClick={() => handlePick(option)}
                className={cn(
                  LANGUAGE_PICKER_STYLES.option,
                  option === locale && LANGUAGE_PICKER_STYLES.optionActive
                )}>
                <span aria-hidden="true" className={LANGUAGE_PICKER_STYLES.flag}>
                  {I18nService.flagOf(option)}
                </span>
                {I18nService.languageNameOf(option)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
