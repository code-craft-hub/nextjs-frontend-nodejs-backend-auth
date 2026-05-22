import { Providers } from "@/shared/providers/query-provider";
import { PostHogProvider } from "@/shared/providers/posthog-provider";
import "./globals.css";
import {
  EB_Garamond,
  Epilogue,
  Instrument_Sans,
  Inter,
  Merriweather,
  Outfit,
  Plus_Jakarta_Sans,
  Poppins,
  Roboto,
  Geist,
} from "next/font/google";
import { Metadata } from "next";
import Script from "next/script";

// Primary font — preloaded (used in landing page headings and body)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Secondary fonts — preload: false prevents 9 extra font <link> tags from
// competing with the primary font and critical images on initial page load.
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  display: "swap",
  preload: false,
});
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
  preload: false,
});
const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  display: "swap",
  preload: false,
});
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  preload: false,
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
  display: "swap",
  preload: false,
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: false,
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  preload: false,
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cverai.com"),
  title: {
    default: "Cver AI - Never Miss a Job Again",
    template: "%s | Cver AI",
  },
  description:
    "AI-powered job search platform. Auto-apply to jobs, tailor your resume and cover letter, and prepare for interviews — all in one place.",
  openGraph: {
    type: "website",
    siteName: "Cver AI",
    title: "Cver AI - Never Miss a Job Again",
    description:
      "AI-powered job search platform. Auto-apply to jobs, tailor your resume and cover letter, and prepare for interviews — all in one place.",
    images: [{ url: "/assets/images/dashboard.png", width: 1200, height: 630, alt: "Cver AI Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cver AI - Never Miss a Job Again",
    description:
      "AI-powered job search platform. Auto-apply to jobs, tailor your resume and cover letter, and prepare for interviews — all in one place.",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_MEASUREMENT_ID =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-CDMCYEXE2W";

  return (
    <html
      lang="en"
      className={`
      ${ebGaramond.variable}
      ${epilogue.variable}
      ${instrumentSans.variable}
      ${inter.variable}
      ${merriweather.variable}
      ${outfit.variable}
      ${plusJakartaSans.variable}
      ${poppins.variable}
      ${roboto.variable}
      ${geist.variable}
    `}
      suppressHydrationWarning={true}
    >
      <head>
        {/* Firebase Auth — used on login/register/dashboard routes */}
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
        {/* YouTube — embedded in VideoModal on the landing page */}
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        {/* PostHog analytics — routed through /ingest but assets load from CDN */}
        <link rel="dns-prefetch" href="https://us-assets.i.posthog.com" />
      </head>
      <body>
        {/* Google Analytics — lazyOnload defers until page is idle */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <PostHogProvider>
          <Providers>{children}</Providers>
        </PostHogProvider>
      </body>

      <Script
        id="crisp-chat"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.$crisp = [];
              window.CRISP_WEBSITE_ID = "e4f34063-228f-4ae1-8f14-ce9a5b7d4a1d";
              (function() {
                var d = document;
                var s = d.createElement("script");
                s.src = "https://client.crisp.chat/l.js";
                s.async = 1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
            `,
        }}
      />
    </html>
  );
}
