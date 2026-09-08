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

    const pW = 420;
    const pH = 460;

    // Background
    const bg = scene.add.graphics();
    bg.fillStyle(0x0f1117, 0.95);
    bg.fillRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(3, 0x473d31, 0.95);
    bg.strokeRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(1, 0xb45309, 0.8);
    bg.strokeRect(-pW / 2 + 4, -pH / 2 + 4, pW - 8, pH - 8);
    this.add(bg);

    // Title
    const title = scene.add.text(0, -pH / 2 + 20, 'CHARACTER SHEET', {
      fontFamily: 'serif',
      fontSize: '17px',
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
    this.statsText = scene.add.text(-pW / 2 + 30, -pH / 2 + 60, '', {
      fontFamily: 'serif',
      fontSize: '13px',
      color: '#e2e8f0',
      lineSpacing: 8,
    });
    this.add(this.statsText);
  }

  public refresh() {
    const p = this.player;
    const className = p.className === 'vanguard' ? 'Vanguard (Iron Sentinel)' : 'Arcanist (Umbral Weaver)';
    const reqExp = p.getExpRequiredForLevel(p.level);

    const txt = [
      `Hero: ${className}`,
      `Level: ${p.level}   (EXP: ${p.exp} / ${reqExp})`,
      `---------------------------------------`,
      `❤️ Maximum Life: ${p.maxHp}`,
      `🔷 Maximum ${p.resourceType === 'fury' ? 'Fury' : 'Mana'}: ${p.maxResource}`,
      `⚔️ Attack Damage: ${p.attack}`,
      `🛡️ Armor: ${p.armor}  (Damage Reduction: ${Math.round((p.armor / (p.armor + 60)) * 100)}%)`,
      `💥 Critical Chance: ${Math.round(p.critChance * 100)}%`,
      `⚡ Critical Damage: +${Math.round(p.critDamage * 100)}%`,
      `🗡️ Attack Speed: ${p.attackSpeed}x`,
      `👟 Movement Speed: ${p.moveSpeed}`,
      `🩸 Life Steal: ${Math.round(p.lifeSteal * 100)}%`,
      `🔥 Fire Damage: +${p.fireDamage}`,
      `❄️ Cold Damage: +${p.coldDamage}`,
      `⚡ Lightning Damage: +${p.lightningDamage}`,
      `---------------------------------------`,
      `Available Skill Points: ${p.skillManager.skillPoints}`,
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
