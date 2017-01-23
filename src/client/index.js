import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import qs from 'qs';

import './assets/styles/index.scss';
import ExterminateClient from './app/client';

export default (() => {
  const { password } = qs.parse(window.location.search.slice(1));

  if (!password) {
    document.querySelector('.splash-connectivity').style.display = 'none';
    document.querySelector('.password-screen').style.display = 'flex';
    return null;
  }

  return new ExterminateClient('localhost:8080');
})();
