import Phaser from 'phaser';
import { SoundEngine } from '../audio/SoundEngine';

export interface EndingData {
  className: string;
  level: number;
  gold: number;
  monstersKilled: number;
  legendariesFound: number;
}

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  public create(data: EndingData) {
    const W = 1280;
    const H = 720;

    SoundEngine.getInstance().playLevelUp();

    // Dark backdrop
    for (let x = 0; x < W; x += 32) {
      for (let y = 0; y < H; y += 32) {
        const t = this.add.image(x + 16, y + 16, 'tile_stone_floor');
        t.setTint(0x101018);
      }
    }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x050508, 0.85);
    overlay.fillRect(0, 0, W, H);

    // Glowing victory particles
    for (let i = 0; i < 35; i++) {
      const p = this.add.sprite(
        Phaser.Math.Between(100, W - 100),
        Phaser.Math.Between(100, H - 100),
        'fx_dot'
      );
      p.setTint(Phaser.Math.RND.pick([0xfacc15, 0x38bdf8, 0xf97316, 0xffffff]));
      p.setScale(Phaser.Math.FloatBetween(0.6, 1.4));
      this.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(40, 100),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 5000),
        repeat: -1,
      });
    }

    // Victory Title
    const victoryTitle = this.add.text(W / 2, 110, 'VICTORY IN OBLIVION', {
      fontFamily: 'serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 6,
    });
    victoryTitle.setOrigin(0.5, 0.5);

    const epilogue = this.add.text(
      W / 2,
      190,
      [
        'Malagath, the Void Sovereign, collapses into dissolving embers.',
        'The dark celestial eclipse shatters, and dawn returns to the realm of mortal men.',
        'Your name is forever carved into the stones of Oakhaven Refuge as the Savior of the Depths.',
      ].join('\n'),
      {
        fontFamily: 'serif',
        fontSize: '15px',
        color: '#e2e8f0',
        align: 'center',
        lineSpacing: 8,
      }
    );
    epilogue.setOrigin(0.5, 0.5);

    // Stats Panel
    const statsContainer = this.add.container(W / 2, 380);

    const sBg = this.add.graphics();
    sBg.fillStyle(0x0f1118, 0.95);
    sBg.fillRect(-260, -110, 520, 220);
    sBg.lineStyle(2, 0xd97706, 0.9);
    sBg.strokeRect(-260, -110, 520, 220);
    statsContainer.add(sBg);

    const statsHeader = this.add.text(0, -85, '— CRUSADE RECORD —', {
      fontFamily: 'serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#fbbf24',
    }).setOrigin(0.5, 0.5);
    statsContainer.add(statsHeader);

    const statsInfo = [
      `Hero Class: ${data.className === 'vanguard' ? 'Vanguard' : 'Arcanist'}`,
      `Final Level: Level ${data.level || 15}`,
      `Abominations Slain: ${data.monstersKilled || 48}`,
      `Legendary Relics Acquired: ${data.legendariesFound || 3}`,
      `Total Gold Amassed: 🪙 ${data.gold || 1250}`,
    ].join('\n');

    const statsText = this.add.text(0, 15, statsInfo, {
      fontFamily: 'serif',
      fontSize: '14px',
      color: '#f8fafc',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5, 0.5);
    statsContainer.add(statsText);

    // Return to Title Button
    const returnBtn = this.add.text(W / 2, 580, 'RETURN TO TITLE', {
      fontFamily: 'serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24',
      backgroundColor: '#78350f',
      padding: { x: 30, y: 12 },
      stroke: '#000',
      strokeThickness: 3,
    });
    returnBtn.setOrigin(0.5, 0.5);
    returnBtn.setInteractive({ useHandCursor: true });

    returnBtn.on('pointerover', () => {
      returnBtn.setBackgroundColor('#92400e');
      returnBtn.setScale(1.05);
    });
    returnBtn.on('pointerout', () => {
      returnBtn.setBackgroundColor('#78350f');
      returnBtn.setScale(1.0);
    });
    returnBtn.on('pointerdown', () => {
      SoundEngine.getInstance().playButtonClick();
      this.scene.start('MainMenuScene');
    });
  }
}
