import Phaser from 'phaser';
import { SoundEngine } from '../audio/SoundEngine';

export class PauseMenuUI extends Phaser.GameObjects.Container {
  private onResumeCallback: () => void;
  private onSaveCallback: () => void;
  private onQuitCallback: () => void;
  private saveStatusText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    onResume: () => void,
    onSave: () => void,
    onQuit: () => void
  ) {
    super(scene, 1280 / 2, 720 / 2);
    scene.add.existing(this);

    this.onResumeCallback = onResume;
    this.onSaveCallback = onSave;
    this.onQuitCallback = onQuit;

    this.setDepth(400);
    this.setScrollFactor(0);
    this.setVisible(false);

    const pW = 400;
    const pH = 420;

    // Background
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0c10, 0.97);
    bg.fillRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(2, 0x473d31, 0.95);
    bg.strokeRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(1, 0xb45309, 0.8);
    bg.strokeRect(-pW / 2 + 4, -pH / 2 + 4, pW - 8, pH - 8);
    this.add(bg);

    // Title
    const title = scene.add.text(0, -pH / 2 + 30, '일시 정지 (PAUSED)', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 3,
    });
    title.setOrigin(0.5, 0.5);
    this.add(title);

    // Menu Buttons
    const buttons = [
      {
        label: '게임 재개 (RESUME)',
        action: () => {
          this.close();
          this.onResumeCallback();
        },
      },
      {
        label: '게임 저장 (SAVE)',
        action: () => {
          this.onSaveCallback();
          this.saveStatusText.setText('게임 진행 상황이 저장되었습니다!');
          this.scene.time.delayedCall(2000, () => this.saveStatusText.setText(''));
        },
      },
      {
        label: '음향 On / Off (SOUND)',
        action: () => {
          const muted = SoundEngine.getInstance().toggleMute();
          this.saveStatusText.setText(muted ? '음향 꺼짐 (Muted)' : '음향 켜짐 (Enabled)');
          this.scene.time.delayedCall(1500, () => this.saveStatusText.setText(''));
        },
      },
      {
        label: '메인 메뉴로 (TITLE)',
        action: () => {
          this.close();
          this.onQuitCallback();
        },
      },
    ];

    const startY = -60;
    const spacingY = 55;

    buttons.forEach((btn, idx) => {
      const bY = startY + idx * spacingY;
      const bText = scene.add.text(0, bY, btn.label, {
        fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#e2e8f0',
        backgroundColor: '#1f2937',
        padding: { x: 20, y: 10 },
      });
      bText.setOrigin(0.5, 0.5);
      bText.setInteractive({ useHandCursor: true });

      bText.on('pointerover', () => {
        bText.setColor('#fbbf24');
        bText.setBackgroundColor('#374151');
      });
      bText.on('pointerout', () => {
        bText.setColor('#e2e8f0');
        bText.setBackgroundColor('#1f2937');
      });
      bText.on('pointerdown', () => {
        SoundEngine.getInstance().playButtonClick();
        btn.action();
      });

      this.add(bText);
    });

    this.saveStatusText = scene.add.text(0, pH / 2 - 30, '', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '12px',
      color: '#4ade80',
    });
    this.saveStatusText.setOrigin(0.5, 0.5);
    this.add(this.saveStatusText);
  }

  public open() {
    this.setVisible(true);
    SoundEngine.getInstance().playButtonClick();
  }

  public close() {
    this.setVisible(false);
  }
}
