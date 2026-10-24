'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { CatalogChapters } from '@/components/sections/CatalogChapters'
import { CatalogControls } from '@/components/sections/CatalogControls'
import { CatalogStage } from '@/components/sections/CatalogStage'
import { CATALOG_BOOK_STYLES } from '@/declarations/ui/variants'
import type { CatalogBook as CatalogBookData } from '@/types/content'
import { catalogNumbersOf, catalogSlotsOf, catalogViewOf } from '@/utils/catalog'

export interface CatalogBookProps {
  book: CatalogBookData
}

/**
 * Flippable catalogue, two pages per spread
 * @param {CatalogBookProps} props - Book props
 * @return {JSX.Element} - Rendered book
 */

export const CatalogBook = ({ book }: CatalogBookProps) => {
  const t = useTranslations('sections.catalog')
  const slots = useMemo(() => catalogSlotsOf(book.pages), [book.pages])
  const leaves = slots.length / 2
  // Turned leaves count
  const [view, setView] = useState(0)

  const go = (next: number) => setView(Math.max(0, Math.min(leaves, next)))

  // Pages in sight
  const numbers = catalogNumbersOf(slots, view)
  const [from = 1, to = from] = [numbers[0], numbers.at(-1)]
  const label =
    from === to
      ? t('pageOf', { page: from, total: book.pages.length })
      : t('pagesOf', { from, to, total: book.pages.length })
  const activeChapter = [...book.chapters].reverse().find((chapter) => chapter.page <= to)

  return (
    <div className={CATALOG_BOOK_STYLES.layout}>
      <CatalogChapters
        book={book}
        activeId={activeChapter?.id}
        onSelect={(page) => go(catalogViewOf(slots, book.pages[page - 1]))}
      />
      <CatalogStage
        slots={slots}
        view={view}
        ratio={book.width / book.height}
        label={label}
        onGo={go}
      />
      <CatalogControls view={view} leaves={leaves} label={label} onGo={go} />
    </div>
  )
}
