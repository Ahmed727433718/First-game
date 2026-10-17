/* ===========================================================
   CUBE FACTORY — الشاشة الرئيسية (MenuScene)
   المتطلبات: Phaser 3.60 أو أحدث + صورة الخلفية محمّلة بالمفتاح 'bg'
   لا يحتاج أي ملفات إضافية: كل الرسومات (توهج، مكعبات، أزرار) تُولَّد بالكود.
   =========================================================== */

const MENU_CFG = {
  // ── ربط المشاهد (غيّرها لتطابق مشروعك) ──
  sceneKey: 'menu',        // مفتاح هذا المشهد (خليه نفس المفتاح القديم عندك)
  gameSceneKey: 'game',    // مشهد اللعب الذي يبدأ عند الضغط على PLAY
  bgKey: 'bg',             // مفتاح صورة الخلفية
  bgW: 941, bgH: 1672,     // مقاس صورة الخلفية الأصلي

  // ── الهوية ──
  title: ['CUBE', 'FACTORY'],
  version: 'v1.0.0',
  font: '"Lilita One", "Bungee", Impact, "Arial Black", sans-serif',
  accent: 0xf58a1f,        // البرتقالي الرئيسي
  ink: 0x0b0f1a,           // لون الحدود الداكنة

  // ── أماكن العناصر على صورة الخلفية الأصلية ──
  lamps: [[108, 130], [467, 130], [830, 130]],
  sparkPoint: [900, 520],

  // ── التأثيرات (0 أو false = إيقاف) ──
  floatingCubes: 7,
  lightCones: true,

  // ── الصوت (اختياري: يشتغل فقط إذا الملفات محمّلة بهالأسماء) ──
  musicKey: 'menu_music',
  clickKey: 'click'
};

const MENU_SETTINGS_KEY = 'cubefactory_settings_v1';

function menuLoadSettings() {
  const s = { music: true, sound: true, vibration: true };
  try { Object.assign(s, JSON.parse(localStorage.getItem(MENU_SETTINGS_KEY) || '{}')); } catch (e) {}
  return s;
}
function menuSaveSettings(s) {
  try { localStorage.setItem(MENU_SETTINGS_KEY, JSON.stringify(s)); } catch (e) {}
}
// f سالب = أغمق، f موجب = أفتح
function menuShade(hex, f) {
  let r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return (r << 16) | (g << 8) | b;
}

class MenuScene extends Phaser.Scene {
  constructor() { super(MENU_CFG.sceneKey); }
  preload() {
    this.load.image(MENU_CFG.bgKey, 'assets/background.jpg');
     }

  /* ───────────────────────── البناء الرئيسي ───────────────────────── */
  create() {
    const cam = this.cameras.main;
    this.sw = this.scale.width;
    this.sh = this.scale.height;
    // معامل تكبير الواجهة حسب حجم الشاشة (540×960 هو المقاس المرجعي)
    this.ui = Phaser.Math.Clamp(Math.min(this.sw / 540, this.sh / 960), 0.6, 2.2);
    this.settings = menuLoadSettings();
    this.game.registry.set('settings', this.settings); // باقي اللعبة تقدر تقرأها من هنا
    this.ready = false;
    this.busy = false;
    this.panelOpen = false;

    // دخول سينمائي: ظهور تدريجي + تقريب خفيف
    cam.setBackgroundColor(MENU_CFG.ink);
    cam.fadeIn(700, 0, 0, 0);
    cam.setZoom(1.1);
    this.zoomIn = this.tweens.add({ targets: cam, zoom: 1, duration: 1700, ease: 'Cubic.easeOut' });

    this.makeTextures();
    this.buildBackground();
    this.buildLamps();
    this.buildDust();
    this.buildCubes();
    this.buildSparks();
    this.buildVignette();
    this.buildTitle();
    this.buildButtons();
    this.buildFooter();
    this.setupAudio();
    this.setupResize();

    // بعد انتهاء الحركة الافتتاحية تُفتح الأزرار وتبدأ نبضة PLAY
    this.time.delayedCall(1300, () => {
      this.ready = true;
      this.tweens.add({
        targets: this.playBtn, scale: { from: 1, to: 1.035 },
        duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    });
  }

  /* ───────────────────────── الخامات المولَّدة بالكود ───────────────────────── */
  canvasTex(key, w, h, draw) {
    if (this.textures.exists(key)) this.textures.remove(key);
    const tex = this.textures.createCanvas(key, w, h);
    draw(tex.getContext(), w, h);
    tex.refresh();
  }

  makeTextures() {
    // نقطة بيضاء للجزيئات (نفس اسمك القديم 'dot')
    if (!this.textures.exists('dot')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 4, 4);
      g.generateTexture('dot', 4, 4);
      g.destroy();
    }

    // توهج دائري ناعم (يتلوّن بـ setTint)
    this.canvasTex('mn_glow', 256, 256, (ctx) => {
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
      g.addColorStop(0.6, 'rgba(255,255,255,0.14)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    });

    // مخروط ضوء ينزل من المصباح
    this.canvasTex('mn_cone', 256, 512, (ctx) => {
      ctx.beginPath();
      ctx.moveTo(108, 0); ctx.lineTo(148, 0); ctx.lineTo(256, 512); ctx.lineTo(0, 512);
      ctx.closePath();
      const v = ctx.createLinearGradient(0, 0, 0, 512);
      v.addColorStop(0, 'rgba(255,255,255,0.9)');
      v.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = v;
      ctx.fill();
      // تنعيم الحواف الجانبية
      ctx.globalCompositeOperation = 'destination-in';
      const h = ctx.createLinearGradient(0, 0, 256, 0);
      h.addColorStop(0, 'rgba(255,255,255,0)');
      h.addColorStop(0.5, 'rgba(255,255,255,1)');
      h.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = h;
      ctx.fillRect(0, 0, 256, 512);
    });

    // نجمة لمعان رباعية
    this.canvasTex('mn_star', 128, 128, (ctx) => {
      ctx.translate(64, 64);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -62);
      ctx.quadraticCurveTo(4, -4, 62, 0);
      ctx.quadraticCurveTo(4, 4, 0, 62);
      ctx.quadraticCurveTo(-4, 4, -62, 0);
      ctx.quadraticCurveTo(-4, -4, 0, -62);
      ctx.fill();
    });

    // مكعبات أيزومترية بأربعة ألوان
    const P = (x, y) => ({ x, y });
    [0xf58a1f, 0x39a0ff, 0x35d0a5, 0xf2f5ff].forEach((c, i) => {
      const key = 'mn_cube' + i;
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const top = [P(32, 3), P(61, 18), P(32, 33), P(3, 18)];
      const left = [P(3, 18), P(32, 33), P(32, 69), P(3, 54)];
      const right = [P(61, 18), P(32, 33), P(32, 69), P(61, 54)];
      g.fillStyle(menuShade(c, -0.38), 1); g.fillPoints(right, true);
      g.fillStyle(menuShade(c, -0.14), 1); g.fillPoints(left, true);
      g.fillStyle(menuShade(c, 0.35), 1); g.fillPoints(top, true);
      g.lineStyle(2.5, MENU_CFG.ink, 1);
      [top, left, right].forEach((f) => g.strokePoints(f, true));
      g.generateTexture(key, 64, 72);
      g.destroy();
    });
  }

  /* ───────────────────────── الخلفية ───────────────────────── */
  buildBackground() {
    const { sw, sh } = this;
    const W = MENU_CFG.bgW, H = MENU_CFG.bgH;
    this.bg = this.add.image(sw / 2, sh / 2, MENU_CFG.bgKey).setDepth(0);
    this.bg.setScale(Math.max(sw / W, sh / H));
    const s = this.bg.scaleX;
    const left = sw / 2 - (W * s) / 2;
    const top = sh / 2 - (H * s) / 2;
    this.s = s;
    // تحويل إحداثيات الصورة الأصلية إلى إحداثيات الشاشة
    this.px = (x) => left + x * s;
    this.py = (y) => top + y * s;
  }

  /* ───────────────────────── المصابيح: توهج + مخروط + وميض ───────────────────────── */
  buildLamps() {
    const { s, px, py } = this;
    const ADD = Phaser.BlendModes.ADD;
    const warm = 0xffb347;

    MENU_CFG.lamps.forEach(([lx, ly], i) => {
      const x = px(lx), y = py(ly);
      const dur = 1300 + i * 260;

      if (MENU_CFG.lightCones) {
        const cone = this.add.image(x, y, 'mn_cone').setOrigin(0.5, 0)
          .setTint(warm).setBlendMode(ADD).setDepth(1)
          .setScale(s * 1.15, s * 1.5).setAlpha(0.2);
        this.tweens.add({
          targets: cone, alpha: { from: 0.12, to: 0.3 }, angle: { from: -1.8, to: 1.8 },
          duration: dur * 1.6, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 180
        });
      }

      const base = s * 1.25;
      const glow = this.add.image(x, y, 'mn_glow')
        .setTint(warm).setBlendMode(ADD).setDepth(2).setScale(base).setAlpha(0.75);
      this.tweens.add({
        targets: glow, alpha: { from: 0.55, to: 0.95 }, scale: { from: base * 0.9, to: base * 1.12 },
        duration: dur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 180
      });

      // نواة مضيئة صغيرة (الوسطى تومض كمصباح قديم)
      const core = this.add.image(x, y, 'mn_glow')
        .setTint(0xfff1cc).setBlendMode(ADD).setDepth(2).setScale(s * 0.42).setAlpha(0.85);
      if (i === 1) this.flicker(core);
    });
  }

  flicker(core) {
    const next = () => this.time.delayedCall(Phaser.Math.Between(2200, 6000), () => {
      this.tweens.add({
        targets: core, alpha: 0.2, duration: 45, yoyo: true,
        repeat: Phaser.Math.Between(2, 5), onComplete: next
      });
    });
    next();
  }

  /* ───────────────────────── الغبار (طبقتان: بعيدة وقريبة) ───────────────────────── */
  buildDust() {
    const { sw, sh } = this;
    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: sw }, y: { min: 0, max: sh },
      lifespan: 6500,
      speedY: { min: -20, max: -5 }, speedX: { min: -8, max: 8 },
      scale: { start: 0.6, end: 0 }, alpha: { start: 0.5, end: 0 },
      frequency: 150, tint: 0xcfe9ff
    }).setDepth(3);

    // طبقة قريبة: أكبر وأدفأ وأسرع، فوق كل شيء ما عدا الواجهة
    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: sw }, y: { min: sh * 0.3, max: sh },
      lifespan: 5000,
      speedY: { min: -55, max: -20 }, speedX: { min: -14, max: 14 },
      scale: { start: 1.3, end: 0 }, alpha: { start: 0.35, end: 0 },
      frequency: 240, tint: 0xffd9a0, blendMode: 'ADD'
    }).setDepth(9);
  }

  /* ───────────────────────── مكعبات طافية (هوية اللعبة) ───────────────────────── */
  buildCubes() {
    const n = MENU_CFG.floatingCubes || 0;
    for (let i = 0; i < n; i++) {
      this.time.delayedCall(i * 700, () => this.spawnCube(true));
    }
  }

  spawnCube(first) {
    const { sw, sh, ui } = this;
    const size = Phaser.Math.FloatBetween(0.35, 0.85) * ui;
    const x = Phaser.Math.Between(Math.round(sw * 0.06), Math.round(sw * 0.94));
    const y0 = first ? Phaser.Math.Between(Math.round(sh * 0.15), Math.round(sh * 0.95)) : sh + 70 * ui;
    const dur = Phaser.Math.Between(12000, 20000) * ((y0 + 90 * ui) / (sh + 90 * ui));
    const maxA = 0.22 + size * 0.38;

    const cube = this.add.image(x, y0, 'mn_cube' + Phaser.Math.Between(0, 3))
      .setScale(size).setAlpha(0).setDepth(4).setAngle(Phaser.Math.Between(-25, 25));

    this.tweens.add({ targets: cube, y: -90 * ui, duration: dur, ease: 'Linear',
      onComplete: () => {
        this.tweens.killTweensOf(cube); // يوقف tween التمايل اللانهائي قبل الحذف (يمنع تراكم tweens)
        cube.destroy();
        this.spawnCube(false);
      } });
    this.tweens.add({ targets: cube, x: x + Phaser.Math.Between(-45, 45) * ui,
      angle: cube.angle + Phaser.Math.Between(-45, 45),
      duration: Phaser.Math.Between(2600, 4200), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: cube, alpha: maxA, duration: 1200 });
    this.tweens.add({ targets: cube, alpha: 0, duration: 1500, delay: Math.max(0, dur - 1500) });
  }

  /* ───────────────────────── الشرر من الأنابيب ───────────────────────── */
  buildSparks() {
    const [sx, sy] = MENU_CFG.sparkPoint;
    const x = this.px(sx), y = this.py(sy);
    const emitter = this.add.particles(x, y, 'dot', {
      emitting: false,
      lifespan: { min: 500, max: 1100 },
      speed: { min: 40, max: 150 },
      angle: { min: 210, max: 330 },
      gravityY: 260,
      scale: { start: 1.4, end: 0 },
      alpha: { start: 1, end: 0 },
      color: [0xfff3b0, 0xf58a1f, 0x8a2a00],
      blendMode: 'ADD'
    }).setDepth(5);

    const flash = this.add.image(x, y, 'mn_glow').setTint(0xffa040)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(5).setScale(this.s * 0.5).setAlpha(0);

    const next = () => this.time.delayedCall(Phaser.Math.Between(500, 1800), () => {
      emitter.explode(Phaser.Math.Between(5, 12));
      flash.setAlpha(0.9);
      this.tweens.add({ targets: flash, alpha: 0, duration: 160 });
      next();
    });
    next();
  }

  /* ───────────────────────── تعتيم الأطراف (يعطي عمق وسينمائية) ───────────────────────── */
  buildVignette() {
    const { sw, sh } = this;
    this.canvasTex('mn_vig', sw, sh, (ctx) => {
      const r = Math.hypot(sw, sh) / 2;
      let g = ctx.createRadialGradient(sw / 2, sh * 0.46, r * 0.35, sw / 2, sh * 0.5, r);
      g.addColorStop(0, 'rgba(5,8,16,0)');
      g.addColorStop(1, 'rgba(5,8,16,0.72)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, sw, sh);
      // تعتيم سفلي خفيف لتوضيح الأزرار
      g = ctx.createLinearGradient(0, sh * 0.5, 0, sh);
      g.addColorStop(0, 'rgba(5,8,16,0)');
      g.addColorStop(1, 'rgba(5,8,16,0.5)');
      ctx.fillStyle = g;
      ctx.fillRect(0, sh * 0.5, sw, sh * 0.5);
    });
    this.add.image(sw / 2, sh / 2, 'mn_vig').setDepth(8);
  }

  /* ───────────────────────── نص مع إعدادات موحّدة ───────────────────────── */
  menuText(x, y, str, size, style) {
    const t = this.add.text(x, y, str, Object.assign({
      fontFamily: MENU_CFG.font,
      fontSize: Math.round(size) + 'px',
      color: '#ffffff',
      stroke: '#0b0f1a',
      strokeThickness: Math.max(2, Math.round(size * 0.14)),
      shadow: { offsetX: 0, offsetY: Math.max(2, Math.round(size * 0.07)), color: '#000000', blur: 0, stroke: true, fill: true }
    }, style || {})).setOrigin(0.5);
    if (t.setResolution) t.setResolution(Math.min(window.devicePixelRatio || 1, 2));
    return t;
  }

  gradientFill(t, stops) {
    try {
      const g = t.context.createLinearGradient(0, 0, 0, t.height);
      stops.forEach(([o, c]) => g.addColorStop(o, c));
      t.setFill(g);
    } catch (e) { /* لو فشل التدرّج يبقى الأبيض */ }
  }

  /* ───────────────────────── العنوان ───────────────────────── */
  buildTitle() {
    const { sw, sh, ui } = this;
    const ty = sh * 0.3;
    this.titleY = ty;

    // هالة برتقالية خلف العنوان
    this.halo = this.add.image(sw / 2, ty, 'mn_glow').setTint(MENU_CFG.accent)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(9).setAlpha(0)
      .setScale((sw * 1.25) / 256, (ui * 320) / 256);

    const a = this.menuText(0, -52 * ui, MENU_CFG.title[0], 120 * ui);
    const b = this.menuText(0, 48 * ui, MENU_CFG.title[1], 74 * ui);
    this.gradientFill(a, [[0, '#fff4c8'], [0.5, '#ffb347'], [1, '#f58a1f']]);
    this.gradientFill(b, [[0, '#ffffff'], [1, '#aebcdc']]);
    [a, b].forEach((t) => { if (t.width > sw * 0.88) t.setScale((sw * 0.88) / t.width); });

    this.titleBox = this.add.container(sw / 2, ty - 70 * ui, [a, b])
      .setDepth(10).setAlpha(0).setScale(0.4);

    this.tweens.add({ targets: this.halo, alpha: 0.3, duration: 900, delay: 400 });
    this.tweens.add({
      targets: this.titleBox, y: ty, scale: 1, alpha: 1,
      duration: 850, delay: 350, ease: 'Back.easeOut',
      onComplete: () => this.titleIdle()
    });
  }

  titleIdle() {
    const { ui } = this;
    this.tweens.add({ targets: this.titleBox, y: this.titleY - 7 * ui,
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: this.titleBox, scale: 1.035,
      duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: this.halo, alpha: { from: 0.22, to: 0.38 },
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.glintLoop();
  }

  // لمعة نجمية تظهر بشكل عشوائي على العنوان
  glintLoop() {
    const { sw, ui } = this;
    const star = this.add.image(0, 0, 'mn_star').setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(11).setAlpha(0).setScale(0);
    const fire = () => {
      star.setPosition(
        sw / 2 + Phaser.Math.FloatBetween(-0.36, 0.36) * sw * 0.7,
        this.titleBox.y + Phaser.Math.FloatBetween(-0.9, 0.75) * 70 * ui
      );
      star.setAngle(0);
      this.tweens.add({
        targets: star, scale: { from: 0, to: 0.6 * ui }, alpha: { from: 0, to: 1 }, angle: 60,
        duration: 380, yoyo: true, ease: 'Sine.easeOut',
        onComplete: () => this.time.delayedCall(Phaser.Math.Between(1400, 3200), fire)
      });
    };
    this.time.delayedCall(600, fire);
  }

  /* ───────────────────────── الأزرار ───────────────────────── */
  buildButtons() {
    const { sw, sh, ui } = this;
    const bw = Math.min(sw * 0.68, 560 * ui);
    const y0 = sh * 0.58;

    this.playBtn = this.makeButton(sw / 2, y0, bw, 98 * ui, 'PLAY', MENU_CFG.accent,
      () => this.startGame(), { icon: 'play', shine: true, fontSize: 48 * ui });
    this.settingsBtn = this.makeButton(sw / 2, y0 + 132 * ui, bw * 0.8, 72 * ui, 'SETTINGS', 0x3a4a6b,
      () => this.openSettings(), { icon: 'gear', fontSize: 30 * ui });

    // دخول الأزرار: تصعد من الأسفل بالتتابع
    [this.playBtn, this.settingsBtn].forEach((btn, i) => {
      const targetY = btn.y;
      btn.setAlpha(0).setScale(0.85);
      btn.y = targetY + 60 * ui;
      this.tweens.add({
        targets: btn, y: targetY, alpha: 1, scale: 1,
        duration: 480, delay: 650 + i * 150, ease: 'Back.easeOut'
      });
    });
  }

  press(face, lip, down) {
    this.tweens.killTweensOf(face);
    this.tweens.add({
      targets: face, y: down ? lip * 0.8 : 0,
      scaleX: down ? 0.985 : 1, scaleY: down ? 0.985 : 1,
      duration: down ? 70 : 160, ease: down ? 'Sine.easeOut' : 'Back.easeOut'
    });
  }

  makeButton(x, y, w, h, label, color, onClick, opts) {
    opts = opts || {};
    const ink = MENU_CFG.ink;
    const lip = Math.round(h * 0.11);          // سماكة الحافة السفلية (إحساس 3D)
    const r = h * 0.28;
    const dark = menuShade(color, -0.55);
    const light = menuShade(color, 0.45);

    // الحافة السفلية الثابتة
    const base = this.add.graphics();
    base.fillStyle(ink, 1).fillRoundedRect(-w / 2 - 3, -h / 2 + lip - 3, w + 6, h + 6, r + 3);
    base.fillStyle(dark, 1).fillRoundedRect(-w / 2, -h / 2 + lip, w, h, r);

    // وجه الزر (هو اللي يتحرك عند الضغط)
    const face = this.add.container(0, 0);
    const body = this.add.graphics();
    body.fillStyle(ink, 1).fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, r + 3);
    body.fillStyle(color, 1).fillRoundedRect(-w / 2, -h / 2, w, h, r);
    body.fillStyle(light, 0.38).fillRoundedRect(-w / 2 + 7, -h / 2 + 6, w - 14, h * 0.4,
      { tl: r - 4, tr: r - 4, bl: 8, br: 8 });
    face.add(body);

    if (opts.shine) {
      const hh = h / 2 - 8, bar = h * 0.28;
      const shine = this.add.graphics();
      shine.fillStyle(0xffffff, 0.42);
      shine.fillPoints([{ x: 0, y: hh }, { x: bar * 0.7, y: -hh }, { x: bar * 1.5, y: -hh }, { x: bar * 0.8, y: hh }], true);
      shine.setAlpha(0);
      face.add(shine);
      const x0 = -w / 2 + r, x1 = w / 2 - r - bar * 1.5;
      this.tweens.add({
        targets: shine, x: { from: x0, to: x1 },
        duration: 750, repeat: -1, repeatDelay: 1900, delay: 1600, ease: 'Sine.easeInOut',
        // الشفافية تُحسب من موقع اللمعة نفسه (أضمن من tween.progress مع التكرار اللانهائي)
        onUpdate: (tw, t) => t.setAlpha(Math.sin(Phaser.Math.Clamp((t.x - x0) / (x1 - x0), 0, 1) * Math.PI) * 0.9)
      });
    }

    // النص + الأيقونة
    const txt = this.menuText(0, -h * 0.02, label, opts.fontSize || h * 0.5);
    const iconW = opts.icon ? h * 0.44 : 0;
    const gap = opts.icon ? h * 0.2 : 0;
    const total = iconW + gap + txt.width;
    txt.x = -total / 2 + iconW + gap + txt.width / 2;
    face.add(txt);

    if (opts.icon) {
      const ic = this.add.graphics();
      const cx = -total / 2 + iconW / 2, cy = -h * 0.02;
      if (opts.icon === 'play') this.drawPlayIcon(ic, cx, cy, iconW);
      else this.drawGearIcon(ic, cx, cy, iconW, color);
      face.add(ic);
    }

    const c = this.add.container(x, y, [base, face]).setDepth(10);
    c.setSize(w + 16, h + lip + 16);
    c.setInteractive({ useHandCursor: true });

    const allowed = () => (opts.modal ? this.panelOpen && !this.busy : this.ready && !this.busy && !this.panelOpen);
    let down = false;
    c.on('pointerdown', () => {
      if (!allowed()) return;
      down = true;
      this.press(face, lip, true);
      this.sfx(MENU_CFG.clickKey);
      this.haptic(12);
    });
    c.on('pointerup', () => {
      if (!down) return;
      down = false;
      this.press(face, lip, false);
      onClick();
    });
    c.on('pointerout', () => {
      if (!down) return;
      down = false;
      this.press(face, lip, false);
    });
    return c;
  }

  drawPlayIcon(g, cx, cy, sz) {
    const pts = [{ x: cx - sz * 0.34, y: cy - sz * 0.5 }, { x: cx + sz * 0.5, y: cy }, { x: cx - sz * 0.34, y: cy + sz * 0.5 }];
    g.fillStyle(0xffffff, 1);
    g.lineStyle(Math.max(3, sz * 0.14), MENU_CFG.ink, 1);
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
  }

  drawGearIcon(g, cx, cy, sz, holeColor) {
    const R = sz * 0.5, d = Math.PI / 180, pts = [];
    for (let i = 0; i < 8; i++) {
      const a = i * 45 * d;
      [[-11, 0.74], [-7, 1], [7, 1], [11, 0.74]].forEach(([o, k]) => {
        pts.push({ x: cx + Math.cos(a + o * d) * R * k, y: cy + Math.sin(a + o * d) * R * k });
      });
    }
    const lw = Math.max(3, sz * 0.12);
    g.fillStyle(0xffffff, 1);
    g.lineStyle(lw, MENU_CFG.ink, 1);
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    g.fillStyle(holeColor, 1).fillCircle(cx, cy, R * 0.34);
    g.strokeCircle(cx, cy, R * 0.34);
  }

  buildFooter() {
    const { sw, sh, ui } = this;
    this.menuText(sw / 2, sh - 16 * ui, MENU_CFG.version, 15 * ui,
      { color: '#9fb0cc', strokeThickness: 0, shadow: { offsetX: 0, offsetY: 1, color: '#000', blur: 2, fill: true } })
      .setOrigin(0.5, 1).setAlpha(0.7).setDepth(10);
  }

  /* ───────────────────────── PLAY → الانتقال للعبة ───────────────────────── */
  startGame() {
    if (this.busy) return;
    this.busy = true;
    const cam = this.cameras.main;
    const { ui } = this;

    this.sfx(MENU_CFG.clickKey);
    this.haptic(25);
    if (this.zoomIn) this.zoomIn.stop(); // لا يتعارض تقريب الدخول مع تقريب الخروج
    cam.flash(220, 255, 255, 255);
    this.burst(this.playBtn.x, this.playBtn.y);

    this.tweens.add({ targets: this.titleBox, scale: 1.18, alpha: 0, duration: 420, ease: 'Cubic.easeIn' });
    this.tweens.add({ targets: [this.playBtn, this.settingsBtn], y: '+=' + 50 * ui, alpha: 0,
      duration: 320, ease: 'Cubic.easeIn' });
    cam.zoomTo(1.22, 650, 'Cubic.easeIn');

    this.time.delayedCall(260, () => cam.fadeOut(420, 0, 0, 0));
    cam.once('camerafadeoutcomplete', () => this.goToGame());
  }

  goToGame() {
    if (this.scene.manager.keys[MENU_CFG.gameSceneKey]) {
      this.scene.start(MENU_CFG.gameSceneKey);
    } else {
      // مشهد اللعب غير موجود بهذا المفتاح: ارجع للقائمة بدل ما تعلق الشاشة
      console.warn('[MenuScene] لا يوجد مشهد بمفتاح "' + MENU_CFG.gameSceneKey + '" — عدّل MENU_CFG.gameSceneKey');
      this.scene.restart();
    }
  }

  burst(x, y) {
    const e = this.add.particles(x, y, 'dot', {
      emitting: false,
      speed: { min: 140, max: 420 }, angle: { min: 0, max: 360 },
      lifespan: { min: 450, max: 850 },
      scale: { start: 2.4, end: 0 }, alpha: { start: 1, end: 0 },
      color: [0xffffff, 0xffc36b, 0xf58a1f], blendMode: 'ADD'
    }).setDepth(50);
    e.explode(34);
    this.time.delayedCall(1000, () => e.destroy());
  }

  /* ───────────────────────── نافذة الإعدادات ───────────────────────── */
  makeSwitch(x, y, value) {
    const { ui } = this;
    const tw = 78 * ui, th = 40 * ui;
    const track = this.add.graphics();
    const knob = this.add.circle(0, 0, th * 0.4, 0xffffff).setStrokeStyle(Math.max(2, 3 * ui), MENU_CFG.ink);
    const c = this.add.container(x, y, [track, knob]);
    const draw = (v) => {
      track.clear();
      track.fillStyle(MENU_CFG.ink, 1).fillRoundedRect(-tw / 2 - 3, -th / 2 - 3, tw + 6, th + 6, (th + 6) / 2);
      track.fillStyle(v ? MENU_CFG.accent : 0x4a5570, 1).fillRoundedRect(-tw / 2, -th / 2, tw, th, th / 2);
    };
    const knobX = (v) => (v ? tw / 2 - th / 2 : -tw / 2 + th / 2);
    draw(value);
    knob.x = knobX(value);
    c.set = (v) => {
      draw(v);
      this.tweens.add({ targets: knob, x: knobX(v), duration: 140, ease: 'Back.easeOut' });
    };
    return c;
  }

  openSettings() {
    if (this.panelOpen || this.busy) return;
    this.panelOpen = true;
    const { sw, sh, ui } = this;
    const ink = MENU_CFG.ink, accent = MENU_CFG.accent;

    const rows = [['music', 'MUSIC'], ['sound', 'SOUND']];
    if (typeof navigator !== 'undefined' && navigator.vibrate) rows.push(['vibration', 'VIBRATION']);

    const pw = Math.min(sw * 0.88, 540 * ui);
    const rowH = 76 * ui;
    const ph = 104 * ui + rowH * rows.length + 100 * ui;
    const R = 34 * ui;

    // خلفية معتمة تمنع الضغط على ما تحتها، والضغط عليها يغلق النافذة
    const dim = this.add.rectangle(sw / 2, sh / 2, sw, sh, 0x050810, 0.74)
      .setDepth(100).setAlpha(0).setInteractive();
    dim.on('pointerup', () => this.closeSettings());

    const panel = this.add.container(sw / 2, sh / 2).setDepth(101).setAlpha(0).setScale(0.86);

    const g = this.add.graphics();
    g.fillStyle(ink, 1).fillRoundedRect(-pw / 2 - 5, -ph / 2 - 5, pw + 10, ph + 10, R + 5);
    g.fillStyle(0x1c2740, 1).fillRoundedRect(-pw / 2, -ph / 2, pw, ph, R);
    g.fillStyle(accent, 1).fillRoundedRect(-pw / 2, -ph / 2, pw, 78 * ui, { tl: R, tr: R, bl: 0, br: 0 });
    g.fillStyle(0xffffff, 0.16).fillRoundedRect(-pw / 2 + 8, -ph / 2 + 7, pw - 16, 26 * ui, { tl: R - 6, tr: R - 6, bl: 6, br: 6 });
    g.fillStyle(ink, 0.55).fillRect(-pw / 2, -ph / 2 + 78 * ui - 2, pw, 4); // خط سفلي للعنوان
    const blocker = this.add.zone(0, 0, pw, ph).setInteractive(); // يمنع إغلاق النافذة عند الضغط داخلها
    panel.add([g, blocker]);

    panel.add(this.menuText(0, -ph / 2 + 39 * ui, 'SETTINGS', 40 * ui));

    const firstY = -ph / 2 + 104 * ui + rowH / 2;
    rows.forEach(([key, label], i) => {
      const ry = firstY + i * rowH;
      if (i > 0) {
        const sep = this.add.graphics();
        sep.fillStyle(0xffffff, 0.07).fillRect(-pw / 2 + 28 * ui, ry - rowH / 2 - 1, pw - 56 * ui, 2);
        panel.add(sep);
      }
      const lbl = this.menuText(-pw / 2 + 36 * ui, ry, label, 30 * ui).setOrigin(0, 0.5);
      const sw1 = this.makeSwitch(pw / 2 - 36 * ui - 39 * ui, ry, !!this.settings[key]);
      const zone = this.add.zone(0, ry, pw - 40 * ui, rowH - 8 * ui).setInteractive({ useHandCursor: true });
      zone.on('pointerup', () => {
        this.settings[key] = !this.settings[key];
        menuSaveSettings(this.settings);
        this.game.registry.set('settings', this.settings);
        sw1.set(this.settings[key]);
        if (key === 'music') this.applyMusic();
        this.sfx(MENU_CFG.clickKey);
        this.haptic(10);
      });
      panel.add([lbl, sw1, zone]);
    });

    const closeBtn = this.makeButton(0, ph / 2 - 58 * ui, pw * 0.5, 64 * ui, 'CLOSE', 0x3a4a6b,
      () => this.closeSettings(), { modal: true, fontSize: 28 * ui });
    panel.add(closeBtn);

    this.panelObjs = [dim, panel];
    this.tweens.add({ targets: dim, alpha: 1, duration: 180 });
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' });
    this.cameras.main.shake(120, 0.0025);
  }

  closeSettings() {
    if (!this.panelOpen || !this.panelObjs) return;
    const [dim, panel] = this.panelObjs;
    this.panelObjs = null;
    this.tweens.add({ targets: dim, alpha: 0, duration: 160 });
    this.tweens.add({
      targets: panel, alpha: 0, scale: 0.9, duration: 170, ease: 'Sine.easeIn',
      onComplete: () => { dim.destroy(); panel.destroy(); this.panelOpen = false; }
    });
  }

  /* ───────────────────────── الصوت والاهتزاز (اختياري) ───────────────────────── */
  setupAudio() {
    this.applyMusic();
    if (this.sound.locked) this.sound.once('unlocked', () => this.applyMusic());
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => { if (this.panelOpen) this.closeSettings(); });
    }
  }

  applyMusic() {
    const k = MENU_CFG.musicKey;
    if (!k || !this.cache.audio.exists(k)) return;
    let m = this.sound.get(k);
    if (!m) m = this.sound.add(k, { loop: true, volume: 0.5 });
    if (this.settings.music) { if (!m.isPlaying) m.play(); }
    else if (m.isPlaying) m.stop();
  }

  sfx(key) {
    if (this.settings.sound && key && this.cache.audio.exists(key)) this.sound.play(key, { volume: 0.7 });
  }

  haptic(ms) {
    if (this.settings.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  /* ───────────────────────── تغيّر حجم الشاشة ───────────────────────── */
  setupResize() {
    const w0 = this.sw, h0 = this.sh;
    const onResize = () => {
      clearTimeout(this._rt);
      this._rt = setTimeout(() => {
        const { width, height } = this.scale;
        const changed = Math.abs(width - w0) / w0 > 0.05 || Math.abs(height - h0) / h0 > 0.05;
        if (changed && !this.busy && !this.panelOpen && this.scene.isActive(MENU_CFG.sceneKey)) this.scene.restart();
      }, 250);
    };
    this.scale.on('resize', onResize);
    this.events.once('shutdown', () => {
      clearTimeout(this._rt);
      this.scale.off('resize', onResize);
    });
  }
}
