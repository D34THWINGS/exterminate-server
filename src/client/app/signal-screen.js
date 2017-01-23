import Phaser from 'phaser-ce/build/custom/phaser-split';

import { TRANSITION_TIME } from '../../shared/constants';

const { clientWidth, clientHeight } = document.body;
const noop = () => {};

const POINTS_DENSITY = 1;
const SIGNAL_TIMEOUT = 3000;
const ORDER_WEIGHTS = {
  forward1: 7,
  forward2: 9,
  forward3: 12,
  backward: 8,
  uturn: 12,
  left: 7,
  right: 7,
};

export default class SignalScreen {
  constructor(game) {
    this.game = game;

    this.group = this.game.add.group();
    this.group.visible = false;

    this.signalBackgroundMask = this.game.add.graphics(0, 0);
    this.signalBackground = this.game.add.graphics(0, 0, this.group)
      .beginFill(0x00ff00, 0.1)
      .drawRect(0, 0, clientWidth, clientHeight)
      .endFill();
    this.signalBackground.mask = this.signalBackgroundMask;

    this.signalPath = this.game.add.bitmapData(clientWidth, clientHeight);
    this.signalObject = this.group.add(this.signalPath.addToWorld());
    this.signalObject.inputEnabled = true;

    this.game.add.text(30, 30, 'Draw electric signal:', {
      fill: 'white',
      font: 'Overpass, sans-serif',
      fontSize: 30,
    }, this.group);

    this.signalGenerateTime = null;
    this.signalDrawingEnabled = false;
    this.lockedPrecisions = [];
    this.onSignalEnd = new Phaser.Signal();
  }

  showScreen(order, index, cb = noop) {
    this.generateSignal(order, index);

    this.lockedPrecisions = [];
    this.group.visible = true;
    this.signalObject.inputEnabled = true;
    this.game.add.tween(this.group).to({ alpha: 1 }, TRANSITION_TIME, 'Linear', true).onComplete.addOnce(cb);

    this.signalObject.events.onInputDown.addOnce(() => {
      this.signalDrawingEnabled = true;
      this.signalObject.events.onInputUp.addOnce(() => {
        this.endSignal();
      });
    });

    this.signalTimeout = setTimeout(() => this.endSignal(), SIGNAL_TIMEOUT);
  }

  generateSignal(order, index) {
    this.signalGenerateTime = this.game.time.now;
    this.pointsAmount = Math.round(ORDER_WEIGHTS[order] * (1 + (index / 10)));
    this.points = SignalScreen.generatePoints(this.pointsAmount);
    const nbPointsInterpolated = Math.round(clientWidth / POINTS_DENSITY);

    this.signalPath.clear();
    this.signalBackgroundMask.clear();

    const x = 1 / nbPointsInterpolated;
    for (let i = 0; i <= 1; i += x) {
      const px = Phaser.Math.catmullRomInterpolation(this.points.x, i);
      const py = Phaser.Math.catmullRomInterpolation(this.points.y, i);
      this.signalPath.circle(px + ((clientWidth / this.pointsAmount) / 2), py, 1, 'white');
    }
  }

  update() {
    if (!this.signalDrawingEnabled) {
      return;
    }

    const { x, y } = this.game.input.activePointer;

    const offset = (clientWidth / this.pointsAmount) / 2;
    if (x < offset) {
      return;
    }

    const i = (x - offset) / (clientWidth - (offset * 2));
    const py = Phaser.Math.catmullRomInterpolation(this.points.y, i);
    const activeZoneIndex = Math.floor(i / (1 / (this.pointsAmount - 1)));
    if (!this.lockedPrecisions[activeZoneIndex] && activeZoneIndex >= this.lockedPrecisions.length) {
      this.lockedPrecisions[activeZoneIndex] = 100 - Math.round((Math.abs(y - py) / clientHeight) * 100);

      if (activeZoneIndex >= this.pointsAmount - 1) {
        this.endSignal();
      }
    }
  }

  render() {
    if (!this.group.visible) {
      return;
    }

    const percent = Math.min((this.game.time.now - this.signalGenerateTime) / SIGNAL_TIMEOUT, 1);
    this.signalBackgroundMask
      .beginFill(0xffffff)
      .drawRect(0, 0, clientWidth * percent, clientHeight)
      .endFill();
  }

  endSignal(withDispatch = true) {
    clearTimeout(this.signalTimeout);

    this.signalDrawingEnabled = false;
    this.signalObject.inputEnabled = false;

    this.game.add.tween(this.group).to({ alpha: 0 }, 500, 'Linear', true).onComplete.addOnce(() => {
      this.group.visible = false;
      if (withDispatch) {
        this.onSignalEnd.dispatch(this.lockedPrecisions.reduce((v, p) => v + p, 0));
      }
    });
  }

  static generatePoints(pointsAmount) {
    const x = new Array(pointsAmount)
      .fill(0)
      .map((v, i) => (i === 0 ? 0 : Math.round((i / pointsAmount) * clientWidth)));
    const y = new Array(pointsAmount)
      .fill(0)
      .map(() => Math.floor(Math.random() * (clientHeight - 60)) + 30);
    return { x, y };
  }
}
