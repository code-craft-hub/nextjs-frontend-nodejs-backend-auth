'use client'

import { ArrowRight } from 'lucide-react'
import {
  WAITLIST_ID,
  WAITLIST_NAME_INPUT_ID,
} from '@/components/landing/WaitlistForm'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * The marketing header CTA — a white pill wrapped in the animated For-you
 * aurora ring. It jumps to the hero's waitlist form and puts the cursor in the
 * first field; without JS it is a plain `#waitlist` anchor.
 */
export function JoinWaitlistLink({ className }: { className?: string }) {
  return (
    <div className={cn('relative inline-flex h-10 shrink-0', className)}>
      <span
        aria-hidden="true"
        className="live-feed-ring live-feed-ring-glow pointer-events-none absolute -inset-0.5 rounded-[0.875rem]"
      />
      <span
        aria-hidden="true"
        className="live-feed-ring pointer-events-none absolute -inset-0.5 rounded-[0.875rem]"
      />
      <a
        href={`#${WAITLIST_ID}`}
        onClick={(event) => {
          const nameInput = document.getElementById(WAITLIST_NAME_INPUT_ID)
          // After signing up the form is gone, so let the anchor scroll to
          // the confirmation instead.
          if (!nameInput) return
          event.preventDefault()
          nameInput.focus()
        }}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'relative h-10 w-full rounded-xl border-transparent bg-card px-4 font-bold text-foreground shadow-none! drop-shadow-none hover:bg-card hover:text-foreground',
        )}
      >
        Join waitlist
        <ArrowRight data-icon="inline-end" />
      </a>
    </div>
  )
}
