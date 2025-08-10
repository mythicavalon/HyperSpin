export const Analytics = {
  provider: (typeof window !== 'undefined' && window.ANALYTICS_PROVIDER) || 'none',
  event(name, params = {}) {
    if (this.provider === 'ga4' && window.gtag) {
      window.gtag('event', name, params);
    } else if (this.provider === 'plausible' && window.plausible) {
      window.plausible(name, { props: params });
    } else {
      // fallback debug
      // console.log('[Analytics]', name, params);
    }
  },
  levelStart(level) { this.event('level_start', { level }); },
  levelComplete(level) { this.event('level_complete', { level }); },
  reviveAttempt(level) { this.event('revive_attempt', { level }); },
  purchaseInitiated(itemID) { this.event('purchase_initiated', { itemID }); },
  purchaseCompleted(itemID) { this.event('purchase_completed', { itemID }); },
};