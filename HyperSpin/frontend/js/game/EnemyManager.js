export class EnemyManager {
  constructor(scene) { this.scene = scene; }
  spawnWave(level, wave) {
    const baseCount = 3 + Math.floor(level / 10) + Math.floor(wave / 3);
    const count = Math.min(10 + Math.floor(level / 5), baseCount + Math.floor(Math.random() * 3));
    const speedBase = 60 + Math.min(240, level * 2 + wave * 5);
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(20, this.scene.scale.width - 20);
      const y = -Phaser.Math.Between(20, 200);
      const enemy = this.scene.enemies.create(x, y, 'enemy');
      enemy.setVelocity(0, Phaser.Math.Between(speedBase * 0.8, speedBase * 1.2));
    }
  }
}