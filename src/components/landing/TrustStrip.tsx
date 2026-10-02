import { HERO_TRUST_LOGOS } from '@/data/landing'

/**
 * Expanded employer wordmarks sourced from SVG Logos and hosted locally. CSS
 * keeps them monochrome at rest, then restores the original SVG colours on
 * hover without duplicating the assets.
 */
function LogoRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16"
    >
      {HERO_TRUST_LOGOS.map((logo) => (
        <li
          key={logo.id}
          className="group/logo flex h-9 w-36 shrink-0 items-center justify-center"
          title={ariaHidden ? undefined : logo.label}
        >
          <img
            src={logo.src}
            alt={ariaHidden ? '' : logo.label}
            className="max-h-7 w-full max-w-32 object-contain opacity-40 grayscale transition-[filter,opacity,transform] duration-300 group-hover/logo:scale-[1.03] group-hover/logo:opacity-100 group-hover/logo:grayscale-0"
          />
        </li>
      ))}
    </ul>
  )
}

/**
 * Aspirational employer strip. The caption matters: these are the employers
 * members are aiming at, not customers or partners of Cver AI.
 */
export function TrustStrip() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-6">
      <p className="text-center text-sm text-muted-foreground">
        Employers our members are aiming for
      </p>

      <div className="landing-marquee-mask mt-7 flex overflow-hidden">
        <div className="landing-marquee flex w-max items-center">
          <LogoRow />
          <LogoRow ariaHidden />
        </div>
      </div>
    </div>
  )
}
