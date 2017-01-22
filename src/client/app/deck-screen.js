import Phaser from 'phaser-ce/build/custom/phaser-split';

import { MOVES } from '../../shared/constants';

const { clientWidth } = document.body;

const CARDS_PER_ROW = 4;

export default class DeckScreen {
  constructor(game, parent) {
    this.game = game;
    this.parent = parent;
    this.group = null;
    this.onOrderClick = new Phaser.Signal();
  }

  generateDeckView(deck) {
    if (this.group) {
      this.group.destroy();
    }

    this.group = this.game.add.group(this.parent);
    deck.forEach((card, i) => {
      const size = (((3 / 4) * clientWidth) - (CARDS_PER_ROW * 10)) / CARDS_PER_ROW;
      const x = ((i % CARDS_PER_ROW) * (size + 10)) + 5;
      const y = (Math.floor(i / CARDS_PER_ROW) * (size + 10)) + 85;
      const icon = this.game.add.sprite(x, y, 'orders', MOVES.indexOf(card), this.group);
      icon.width = size;
      icon.height = size;
      icon.inputEnabled = true;
      icon.events.onInputDown.addOnce(() => this.onOrderClick.dispatch(card, icon));
    });

    this.game.add.text(30, 30, 'Available moves:', {
      fill: 'white',
      font: 'Overpass',
      fontSize: 30,
    }, this.group);
  }

  destroyDeckView() {
    this.group.destroy();
    this.group = null;
  }
}
