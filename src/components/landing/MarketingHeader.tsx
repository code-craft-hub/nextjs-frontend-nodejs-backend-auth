import Link from 'next/link'
import { JoinWaitlistButton } from '@/components/landing/JoinWaitlistButton'

/**
 * The marketing header. While Cver AI is waitlist-only it carries just the
 * logo and the waitlist CTA — no section nav, so no mobile menu either, and
 * the CTA shows at every breakpoint. Render it inside `WaitlistProvider`.
 */
export function MarketingHeader() {
  return (
    <header className="relative z-40 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6">
      <div className="flex h-14 items-center justify-between gap-4 px-3">
        <Link
          href="/"
          aria-label="Cver AI home"
          className="flex w-fit items-center pl-2"
        >
          <img src="/cver-logo.png" alt="Cver AI" className="w-20" />
        </Link>

        <JoinWaitlistButton />
      </div>
    </header>
  )
}
