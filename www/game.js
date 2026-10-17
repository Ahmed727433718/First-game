const CFG = {
  ui: 'assets/ui/',
  settingsKey: 'cubefactory_settings_v1',
  accent: 0xf58a1f,
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

class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }

  preload() {
    this.load.video('bgvid', 'assets/bg.mp4', 'loadeddata', false, true);

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
  }

  create() {
    this.scene.start('menu');
  }
}

class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }

  create() {
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
