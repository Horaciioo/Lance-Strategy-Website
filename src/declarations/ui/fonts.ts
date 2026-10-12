import { Archivo, Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google'

/**
 * Latin family, width axis
 * @type {Object}
 */

const sans = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-sans',
  display: 'swap',
})

// CJK slices, served per unicode-range
const sansChinese = Noto_Sans_SC({
  weight: ['400', '500'],
  variable: '--font-sans-chinese',
  display: 'swap',
  preload: false,
})

const displayChinese = Noto_Serif_SC({
  weight: ['600'],
  variable: '--font-display-chinese',
  display: 'swap',
  preload: false,
})

/**
 * Font CSS variables
 * @type {string}
 */

export const FONT_VARIABLES = `${sans.variable} ${sansChinese.variable} ${displayChinese.variable}`
