import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { QuestManager } from '../quests/QuestManager';
import { SKILL_DEFINITIONS } from '../skills/SkillDefinitions';
import { SkillSlot } from '../skills/SkillTypes';

export class HUD extends Phaser.GameObjects.Container {
  private player: Player;
  private questManager: QuestManager;

  // Globes
  private hpText: Phaser.GameObjects.Text;
  private hpFill: Phaser.GameObjects.Graphics;
  private resText: Phaser.GameObjects.Text;
  private resFill: Phaser.GameObjects.Graphics;

  // XP & Level
  private xpFill: Phaser.GameObjects.Graphics;
  private levelText: Phaser.GameObjects.Text;

  // Skill Slots
  private slotIcons: Map<SkillSlot, Phaser.GameObjects.Sprite> = new Map();
  private slotCooldownGfx: Map<SkillSlot, Phaser.GameObjects.Graphics> = new Map();

  // Potions
  private hpPotionCountText!: Phaser.GameObjects.Text;
  private manaPotionCountText!: Phaser.GameObjects.Text;

  // Quest Tracker
  private questTitleText: Phaser.GameObjects.Text;
  private questProgressText: Phaser.GameObjects.Text;

  // Boss Bar
  private bossContainer: Phaser.GameObjects.Container;
  private bossBarFill: Phaser.GameObjects.Graphics;
  private bossNameText: Phaser.GameObjects.Text;

  // Area & Gold
  private areaText: Phaser.GameObjects.Text;
  private goldText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player, questManager: QuestManager) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.player = player;
    this.questManager = questManager;
    this.setDepth(200);
    this.setScrollFactor(0);

    const W = 1280;
    const H = 720;

    // --- HEALTH GLOBE (Bottom Left) ---
    const hgX = 90;
    const hgY = H - 75;

    this.hpFill = scene.add.graphics();
    this.add(this.hpFill);

    const hpFrame = scene.add.image(hgX, hgY, 'ui_globe_frame');
    this.add(hpFrame);

    this.hpText = scene.add.text(hgX, hgY, '100/100', {
      fontFamily: 'serif',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.hpText.setOrigin(0.5, 0.5);
    this.add(this.hpText);

    // --- RESOURCE GLOBE (Bottom Right) ---
    const rgX = W - 90;
    const rgY = H - 75;

    this.resFill = scene.add.graphics();
    this.add(this.resFill);

    const resFrame = scene.add.image(rgX, rgY, 'ui_globe_frame');
    this.add(resFrame);

    this.resText = scene.add.text(rgX, rgY, '100/100', {
      fontFamily: 'serif',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.resText.setOrigin(0.5, 0.5);
    this.add(this.resText);

    // --- CENTER HOTBAR ---
    const centerX = W / 2;
    const barY = H - 45;

    // Background bar panel
    const barBg = scene.add.graphics();
    barBg.fillStyle(0x0a0c12, 0.9);
    barBg.fillRect(centerX - 240, barY - 26, 480, 52);
    barBg.lineStyle(2, 0x4a3e30, 0.9);
    barBg.strokeRect(centerX - 240, barY - 26, 480, 52);
    this.add(barBg);

    // Potion Slots: Q (HP) & E (Mana)
    this.createPotionSlot(centerX - 210, barY, 'icon_potion_hp', 'Q', 'hp');
    this.createPotionSlot(centerX + 210, barY, 'icon_potion_mana', 'E', 'mana');

    // Skill Slots: LMB, RMB, 1, 2, 3, 4
    const slotsConfig: { slot: SkillSlot; label: string; x: number }[] = [
      { slot: 'left', label: 'LMB', x: centerX - 140 },
      { slot: 'right', label: 'RMB', x: centerX - 85 },
      { slot: 'slot1', label: '1', x: centerX - 30 },
      { slot: 'slot2', label: '2', x: centerX + 25 },
      { slot: 'slot3', label: '3', x: centerX + 80 },
      { slot: 'slot4', label: '4', x: centerX + 135 },
    ];

    for (const sc of slotsConfig) {
      this.createSkillSlot(sc.x, barY, sc.slot, sc.label);
    }

    // --- EXPERIENCE BAR & LEVEL ---
    this.xpFill = scene.add.graphics();
    this.add(this.xpFill);

    this.levelText = scene.add.text(centerX, H - 78, 'Lv. 1', {
      fontFamily: 'serif',
      fontSize: '13px',
      color: '#facc15',
      stroke: '#000',
      strokeThickness: 3,
    });
    this.levelText.setOrigin(0.5, 0.5);
    this.add(this.levelText);

    // --- AREA & GOLD (Top Left) ---
    this.areaText = scene.add.text(20, 20, 'Oakhaven Refuge', {
      fontFamily: 'serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f3f4f6',
      stroke: '#000',
      strokeThickness: 3,
    });
    this.add(this.areaText);

    this.goldText = scene.add.text(20, 44, '🪙 50 Gold', {
      fontFamily: 'serif',
      fontSize: '14px',
      color: '#facc15',
      stroke: '#000',
      strokeThickness: 3,
    });
    this.add(this.goldText);

    // UI Hotkey tips
    const tips = scene.add.text(20, 68, '[I] Inventory  [C] Character  [K] Skills  [ESC] Menu', {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: '#9ca3af',
      stroke: '#000',
      strokeThickness: 2,
    });
    this.add(tips);

    // --- QUEST TRACKER (Top Right) ---
    const qx = W - 260;
    const qy = 20;

    const questBg = scene.add.graphics();
    questBg.fillStyle(0x0f1117, 0.85);
    questBg.fillRect(qx - 10, qy - 8, 255, 75);
    questBg.lineStyle(1, 0x473d31, 0.8);
    questBg.strokeRect(qx - 10, qy - 8, 255, 75);
    this.add(questBg);

    this.questTitleText = scene.add.text(qx, qy, 'Main: The Vanishing Sentinel', {
      fontFamily: 'serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 2,
    });
    this.add(this.questTitleText);

    this.questProgressText = scene.add.text(qx, qy + 22, 'Slay Hollow Walkers: 0 / 6', {
      fontFamily: 'serif',
      fontSize: '11px',
      color: '#e2e8f0',
      stroke: '#000',
      strokeThickness: 2,
      wordWrap: { width: 235 },
    });
    this.add(this.questProgressText);

    // --- BOSS HEALTH BAR (Top Center) ---
    this.bossContainer = scene.add.container(W / 2, 45);
    this.bossContainer.setVisible(false);
    this.add(this.bossContainer);

    const bBg = scene.add.graphics();
    bBg.fillStyle(0x0a0a0c, 0.9);
    bBg.fillRect(-220, -12, 440, 24);
    bBg.lineStyle(2, 0xd97706, 0.9);
    bBg.strokeRect(-220, -12, 440, 24);
    this.bossContainer.add(bBg);

    this.bossBarFill = scene.add.graphics();
    this.bossContainer.add(this.bossBarFill);

    this.bossNameText = scene.add.text(0, -25, 'Grave Lord Malakor', {
      fontFamily: 'serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f87171',
      stroke: '#000',
      strokeThickness: 3,
    });
    this.bossNameText.setOrigin(0.5, 0.5);
    this.bossContainer.add(this.bossNameText);
  }

  private createPotionSlot(x: number, y: number, iconKey: string, keyLabel: string, type: 'hp' | 'mana') {
    const slot = this.scene.add.image(x, y, 'ui_slot');
    this.add(slot);

    const icon = this.scene.add.image(x, y, iconKey);
    this.add(icon);

    const keyTxt = this.scene.add.text(x - 14, y - 18, keyLabel, {
      fontFamily: 'serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#facc15',
      stroke: '#000',
      strokeThickness: 2,
    });
    this.add(keyTxt);

    const countTxt = this.scene.add.text(x + 8, y + 6, '3', {
      fontFamily: 'serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2,
    });
    this.add(countTxt);

    if (type === 'hp') this.hpPotionCountText = countTxt;
    else this.manaPotionCountText = countTxt;
  }

  private createSkillSlot(x: number, y: number, slotKey: SkillSlot, label: string) {
    const slotBg = this.scene.add.image(x, y, 'ui_slot');
    this.add(slotBg);

    const icon = this.scene.add.sprite(x, y, 'icon_sword');
    icon.setVisible(false);
    this.add(icon);
    this.slotIcons.set(slotKey, icon);

    const cdGfx = this.scene.add.graphics();
    this.add(cdGfx);
    this.slotCooldownGfx.set(slotKey, cdGfx);

    const lbl = this.scene.add.text(x - 16, y - 18, label, {
      fontFamily: 'serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#facc15',
      stroke: '#000',
      strokeThickness: 2,
    });
    this.add(lbl);
  }

  public updateHUD(time: number, delta: number, areaName: string, activeBoss?: Boss | null) {
    const p = this.player;

    // Health Globe
    this.hpText.setText(`${Math.max(0, Math.round(p.hp))}/${p.maxHp}`);
    this.hpFill.clear();
    const hpRatio = Math.max(0, Math.min(1, p.hp / p.maxHp));
    const hgX = 90;
    const hgY = 720 - 75;
    // Draw red circle clipped by height
    this.hpFill.fillStyle(0xdc2626, 0.95);
    const fillH = 68 * hpRatio;
    this.hpFill.beginPath();
    this.hpFill.arc(hgX, hgY, 34, 0, Math.PI * 2);
    this.hpFill.fill();
    // Black cover for empty portion
    this.hpFill.fillStyle(0x18181b, 0.85);
    this.hpFill.fillRect(hgX - 35, hgY - 35, 70, 68 - fillH);

    // Resource Globe
    this.resText.setText(`${Math.max(0, Math.round(p.resource))}/${p.maxResource}`);
    this.resFill.clear();
    const resRatio = Math.max(0, Math.min(1, p.resource / p.maxResource));
    const rgX = 1280 - 90;
    const rgY = 720 - 75;
    const resColor = p.resourceType === 'fury' ? 0xf97316 : 0x2563eb;
    this.resFill.fillStyle(resColor, 0.95);
    const rFillH = 68 * resRatio;
    this.resFill.beginPath();
    this.resFill.arc(rgX, rgY, 34, 0, Math.PI * 2);
    this.resFill.fill();
    this.resFill.fillStyle(0x18181b, 0.85);
    this.resFill.fillRect(rgX - 35, rgY - 35, 70, 68 - rFillH);

    // XP Bar (Center bottom thin line)
    this.xpFill.clear();
    const reqExp = p.getExpRequiredForLevel(p.level);
    const expRatio = Math.max(0, Math.min(1, p.exp / reqExp));
    const xpW = 460;
    const xpX = 1280 / 2 - xpW / 2;
    const xpY = 720 - 70;
    this.xpFill.fillStyle(0x1f2937, 0.8);
    this.xpFill.fillRect(xpX, xpY, xpW, 5);
    this.xpFill.fillStyle(0xa855f7, 0.9);
    this.xpFill.fillRect(xpX, xpY, xpW * expRatio, 5);

    this.levelText.setText(`Level ${p.level}`);

    // Potion counts
    this.hpPotionCountText.setText(String(p.inventory.hpPotions));
    this.manaPotionCountText.setText(String(p.inventory.manaPotions));

    // Gold
    this.goldText.setText(`🪙 ${p.inventory.gold} Gold`);
    this.areaText.setText(areaName);

    // Skill slots & cooldowns
    for (const [slotKey, icon] of this.slotIcons.entries()) {
      const skillId = p.skillManager.slots[slotKey];
      if (skillId) {
        const def = SKILL_DEFINITIONS[skillId];
        if (def) {
          icon.setTexture(def.icon);
          icon.setVisible(true);

          const cdGfx = this.slotCooldownGfx.get(slotKey);
          if (cdGfx) {
            cdGfx.clear();
            const pct = p.skillManager.getCooldownPercent(skillId, time);
            if (pct > 0) {
              cdGfx.fillStyle(0x000000, 0.7);
              cdGfx.fillRect(icon.x - 20, icon.y - 20 + 40 * (1 - pct), 40, 40 * pct);
            }
          }
        }
      } else {
        icon.setVisible(false);
      }
    }

    // Quest Tracker
    const q = this.questManager.getActiveMainQuest();
    if (q) {
      this.questTitleText.setText(`Main: ${q.title}`);
      if (q.isCompleted) {
        this.questProgressText.setText('Objective Complete! Talk to Elder Corvus.');
        this.questProgressText.setColor('#4ade80');
      } else {
        this.questProgressText.setText(`${q.description} (${q.currentCount}/${q.targetCount})`);
        this.questProgressText.setColor('#e2e8f0');
      }
    } else {
      this.questTitleText.setText('Campaign Completed!');
      this.questProgressText.setText('All shadows dispelled.');
      this.questProgressText.setColor('#facc15');
    }

    // Boss Bar
    if (activeBoss && activeBoss.active && activeBoss.hp > 0) {
      this.bossContainer.setVisible(true);
      this.bossNameText.setText(`${activeBoss.bossName} - ${activeBoss.bossTitle} (Phase ${activeBoss.phase})`);
      this.bossBarFill.clear();
      const bRatio = Math.max(0, Math.min(1, activeBoss.hp / activeBoss.maxHp));
      this.bossBarFill.fillStyle(0xdc2626, 0.9);
      this.bossBarFill.fillRect(-218, -10, 436 * bRatio, 20);
    } else {
      this.bossContainer.setVisible(false);
    }
  }
}
