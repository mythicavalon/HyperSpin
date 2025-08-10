export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    // Placeholder assets
    this.load.image('blade', 'https://dummyimage.com/64x64/2f6feb/ffffff.png&text=B');
    this.load.image('enemy', 'https://dummyimage.com/48x48/eb4d2f/ffffff.png&text=E');
    this.load.audio('hit', 'https://cdn.jsdelivr.net/gh/matthias-research/pages@master/tennis/sounds/hit.wav');
  }
  create() {
    this.scene.start('MainMenu');
  }
}