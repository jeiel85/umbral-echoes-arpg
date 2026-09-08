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
    const titleText = this.add.text(W / 2, 155, 'UMBRAL ECHOES', {
      fontFamily: "'Cinzel', serif",
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#f8fafc',
      stroke: '#000000',
      strokeThickness: 8,
      letterSpacing: 4,
    });
    titleText.setOrigin(0.5, 0.5);

    const subtitleText = this.add.text(W / 2, 215, '— FORSAKEN DEPTHS —', {
      fontFamily: "'Cinzel', serif",
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 4,
      letterSpacing: 6,
    });
    subtitleText.setOrigin(0.5, 0.5);

    const genreText = this.add.text(W / 2, 255, '정통 다크 판타지 핵앤슬래시 ARPG', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '14px',
      color: '#94a3b8',
      stroke: '#000',
      strokeThickness: 2,
    });
    genreText.setOrigin(0.5, 0.5);

    // Menu Buttons Container
    const hasSave = SaveManager.hasSave();
    const startY = 330;
    const spacingY = 55;

    const createButton = (
      label: string,
      y: number,
      enabled: boolean,
      onClick: () => void
    ) => {
      const btn = this.add.text(W / 2, y, label, {
        fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
        fontSize: '15px',
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
    createButton('새 여정 시작 (NEW GAME)', startY, true, () => {
      this.scene.start('CharacterSelectScene');
    });

    // 2. Continue
    const continueBtn = createButton(
      hasSave ? '여정 이어하기 (CONTINUE)' : '여정 이어하기 (저장 없음)',
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
      '음향 On / Off (SOUND)',
      startY + spacingY * 2,
      true,
      () => {
        const isMuted = SoundEngine.getInstance().toggleMute();
        audioBtn.setText(isMuted ? '음향: 음소거됨 (MUTED)' : '음향: 켜짐 (ACTIVE)');
      }
    );

    // 4. Credits & Lore
    createButton('게임 설명서 & 정보 (MANUAL)', startY + spacingY * 3, true, () => {
      this.showCreditsModal();
    });

    // 5. Reset Save
    if (hasSave) {
      const resetBtn = this.add.text(W / 2, startY + spacingY * 4 + 10, '[ 저장 데이터 초기화 ]', {
        fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
        fontSize: '12px',
        color: '#f87171',
      });
      resetBtn.setOrigin(0.5, 0.5);
      resetBtn.setInteractive({ useHandCursor: true });
      resetBtn.on('pointerdown', () => {
        SaveManager.deleteSave();
        resetBtn.setText('저장 데이터가 삭제되었습니다.');
        continueBtn.setColor('#4b5563');
        continueBtn.setBackgroundColor('#0d0e14');
        continueBtn.disableInteractive();
      });
    }

    // Version label
    const ver = this.add.text(W - 15, H - 15, 'v1.0.0 — Pure Client Web ARPG', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
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
    bg.fillRect(-320, -220, 640, 440);
    bg.lineStyle(2, 0xd97706, 0.9);
    bg.strokeRect(-320, -220, 640, 440);
    modal.add(bg);

    const title = this.add.text(0, -180, '조작법 및 게임 안내 (GAME GUIDE)', {
      fontFamily: "'Noto Sans KR', 'Cinzel', sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24',
    }).setOrigin(0.5, 0.5);
    modal.add(title);

    const text = this.add.text(
      0,
      -10,
      [
        '◆ 조작 가이드 ◆',
        '• 이동: WASD 또는 마우스 좌클릭 (원하는 위치 이동)',
        '• 기본 공격: 마우스 좌클릭(LMB) / 우클릭(RMB)',
        '• 스킬 시전: 숫자 키 1, 2, 3, 4',
        '• 물약 사용: Q (생명력 물약) / E (마나 물약)',
        '• 단축키: I (가방/장비), C (캐릭터 정보), K (스킬 트리), Tab (미니맵), ESC (메뉴)',
        '• 상호작용: Space 키 또는 마우스 클릭 (NPC 대화, 상자 열기, 포탈 이동)',
        '',
        '◆ 게임 특징 ◆',
        '• 웹 브라우저에서 바로 실행되는 100% 클라이언트 다크 판타지 핵앤슬래시',
        '• 2종 영웅 클래스(선봉장, 비전술사), 8종 고유 스킬, 8종 전설 유니크 아이템',
        '• 10종 몬스터 및 정예 속성, 3종의 다단계 페이즈 보스 레이드',
      ].join('\n'),
      {
        fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
        fontSize: '12px',
        color: '#e2e8f0',
        align: 'left',
        lineSpacing: 5,
      }
    ).setOrigin(0.5, 0.5);
    modal.add(text);

    const close = this.add.text(0, 175, '[ 닫 기 (CLOSE) ]', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fbbf24',
      backgroundColor: '#1f2937',
      padding: { x: 18, y: 8 },
    }).setOrigin(0.5, 0.5);
    close.setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => {
      SoundEngine.getInstance().playButtonClick();
      modal.destroy();
    });
    modal.add(close);
  }
}
