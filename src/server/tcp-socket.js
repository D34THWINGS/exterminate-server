import net from 'net';
import through from 'through2';

const BoardEvents = {
  START_GAME: '0',
  NEXT_TURN: '1',
};

const ServerEvents = {
  GAME_STARTED: '0',
  PLAYER_ORDERS: '1',
};

export default class TcpSocket {
  /**
   * @param {ExterminateServer} server
   * @param {String} host
   * @param {Number} port
   */
  constructor(server, host, port) {
    this.server = server;

    this.tcp = net.createServer()
      .on('error', (err) => {
        throw err;
      });

    this.tcp.listen({
      host,
      port,
      exclusive: true,
    }, () => {
      this.server.httpServer.log('info', `Opened TCP server on port ${port}`);

      this.tcp.on('connection', socket => this.handleConnection(socket));
      this.tcp.on('error', err => this.server.httpServer.log('error', err));
    });
  }

  /**
   * @param {Socket} socket
   */
  handleConnection(socket) {
    this.server.httpServer.log('info', 'New socket connected');
    socket.on('error', err => this.server.httpServer.log('error', err));

    let buffer = [];
    socket.on('close', () => this.handleSocketClose())
      .pipe(through.obj(function (chunk, enc, cb) {
        chunk.toString().split('.').forEach(value => this.push(value));
        cb();
      }))
      .pipe(through.obj(function (chunk, enc, cb) {
        if (chunk === 'EOL') {
          this.push(buffer);
          buffer = [];
        } else {
          buffer.push(chunk);
        }
        cb();
      }))
      .on('data', data => this.handleMessage(...data))
      .on('error', err => this.server.httpServer.log('error', err.stack));

    this.socket = socket;
  }

  handleSocketClose() {
    this.server.httpServer.log('info', 'TCP socket disconnected');
  }

  /**
   * @param {String} event
   * @param {...String} eventArgs
   * @returns {*}
   */
  handleMessage(event, ...eventArgs) {
    this.server.httpServer.log('info', `Received TCP event ${event} with ${eventArgs}`);
    switch (event) {
      case BoardEvents.START_GAME:
        return this.server.exterminate.startGame(...eventArgs);
      case BoardEvents.NEXT_TURN:
        return this.server.exterminate.nextTurn(...eventArgs);
      default:
        return null;
    }
  }

  sendGameStart(players) {
    this.socket.write(ServerEvents.GAME_STARTED);
    players.forEach(player => this.socket.write(`.${player.id}`));
    this.socket.write('\n');
  }

  sendPlayerOrders(players) {
    this.socket.write(ServerEvents.PLAYER_ORDERS);
    players.forEach(player => this.socket.write(`.${player.id}|${player.getOrdersAsString()}`));
    this.socket.write('\n');
  }
}
