import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsScreenTracker() {
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Track page view
    trackEvent('page_view', {
      path: pathname,
      timestamp: new Date().toISOString()
    });
  }, [pathname]);

  return null;
} 