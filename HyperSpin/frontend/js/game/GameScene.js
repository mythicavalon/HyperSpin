import { Analytics } from '../analytics.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  create() {
    const { width, height } = this.scale;
    this.level = 1;
    this.wave = 1;
    this.hp = 100;

    this.center = new Phaser.Math.Vector2(width/2, height*0.6);
    this.player = this.add.sprite(this.center.x, this.center.y, 'blade');
    this.player.setScale(1.2);

    this.rotationSpeed = 0;
    this.input.on('pointerdown', (p) => { this.rotationSpeed = 6; });
    this.input.on('pointerup', (p) => { this.rotationSpeed = 0; });

    this.enemies = this.physics.add.group();
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.spawnEnemy() });

    this.physics.add.overlap(this.player, this.enemies, (p, e) => {
      e.destroy();
      this.sound.play('hit');
    });

    this.hpText = this.add.text(12, 12, 'HP: 100', { fontSize: 20, color: '#eaf2ff' });
    Analytics.levelStart(this.level);
  }
  spawnEnemy() {
    const x = Phaser.Math.Between(20, this.scale.width - 20);
    const y = -20;
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocity(0, Phaser.Math.Between(60, 120));
  }
  update(time, delta) {
    this.player.rotation += this.rotationSpeed * (delta/1000);
    this.enemies.getChildren().forEach((e) => {
      if (e.y > this.scale.height + 20) e.destroy();
    });

    // Simulate damage
    if (Math.random() < 0.01) {
      this.hp = Math.max(0, this.hp - 1);
      this.hpText.setText(`HP: ${this.hp}`);
      if (this.hp <= 0) {
        this.scene.launch('Death', { level: this.level });
        this.scene.pause();
      }
    }
  }
}