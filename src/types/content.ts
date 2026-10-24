import type { GlobePlaceId } from '@/declarations/globe'
import type { IconName } from '@/declarations/ui/icons'
import type { Identifiable, Tone, TranslationKey } from '@/types/common'

/**
 * Media item
 * @typedef MediaItem
 * @property {string} src - Image source
 * @property {TranslationKey} translationKey - Alternative text key
 * @property {number} [width] - Image width
 * @property {number} [height] - Image height
 */

export interface MediaItem extends Identifiable {
  src: string
  // Alternative text key
  translationKey: TranslationKey
  width?: number
  height?: number
}

/**
 * Feature item
 * @typedef FeatureItem
 * @property {TranslationKey} translationKey - Title key
 * @property {IconName} icon - Display icon
 * @property {Tone} [tone] - Icon tone
 */

export interface FeatureItem extends Identifiable {
  translationKey: TranslationKey
  icon: IconName
  tone?: Tone
}

/**
 * Text-only topic
 * @typedef TopicItem
 * @property {TranslationKey} translationKey - Title key
 */

export interface TopicItem extends Identifiable {
  translationKey: TranslationKey
}

/**
 * Team member
 * @typedef TeamMember
 * @property {TranslationKey} translationKey - Profile key
 * @property {string} countryId - Country item ID
 * @property {GlobePlaceId} placeId - Globe place
 * @property {TranslationKey[]} tags - Handled topics
 * @property {string} portrait - Portrait source
 * @property {Object} logo - Carried brand mark
 */

export interface TeamMember extends Identifiable {
  translationKey: TranslationKey
  countryId: string
  placeId: GlobePlaceId
  tags: TranslationKey[]
  portrait: string
  // Carried brand mark
  logo: { symbol: string; image: string | null }
}

/**
 * Country item
 * @typedef CountryItem
 * @property {string} flag - Emoji flag
 */

export interface CountryItem extends TopicItem {
  flag: string
}

/**
 * Conversation line
 * @typedef DialogueLine
 * @property {TranslationKey} translationKey - Message key
 * @property {string} speaker - Client or team member ID
 * @property {string} stepId - Process step ID
 * @property {Object} [attachment] - Shared file
 */

export interface DialogueLine extends Identifiable {
  translationKey: TranslationKey
  speaker: string
  stepId: string
  attachment?: { translationKey: TranslationKey; icon: IconName }
}

/**
 * Statistic item
 * @typedef StatItem
 * @property {TranslationKey} translationKey - Label key
 * @property {number} value - Raw value
 * @property {'count' | 'currency' | 'percent'} [format] - Value format type
 * @property {IconName} [icon] - Display icon
 */

export interface StatItem extends Identifiable {
  translationKey: TranslationKey
  value: number
  // Value format type
  format?: 'count' | 'currency' | 'percent'
  icon?: IconName
}

/**
 * Declared picture, intrinsic size included
 * @typedef ImageAsset
 * @property {string} src - Public path
 * @property {number} width - Intrinsic width
 * @property {number} height - Intrinsic height
 */

export interface ImageAsset {
  src: string
  width: number
  height: number
}

/**
 * Testimonial item
 * @typedef TestimonialItem
 * @property {TranslationKey} translationKey - Quote key
 * @property {number} [rating] - Star rating
 * @property {string} [avatar] - Author image
 */

export interface TestimonialItem extends Identifiable {
  translationKey: TranslationKey
  rating?: number
  avatar?: string
}

/**
 * FAQ item
 * @typedef FaqItem
 * @property {TranslationKey} translationKey - Answer key
 */

export interface FaqItem extends Identifiable {
  translationKey: TranslationKey
}

/**
 * Before and after pair
 * @typedef ComparisonItem
 * @property {TranslationKey} translationKey - Caption key
 * @property {ImageAsset} before - Starting picture
 * @property {ImageAsset} after - Finished picture
 */

export interface ComparisonItem extends Identifiable {
  translationKey: TranslationKey
  before: ImageAsset
  after: ImageAsset
}

/**
 * Pricing item
 * @typedef PricingItem
 * @property {TranslationKey} translationKey - Plan name key
 * @property {number} amountCents - Amount in cents
 * @property {'once' | 'month' | 'year'} [period] - Billing period
 * @property {boolean} [featured] - Highlight flag
 * @property {TranslationKey[]} includedKeys - Included features
 */

export interface PricingItem extends Identifiable {
  translationKey: TranslationKey
  // Amount in cents
  amountCents: number
  period?: 'once' | 'month' | 'year'
  featured?: boolean
  includedKeys: TranslationKey[]
}

/**
 * Timeline item
 * @typedef TimelineItem
 * @property {TranslationKey} translationKey - Event description key
 * @property {string} date - Event date
 * @property {IconName} [icon] - Milestone icon
 */

export interface TimelineItem extends Identifiable {
  translationKey: TranslationKey
  date: string
  icon?: IconName
}

/**
 * Group affiliate
 * @typedef GroupAffiliate
 * @property {string | null} url - Outbound link, none for the current site
 */

export interface GroupAffiliate {
  id: string
  translationKey: TranslationKey
  url: string | null
}

/**
 * Printed catalogue
 * @typedef CatalogBook
 * @property {string} id - Edition id
 * @property {string} file - Downloadable PDF
 * @property {string[]} pages - Page pictures, in order
 */

export interface CatalogBook {
  id: string
  file: string
  pages: string[]
  width: number
  height: number
  chapters: Array<{ id: TranslationKey; page: number }>
}

/**
 * Quote channel
 * @typedef QuoteChannel
 */

export interface QuoteChannel extends FeatureItem {
  // Link built from the contact identity
  kind: 'whatsapp' | 'email'
}
