class GameScene extends Phaser.Scene {
  constructor() { super('game'); }

  create() {
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'شاشة اللعب (قريباً)', {
      fontSize: '28px', color: '#ffffff'
    }).setOrigin(0.5);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: 'rgba(0,0,0,0)',
  pixelArt: true,
  scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
  scene: [MenuScene, GameScene]
});
