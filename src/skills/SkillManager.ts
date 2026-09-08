import { SkillDefinition, SkillId, SkillSlot } from './SkillTypes';
import { SKILL_DEFINITIONS } from './SkillDefinitions';

export class SkillManager {
  public className: 'vanguard' | 'arcanist';
  public skillPoints: number = 0;
  public unlockedSkills: Set<SkillId> = new Set();
  public slots: Record<SkillSlot, SkillId | null> = {
    left: null,
    right: null,
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
  };

  private cooldowns: Map<SkillId, number> = new Map(); // Timestamp when ready

  constructor(className: 'vanguard' | 'arcanist') {
    this.className = className;
    this.initDefaults();
  }

  public initDefaults() {
    if (this.className === 'vanguard') {
      this.unlockedSkills.add('cleave');
      this.unlockedSkills.add('seismic_slam');
      this.slots.left = 'cleave';
      this.slots.right = 'seismic_slam';
    } else {
      this.unlockedSkills.add('arcane_bolt');
      this.unlockedSkills.add('glacial_nova');
      this.slots.left = 'arcane_bolt';
      this.slots.right = 'glacial_nova';
    }
  }

  public unlockSkill(id: SkillId, playerLevel: number): boolean {
    const def = SKILL_DEFINITIONS[id];
    if (!def) return false;
    if (this.unlockedSkills.has(id)) return false;
    if (this.skillPoints <= 0) return false;
    if (playerLevel < def.requiredLevel) return false;

    this.skillPoints--;
    this.unlockedSkills.add(id);

    // Auto-equip to an empty hotbar slot if active
    if (!def.isPassive) {
      if (!this.slots.slot1) this.slots.slot1 = id;
      else if (!this.slots.slot2) this.slots.slot2 = id;
      else if (!this.slots.slot3) this.slots.slot3 = id;
      else if (!this.slots.slot4) this.slots.slot4 = id;
    }

    return true;
  }

  public isSkillReady(id: SkillId, now: number): boolean {
    const readyAt = this.cooldowns.get(id) || 0;
    return now >= readyAt;
  }

  public getCooldownPercent(id: SkillId, now: number): number {
    const def = SKILL_DEFINITIONS[id];
    if (!def || def.cooldown <= 0) return 0;
    const readyAt = this.cooldowns.get(id) || 0;
    if (now >= readyAt) return 0;
    const remaining = (readyAt - now) / 1000;
    return Math.min(1, Math.max(0, remaining / def.cooldown));
  }

  public triggerCooldown(id: SkillId, now: number) {
    const def = SKILL_DEFINITIONS[id];
    if (!def || def.cooldown <= 0) return;
    this.cooldowns.set(id, now + def.cooldown * 1000);
  }

  public serialize(): any {
    return {
      className: this.className,
      skillPoints: this.skillPoints,
      unlockedSkills: Array.from(this.unlockedSkills),
      slots: this.slots,
    };
  }

  public deserialize(data: any) {
    if (!data) return;
    this.skillPoints = data.skillPoints ?? 0;
    if (Array.isArray(data.unlockedSkills)) {
      this.unlockedSkills = new Set(data.unlockedSkills);
    }
    if (data.slots) {
      this.slots = { ...this.slots, ...data.slots };
    }
  }
}
