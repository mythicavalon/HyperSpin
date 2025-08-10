export class LevelManager {
  constructor() { this.maxLevels = 2222; this.maxWaves = 22; }
  isMilestone(level) { return level % 111 === 0; }
}