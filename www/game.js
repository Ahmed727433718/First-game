const SAVE_KEY = 'cubefactory-save-v1';
const CUBE_MAX_HP = 5;

const state = { money: 0, speedLevel: 1, totalBroken: 0 };

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.version === 1) Object.assign(state, s.data);
  } catch (e) { }
}

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, data: state }));
  } catch (e) { }
}

function produceInterval() { return Math.max(800, 4000 * Math.pow(0.9, state.speedLevel - 1)); }
function upgradeCost()     { return Math.floor(10 * Math.pow(1.2, state.speedLevel - 1)); }
function cubeValue()       { return 1; }

function updateHUD() {
  document.getElementById('money').textContent = Math.floor(state.money);
  document.getElementById('lvl').textContent = state.speedLevel;
  const cost = upgradeCost();
  const btn = document.getElementById('upgrade');
  btn.textContent = `ترقية الإنتاج (${cost})`;
  btn.disabled = state.money < cost;
}

let mainScene = null;

class MainScene extends Phaser.Scene {
  constructor() { super('main'); }

  create() {
    mainScene = this;
    this.cube = null;
    this.startProduction();
    this.time.addEvent({ delay: 5000, loop: true, callback: save });
    this.spawnCube();
    updateHUD();
  }

  startProduction() {
    if (this.prodTimer) this.prodTimer.remove();
    this.prodTimer = this.time.addEvent({
      delay: produceInterval(),
      loop: true,
      callback: () => this.spawnCube()
    });
  }

  spawnCube() {
    if (this.cube) return;
    const w = this.scale.width, h = this.scale.height;
    const size = Math.min(w, h) * 0.22;

    const rect = this.add.rectangle(w / 2, h / 2, size, size, 0x4fc3f7)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive();
    rect.hp = CUBE_MAX_HP;
    rect.label = this.add.text(w / 2, h / 2, String(rect.hp), { fontSize: '32px', color: '#000' }).setOrigin(0.5);

    rect.on('pointerdown', () => this.hitCube(rect));
    this.cube = rect;
  }

  hitCube(rect) {
    rect.hp -= 1;
    rect.label.setText(String(rect.hp));
    this.tweens.add({ targets: rect, scaleX: 0.9, scaleY: 0.9, yoyo: true, duration: 80 });

    if (rect.hp <= 0) {
      state.money += cubeValue();
      state.totalBroken += 1;
      rect.label.destroy();
      rect.destroy();
      this.cube = null;
      updateHUD();
    }
  }
}

function buyUpgrade() {
  const cost = upgradeCost();
  if (state.money < cost) return;
  state.money -= cost;
  state.speedLevel += 1;
  save();
  mainScene.startProduction();
  updateHUD();
}

document.getElementById('upgrade').addEventListener('click', buyUpgrade);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) save();
});

load();

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#1b1f2a',
  scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
  scene: [MainScene]
});
