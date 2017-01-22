import { TRANSITION_TIME } from '../../shared/constants';

const { clientWidth, clientHeight } = document.body;

export default class LoadingScreen {
  constructor(game) {
    this.game = game;

    this.group = this.game.add.group();

    this.loadingTitle = this.game.add.text(clientWidth / 2, (clientHeight / 2) - 30, 'EXTERMINATE', {
      fill: 'white',
      font: 'Overpass',
      fontSize: 60,
    }, this.group);
    this.loadingTitle.anchor.set(0.5, 0.5);

    this.loadingSubtitle = this.game.add.text(clientWidth / 2, (clientHeight / 2) + 30, 'Awaiting server...', {
      fill: 'white',
      font: 'Overpass',
      fontSize: 30,
    }, this.group);
    this.loadingSubtitle.anchor.set(0.5, 0.5);

    this.group.alpha = 1;
    this.tweener = this.game.add.tween(this.group).to({ alpha: 0.3 }, 2000, 'Linear', true, 0, -1, true);
  }

  hideScreen() {
    this.tweener.stop();
    this.tweener = this.game.add.tween(this.group).to({ alpha: 0 }, TRANSITION_TIME, 'Linear', true);
  }
}
