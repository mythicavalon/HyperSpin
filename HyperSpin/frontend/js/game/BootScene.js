export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    // Generate simple textures
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Blade: cyan circle
    g.fillStyle(0x2f6feb, 1);
    g.fillCircle(32, 32, 28);
    g.generateTexture('blade', 64, 64);
    g.clear();
    // Enemy: magenta square
    g.fillStyle(0xeb4d2f, 1);
    g.fillRect(0, 0, 48, 48);
    g.generateTexture('enemy', 48, 48);

    this.load.audio('hit', 'https://cdn.jsdelivr.net/gh/matthias-research/pages@master/tennis/sounds/hit.wav');
  }
  create() {
    this.scene.start('MainMenu');
  }
}