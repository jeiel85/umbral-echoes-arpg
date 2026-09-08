import Phaser from 'phaser';
import { SoundEngine } from '../audio/SoundEngine';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedClass: 'vanguard' | 'arcanist' = 'vanguard';
  private vanguardCard!: Phaser.GameObjects.Container;
  private arcanistCard!: Phaser.GameObjects.Container;
  private embarkBtn!: Phaser.GameObjects.Text;

  constructor() {
    super('CharacterSelectScene');
  }

  public create() {
    const W = 1280;
    const H = 720;

    // Background
    for (let x = 0; x < W; x += 32) {
      for (let y = 0; y < H; y += 32) {
        const t = this.add.image(x + 16, y + 16, 'tile_stone_floor');
        t.setTint(0x1a1522);
      }
    }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x05040a, 0.7);
    overlay.fillRect(0, 0, W, H);

    // Title
    const title = this.add.text(W / 2, 65, '영웅 선택 (CHOOSE YOUR HERO)', {
      fontFamily: "'Cinzel', 'Noto Sans KR', serif",
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 5,
    });
    title.setOrigin(0.5, 0.5);

    const subtitle = this.add.text(W / 2, 105, '심연의 어둠에 맞설 당신의 영웅을 선택하십시오', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '14px',
      color: '#94a3b8',
    });
    subtitle.setOrigin(0.5, 0.5);

    // Card 1: Vanguard
    this.vanguardCard = this.createClassCard(
      W / 2 - 250,
      360,
      'vanguard',
      '선봉장 (VANGUARD)',
      '강철의 수호자 (The Iron Sentinel)',
      'char_vanguard',
      [
        '역할: 강력한 근접 전사',
        '전투 자원: 분노 (공격/피격 시 충전)',
        '주 무기: 대검 & 판금 갑옷',
        '특징: 높은 생명력, 강력한 베기,',
        '도약 분쇄 및 휠윈드 광역 섬멸',
        '',
        '기본 보유 스킬:',
        '• 휩쓸기 (Cleave) - 전방 베기',
        '• 대지 강타 (Seismic Slam) - 광역 기절',
      ]
    );

    // Card 2: Arcanist
    this.arcanistCard = this.createClassCard(
      W / 2 + 250,
      360,
      'arcanist',
      '비전술사 (ARCANIST)',
      '그림자 직조자 (The Umbral Weaver)',
      'char_arcanist',
      [
        '역할: 원거리 원소 마법사',
        '전투 자원: 마나 (빠른 자동 회복)',
        '주 무기: 고대 지팡이 & 주문서',
        '특징: 관통 마법창, 빙결 고리,',
        '파멸의 운석 낙하 및 차원 도약',
        '',
        '기본 보유 스킬:',
        '• 비전 화살 (Arcane Bolt) - 관통 창',
        '• 빙결 고리 (Glacial Nova) - 광역 동결',
      ]
    );

    this.selectClass('vanguard');

    // Embark Button
    this.embarkBtn = this.add.text(W / 2, 620, '어둠 속으로 출전 (EMBARK)', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24',
      backgroundColor: '#78350f',
      padding: { x: 35, y: 14 },
      stroke: '#000',
      strokeThickness: 3,
    });
    this.embarkBtn.setOrigin(0.5, 0.5);
    this.embarkBtn.setInteractive({ useHandCursor: true });

    this.embarkBtn.on('pointerover', () => {
      this.embarkBtn.setBackgroundColor('#92400e');
      this.embarkBtn.setScale(1.05);
    });
    this.embarkBtn.on('pointerout', () => {
      this.embarkBtn.setBackgroundColor('#78350f');
      this.embarkBtn.setScale(1.0);
    });
    this.embarkBtn.on('pointerdown', () => {
      SoundEngine.getInstance().playButtonClick();
      this.scene.start('GameScene', { className: this.selectedClass, loadFromSave: false });
    });

    // Back Button
    const backBtn = this.add.text(80, 50, '◀ 뒤로 가기', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#9ca3af',
    });
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      SoundEngine.getInstance().playButtonClick();
      this.scene.start('MainMenuScene');
    });
  }

  private createClassCard(
    x: number,
    y: number,
    cKey: 'vanguard' | 'arcanist',
    name: string,
    sub: string,
    spriteKey: string,
    details: string[]
  ): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);
    const cW = 380;
    const cH = 440;

    const bg = this.add.graphics();
    bg.name = 'cardBg';
    card.add(bg);

    // Hero Sprite preview
    const sprite = this.add.sprite(0, -cH / 2 + 75, spriteKey);
    sprite.setScale(2.2);
    card.add(sprite);

    // Name
    const title = this.add.text(0, -cH / 2 + 135, name, {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f8fafc',
    });
    title.setOrigin(0.5, 0.5);
    card.add(title);

    const subTitle = this.add.text(0, -cH / 2 + 160, sub, {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#fbbf24',
    });
    subTitle.setOrigin(0.5, 0.5);
    card.add(subTitle);

    // Details text
    const det = this.add.text(0, -cH / 2 + 185, details.join('\n'), {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '12px',
      color: '#cbd5e1',
      align: 'center',
      lineSpacing: 5,
    });
    det.setOrigin(0.5, 0);
    card.add(det);

    // Interactive card selection
    card.setSize(cW, cH);
    card.setInteractive({ useHandCursor: true });
    card.on('pointerdown', () => {
      SoundEngine.getInstance().playButtonClick();
      this.selectClass(cKey);
    });

    return card;
  }

  private selectClass(className: 'vanguard' | 'arcanist') {
    this.selectedClass = className;
    const cW = 380;
    const cH = 440;

    const updateCardGfx = (card: Phaser.GameObjects.Container, isSelected: boolean) => {
      const bg = card.getByName('cardBg') as Phaser.GameObjects.Graphics;
      if (!bg) return;
      bg.clear();
      bg.fillStyle(isSelected ? 0x1a1d29 : 0x0f1118, 0.95);
      bg.fillRect(-cW / 2, -cH / 2, cW, cH);
      bg.lineStyle(isSelected ? 3 : 1, isSelected ? 0xfacc15 : 0x473d31, 1);
      bg.strokeRect(-cW / 2, -cH / 2, cW, cH);
    };

    updateCardGfx(this.vanguardCard, className === 'vanguard');
    updateCardGfx(this.arcanistCard, className === 'arcanist');
  }
}
