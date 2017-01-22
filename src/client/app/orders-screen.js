import { ORDERS_AMOUNT, MOVES, TRANSITION_TIME } from '../../shared/constants';

const { clientWidth, clientHeight } = document.body;

const ORDERS_PER_ROW = 2;

export default class OrdersScreen {
  constructor(game) {
    this.game = game;

    this.group = this.game.add.group();
    this.selectedOrders = null;
    this.selectedSeparator = this.game.add.graphics(0, 0, this.group)
      .moveTo((3 / 4) * clientWidth, 0)
      .lineStyle(3, 0xffffff)
      .lineTo((3 / 4) * clientWidth, clientHeight);
    this.selectedText = this.game.add.text(((3 / 4) * clientWidth) + 30, 30, 'Selected:', {
      fill: 'white',
      font: 'Overpass',
      fontSize: 30,
    }, this.group);

    this.hideScreen(true);
  }

  editMode() {
    if (this.selectedOrders) {
      this.selectedOrders.destroy();
      this.selectedOrders = null;
    }

    this.selectedText.x = ((3 / 4) * clientWidth) + 30;
    this.selectedSeparator.visible = true;
    this.showScreen();
  }

  viewMode() {
    this.selectedText.x = 30;
    this.selectedSeparator.visible = false;

    const size = (clientWidth - (ORDERS_AMOUNT * 10)) / ORDERS_AMOUNT;
    this.selectedOrders.children.forEach((child, i) => {
      if (i % 2 === 0) {
        child.width = child.height = size;
      }
      child.x = ((((i - (i % 2)) / 2) % ORDERS_AMOUNT) * (size + 10)) + 5;
      child.y = (Math.floor(((i - (i % 2)) / 2) / ORDERS_AMOUNT) * (size + 10)) + 85;
    });
  }

  hideScreen(instant, cb = () => {}) {
    if (instant) {
      this.group.alpha = 0;
      this.group.visible = false;
    }

    this.game.add.tween(this.group).to({ alpha: 0 }, TRANSITION_TIME, 'Linear', true).onComplete.addOnce(() => {
      this.group.visible = false;
      cb();
    });
  }

  showScreen(cb = () => {}) {
    this.group.visible = true;
    this.game.add.tween(this.group).to({ alpha: 1 }, TRANSITION_TIME, 'Linear', true).onComplete.addOnce(cb);
  }

  addSelectedOrder(order, priority, ordersCount) {
    if (!this.selectedOrders) {
      this.selectedOrders = this.game.add.group(this.group);
    }

    const size = (((1 / 4) * clientWidth) - (ORDERS_PER_ROW * 10)) / ORDERS_PER_ROW;
    const x = ((ordersCount % ORDERS_PER_ROW) * (size + 10)) + 5 + ((3 / 4) * clientWidth);
    const y = (Math.floor(ordersCount / ORDERS_PER_ROW) * (size + 10)) + 85;
    const icon = this.game.add.sprite(x, y, 'orders', MOVES.indexOf(order), this.selectedOrders);
    this.game.add.text(x, y, priority, {
      fill: 'white',
      font: 'Overpass',
      fontSize: 30,
    }, this.selectedOrders);
    icon.width = icon.height = size;
  }
}
