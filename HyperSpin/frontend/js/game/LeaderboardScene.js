export default class LeaderboardScene extends Phaser.Scene {
  constructor() { super('Leaderboard'); }
  async create() {
    const { width, height } = this.scale;
    this.add.text(width/2, 80, 'Friends Leaderboard', { fontSize: 28, color: '#eaf2ff' }).setOrigin(0.5);
    const auth = this.game.registry.get('auth');
    if (!auth?.user) {
      this.add.text(width/2, height/2, 'Login to see friends leaderboard', { fontSize: 20, color: '#eaf2ff' }).setOrigin(0.5);
      return;
    }
    const res = await fetch(`/api/leaderboard/friends`, { headers: { Authorization: `Bearer ${auth.jwt}` } });
    const data = await res.json();
    if (Array.isArray(data)) {
      data.slice(0, 10).forEach((row, i) => {
        this.add.text(40, 140 + i*30, `${i+1}. ${row.displayName} - Lv ${row.level}`, { fontSize: 18, color: '#eaf2ff' });
      });
    } else {
      this.add.text(width/2, height/2, 'Failed to load leaderboard', { fontSize: 18, color: '#ff8080' }).setOrigin(0.5);
    }
    const back = this.add.text(width/2, height - 80, 'Back', { fontSize: 24, color: '#2f6feb' }).setOrigin(0.5).setInteractive();
    back.on('pointerup', () => this.scene.start('MainMenu'));
  }
}