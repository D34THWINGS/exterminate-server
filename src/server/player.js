import uuid from 'uuid/v4';

import { ORDERS_AMOUNT } from './constants';

export default class Player {
  constructor(socket) {
    this.id = uuid();
    this.socket = socket;

    this.orders = [];
  }

  sendDeck(deck) {
    this.socket.emit('deck', deck);
  }

  chooseOrder(order) {
    if (!this.isReady()) {
      this.orders.push(order);
    }
  }

  reset() {
    this.orders = [];
  }

  isReady() {
    return this.orders.length === ORDERS_AMOUNT;
  }

  getOrdersAsString() {
    return this.orders.map(order => `${order.type}:${order.priority}`).join('.');
  }
}
