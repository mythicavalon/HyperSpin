export default class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenu'); }
  create() {
    const { width, height } = this.scale;
    this.add.text(width/2, height*0.25, 'HyperSpin', { fontSize: 48, color: '#eaf2ff' }).setOrigin(0.5);

    const start = this.add.text(width/2, height*0.45, 'Start', { fontSize: 32, color: '#2f6feb' }).setOrigin(0.5).setInteractive();
    start.on('pointerup', () => this.scene.start('Game'));

    const login = this.add.text(width/2, height*0.55, 'Login with Facebook', { fontSize: 22, color: '#eaf2ff' }).setOrigin(0.5).setInteractive();
    login.on('pointerup', async () => {
      const ok = await window.HyperSpin.loginWithFacebook();
      login.setText(ok ? 'Logged in' : 'Login failed');
    });

    const shop = this.add.text(width/2, height*0.65, 'Shop', { fontSize: 22, color: '#eaf2ff' }).setOrigin(0.5).setInteractive();
    shop.on('pointerup', () => this.scene.start('Shop'));

    const lb = this.add.text(width/2, height*0.75, 'Leaderboard', { fontSize: 22, color: '#eaf2ff' }).setOrigin(0.5).setInteractive();
    lb.on('pointerup', () => this.scene.start('Leaderboard'));
  }
}