import { ConfigurationService } from '@/services/ConfigurationService'
import type {
  CatalogBook,
  ComparisonItem,
  CountryItem,
  DialogueLine,
  FaqItem,
  FeatureItem,
  GroupAffiliate,
  MediaItem,
  QuoteChannel,
  StatItem,
  TeamMember,
  TestimonialItem,
  TopicItem,
} from '@/types/content'

/**
 * Placeholder image
 * @type {string}
 */

export const PLACEHOLDER_IMAGE = '/images/placeholder.svg'

/**
 * Reasons to choose
 * @type {FeatureItem[]}
 */

export const FEATURES: FeatureItem[] = [
  { id: 'team', translationKey: 'team', icon: 'users' },
  { id: 'develop', translationKey: 'develop', icon: 'pencilRuler' },
  { id: 'control', translationKey: 'control', icon: 'shieldCheck' },
]

/**
 * Offers, even count
 * @type {MediaItem[]}
 */

export const OFFERS: MediaItem[] = [
  'sourcing',
  'design',
  'production',
  'quality',
  'shipping',
  'customs',
].map((id) => ({ id, src: PLACEHOLDER_IMAGE, translationKey: id }))

/**
 * Founders, France then China
 * @type {TeamMember[]}
 */

export const TEAM: TeamMember[] = [
  {
    id: 'france',
    translationKey: 'france',
    countryId: 'france',
    placeId: 'paris',
    tags: ['brief', 'quote', 'delivery'],
    portrait: '/images/team/fabien-jaeger.jpg',
    logo: ConfigurationService.site.logo,
  },
  {
    id: 'china',
    translationKey: 'china',
    countryId: 'china',
    placeId: 'shanghai',
    tags: ['factories', 'production', 'inspection'],
    portrait: '/images/team/guillaume-schneider.jpg',
    logo: ConfigurationService.site.logo,
  },
]

/**
 * Countries served
 * @type {CountryItem[]}
 */

export const HERO_COUNTRIES: CountryItem[] = [
  { id: 'france', translationKey: 'france', flag: '🇫🇷' },
  { id: 'china', translationKey: 'china', flag: '🇨🇳' },
]

/**
 * Process steps
 * @type {TopicItem[]}
 */

export const DIALOGUE_STEPS: TopicItem[] = ['need', 'strategy', 'import'].map((id) => ({
  id,
  translationKey: id,
}))

/**
 * Scripted conversation
 * @type {DialogueLine[]}
 */

export const DIALOGUE: DialogueLine[] = [
  { id: 'need', translationKey: 'need', speaker: 'client', stepId: 'need' },
  {
    id: 'strategy',
    translationKey: 'strategy',
    speaker: 'france',
    stepId: 'strategy',
    attachment: { translationKey: 'brief', icon: 'file' },
  },
  {
    id: 'import',
    translationKey: 'import',
    speaker: 'china',
    stepId: 'import',
    attachment: { translationKey: 'samples', icon: 'photos' },
  },
  { id: 'done', translationKey: 'done', speaker: 'client', stepId: 'import' },
]

/**
 * Statistics
 * @type {StatItem[]}
 */

export const STATS: StatItem[] = [
  { id: 'clients', translationKey: 'clients', value: 240, format: 'count', icon: 'users' },
  { id: 'projects', translationKey: 'projects', value: 128, format: 'count', icon: 'sparkles' },
  {
    id: 'satisfaction',
    translationKey: 'satisfaction',
    value: 0.98,
    format: 'percent',
    icon: 'heart',
  },
  { id: 'experience', translationKey: 'experience', value: 12, format: 'count', icon: 'clock' },
]

/**
 * Response and delivery promises
 * @type {FeatureItem[]}
 */

export const PROMISES: FeatureItem[] = [
  { id: 'response', translationKey: 'response', icon: 'clock', tone: 'primary' },
  { id: 'delivery', translationKey: 'delivery', icon: 'send', tone: 'accent' },
]

/**
 * Testimonials
 * @type {TestimonialItem[]}
 */

export const TESTIMONIALS: TestimonialItem[] = [
  { id: 'first', translationKey: 'first', rating: 5 },
  { id: 'second', translationKey: 'second', rating: 5 },
  { id: 'third', translationKey: 'third', rating: 4 },
]

/**
 * FAQ items
 * @type {FaqItem[]}
 */

export const FAQ: FaqItem[] = [
  { id: 'first', translationKey: 'first' },
  { id: 'second', translationKey: 'second' },
  { id: 'third', translationKey: 'third' },
  { id: 'fourth', translationKey: 'fourth' },
  { id: 'fifth', translationKey: 'fifth' },
]

/**
 * Before and after pairs
 * @type {ComparisonItem[]}
 */

export const COMPARISONS: ComparisonItem[] = [
  {
    id: 'first',
    translationKey: 'first',
    before: { src: PLACEHOLDER_IMAGE, width: 800, height: 600 },
    after: { src: PLACEHOLDER_IMAGE, width: 800, height: 600 },
  },
  {
    id: 'second',
    translationKey: 'second',
    before: { src: PLACEHOLDER_IMAGE, width: 800, height: 600 },
    after: { src: PLACEHOLDER_IMAGE, width: 800, height: 600 },
  },
]

/**
 * Legal page sections
 * @type {Object}
 */

export const LEGAL_SECTIONS = {
  legalNotice: ['publisher', 'hosting', 'property', 'liability'],
  privacyPolicy: ['collection', 'purpose', 'retention', 'rights', 'cookies', 'contact'],
} as const

/**
 * Legal page name
 * @typedef {keyof typeof LEGAL_SECTIONS} LegalPage
 */

export type LegalPage = keyof typeof LEGAL_SECTIONS

export const GALLERY: MediaItem[] = Array.from({ length: 6 }, (_, index) => ({
  id: `item-${index + 1}`,
  src: PLACEHOLDER_IMAGE,
  translationKey: `item${index + 1}`,
}))

/**
 * Free quote channels
 * @type {QuoteChannel[]}
 */

export const QUOTE_CHANNELS: QuoteChannel[] = [
  { id: 'whatsapp', translationKey: 'whatsapp', icon: 'chat', kind: 'whatsapp' },
  { id: 'email', translationKey: 'email', icon: 'mail', kind: 'email' },
]

/**
 * Printed catalogue, one picture per page
 * @type {CatalogBook}
 */

export const CATALOG_BOOK: CatalogBook = {
  file: '/catalog/catalogue-2026-2027.pdf',
  pages: Array.from(
    { length: 16 },
    (_, index) => `/catalog/pages/page-${String(index + 1).padStart(2, '0')}.webp`
  ),
  // Page size, pixels
  width: 900,
  height: 1273,
  // First page of each chapter
  chapters: [
    { id: 'cover', page: 1 },
    { id: 'about', page: 2 },
    { id: 'workwear', page: 4 },
    { id: 'heated', page: 7 },
    { id: 'gloves', page: 11 },
    { id: 'footwear', page: 15 },
    { id: 'contact', page: 16 },
  ],
}

/**
 * Lance Group affiliates, left then right of the hub
 * @type {GroupAffiliate[]}
 */

export const GROUP_AFFILIATES: GroupAffiliate[] = [
  { id: 'itemsprotect', translationKey: 'itemsprotect', url: ConfigurationService.site.group.url },
  { id: 'strategy', translationKey: 'strategy', url: null },
]

/**
 * Reach lines under the world caption, message keys in order
 * @type {string[]}
 */

export const INTRO_REACH = ['offices', 'route', 'control'] as const
