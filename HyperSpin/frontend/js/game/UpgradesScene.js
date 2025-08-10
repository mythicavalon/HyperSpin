export default class UpgradesScene extends Phaser.Scene {
  constructor() { super('Upgrades'); }
  init(data) { this.upgrades = data.upgrades; }
  create() {
    const { width, height } = this.scale;
    this.add.text(width/2, 80, 'Upgrades', { fontSize: 32, color: '#eaf2ff' }).setOrigin(0.5);

    const pts = this.add.text(width/2, 120, `Points: ${this.upgrades.points}`, { fontSize: 20, color: '#7da7ff' }).setOrigin(0.5);

    const speedBtn = this.add.text(width/2, 170, 'Increase Speed', { fontSize: 22, color: '#2f6feb' }).setOrigin(0.5).setInteractive();
    const armorBtn = this.add.text(width/2, 210, 'Increase Armor', { fontSize: 22, color: '#2f6feb' }).setOrigin(0.5).setInteractive();

    speedBtn.on('pointerup', () => {
      if (this.upgrades.applyUpgrade('speed')) pts.setText(`Points: ${this.upgrades.points}`);
    });
    armorBtn.on('pointerup', () => {
      if (this.upgrades.applyUpgrade('armor')) pts.setText(`Points: ${this.upgrades.points}`);
    });

    const back = this.add.text(width/2, height - 80, 'Back', { fontSize: 24, color: '#2f6feb' }).setOrigin(0.5).setInteractive();
    back.on('pointerup', () => this.scene.stop());
  }
}