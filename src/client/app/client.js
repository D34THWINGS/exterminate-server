import Phaser from 'phaser-ce/build/custom/phaser-split';
import io from 'socket.io-client';
import qs from 'qs';

import { ORDERS_AMOUNT } from '../../shared/constants';
import OrdersScreen from './orders-screen';
import DeckScreen from './deck-screen';
import SignalScreen from './signal-screen';
import LoadingScreen from './loading-screen';

const { clientWidth, clientHeight } = document.body;

export default class ExterminateClient {
  constructor(host) {
    const { pseudo } = qs.parse(window.location.search.slice(1));

    this.socket = io(`${host}?pseudo=${pseudo}`)
      .on('connect', () => this.handleConnection())
      .on('deck', deck => this.handleDeck(deck));

    this.ordersCount = 0;
  }

  preload() {
    this.game.load.spritesheet('orders', 'assets/images/orders.jpg', 200, 200, 7);
    this.game.load.spritesheet('loader', 'assets/images/loader.png', 600, 600, 3);
  }

  create() {
    this.game.world.setBounds(-1500, -1500, 6000, 6000);
    this.game.stage.disableVisibilityChange = true;

    this.game.camera.setPosition(0, 0);

    this.ordersScreen = new OrdersScreen(this.game);
    this.deckScreen = new DeckScreen(this.game, this.ordersScreen.group);
    this.deckScreen.onOrderClick.add(this.handleOrderClick.bind(this));
    this.signalScreen = new SignalScreen(this.game);
    this.loadingScreen = new LoadingScreen(this.game);
  }

  update() {
    this.signalScreen.update();
  }

  render() {
    this.signalScreen.render();
  }

  handleConnection() {
    document.querySelector('.splash-screen').style.display = 'none';

    this.game = new Phaser.Game(clientWidth, clientHeight, Phaser.AUTO, '', {
      preload: () => this.preload(),
      create: () => this.create(),
      update: () => this.update(),
      render: () => this.render(),
    });
  }

  handleDeck(deck) {
    this.loadingScreen.hideScreen();
    this.ordersScreen.editMode();
    this.ordersCount = 0;
    this.deckScreen.generateDeckView(deck);
  }

  handleOrderClick(order, icon) {
    this.signalScreen.onSignalEnd.addOnce(priority => this.handleSignalCompleted(order, priority, icon));
    this.ordersScreen.hideScreen(false, () => this.signalScreen.showScreen(order, this.ordersCount));
  }

  handleSignalCompleted(order, priority, icon) {
    icon.destroy();

    this.ordersScreen.showScreen();
    this.ordersScreen.addSelectedOrder(order, priority, this.ordersCount);

    this.ordersCount += 1;
    if (this.ordersCount >= ORDERS_AMOUNT) {
      this.handleAllOrdersCompleted();
    }

    this.socket.emit('choose', { type: order, priority });
  }

  handleAllOrdersCompleted() {
    this.deckScreen.destroyDeckView();
    this.ordersScreen.viewMode();
  }
}
