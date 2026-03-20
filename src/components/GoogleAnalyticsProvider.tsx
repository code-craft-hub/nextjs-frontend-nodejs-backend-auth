'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initGA, logPageView, captureUtm } from '@/lib/analytics';

export default function GoogleAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Initialize GA and capture UTM params once on mount
  useEffect(() => {
    initGA();
    captureUtm();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!pathname) return;

    // Read query string directly from window.location
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const url = pathname + search;

    logPageView(url, document.title);
  }, [pathname]);

  return <>{children}</>;
}
