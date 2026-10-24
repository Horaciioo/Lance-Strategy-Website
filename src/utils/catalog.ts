/**
 * Page slots of a bound book
 * @param {string[]} pages - Page pictures, cover first
 * @return {Array<string | null>} - Even slots, blank before the back cover
 */

export const catalogSlotsOf = (pages: string[]): Array<string | null> =>
  pages.length % 2 === 0 ? pages : [...pages.slice(0, -1), null, ...pages.slice(-1)]

/**
 * Spread showing a page
 * @param {Array<string | null>} slots - Page slots
 * @param {string | undefined} page - Page picture
 * @return {number} - Turned leaves count
 */

export const catalogViewOf = (slots: Array<string | null>, page: string | undefined): number =>
  Math.ceil(
    Math.max(
      0,
      slots.findIndex((slot) => slot === page)
    ) / 2
  )

/**
 * Printed number of a slot
 * @param {Array<string | null>} slots - Page slots
 * @param {number} slot - Slot index
 * @return {number} - Page number, blanks left out
 */

export const catalogNumberOf = (slots: Array<string | null>, slot: number): number =>
  slots.slice(0, slot + 1).filter(Boolean).length

/**
 * Printed numbers on a spread
 * @param {Array<string | null>} slots - Page slots
 * @param {number} view - Turned leaves count
 * @return {number[]} - Page numbers, blanks left out
 */

export const catalogNumbersOf = (slots: Array<string | null>, view: number): number[] =>
  [view * 2 - 1, view * 2].filter((slot) => slots[slot]).map((slot) => catalogNumberOf(slots, slot))
