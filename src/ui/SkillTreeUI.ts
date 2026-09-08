import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { SKILL_DEFINITIONS } from '../skills/SkillDefinitions';
import { SkillId, SkillSlot } from '../skills/SkillTypes';
import { SoundEngine } from '../audio/SoundEngine';

export class SkillTreeUI extends Phaser.GameObjects.Container {
  private player: Player;
  private skillEntriesContainer: Phaser.GameObjects.Container;
  private pointsText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 1280 / 2, 720 / 2);
    scene.add.existing(this);

    this.player = player;
    this.setDepth(300);
    this.setScrollFactor(0);
    this.setVisible(false);

    const pW = 660;
    const pH = 520;

    // Background (100% opaque)
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0c10, 1.0);
    bg.fillRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(3, 0x473d31, 1.0);
    bg.strokeRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(1, 0xb45309, 0.9);
    bg.strokeRect(-pW / 2 + 4, -pH / 2 + 4, pW - 8, pH - 8);
    this.add(bg);

    // Title
    const title = scene.add.text(0, -pH / 2 + 20, '스킬 및 전문화 (SKILL TREE & MASTERIES)', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 3,
    });
    title.setOrigin(0.5, 0.5);
    this.add(title);

    // Points display
    this.pointsText = scene.add.text(0, -pH / 2 + 45, '사용 가능한 스킬 포인트: 0 P', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#a855f7',
      stroke: '#000',
      strokeThickness: 2,
    });
    this.pointsText.setOrigin(0.5, 0.5);
    this.add(this.pointsText);

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

    this.skillEntriesContainer = scene.add.container(0, 0);
    this.add(this.skillEntriesContainer);
  }

  public refresh() {
    this.skillEntriesContainer.removeAll(true);
    this.pointsText.setText(`사용 가능한 스킬 포인트: ${this.player.skillManager.skillPoints} P`);

    const classSkills = Object.values(SKILL_DEFINITIONS).filter((s) => s.className === this.player.className);
    const startY = -180;
    const spacingY = 50;

    classSkills.forEach((skill, idx) => {
      const y = startY + idx * spacingY;
      const isUnlocked = this.player.skillManager.unlockedSkills.has(skill.id);
      const canLearn = !isUnlocked && this.player.skillManager.skillPoints > 0 && this.player.level >= skill.requiredLevel;

      // Slot icon
      const icon = this.scene.add.sprite(-280, y, skill.icon);
      this.skillEntriesContainer.add(icon);

      // Skill title & req level
      const titleColor = isUnlocked ? '#facc15' : canLearn ? '#e2e8f0' : '#6b7280';
      const nameText = this.scene.add.text(
        -250,
        y - 12,
        `${skill.name} ${skill.isPassive ? '(지속 효과)' : ''} - 요구 Lv.${skill.requiredLevel}`,
        {
          fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
          fontSize: '13px',
          fontStyle: 'bold',
          color: titleColor,
        }
      );
      this.skillEntriesContainer.add(nameText);

      // Description
      const descText = this.scene.add.text(-250, y + 5, skill.tooltipText, {
        fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
        fontSize: '11px',
        color: '#9ca3af',
      });
      this.skillEntriesContainer.add(descText);

      // Learn button / Learned label / Hotbar assign
      if (isUnlocked) {
        if (skill.isPassive) {
          const learned = this.scene.add.text(230, y - 6, '[ 활성화됨 ]', {
            fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
            fontSize: '11px',
            color: '#4ade80',
          });
          this.skillEntriesContainer.add(learned);
        } else {
          // Assign button dropdown/cycle
          const currentSlot = (Object.keys(this.player.skillManager.slots) as SkillSlot[]).find(
            (k) => this.player.skillManager.slots[k] === skill.id
          );
          const btnLabel = currentSlot ? `[슬롯: ${currentSlot.toUpperCase()}]` : '[슬롯 장착]';
          const assignBtn = this.scene.add.text(190, y - 6, btnLabel, {
            fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
            fontSize: '11px',
            color: '#38bdf8',
            backgroundColor: '#1f2937',
            padding: { x: 6, y: 3 },
          });
          assignBtn.setInteractive({ useHandCursor: true });
          assignBtn.on('pointerdown', () => {
            this.cycleSlot(skill.id);
            SoundEngine.getInstance().playButtonClick();
            this.refresh();
          });
          this.skillEntriesContainer.add(assignBtn);
        }
      } else if (canLearn) {
        const learnBtn = this.scene.add.text(210, y - 6, '[ 스킬 습득 ]', {
          fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#fbbf24',
          backgroundColor: '#92400e',
          padding: { x: 8, y: 4 },
        });
        learnBtn.setInteractive({ useHandCursor: true });
        learnBtn.on('pointerdown', () => {
          this.player.skillManager.unlockSkill(skill.id, this.player.level);
          this.player.recalculateStats();
          SoundEngine.getInstance().playLevelUp();
          this.refresh();
        });
        this.skillEntriesContainer.add(learnBtn);
      } else {
        const lockedText = this.scene.add.text(215, y - 6, `요구 Lv.${skill.requiredLevel}`, {
          fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
          fontSize: '11px',
          color: '#6b7280',
        });
        this.skillEntriesContainer.add(lockedText);
      }
    });
  }

  private cycleSlot(skillId: SkillId) {
    const slots: SkillSlot[] = ['left', 'right', 'slot1', 'slot2', 'slot3', 'slot4'];
    const currentIdx = slots.findIndex((s) => this.player.skillManager.slots[s] === skillId);
    if (currentIdx === -1) {
      // Assign to slot1
      this.player.skillManager.slots.slot1 = skillId;
    } else {
      // Clear current and assign to next
      const nextIdx = (currentIdx + 1) % slots.length;
      this.player.skillManager.slots[slots[currentIdx]] = null;
      this.player.skillManager.slots[slots[nextIdx]] = skillId;
    }
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
