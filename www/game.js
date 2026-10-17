const CFG = {
  ui: 'assets/ui/',
  settingsKey: 'cubefactory_settings_v1',
<<<<<<< HEAD
  accent: 0xf58a1f,
=======
>>>>>>> 6db0c2e (complete main menu)
  W: 540,
  H: 960
};

const DEFAULT_SETTINGS = { music: true, sound: true, vibration: true };

function loadSettings() {
  try {
    return Object.assign({}, DEFAULT_SETTINGS,
      JSON.parse(localStorage.getItem(CFG.settingsKey) || '{}'));
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(s) {
  try { localStorage.setItem(CFG.settingsKey, JSON.stringify(s)); } catch (e) {}
}

<<<<<<< HEAD
=======
const IMG = {
  logo: 'cube_factory_logo_2400x900',
  playBody: 'play_body_2400x816',
  playIcon: 'play_icon_512x512',
  setBody: 'settings_body_1800x612',
  setIcon: 'settings_icon_512x512',
  panel: 'settings_panel_body_2400x2100',
  iconMusic: 'icon_music_512x512',
  iconSound: 'icon_sound_512x512',
  iconVib: 'icon_vibration_512x512',
  toggleOn: 'toggle_on_400x200',
  toggleOff: 'toggle_off_400x200'
};

>>>>>>> 6db0c2e (complete main menu)
class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }

  preload() {
    this.load.video('bgvid', 'assets/bg.mp4', 'loadeddata', false, true);
<<<<<<< HEAD

    const files = [
      'cube_factory_logo_2400x900.png',
      'play_body_2400x816.png',
      'play_icon_512x512.png',
      'settings_body_1800x612.png',
      'settings_icon_512x512.png',
      'settings_panel_body_2400x2100.png',
      'icon_music_512x512.png',
      'icon_sound_512x512.png',
      'icon_vibration_512x512.png',
      'icon_language_512x512.png',
      'toggle_on_400x200.png',
      'toggle_off_400x200.png',
      'slider_track_1560x120.png',
      'slider_fill_1560x120.png',
      'slider_handle_256x256.png'
    ];
    files.forEach((f) => this.load.image(f.replace(/\.png$/, ''), CFG.ui + f));
=======
    Object.values(IMG).forEach((k) => this.load.image(k, CFG.ui + k + '.png'));
>>>>>>> 6db0c2e (complete main menu)
  }

  create() {
    this.scene.start('menu');
  }
}

class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }

  create() {
<<<<<<< HEAD
    const w = this.scale.width, h = this.scale.height;

    // الفيديو خلفية تغطي الشاشة كلها
    const video = this.add.video(w / 2, h / 2, 'bgvid');
    video.setDepth(0);
    video.play(true);
    video.setMute(true);
    const scale = Math.max(w / video.width, h / video.height);
    video.setScale(scale);

    this.add.text(w / 2, h / 2, 'Cube Factory', {
      fontSize: '32px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1);
=======
    this.sw = this.scale.width;
    this.sh = this.scale.height;
    this.ui = Math.min(this.sw / CFG.W, this.sh / CFG.H);
    this.settings = loadSettings();
    this.panelOpen = false;

    this.buildBackground();
    this.buildLogo();
    this.buildButtons();
    this.buildSettingsPanel();
  }

  buildBackground() {
    const { sw, sh } = this;
    const video = this.add.video(sw / 2, sh / 2, 'bgvid').setDepth(0);
    video.play(true);
    video.setMute(true);

    // تغطية الشاشة كاملة مع الحفاظ على النسبة
        // تغطية الشاشة كاملة (أبعاد الفيديو الأصلية 720×1280)
    // تغطية الشاشة كاملة (أبعاد الفيديو الأصلية 720×1280)
    const s = Math.max(sw / 720, sh / 1280);
    video.setScale(s);
    this.add.rectangle(sw / 2, sh / 2, sw, sh, 0x050810, 0.35).setDepth(1);
  }

  buildLogo() {
    const { sw, sh, ui } = this;
    this.logo = this.add.image(sw / 2, sh * 0.26, IMG.logo)
      .setDepth(2)
      .setDisplaySize(Math.min(sw * 0.86, 560 * ui), Math.min(sw * 0.86, 560 * ui) * (900 / 2400));
  }

  buildButtons() {
    const { sw, sh, ui } = this;
    const bw = Math.min(sw * 0.72, 420 * ui);
    this.playBtn = this.makeButton(sw / 2, sh * 0.6, bw, IMG.playBody, IMG.playIcon, 'PLAY',
      () => this.onPlay());
    this.setBtn = this.makeButton(sw / 2, sh * 0.6 + bw * 0.36 + 26 * ui, bw * 0.8,
      IMG.setBody, IMG.setIcon, 'SETTINGS', () => this.openSettings());
  }

  makeButton(x, y, width, bodyKey, iconKey, label, onClick) {
    const { ui } = this;
    const body = this.add.image(0, 0, bodyKey);
    body.setDisplaySize(width, width * (body.height / body.width));
    const h = body.displayHeight;

    const icon = this.add.image(0, 0, iconKey).setDisplaySize(h * 0.5, h * 0.5);
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: Math.round(h * 0.38) + 'px',
      color: '#ffffff',
      stroke: '#0b0f1a',
      strokeThickness: Math.max(3, Math.round(h * 0.06))
    }).setOrigin(0, 0.5);

    const gap = h * 0.12;
    const total = icon.displayWidth + gap + txt.width;
    icon.x = -total / 2 + icon.displayWidth / 2;
    txt.x = -total / 2 + icon.displayWidth + gap;

    const c = this.add.container(x, y, [body, icon, txt]).setDepth(3);
    c.setSize(width, h);
    c.setInteractive({ useHandCursor: true });

    c.on('pointerdown', () => {
      if (this.panelOpen) return;
      this.tweens.killTweensOf(c);
      this.tweens.add({ targets: c, scale: 0.94, duration: 90, ease: 'Sine.easeOut' });
      if (this.settings.vibration && navigator.vibrate) navigator.vibrate(10);
    });
    c.on('pointerup', () => {
      if (this.panelOpen) return;
      this.tweens.killTweensOf(c);
      this.tweens.add({ targets: c, scale: 1, duration: 140, ease: 'Back.easeOut' });
      onClick();
    });
    c.on('pointerout', () => {
      this.tweens.killTweensOf(c);
      this.tweens.add({ targets: c, scale: 1, duration: 140, ease: 'Sine.easeOut' });
    });
    return c;
  }

  buildSettingsPanel() {
    const { sw, sh, ui } = this;
    this.panel = this.add.container(0, 0).setDepth(20).setVisible(false);

    this.dim = this.add.rectangle(sw / 2, sh / 2, sw, sh, 0x050810, 0.7)
      .setInteractive()
      .on('pointerup', () => this.closeSettings());

    const pw = Math.min(sw * 0.9, 520 * ui);
    const panelImg = this.add.image(sw / 2, sh / 2, IMG.panel).setDisplaySize(pw, pw * (2100 / 2400));
    const ph = panelImg.displayHeight;
    const cy = sh / 2 - ph / 2;

    this.panel.add([this.dim, panelImg]);

    const title = this.add.text(sw / 2, sh / 2 - ph * 0.38, 'SETTINGS', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: Math.round(36 * ui) + 'px',
      color: '#ffffff', stroke: '#0b0f1a', strokeThickness: 6
    }).setOrigin(0.5);
    this.panel.add(title);

    const rows = [
      { key: 'music', icon: IMG.iconMusic, label: 'MUSIC' },
      { key: 'sound', icon: IMG.iconSound, label: 'SOUND' },
      { key: 'vibration', icon: IMG.iconVib, label: 'VIBRATION' }
    ];
    this.toggles = {};

    rows.forEach((r, i) => {
      const y = sh / 2 - ph * 0.12 + i * ph * 0.17;
      const ic = this.add.image(sw / 2 - pw * 0.36, y, r.icon)
        .setDisplaySize(44 * ui, 44 * ui);
      const lbl = this.add.text(sw / 2 - pw * 0.24, y, r.label, {
        fontFamily: 'Arial, sans-serif', fontSize: Math.round(24 * ui) + 'px', color: '#ffffff'
      }).setOrigin(0, 0.5);

      const tg = this.add.image(sw / 2 + pw * 0.3, y, this.settings[r.key] ? IMG.toggleOn : IMG.toggleOff)
        .setDisplaySize(90 * ui, 45 * ui)
        .setInteractive({ useHandCursor: true });
      tg.on('pointerup', () => {
        this.settings[r.key] = !this.settings[r.key];
        saveSettings(this.settings);
        tg.setTexture(this.settings[r.key] ? IMG.toggleOn : IMG.toggleOff);
        this.applySettings();
      });
      this.toggles[r.key] = tg;
      this.panel.add([ic, lbl, tg]);
    });

    const closeBtn = this.add.text(sw / 2, sh / 2 + ph * 0.36, 'CLOSE', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: Math.round(28 * ui) + 'px',
      color: '#ffffff', stroke: '#0b0f1a', strokeThickness: 5
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerup', () => this.closeSettings());
    this.panel.add(closeBtn);
  }

  openSettings() {
    this.panelOpen = true;
    this.panel.setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.panel, alpha: 1, duration: 200 });
  }

  closeSettings() {
    this.tweens.add({
      targets: this.panel, alpha: 0, duration: 160,
      onComplete: () => { this.panel.setVisible(false); this.panelOpen = false; }
    });
  }

  applySettings() {
    // الصوت والموسيقى تُربط لاحقاً عند إضافة ملفاتها
  }

  onPlay() {
    this.cameras.main.flash(200, 255, 255, 255);
    // شاشة اللعب تُضاف في الخطوة القادمة
>>>>>>> 6db0c2e (complete main menu)
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#0b0f1a',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: CFG.W,
    height: CFG.H,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene]
});

if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('portrait').catch(() => {});
}
