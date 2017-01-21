import Phaser from 'phaser-ce/build/custom/phaser-split';
import io from 'socket.io-client';
import qs from 'qs';

import { ORDERS_AMOUNT } from '../../shared/constants';

const { clientWidth, clientHeight } = document.body;

const CARDS_PER_ROW = 4;
const ORDERS_PER_ROW = 2;

export default class ExterminateClient {
  constructor(host) {
    const { pseudo } = qs.parse(window.location.search.slice(1));

    this.socket = io(`${host}?pseudo=${pseudo}`)
      .on('connect', () => this.handleConnection())
      .on('deck', deck => this.handleDeck(deck));

    this.ordersCount = 0;
  }

  preload() {
    this.game.load.image('backward', 'assets/images/icons/backward.jpg');
    this.game.load.image('forward1', 'assets/images/icons/forward1.jpg');
    this.game.load.image('forward2', 'assets/images/icons/forward2.jpg');
    this.game.load.image('forward3', 'assets/images/icons/forward3.jpg');
    this.game.load.image('left', 'assets/images/icons/left.jpg');
    this.game.load.image('right', 'assets/images/icons/right.jpg');
    this.game.load.image('uturn', 'assets/images/icons/uturn.jpg');
  }

  create() {
    this.game.world.setBounds(-1500, -1500, 6000, 6000);
    this.game.stage.disableVisibilityChange = true;

    this.game.camera.setPosition(0, 0);

    this.ordersScreen = this.game.add.group();
    this.selectedSeparator = this.game.add.graphics(0, 0, this.ordersScreen)
      .moveTo((3 / 4) * clientWidth, 0)
      .lineStyle(3, 0xffffff)
      .lineTo((3 / 4) * clientWidth, clientHeight);
    this.selectedText = this.game.add.text(((3 / 4) * clientWidth) + 30, 30, 'Selected:', {
      fill: 'white',
    }, this.ordersScreen);

    this.ordersScreen.visible = false;
  }

  update() {
  }

  render() {
  }

  handleConnection() {
    this.game = new Phaser.Game(clientWidth, clientHeight, Phaser.AUTO, '', {
      preload: () => this.preload(),
      create: () => this.create(),
      update: () => this.update(),
      render: () => this.render(),
    });
  }

  handleDeck(deck) {
    if (this.availableMoves) {
      this.availableMoves.destroy();
      this.selectedOrders.destroy();
      this.selectedOrders = null;
    }

    this.selectedText.x = ((3 / 4) * clientWidth) + 30;
    this.selectedSeparator.visible = true;
    this.ordersScreen.visible = true;

    this.ordersCount = 0;
    this.availableMoves = this.game.add.group();
    deck.forEach((card, i) => {
      const size = (((3 / 4) * clientWidth) - (CARDS_PER_ROW * 10)) / CARDS_PER_ROW;
      const x = ((i % CARDS_PER_ROW) * (size + 10)) + 5;
      const y = (Math.floor(i / CARDS_PER_ROW) * (size + 10)) + 85;
      const icon = this.game.add.sprite(x, y, card, null, this.availableMoves);
      icon.width = size;
      icon.height = size;
      icon.inputEnabled = true;
      icon.events.onInputDown.add(() => this.handleOrderClick(card, icon));
    });

    this.game.add.text(30, 30, 'Available moves:', {
      fill: 'white',
    }, this.availableMoves);
  }

  handleOrderClick(order, icon) {
    icon.destroy();

    if (!this.selectedOrders) {
      this.selectedOrders = this.game.add.group(this.ordersScreen);
    }

    const size = (((1 / 4) * clientWidth) - (ORDERS_PER_ROW * 10)) / ORDERS_PER_ROW;
    const x = ((this.ordersCount % ORDERS_PER_ROW) * (size + 10)) + 5 + ((3 / 4) * clientWidth);
    const y = (Math.floor(this.ordersCount / ORDERS_PER_ROW) * (size + 10)) + 85;
    this.game.add.sprite(x, y, order, null, this.selectedOrders);

    this.ordersCount += 1;
    if (this.ordersCount >= ORDERS_AMOUNT) {
      this.handleAllOrdersCompleted();
    }

    this.socket.emit('choose', { type: order, priority: Math.floor(Math.random() * 12000) });
  }

  handleAllOrdersCompleted() {
    this.availableMoves.destroy();
    this.availableMoves = null;

    this.selectedText.x = 30;
    this.selectedSeparator.visible = false;

    const size = (clientWidth - (ORDERS_AMOUNT * 10)) / ORDERS_AMOUNT;
    this.selectedOrders.children.forEach((child, i) => {
      child.width = child.height = size;
      child.x = ((i % ORDERS_AMOUNT) * (size + 10)) + 5;
      child.y = (Math.floor(i / ORDERS_AMOUNT) * (size + 10)) + 85;
    });
  }
}
