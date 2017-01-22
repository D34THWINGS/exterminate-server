import { TRANSITION_TIME } from '../../shared/constants';

const { clientWidth, clientHeight } = document.body;

export default class LoadingScreen {
  constructor(game) {
    this.game = game;

    this.group = this.game.add.group();

    this.loadingTitle = this.game.add.text(clientWidth / 2, (clientHeight / 2) + (clientHeight / 10), 'EXTERMINATE', {
      fill: 'white',
      font: 'Overpass',
      fontSize: 60,
    }, this.group);
    this.loadingTitle.anchor.set(0.5, 0.5);

    this.loadingSubtitle = this.game.add.text(clientWidth / 2, (clientHeight / 2) + (clientHeight / 10) + 60, 'Awaiting game start...', {
      fill: 'white',
      font: 'Overpass',
      fontSize: 30,
    }, this.group);
    this.loadingSubtitle.anchor.set(0.5, 0.5);

    this.loadingSprite = this.game.add.sprite(clientWidth / 2, (clientHeight / 2) - 60, 'loader', 0, this.group);
    this.loadingSprite.anchor.set(0.5, 0.5);
    this.loadingSprite.animations.add('load');
    this.loadingSprite.animations.play('load', 1, true);
    this.loadingSprite.width = this.loadingSprite.height = clientHeight / 5;

    this.group.alpha = 1;
    this.tweener = this.game.add.tween(this.loadingSubtitle).to({ alpha: 0.3 }, 2000, 'Linear', true, 0, -1, true);
  }

  hideScreen() {
    this.tweener.stop();
    this.tweener = this.game.add.tween(this.group).to({ alpha: 0 }, TRANSITION_TIME, 'Linear', true);
  }
}
