export default class UpgradesScene extends Phaser.Scene {
  constructor() { super('Upgrades'); }
  create() {
    const { width, height } = this.scale;
    this.add.text(width/2, 80, 'Upgrades', { fontSize: 32, color: '#eaf2ff' }).setOrigin(0.5);
    const back = this.add.text(width/2, height - 80, 'Back', { fontSize: 24, color: '#2f6feb' }).setOrigin(0.5).setInteractive();
    back.on('pointerup', () => this.scene.start('MainMenu'));
  }
}