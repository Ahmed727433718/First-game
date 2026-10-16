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

  preload() {
    this.load.image('factory', 'assets/factory.png');
    this.load.image('conveyor', 'assets/conveyor.png');
    this.load.image('cube', 'assets/cube.png');
  }

  create() {
    mainScene = this;
    this.cube = false;
    this.cubeHp = 0;

    this.factory = this.add.image(0, 0, 'factory').setOrigin(0.5, 1);
    this.conveyor = this.add.image(0, 0, 'conveyor').setOrigin(0.5, 0);

    this.cubeSprite = this.add.image(0, 0, 'cube').setVisible(false).setInteractive();
    this.hpText = this.add.text(0, 0, '', {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);

    this.cubeSprite.on('pointerdown', () => this.hitCube());
    this.scale.on('resize', () => this.layout());

    this.layout();
    this.time.addEvent({ delay: 5000, loop: true, callback: save });
    this.spawnCube();
    updateHUD();
  }

  layout() {
    const w = this.scale.width, h = this.scale.height;

    const fScale = (w * 0.9) / this.factory.width;
    this.factory.setScale(fScale).setPosition(w / 2, h * 0.45);

    const cScale = (w * 0.9) / this.conveyor.width;
    this.conveyor.setScale(cScale).setPosition(w / 2, h * 0.45);

    this.cubeSize = w * 0.14;
    this.cubeBaseScale = this.cubeSize / this.cubeSprite.width;
    const cubeX = w / 2;
    const cubeY = this.conveyor.y - this.cubeSize * 0.3;
    this.cubeSprite.setScale(this.cubeBaseScale).setPosition(cubeX, cubeY);
    this.hpText.setPosition(cubeX, cubeY);
  }

  spawnCube() {
    if (this.cube) return;
    this.cube = true;
    this.cubeHp = CUBE_MAX_HP;
    this.cubeSprite.setScale(this.cubeBaseScale).setAlpha(1).setVisible(true);
    this.hpText.setText(String(this.cubeHp)).setVisible(true);
  }

  hitCube() {
    if (!this.cube) return;
    this.cubeHp -= 1;
    this.hpText.setText(String(this.cubeHp));
    this.tweens.add({
      targets: this.cubeSprite,
      scale: this.cubeBaseScale * 0.9,
      yoyo: true,
      duration: 80
    });
    if (this.cubeHp <= 0) this.breakCube();
  }

  breakCube() {
    state.money += cubeValue();
    state.totalBroken += 1;
    this.cube = false;
    this.cubeSprite.setVisible(false);
    this.hpText.setVisible(false);
    updateHUD();
    this.time.delayedCall(produceInterval(), () => this.spawnCube());
  }
}

function buyUpgrade() {
  const cost = upgradeCost();
  if (state.money < cost) return;
  state.money -= cost;
  state.speedLevel += 1;
  save();
  updateHUD();
}

document.getElementById('upgrade').addEventListener('click', buyUpgrade);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) save();
});

if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('portrait').catch(() => { });
}

load();

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#1b1f2a',
  pixelArt: true,
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  scene: [MainScene]
});
