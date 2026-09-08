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
    const victoryTitle = this.add.text(W / 2, 105, '심연의 종식: 승리 (VICTORY IN OBLIVION)', {
      fontFamily: "'Cinzel', 'Noto Sans KR', serif",
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 6,
    });
    victoryTitle.setOrigin(0.5, 0.5);

    const epilogue = this.add.text(
      W / 2,
      185,
      [
        '공허의 군주 말라가스는 산산이 부서져 타오르는 잿더미로 스러졌습니다.',
        '대지를 뒤덮던 칠흑 같은 개기일식이 걷히고, 마침내 지상에 따스한 여명의 빛이 돌아옵니다.',
        '당신의 이름은 잿빛 안식처와 왕국의 역사에 세상을 구원한 영웅으로 영원히 새겨질 것입니다.',
      ].join('\n'),
      {
        fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
        fontSize: '14px',
        color: '#e2e8f0',
        align: 'center',
        lineSpacing: 8,
      }
    );
    epilogue.setOrigin(0.5, 0.5);

    // Stats Panel
    const statsContainer = this.add.container(W / 2, 375);

    const sBg = this.add.graphics();
    sBg.fillStyle(0x0a0c10, 1.0);
    sBg.fillRect(-260, -110, 520, 220);
    sBg.lineStyle(2, 0xd97706, 0.95);
    sBg.strokeRect(-260, -110, 520, 220);
    statsContainer.add(sBg);

    const statsHeader = this.add.text(0, -85, '— 성전 원정 기록 (CRUSADE RECORD) —', {
      fontFamily: "'Noto Sans KR', 'Cinzel', sans-serif",
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fbbf24',
    }).setOrigin(0.5, 0.5);
    statsContainer.add(statsHeader);

    const statsInfo = [
      `영웅 클래스 : ${data.className === 'vanguard' ? '선봉장 (Vanguard)' : '비전술사 (Arcanist)'}`,
      `최종 레벨   : Lv.${data.level || 15}`,
      `처치한 마물 : ${data.monstersKilled || 48} 마리`,
      `발견한 전설 : ${data.legendariesFound || 3} 개`,
      `축적한 골드 : ${data.gold || 1250} G`,
    ].join('\n');

    const statsText = this.add.text(0, 15, statsInfo, {
      fontFamily: "'Noto Sans KR', 'Segoe UI', monospace",
      fontSize: '13px',
      color: '#f8fafc',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5, 0.5);
    statsContainer.add(statsText);

    // Return to Title Button
    const returnBtn = this.add.text(W / 2, 575, '[ 메인 화면으로 (RETURN TO TITLE) ]', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '16px',
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
