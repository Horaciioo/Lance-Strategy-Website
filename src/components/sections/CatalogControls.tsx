import { useTranslations } from 'next-intl'

import { IconButton } from '@/components/elements/actions/IconButton'
import { CATALOG_BOOK_STYLES } from '@/declarations/ui/variants'

export interface CatalogControlsProps {
  // Turned leaves count
  view: number
  leaves: number
  label: string
  onGo: (view: number) => void
}

/**
 * Page turning controls
 * @param {CatalogControlsProps} props - Controls props
 * @return {JSX.Element} - Rendered controls
 */

export const CatalogControls = ({ view, leaves, label, onGo }: CatalogControlsProps) => {
  const t = useTranslations('sections.catalog')

  return (
    <div className={CATALOG_BOOK_STYLES.controls}>
      <IconButton
        icon="chevronLeft"
        label={t('previous')}
        variant="onMediaOutline"
        disabled={view === 0}
        onClick={() => onGo(view - 1)}
      />
      <div className={CATALOG_BOOK_STYLES.meter}>
        <p aria-live="polite" className={CATALOG_BOOK_STYLES.counter}>
          {label}
        </p>
        <span aria-hidden="true" className={CATALOG_BOOK_STYLES.track}>
          <span
            className={CATALOG_BOOK_STYLES.progress}
            style={{ width: `${(view / leaves) * 100}%` }}
          />
        </span>
      </div>
      <IconButton
        icon="chevronRight"
        label={t('next')}
        variant="onMediaOutline"
        disabled={view === leaves}
        onClick={() => onGo(view + 1)}
      />
    </div>
  )
}
