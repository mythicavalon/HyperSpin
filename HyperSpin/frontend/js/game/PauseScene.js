export default class PauseScene extends Phaser.Scene {
  constructor() { super('Pause'); }
  create() {
    const { width, height } = this.scale;
    const bg = this.add.rectangle(0,0,width,height,0x000000,0.5).setOrigin(0);
    const resume = this.add.text(width/2, height/2, 'Resume', { fontSize: 32, color: '#eaf2ff' }).setOrigin(0.5).setInteractive();
    resume.on('pointerup', () => this.scene.stop());
  }
}