export default class ShopScene extends Phaser.Scene {
  constructor() { super('Shop'); }
  create() {
    const { width, height } = this.scale;
    this.add.text(width/2, 80, 'Shop', { fontSize: 32, color: '#eaf2ff' }).setOrigin(0.5);

    const items = [
      { id: 'coins_small', label: '100 Coins - $1.99' },
      { id: 'coins_medium', label: '300 Coins - $4.99' },
      { id: 'coins_large', label: '800 Coins - $9.99' },
      { id: 'skin_basic', label: 'Basic Skin - $0.99' },
      { id: 'donation', label: 'Donate - $2+' },
    ];

    const auth = this.game.registry.get('auth');

    items.forEach((it, i) => {
      const btn = this.add.text(width/2, 140 + i*48, it.label, { fontSize: 20, color: '#2f6feb' }).setOrigin(0.5).setInteractive();
      btn.on('pointerup', async () => {
        if (!auth?.user) { btn.setText('Login required'); return; }
        const payments = this.game.registry.get('payments');
        const amount = it.id === 'donation' ? 2.00 : undefined;
        await payments.openPayment(it.id, amount);
      });
    });

    const back = this.add.text(width/2, height - 80, 'Back', { fontSize: 24, color: '#eaf2ff' }).setOrigin(0.5).setInteractive();
    back.on('pointerup', () => this.scene.start('MainMenu'));
  }
}