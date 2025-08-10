export const Analytics = {
  event(name, params = {}) {
    console.log('[Analytics]', name, params);
    // TODO: integrate GA or Plausible
  },
  levelStart(level) { this.event('level_start', { level }); },
  levelComplete(level) { this.event('level_complete', { level }); },
  reviveAttempt(level) { this.event('revive_attempt', { level }); },
  purchaseInitiated(itemID) { this.event('purchase_initiated', { itemID }); },
  purchaseCompleted(itemID) { this.event('purchase_completed', { itemID }); },
};