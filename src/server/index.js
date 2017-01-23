import glue from 'glue';
import path from 'path';

import TcpSocket from './tcp-socket';
import WebsocketServer from './web-socket';
import Extermination from './extermination';

class ExterminateServer {
  constructor(host, port) {
    this.httpServer = null;
    this.tcpSocket = null;
    this.webSocket = null;
    this.exterminate = null;

    glue.compose({
      server: {
        debug: {
          request: ['error'],
        },
      },
      connections: [{
        host,
        port,
      }],
      registrations: [
        { plugin: 'inert' },
        {
          plugin: {
            register: 'good',
            options: {
              ops: {
                interval: 1000,
              },
              reporters: {
                console: [{
                  module: 'good-squeeze',
                  name: 'Squeeze',
                  args: [{ log: '*', response: '*' }],
                }, {
                  module: 'good-console',
                }, 'stdout'],
              },
            },
          },
        },
      ],
    }, {
      relativeTo: path.join(__dirname, '../../'),
    }, (err, server) => {
      if (err) {
        throw err;
      }

      server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
          directory: {
            path: ['dist'],
          },
        },
      });

      server.start(() => server.log('info', `Server listening on ${host}:${port}`));

      this.httpServer = server;
      this.tcpSocket = new TcpSocket(this, host, port + 1);
      this.webSocket = new WebsocketServer(this);
      this.exterminate = new Extermination(this);
    });
  }
}

export default new ExterminateServer('localhost', 8080);
