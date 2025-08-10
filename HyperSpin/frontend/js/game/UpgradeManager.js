export class UpgradeManager {
  constructor() {
    this.points = 0;
    this.levelUpgrades = { speed: 0, armor: 0 };
  }
  addPoints(n) { this.points += n; }
  applyUpgrade(type) {
    if (this.points <= 0) return false;
    if (!this.levelUpgrades[type] && this.levelUpgrades[type] !== 0) return false;
    this.levelUpgrades[type] += 1;
    this.points -= 1;
    return true;
  }
  getRotationSpeedMultiplier() { return 1 + this.levelUpgrades.speed * 0.15; }
  getDamageChanceModifier() { return Math.max(0.1, 1 - this.levelUpgrades.armor * 0.1); }
}