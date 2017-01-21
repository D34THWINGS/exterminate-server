import { ORDERS_AMOUNT } from '../../shared/constants';

const { clientWidth, clientHeight } = document.body;

const ORDERS_PER_ROW = 2;

export default class OrdersScreen {
  constructor(game) {
    this.game = game;

    this.ordersScreen = this.game.add.group();
    this.selectedOrders = null;
    this.selectedSeparator = this.game.add.graphics(0, 0, this.ordersScreen)
      .moveTo((3 / 4) * clientWidth, 0)
      .lineStyle(3, 0xffffff)
      .lineTo((3 / 4) * clientWidth, clientHeight);
    this.selectedText = this.game.add.text(((3 / 4) * clientWidth) + 30, 30, 'Selected:', {
      fill: 'white',
    }, this.ordersScreen);

    this.ordersScreen.visible = false;
  }

  editMode() {
    if (this.selectedOrders) {
      this.selectedOrders.destroy();
      this.selectedOrders = null;
    }

    this.selectedText.x = ((3 / 4) * clientWidth) + 30;
    this.selectedSeparator.visible = true;
    this.ordersScreen.visible = true;
  }

  viewMode() {
    this.selectedText.x = 30;
    this.selectedSeparator.visible = false;

    const size = (clientWidth - (ORDERS_AMOUNT * 10)) / ORDERS_AMOUNT;
    this.selectedOrders.children.forEach((child, i) => {
      child.width = child.height = size;
      child.x = ((i % ORDERS_AMOUNT) * (size + 10)) + 5;
      child.y = (Math.floor(i / ORDERS_AMOUNT) * (size + 10)) + 85;
    });
  }

  addSelectedOrder(order, ordersCount) {
    if (!this.selectedOrders) {
      this.selectedOrders = this.game.add.group(this.ordersScreen);
    }

    const size = (((1 / 4) * clientWidth) - (ORDERS_PER_ROW * 10)) / ORDERS_PER_ROW;
    const x = ((ordersCount % ORDERS_PER_ROW) * (size + 10)) + 5 + ((3 / 4) * clientWidth);
    const y = (Math.floor(ordersCount / ORDERS_PER_ROW) * (size + 10)) + 85;
    this.game.add.sprite(x, y, order, null, this.selectedOrders);
  }
}
