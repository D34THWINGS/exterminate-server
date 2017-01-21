import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';

import './assets/styles/index.scss';
import ExterminateClient from './app/client';

export default new ExterminateClient('192.168.43.128:8080');
