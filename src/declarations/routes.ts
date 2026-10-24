import type { RouteDeclaration, SectionLinkDeclaration } from '@/types/navigation'

/**
 * Site routes
 * @type {Object}
 */

export const ROUTES = {
  home: { path: '/', icon: 'home' },
  booking: { path: '/booking', icon: 'calendar', ctaAction: 'bookAppointment' },
  showcase: { path: '/showcase', icon: 'sparkles', ctaAction: 'showcase' },
  contact: { path: '/contact', icon: 'mail', ctaAction: 'contact' },
  thankYou: { path: '/thank-you', icon: 'success', indexable: false },
  legalNotice: { path: '/legal-notice', icon: 'scale' },
  privacyPolicy: { path: '/privacy-policy', icon: 'shield' },
} as const satisfies Record<string, RouteDeclaration>

/**
 * Section anchors
 * @type {Object}
 */

export const SECTION_ANCHORS = {
  hero: 'hero',
  story: 'story',
  intro: 'intro',
  offers: 'offers',
  team: 'team',
  features: 'features',
  stats: 'stats',
  gallery: 'gallery',
  pricing: 'pricing',
  booking: 'booking',
  comparisons: 'comparisons',
  testimonials: 'testimonials',
  faq: 'faq',
  dialogue: 'dialogue',
  callToAction: 'call-to-action',
  catalog: 'catalog',
  group: 'group',
} as const

/**
/**
 * Landing title the navbar logo flies from
 * @type {string}
 */

export const HERO_LOGO_ATTRIBUTE = 'data-hero-logo'

 * Home section links
 * @type {Object}
 */

export const SECTION_LINKS = {
  catalog: { anchor: 'catalog', icon: 'tag' },
  offers: { anchor: 'offers', icon: 'globe' },
  features: { anchor: 'features', icon: 'shieldCheck' },
} as const satisfies Record<string, SectionLinkDeclaration>
