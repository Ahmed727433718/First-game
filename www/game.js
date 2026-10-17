const CFG = {
  bgVideo: 'assets/bg.mp4',
  ui: 'assets/ui/',
  settingsKey: 'cubefactory_settings_v1',
  accent: 0xf58a1f,
  pressDepth: 8,
  dims: { W: 540, H: 960 }
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

// مساعد: يرجع اسم الصورة الموجودة مسبقاً في Phaser
function uiKey(file) {
  return file.replace(/\.png$/, '');
}

// تحميل كل الأصول في مكان واحد
class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }

  preload() {
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
    files.forEach((f) => this.load.image(uiKey(f), CFG.ui + f));
  }

  create() {
    this.scene.start('menu');
  }
}

class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }
  // تفاصيل الشاشة الرئيسية تُكتب في الخطوة الجاية داخل هذا الكلاس
  create() {
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'Cube Factory', {
      fontSize: '32px', color: '#ffffff'
    }).setOrigin(0.5);
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: 'rgba(0,0,0,0)',
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: CFG.dims.W,
    height: CFG.dims.H,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene]
});

// قفل الوضع العمودي على المتصفح (الأساسي يتم عبر AndroidManifest)
if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('portrait').catch(() => {});
}
