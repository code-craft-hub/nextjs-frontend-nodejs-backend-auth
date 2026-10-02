import type { LucideIcon } from 'lucide-react'
import {
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  Megaphone,
  SendHorizontal,
  UsersRound,
} from 'lucide-react'
import { avatarUrl } from './avatars'

export interface LandingUpdate {
  id: string
  eyebrow: string
  title: string
  detail: string
  icon: LucideIcon
  tintClass: string
  iconClass: string
  badge?: string
  companyLogo?: string
  companyLogos?: string[]
  avatarStack?: string[]
  artwork?: string
}

/**
 * Believable client-only activity used by the marketing hero. Tint classes are
 * categorical presentation metadata, following the same data-layer exception
 * as dashboard feed and job-card tints.
 */
export const LANDING_UPDATES: LandingUpdate[] = [
  {
    id: 'sponsored-jobs',
    eyebrow: 'Sponsored jobs',
    title: '3 visa-sponsored jobs fit you',
    detail: 'Senior product roles in Toronto, all 90%+ matches.',
    icon: BriefcaseBusiness,
    tintClass: 'bg-gradient-to-br from-blue-50 via-sky-50/80 to-indigo-100/55',
    iconClass: 'bg-blue-100 text-blue-700',
    badge: 'Found today',
    companyLogos: [
      '/job-assets/company-logos/atlas-health.png',
      '/job-assets/company-logos/brightline.png',
      '/job-assets/company-logos/kestrel.png',
    ],
    artwork: '/illustrations/briefcase.svg',
  },
  {
    id: 'networking-people',
    eyebrow: 'Networking',
    title: '5 people to network with',
    detail: 'Warm routes into three companies on your shortlist.',
    icon: UsersRound,
    tintClass: 'bg-gradient-to-br from-emerald-50 via-teal-50/80 to-green-100/55',
    iconClass: 'bg-emerald-100 text-emerald-700',
    badge: '5 matches',
    avatarStack: [
      avatarUrl('rene-wells'),
      avatarUrl('maxwell-tan'),
      avatarUrl('zahra-christensen'),
    ],
    artwork: '/illustrations/plane.svg',
  },
  {
    id: 'company-outreach',
    eyebrow: 'Company outreach',
    title: 'A company worth contacting',
    detail: 'Northwind Robotics · personalised cold email ready.',
    icon: SendHorizontal,
    tintClass: 'bg-gradient-to-br from-orange-50 via-amber-50/80 to-yellow-100/55',
    iconClass: 'bg-orange-100 text-orange-700',
    badge: 'Drafted',
    companyLogo: '/job-assets/company-logos/northwind-robotics.png',
    artwork: '/illustrations/post.svg',
  },
  {
    id: 'profile-views',
    eyebrow: 'Talent profile',
    title: '53 profile views this week',
    detail: '7 came from recruiters in your target market.',
    icon: Eye,
    tintClass: 'bg-gradient-to-br from-violet-50 via-purple-50/80 to-fuchsia-100/55',
    iconClass: 'bg-violet-100 text-violet-700',
    badge: '+31%',
    artwork: '/illustrations/chart.svg',
  },
  {
    id: 'linkedin-post',
    eyebrow: 'LinkedIn presence',
    title: 'Your LinkedIn post is ready',
    detail: 'Built from the strongest result in your recent work.',
    icon: Megaphone,
    tintClass: 'bg-gradient-to-br from-rose-50 via-pink-50/80 to-orange-100/55',
    iconClass: 'bg-rose-100 text-rose-700',
    badge: 'Drafted',
    artwork: '/illustrations/post.svg',
  },
  {
    id: 'networking-event',
    eyebrow: 'Local events',
    title: 'An event fits your goals',
    detail: 'Toronto Product Leaders · Thursday, 6:30 PM.',
    icon: CalendarDays,
    tintClass: 'bg-gradient-to-br from-cyan-50 via-sky-50/80 to-blue-100/55',
    iconClass: 'bg-cyan-100 text-cyan-700',
    badge: 'Near you',
    artwork: '/illustrations/plane.svg',
  },
]

/* -------------------------------------------------------------------------- */
/* Marketing page sections                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Aspirational employer logos for the hero trust strip. Expanded wordmarks
 * come from SVG Logos and are stored locally under `public/landing/` so the
 * prototype makes no runtime network calls. These are *target* employers, not
 * customers or partners — the strip copy must keep saying so.
 *
 * Prototype placeholder: swap for real, permissioned logos before launch.
 */
export interface TrustLogo {
  id: string
  src: string
  label: string
}

export const HERO_TRUST_LOGOS: TrustLogo[] = [
  { id: 'google', src: '/landing/employer-logos/google.svg', label: 'Google' },
  { id: 'meta', src: '/landing/employer-logos/meta.svg', label: 'Meta' },
  { id: 'nvidia', src: '/landing/employer-logos/nvidia.svg', label: 'NVIDIA' },
  { id: 'anthropic', src: '/landing/employer-logos/anthropic.svg', label: 'Anthropic' },
  { id: 'stripe', src: '/landing/employer-logos/stripe.svg', label: 'Stripe' },
  { id: 'airbnb', src: '/landing/employer-logos/airbnb.svg', label: 'Airbnb' },
  { id: 'cloudflare', src: '/landing/employer-logos/cloudflare.svg', label: 'Cloudflare' },
  { id: 'spotify', src: '/landing/employer-logos/spotify.svg', label: 'Spotify' },
  { id: 'hugging-face', src: '/landing/employer-logos/hugging-face.svg', label: 'Hugging Face' },
  { id: 'microsoft', src: '/landing/employer-logos/microsoft.svg', label: 'Microsoft' },
  { id: 'slack', src: '/landing/employer-logos/slack.svg', label: 'Slack' },
  { id: 'linkedin', src: '/landing/employer-logos/linkedin.svg', label: 'LinkedIn' },
]
