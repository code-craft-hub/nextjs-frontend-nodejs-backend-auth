import { MarketingHeader } from '@/components/landing/MarketingHeader'
import { TrustStrip } from '@/components/landing/TrustStrip'
import { SwipeCardDeck } from '@/components/landing/SwipeCardDeck'
import { WaitlistForm } from '@/components/landing/WaitlistForm'
import { WaitlistProvider } from '@/components/landing/WaitlistProvider'
import { cn } from '@/lib/utils'
import { LANDING_UPDATES, type LandingUpdate } from '@/data/landing'
import { Card, CardContent } from '@/components/ui/card'

function ProductUpdateCard({
  update,
}: {
  update: LandingUpdate
}) {
  const Icon = update.icon

  return (
    <Card
      className="landing-update-card relative h-60 w-full shrink-0 gap-0 overflow-hidden rounded-[1.6rem] border border-border/80 bg-card py-0 sm:h-64"
    >
      <CardContent className="flex h-full flex-col p-3 sm:p-3.5">
        <div className="flex min-h-9 items-center gap-2 px-1 pb-2.5">
          <div
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-md',
              update.iconClass,
            )}
          >
            <Icon className="size-3" strokeWidth={2.25} />
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {update.eyebrow}
          </span>
          {update.badge && (
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[0.68rem] font-medium text-foreground/70">
              {update.badge}
            </span>
          )}
        </div>

        <div
          className={cn(
            'relative flex min-h-0 flex-1 items-center overflow-hidden rounded-[1.2rem] border border-foreground/10 px-5 py-4 sm:px-6',
            update.tintClass,
          )}
        >
          {update.artwork && (
            <img
              src={update.artwork}
              alt=""
              className="pointer-events-none absolute top-3 right-3 size-20 rotate-2 object-contain opacity-35 sm:size-24"
            />
          )}

          <div className="relative z-10 min-w-0 max-w-[78%] text-left sm:max-w-[80%]">
            {(update.companyLogo || update.companyLogos || update.avatarStack) && (
              <div className="mb-3 flex min-h-10 items-center">
                {update.companyLogo && (
                  <img
                    src={update.companyLogo}
                    alt=""
                    className="size-10 shrink-0 rounded-xl bg-card object-cover p-1.5 ring-1 ring-foreground/10 sm:size-11"
                  />
                )}

                {update.companyLogos && (
                  <div className="flex -space-x-2">
                    {update.companyLogos.map((logo) => (
                      <img
                        key={logo}
                        src={logo}
                        alt=""
                        className="size-9 rounded-xl bg-card object-cover p-1 ring-2 ring-card sm:size-10"
                      />
                    ))}
                  </div>
                )}

                {update.avatarStack && (
                  <div className="flex -space-x-2">
                    {update.avatarStack.map((avatar) => (
                      <img
                        key={avatar}
                        src={avatar}
                        alt=""
                        className="size-9 rounded-full bg-card object-cover p-0.5 ring-2 ring-card sm:size-10"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-xl leading-[1.08] font-semibold tracking-tight text-foreground sm:text-[1.55rem]">
              {update.title}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-snug text-foreground/70 sm:text-[0.95rem]">
              {update.detail}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HeroSwipeDeck() {
  const cards = LANDING_UPDATES.map((update) => ({
    id: update.id,
    label: `${update.eyebrow}: ${update.title}. ${update.detail}`,
    content: <ProductUpdateCard update={update} />,
  }))

  return (
    <SwipeCardDeck
      items={cards}
      ariaLabel="What Cver works on for you"
    />
  )
}

function LandingHero() {
  return (
    <main
      id="home"
      className="landing-hero relative isolate flex min-h-svh flex-col overflow-hidden bg-background"
    >
      <img
        src="/landing/global-career-sky.png"
        alt=""
        className="landing-landscape pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-[clamp(34rem,74vh,48rem)] w-full object-cover object-bottom"
      />

      <MarketingHeader />

      <section className="relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-5 pt-10 pb-7 text-center sm:px-6 sm:pt-12 sm:pb-9 lg:pt-20">
        <h1 className="landing-hero-title max-w-6xl font-display text-[clamp(2.25rem,4.5vw,3.65rem)] leading-[0.98] font-normal tracking-tight text-balance">
          <span className="block font-semibold text-foreground">
            Skilled immigrants
          </span>
          <span className="block text-primary">
            should not have to start over.
          </span>
        </h1>

        <div className="landing-hero-copy relative z-30 mt-5 flex w-full max-w-2xl flex-col items-center text-center lg:max-w-4xl">
          <p className="max-w-xl text-[clamp(1rem,1.25vw,1.125rem)] leading-relaxed text-muted-foreground text-balance lg:max-w-none lg:whitespace-nowrap">
            Find local roles, build the right connections, and get seen by recruiters in your new country.
          </p>
          <WaitlistForm className="mt-6" />
        </div>

        <section className="relative z-20 mt-10 w-full sm:mt-12">
          <div className="landing-deck-viewport">
            <HeroSwipeDeck />
          </div>
        </section>
      </section>

    </main>
  )
}

export default function LandingPage() {
  return (
    <div className="relative overflow-x-clip bg-background font-marketing">
      {/* The header CTA and the hero form submit the same signup. */}
      <WaitlistProvider>
        <LandingHero />
      </WaitlistProvider>

      <div className="relative z-10 bg-background pt-20 pb-14 sm:pt-24 sm:pb-16">
        <img
          src="/landing/global-career-cloud-bridge.png"
          alt=""
          aria-hidden="true"
          className="landing-cloud-bridge pointer-events-none absolute inset-x-0 -top-20 z-0 h-52 w-full object-fill sm:-top-24 sm:h-60"
        />
        <div className="relative z-10">
          <TrustStrip />
        </div>
      </div>
    </div>
  )
}
