import { Analytics } from '../analytics.js';
import { LevelManager } from './LevelManager.js';
import { EnemyManager } from './EnemyManager.js';
import { UpgradeManager } from './UpgradeManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  create() {
    const { width, height } = this.scale;
    this.levelManager = new LevelManager();
    this.upgrades = new UpgradeManager();

    this.level = 1;
    this.wave = 1;
    this.hp = 100;

    this.center = new Phaser.Math.Vector2(width/2, height*0.6);
    this.player = this.add.sprite(this.center.x, this.center.y, 'blade');
    this.player.setScale(1.2);

    this.rotationBase = 6;
    this.rotationSpeed = 0;
    this.input.on('pointerdown', () => { this.rotationSpeed = this.rotationBase * this.upgrades.getRotationSpeedMultiplier(); });
    this.input.on('pointerup', () => { this.rotationSpeed = 0; });

    this.enemies = this.physics.add.group();
    this.enemyManager = new EnemyManager(this);
    this.spawnCurrentWave();

    this.physics.add.overlap(this.player, this.enemies, (p, e) => {
      e.destroy();
      this.sound.play('hit');
    });

    this.hpText = this.add.text(12, 12, 'HP: 100', { fontSize: 20, color: '#eaf2ff' });
    this.levelText = this.add.text(12, 36, 'Lv 1 - W1', { fontSize: 18, color: '#7da7ff' });
    Analytics.levelStart(this.level);
  }
  spawnCurrentWave() {
    this.enemyManager.spawnWave(this.level, this.wave);
    this.waveClearCheck = this.time.addEvent({ delay: 500, loop: true, callback: () => this.checkWaveClear() });
  }
  checkWaveClear() {
    if (this.enemies.countActive(true) === 0) {
      this.waveClearCheck.remove();
      const nextWave = this.levelManager.nextWave(this.wave);
      if (nextWave === 1) {
        // Level complete
        Analytics.levelComplete(this.level);
        const api = window.HyperSpin;
        try { api?.mergeAndSyncSave?.(api.loadSave()); } catch (_) {}
        this.level = this.levelManager.nextLevel(this.level, this.wave);
        this.wave = 1;
        if (this.levelManager.isMilestone(this.level)) {
          this.upgrades.addPoints(1);
          this.scene.launch('Upgrades', { upgrades: this.upgrades });
        }
      } else {
        this.wave = nextWave;
      }
      this.levelText.setText(`Lv ${this.level} - W${this.wave}`);
      this.spawnCurrentWave();
    }
  }
  update(time, delta) {
    this.player.rotation += this.rotationSpeed * (delta/1000);
    this.enemies.getChildren().forEach((e) => { if (e.y > this.scale.height + 20) e.destroy(); });

    // Simulate damage with upgrade-based modifier
    if (Math.random() < 0.01 * this.upgrades.getDamageChanceModifier()) {
      this.hp = Math.max(0, this.hp - 1);
      this.hpText.setText(`HP: ${this.hp}`);
      if (this.hp <= 0) {
        this.scene.launch('Death', { level: this.level });
        this.scene.pause();
      }
    }
  }
}