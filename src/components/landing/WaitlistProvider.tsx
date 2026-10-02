'use client'

import { createContext, use, useActionState, type ReactNode } from 'react'
import { joinWaitlist, type WaitlistState } from '@/lib/waitlist'

/** The hero form's id — the header CTA submits it through `form="…"`. */
export const WAITLIST_FORM_ID = 'waitlist-form'

const INITIAL_STATE: WaitlistState = { status: 'idle' }

interface WaitlistContextValue {
  state: WaitlistState
  formAction: (formData: FormData) => void
  isPending: boolean
}

const WaitlistContext = createContext<WaitlistContextValue | null>(null)

/**
 * One signup shared by both waitlist CTAs — the hero form and the header
 * button that submits it — so they show the same pending, error and success
 * state.
 */
export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [state, formAction, isPending] = useActionState(
    joinWaitlist,
    INITIAL_STATE,
  )

  return (
    <WaitlistContext value={{ state, formAction, isPending }}>
      {children}
    </WaitlistContext>
  )
}

export function useWaitlist() {
  const context = use(WaitlistContext)
  if (!context) {
    throw new Error('useWaitlist must be used inside <WaitlistProvider>')
  }
  return context
}
