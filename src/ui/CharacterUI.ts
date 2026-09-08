import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { SoundEngine } from '../audio/SoundEngine';

export class CharacterUI extends Phaser.GameObjects.Container {
  private player: Player;
  private statsText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 1280 / 2, 720 / 2);
    scene.add.existing(this);

    this.player = player;
    this.setDepth(300);
    this.setScrollFactor(0);
    this.setVisible(false);

    const pW = 460;
    const pH = 480;

    // Background (100% opaque to prevent background bleed / ghosting)
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0c10, 1.0);
    bg.fillRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(2, 0x473d31, 1.0);
    bg.strokeRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(1, 0xb45309, 0.9);
    bg.strokeRect(-pW / 2 + 4, -pH / 2 + 4, pW - 8, pH - 8);
    this.add(bg);

    // Title
    const title = scene.add.text(0, -pH / 2 + 24, '캐릭터 능력치 (CHARACTER SHEET)', {
      fontFamily: "'Segoe UI', 'Noto Sans KR', sans-serif",
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 3,
    });
    title.setOrigin(0.5, 0.5);
    this.add(title);

    // Close Button [X]
    const closeBtn = scene.add.text(pW / 2 - 25, -pH / 2 + 15, '✕', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#f87171',
    });
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      SoundEngine.getInstance().playButtonClick();
      this.close();
    });
    this.add(closeBtn);

    // Stats content text
    this.statsText = scene.add.text(-pW / 2 + 32, -pH / 2 + 58, '', {
      fontFamily: "'Segoe UI', 'Noto Sans KR', monospace",
      fontSize: '12px',
      color: '#e2e8f0',
      lineSpacing: 6,
    });
    this.add(this.statsText);
  }

  public refresh() {
    const p = this.player;
    const className = p.className === 'vanguard' ? '선봉장 (Vanguard - The Iron Sentinel)' : '비전술사 (Arcanist - The Umbral Weaver)';
    const reqExp = p.getExpRequiredForLevel(p.level);

    const txt = [
      `영웅 클래스 : ${className}`,
      `현재 레벨   : Lv.${p.level}  [EXP: ${p.exp} / ${reqExp}]`,
      `스킬 포인트 : ${p.skillManager.skillPoints} 포인트 사용 가능 [K 키로 습득]`,
      `──────────────────────────────────────────────`,
      `최대 생명력 (Max Life)       : ${p.maxHp}`,
      `최대 ${p.resourceType === 'fury' ? '분노 (Max Fury)' : '마나 (Max Mana)'}    : ${p.maxResource}`,
      `기본 공격력 (Attack Damage)  : ${p.attack}`,
      `방어력 (Armor)               : ${p.armor}  (피해 감소: ${Math.round((p.armor / (p.armor + 60)) * 100)}%)`,
      `치명타 확률 (Crit Chance)     : ${Math.round(p.critChance * 100)}%`,
      `치명타 피해 (Crit Damage)     : +${Math.round(p.critDamage * 100)}%`,
      `공격 속도 (Attack Speed)     : ${p.attackSpeed.toFixed(2)}x`,
      `이동 속도 (Movement Speed)   : ${p.moveSpeed}`,
      `생명력 흡수 (Life Steal)     : ${Math.round(p.lifeSteal * 100)}%`,
      `화염 원소 피해 (Fire Damage) : +${p.fireDamage}`,
      `냉기 원소 피해 (Cold Damage) : +${p.coldDamage}`,
      `번개 원소 피해 (Lightning)   : +${p.lightningDamage}`,
      `──────────────────────────────────────────────`,
      `[I] 가방/장비   [K] 스킬 수련   [ESC] 닫기`,
    ].join('\n');

    this.statsText.setText(txt);
  }

  public toggle() {
    this.setVisible(!this.visible);
    if (this.visible) {
      this.refresh();
      SoundEngine.getInstance().playButtonClick();
    }
  }

  public close() {
    this.setVisible(false);
  }
}
