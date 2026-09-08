export type SkillId =
  // Vanguard
  | 'cleave'
  | 'seismic_slam'
  | 'iron_rush'
  | 'whirlwind'
  | 'war_cry'
  | 'leap_retribution'
  | 'iron_will'
  | 'bloodthirst'
  // Arcanist
  | 'arcane_bolt'
  | 'glacial_nova'
  | 'blink'
  | 'cataclysm_meteor'
  | 'chain_lightning'
  | 'umbral_ward'
  | 'arcane_overflow'
  | 'elemental_ruin';

export type SkillSlot = 'left' | 'right' | 'slot1' | 'slot2' | 'slot3' | 'slot4';

export interface SkillDefinition {
  id: SkillId;
  name: string;
  className: 'vanguard' | 'arcanist';
  isPassive: boolean;
  requiredLevel: number;
  resourceCost: number; // Fury or Mana
  cooldown: number; // in seconds
  description: string;
  tooltipText: string;
  icon: string;
}
