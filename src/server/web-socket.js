import io from 'socket.io';

export default class WebsocketServer {
  constructor(server) {
    this.server = server;

    this.ioServer = io(this.server.httpServer.listener)
      .use((socket, cb) => cb(this.server.exterminate.isStarted() ? new Error('Game is already started') : undefined))
      .on('connection', socket => this.handleConnection(socket));
  }

  handleConnection(socket) {
    this.server.httpServer.log('info', 'New Websocket connection');
    const player = this.server.exterminate.addPlayer(socket);

    socket
      .on('disconnect', () => this.server.exterminate.handleDisconnect(player))
      .on('choose', order => this.server.exterminate.handleChosenOrder(order, player));
  }

  broadcast(event, data) {
    this.server.httpServer.log('info', `Event ${event} was sent with ${JSON.stringify(data)}`);
    this.ioServer.emit(event, data);
  }
}
