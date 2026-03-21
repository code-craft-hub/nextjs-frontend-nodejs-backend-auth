'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureUtm } from '@/lib/analytics';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-CDMCYEXE2W';

export default function GoogleAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Capture UTM params once on first load
  useEffect(() => {
    captureUtm();
  }, []);

  // Track SPA page views on route change via gtag (already loaded by layout.tsx Script)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const search = window.location.search;
    window.gtag('event', 'page_view', {
      page_path: pathname + search,
      page_title: document.title,
      send_to: GA_ID,
    });
  }, [pathname]);

  return <>{children}</>;
}
