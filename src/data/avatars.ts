/**
 * Portrait avatars for the mock people on the landing page.
 *
 * Source: the free Untitled UI avatar collection
 * (https://www.untitledui.com/resources/avatars), downloaded once into
 * `public/avatars/` as 320×320 WebP — no runtime network calls.
 *
 * A person keeps the same face everywhere they appear, so reference them
 * through `avatarUrl()` rather than inlining paths. Add a slug here when you
 * bundle a new file.
 */

/** Every avatar bundled in `public/avatars/` — the file name without extension. */
export const AVATAR_SLUGS = [
  'maxwell-tan',
  'rene-wells',
  'zahra-christensen',
] as const

export type AvatarSlug = (typeof AVATAR_SLUGS)[number]

/** Public URL for a bundled avatar. Typos fail typecheck, not at runtime. */
export function avatarUrl(slug: AvatarSlug): string {
  return `/avatars/${slug}.webp`
}
