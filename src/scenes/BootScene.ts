import Phaser from 'phaser';
import { TextureGenerator } from '../graphics/TextureGenerator';
import { SoundEngine } from '../audio/SoundEngine';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public create() {
    // Generate all procedural canvas textures
    TextureGenerator.generateAll(this);

    // Initialize Web Audio context on user gesture listener
    const resumeAudio = () => {
      SoundEngine.getInstance().init();
      window.removeEventListener('pointerdown', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
    };
    window.addEventListener('pointerdown', resumeAudio);
    window.addEventListener('keydown', resumeAudio);

    // Transition directly to Main Menu
    this.scene.start('MainMenuScene');
  }
}
