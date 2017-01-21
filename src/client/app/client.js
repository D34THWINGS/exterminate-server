import Phaser from 'phaser-ce/build/custom/phaser-split';
import io from 'socket.io-client';
import qs from 'qs';

import { ORDERS_AMOUNT } from '../../shared/constants';
import OrdersScreen from './orders-screen';

const { clientWidth, clientHeight } = document.body;

const CARDS_PER_ROW = 4;

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

    this.ordersScreen = new OrdersScreen(this.game);
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
    }

    this.ordersScreen.editMode();

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

    this.ordersScreen.addSelectedOrder(order, this.ordersCount);

    this.ordersCount += 1;
    if (this.ordersCount >= ORDERS_AMOUNT) {
      this.handleAllOrdersCompleted();
    }

    this.socket.emit('choose', { type: order, priority: Math.floor(Math.random() * 12000) });
  }

  handleAllOrdersCompleted() {
    this.availableMoves.destroy();
    this.availableMoves = null;

    this.ordersScreen.viewMode();
  }
}
