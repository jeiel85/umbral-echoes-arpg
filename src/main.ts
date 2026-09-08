import Phaser from 'phaser';
import { gameConfig } from './config';

window.addEventListener('load', () => {
  (window as any).game = new Phaser.Game(gameConfig);
});
