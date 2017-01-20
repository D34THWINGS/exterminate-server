import glue from 'glue';
import path from 'path';

import TcpSocket from './socket';

class ExterminateServer {
  constructor(host, port) {
    this.socket = new TcpSocket();

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
    });
  }
}

export default new ExterminateServer('localhost', 8080);
