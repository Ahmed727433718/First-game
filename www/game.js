const W = 941, H = 1672; // مقاس صورة الخلفية

class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }

  preload() {
    this.load.image('bg', 'assets/background.jpg');
  }

  create() {
    const sw = this.scale.width, sh = this.scale.height;

    // الخلفية: تغطي الشاشة كلها
    this.bg = this.add.image(sw / 2, sh / 2, 'bg');
    this.bg.setScale(Math.max(sw / W, sh / H));
    const s = this.bg.scaleX;
    const left = sw / 2 - (W * s) / 2;
    const top = sh / 2 - (H * s) / 2;
    const px = (x) => left + x * s;
    const py = (y) => top + y * s;

    // نسخة صغيرة نرسم فيها جزيئات (نقطة بيضاء)
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('dot', 4, 4);
    g.destroy();

    // توهج المصابيح الثلاث (حسب إحداثيات الصورة)
    const lamps = [[108, 130], [467, 130], [830, 130]];
    lamps.forEach(([lx, ly], i) => {
      const glow = this.add.circle(px(lx), py(ly), 70 * s, 0xffb347, 0.25)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.15, to: 0.4 },
        scale: { from: 0.9, to: 1.15 },
        duration: 1200 + i * 250,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // غبار يطفو
    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: sw },
      y: { min: 0, max: sh },
      lifespan: 6000,
      speedY: { min: -20, max: -5 },
      speedX: { min: -8, max: 8 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.5, end: 0 },
      frequency: 150,
      tint: 0xcfe9ff
    });

    // شرر برتقالي من الأنابيب (يمين)
    this.add.particles(px(900), py(520), 'dot', {
      lifespan: 900,
      speed: { min: 30, max: 90 },
      angle: { min: 200, max: 340 },
      gravityY: 150,
      scale: { start: 1, end: 0 },
      frequency: 700,
      tint: 0xf58a1f,
      blendMode: 'ADD'
    });

    // العنوان
    const title = this.add.text(sw / 2, sh * 0.3, 'CUBE\nFACTORY', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: Math.floor(sw * 0.16) + 'px',
      color: '#f58a1f',
      align: 'center',
      stroke: '#0b0f1a',
      strokeThickness: 10
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.06 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // زر Play
    this.makeButton(sw / 2, sh * 0.58, sw * 0.6, 90, 'PLAY', 0xf58a1f, () => {
      this.cameras.main.flash(250, 255, 255, 255);
    });

    // زر الإعدادات
    this.makeButton(sw / 2, sh * 0.58 + 120, sw * 0.6, 70, 'SETTINGS', 0x3a4a6b, () => {
      this.cameras.main.shake(150, 0.004);
    });
  }

  makeButton(x, y, w, h, label, color, onClick) {
    const box = this.add.rectangle(0, 0, w, h, color)
      .setStrokeStyle(5, 0x0b0f1a);
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: Math.floor(h * 0.45) + 'px',
      color: '#ffffff',
      stroke: '#0b0f1a',
      strokeThickness: 5
    }).setOrigin(0.5);
    const c = this.add.container(x, y, [box, txt]);
    c.setSize(w, h).setInteractive();

    c.on('pointerdown', () => {
      this.tweens.add({ targets: c, scale: 0.94, duration: 80, yoyo: true });
      onClick();
    });
    return c;
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#1b1f2a',
  pixelArt: true,
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  scene: [MenuScene]
});
