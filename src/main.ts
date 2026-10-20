/// <reference types="vite/client" />
import Phaser from 'phaser';
import { gameConfig } from './config';

window.addEventListener('load', () => {
  (window as any).game = new Phaser.Game(gameConfig);
});

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
