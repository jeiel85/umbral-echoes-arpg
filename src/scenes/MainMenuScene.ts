import Phaser from 'phaser';
import { SaveManager } from '../save/SaveManager';
import { SoundEngine } from '../audio/SoundEngine';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  public create() {
    const W = 1280;
    const H = 720;

    // Start dark ambient drone
    SoundEngine.getInstance().startAmbience();

    // Dark gothic background floor
    for (let x = 0; x < W; x += 32) {
      for (let y = 0; y < H; y += 32) {
        const t = this.add.image(x + 16, y + 16, 'tile_stone_floor');
        t.setTint(0x2d2535);
      }
    }

    // Heavy dark vignette overlay
    const vignette = this.add.graphics();
    vignette.fillStyle(0x07050d, 0.78);
    vignette.fillRect(0, 0, W, H);

    // Atmospheric floating embers
    for (let i = 0; i < 24; i++) {
      const ember = this.add.sprite(
        Phaser.Math.Between(50, W - 50),
        Phaser.Math.Between(H - 100, H),
        'fx_dot'
      );
      ember.setTint(Phaser.Math.RND.pick([0xf97316, 0xef4444, 0xfacc15, 0xa855f7]));
      ember.setScale(Phaser.Math.FloatBetween(0.5, 1.2));
      ember.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));

      this.tweens.add({
        targets: ember,
        y: Phaser.Math.Between(50, H / 2),
        x: ember.x + Phaser.Math.Between(-80, 80),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 7000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 4000),
      });
    }

    // Two standing decorative torches
    const tLeft = this.add.sprite(W / 2 - 320, H / 2 - 60, 'prop_torch').setScale(1.6);
    const tRight = this.add.sprite(W / 2 + 320, H / 2 - 60, 'prop_torch').setScale(1.6);
    this.tweens.add({
      targets: [tLeft, tRight],
      alpha: 0.8,
      duration: 300,
      yoyo: true,
      repeat: -1,
    });

    // Game Title
    const titleText = this.add.text(W / 2, 160, 'UMBRAL ECHOES', {
      fontFamily: 'serif',
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#f8fafc',
      stroke: '#000000',
      strokeThickness: 8,
      letterSpacing: 4,
    });
    titleText.setOrigin(0.5, 0.5);

    const subtitleText = this.add.text(W / 2, 220, '— FORSAKEN DEPTHS —', {
      fontFamily: 'serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 4,
      letterSpacing: 6,
    });
    subtitleText.setOrigin(0.5, 0.5);

    const genreText = this.add.text(W / 2, 260, 'Dark Fantasy Hack & Slash ARPG', {
      fontFamily: 'serif',
      fontSize: '14px',
      color: '#94a3b8',
    });
    genreText.setOrigin(0.5, 0.5);

    // Menu Buttons Container
    const hasSave = SaveManager.hasSave();
    const startY = 340;
    const spacingY = 55;

    const createButton = (
      label: string,
      y: number,
      enabled: boolean,
      onClick: () => void
    ) => {
      const btn = this.add.text(W / 2, y, label, {
        fontFamily: 'serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: enabled ? '#e2e8f0' : '#4b5563',
        backgroundColor: enabled ? '#181a24' : '#0d0e14',
        padding: { x: 30, y: 10 },
        stroke: '#000',
        strokeThickness: 3,
      });
      btn.setOrigin(0.5, 0.5);

      if (enabled) {
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerover', () => {
          btn.setColor('#fbbf24');
          btn.setBackgroundColor('#282c3f');
        });
        btn.on('pointerout', () => {
          btn.setColor('#e2e8f0');
          btn.setBackgroundColor('#181a24');
        });
        btn.on('pointerdown', () => {
          SoundEngine.getInstance().playButtonClick();
          onClick();
        });
      }
      return btn;
    };

    // 1. New Game
    createButton('NEW CRUSADE', startY, true, () => {
      this.scene.start('CharacterSelectScene');
    });

    // 2. Continue
    const continueBtn = createButton(
      hasSave ? 'CONTINUE VOYAGE' : 'CONTINUE (NO SAVE)',
      startY + spacingY,
      hasSave,
      () => {
        const saved = SaveManager.load();
        if (saved) {
          this.scene.start('GameScene', { loadFromSave: true, saveData: saved });
        }
      }
    );

    // 3. Settings / Audio
    const audioBtn = createButton(
      'MUTE / UNMUTE AUDIO',
      startY + spacingY * 2,
      true,
      () => {
        const isMuted = SoundEngine.getInstance().toggleMute();
        audioBtn.setText(isMuted ? 'AUDIO: MUTED' : 'AUDIO: ACTIVE');
      }
    );

    // 4. Credits & Lore
    createButton('LORE & CREDITS', startY + spacingY * 3, true, () => {
      this.showCreditsModal();
    });

    // 5. Reset Save
    if (hasSave) {
      const resetBtn = this.add.text(W / 2, startY + spacingY * 4 + 10, '[ Reset Local Save ]', {
        fontFamily: 'serif',
        fontSize: '12px',
        color: '#f87171',
      });
      resetBtn.setOrigin(0.5, 0.5);
      resetBtn.setInteractive({ useHandCursor: true });
      resetBtn.on('pointerdown', () => {
        SaveManager.deleteSave();
        resetBtn.setText('Save Erased.');
        continueBtn.setColor('#4b5563');
        continueBtn.setBackgroundColor('#0d0e14');
        continueBtn.disableInteractive();
      });
    }

    // Version label
    const ver = this.add.text(W - 15, H - 15, 'v1.0.0 — Pure Client Web ARPG', {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: '#64748b',
    });
    ver.setOrigin(1, 1);
  }

  private showCreditsModal() {
    const W = 1280;
    const H = 720;
    const modal = this.add.container(W / 2, H / 2).setDepth(500);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0c10, 0.98);
    bg.fillRect(-300, -220, 600, 440);
    bg.lineStyle(2, 0xd97706, 0.9);
    bg.strokeRect(-300, -220, 600, 440);
    modal.add(bg);

    const title = this.add.text(0, -180, 'UMBRAL ECHOES: FORSAKEN DEPTHS', {
      fontFamily: 'serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24',
    }).setOrigin(0.5, 0.5);
    modal.add(title);

    const text = this.add.text(
      0,
      -10,
      [
        'A complete 2D Dark Gothic Fantasy Hack & Slash ARPG',
        'Built with TypeScript, Vite, and Phaser 3.',
        '',
        '• Original universe, lore, enemies, bosses, and legendary gear.',
        '• Web Audio API Procedural Sound Engine (zero external audio files).',
        '• Procedural high-detail canvas pixel-art textures and animations.',
        '• 100% Client-side with automatic localStorage save.',
        '',
        'Developed autonomously with utmost fidelity and care.',
        'Enjoy your journey through the Forsaken Depths!',
      ].join('\n'),
      {
        fontFamily: 'serif',
        fontSize: '13px',
        color: '#e2e8f0',
        align: 'center',
        lineSpacing: 6,
      }
    ).setOrigin(0.5, 0.5);
    modal.add(text);

    const close = this.add.text(0, 175, '[ CLOSE ]', {
      fontFamily: 'serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fbbf24',
      backgroundColor: '#1f2937',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5, 0.5);
    close.setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => {
      SoundEngine.getInstance().playButtonClick();
      modal.destroy();
    });
    modal.add(close);
  }
}
