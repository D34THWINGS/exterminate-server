import Player from './player';
import { DECK_SIZE, CARD_PROPORTIONS } from '../shared/constants';

export default class Extermination {
  /**
   * @param {ExterminateServer} server
   */
  constructor(server) {
    this.server = server;
    this.started = false;
    this.players = [];
    this.stockDeck = [];
  }

  addPlayer(socket) {
    const newPlayer = new Player(socket);
    this.players.push(newPlayer);
    return newPlayer;
  }

  startGame() {
    this.server.httpServer.log('info', 'Game started');
    this.started = true;

    this.shuffleStockDeck();

    this.players.forEach((player) => {
      player.reset();
      const playerDeck = this.generateDeck();
      player.sendDeck(playerDeck);
    });

    this.server.tcpSocket.sendGameStart(this.players);
  }

  shuffleStockDeck() {
    this.stockDeck = [];
    Object.keys(CARD_PROPORTIONS)
      .forEach(type => this.stockDeck.push(...(new Array(CARD_PROPORTIONS[type]).fill(type))));

    let counter = this.stockDeck.length;

    while (counter > 0) {
      const index = Math.floor(Math.random() * counter);
      counter -= 1;

      const temp = this.stockDeck[counter];
      this.stockDeck[counter] = this.stockDeck[index];
      this.stockDeck[index] = temp;
    }
  }

  generateDeck() {
    const deck = [];
    for (let i = 0; i < DECK_SIZE; i += 1) {
      deck.push(this.drawCard());
    }
    return deck;
  }

  drawCard() {
    if (this.stockDeck.length === 0) {
      this.shuffleStockDeck();
    }

    return this.stockDeck.pop();
  }

  handleChosenOrder(order, player) {
    this.server.httpServer.log('info', `Order ${order.type}(${order.priority}) received from player ${player.id}`);
    player.chooseOrder(order);

    if (this.isAllPlayerReady()) {
      this.server.httpServer.log('info', 'All players made their orders, sending orders to board');
      this.server.tcpSocket.sendPlayerOrders(this.players);
    }
  }

  handleDisconnect(player) {
    const i = this.players.findIndex(p => p.id === player.id);
    this.players.splice(i, 1);
  }

  newRound() {
    this.players.forEach(player => player.reset());
  }

  isAllPlayerReady() {
    return this.players.every(player => player.isReady());
  }

  isStarted() {
    return this.started;
  }
}
