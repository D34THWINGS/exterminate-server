import Phaser from 'phaser-ce/build/custom/phaser-split';
import io from 'socket.io-client';

export default class ExterminateClient {
  constructor(host) {
    this.socket = io(host)
      .on('connect', () => this.handleConnection())
      .on('start', () => this.handleStart());
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
    this.game.world.setBounds(-1500, 0, 3000, 1000);
    this.game.stage.disableVisibilityChange = true;

    this.moves = this.game.add.group();
  }

  update() {
  }

  render() {
    this.game.debug.cameraInfo(this.game.camera, 32, 32);
  }

  handleConnection() {
    this.game = new Phaser.Game(document.body.clientWidth, document.body.clientHeight, Phaser.AUTO, '', {
      preload: () => this.preload(),
      create: () => this.create(),
      update: () => this.update(),
      render: () => this.render(),
    });
  }

  handleStart() {
  }
}
