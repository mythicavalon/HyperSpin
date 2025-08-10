export default class DeathScene extends Phaser.Scene {
  constructor() { super('Death'); }
  init(data) { this.level = data.level || 1; }
  create() {
    const { width, height } = this.scale;
    const panel = this.add.rectangle(width/2, height/2, Math.min(420, width*0.9), 220, 0x121826).setStrokeStyle(2, 0x20304d);
    this.add.text(width/2, height/2 - 60, 'You Died', { fontSize: 28, color: '#eaf2ff' }).setOrigin(0.5);

    let remaining = 8;
    const timerText = this.add.text(width/2, height/2 - 20, `Revive in ${remaining}s`, { fontSize: 18, color: '#eaf2ff' }).setOrigin(0.5);
    const reviveBtn = this.add.text(width/2, height/2 + 30, 'Revive (0.99)', { fontSize: 22, color: '#2f6feb' }).setOrigin(0.5).setInteractive();

    const t = this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      remaining--; timerText.setText(`Revive in ${remaining}s`);
      if (remaining <= 0) { t.remove(); this.restartLevel(); }
    }});

    reviveBtn.on('pointerup', async () => {
      reviveBtn.disableInteractive();
      const auth = this.game.registry.get('auth');
      if (!auth?.user) { reviveBtn.setText('Login required'); return; }
      const payments = this.game.registry.get('payments');
      window.HyperSpin.Analytics.reviveAttempt(this.level);
      const result = await payments.openPayment('revive');
      if (result.type === 'purchase_completed') {
        t.remove();
        this.scene.stop();
        this.scene.get('Game').hp = 100;
        this.scene.resume('Game');
      } else {
        reviveBtn.setText('Try again');
        reviveBtn.setInteractive();
      }
    });
  }
  restartLevel() {
    this.scene.stop('Game');
    this.scene.stop();
    this.scene.start('Game');
  }
}