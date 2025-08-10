export default class UIScene extends Phaser.Scene {
  constructor() { super('UI'); }
  create() {
    const pauseBtn = this.add.text(this.scale.width - 60, 20, 'II', { fontSize: 24, color: '#eaf2ff' }).setInteractive();
    pauseBtn.on('pointerup', () => this.scene.launch('Pause'));
  }
}