export class LevelManager {
  constructor() {
    this.maxLevels = 2222;
    this.maxWaves = 22;
  }
  isMilestone(level) { return level % 111 === 0; }
  nextWave(current) { return current < this.maxWaves ? current + 1 : 1; }
  nextLevel(level, wave) { return wave >= this.maxWaves ? Math.min(this.maxLevels, level + 1) : level; }
  getParams(level, wave) {
    return {
      enemyMultiplier: 1 + level * 0.02 + wave * 0.03,
      speedMultiplier: 1 + level * 0.01 + wave * 0.02,
      reward: 1 + Math.floor(level / 5),
    };
  }
}