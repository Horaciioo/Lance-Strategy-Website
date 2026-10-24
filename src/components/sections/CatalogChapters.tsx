import { useTranslations } from 'next-intl'

import { CATALOG_BOOK_STYLES } from '@/declarations/ui/variants'
import type { CatalogBook } from '@/types/content'
import { cn } from '@/utils/classnames'

export interface CatalogChaptersProps {
  book: CatalogBook
  activeId: string | undefined
  onSelect: (page: number) => void
}

/**
 * Catalogue sections
 * @param {CatalogChaptersProps} props - Chapters props
 * @return {JSX.Element} - Rendered list
 */

export const CatalogChapters = ({ book, activeId, onSelect }: CatalogChaptersProps) => {
  const t = useTranslations('sections.catalog')

  return (
    <nav aria-label={t('chaptersLabel')}>
      <ol className={CATALOG_BOOK_STYLES.chapters}>
        {book.chapters.map((chapter, index) => {
          // Last page before the next chapter
          const last = (book.chapters[index + 1]?.page ?? book.pages.length + 1) - 1
          const isActive = chapter.id === activeId

          return (
            <li key={chapter.id}>
              <button
                type="button"
                aria-current={isActive || undefined}
                onClick={() => onSelect(chapter.page)}
                className={cn(
                  CATALOG_BOOK_STYLES.chapter,
                  isActive && CATALOG_BOOK_STYLES.chapterActive
                )}>
                <span className={CATALOG_BOOK_STYLES.chapterIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={CATALOG_BOOK_STYLES.chapterLabel}>
                  {t(`chapters.${chapter.id}`)}
                </span>
                <span className={CATALOG_BOOK_STYLES.chapterPages}>
                  {last > chapter.page
                    ? t('pageRange', { from: chapter.page, to: last })
                    : t('pageSingle', { page: chapter.page })}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
