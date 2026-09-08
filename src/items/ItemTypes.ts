export type ItemRarity = 'common' | 'magic' | 'rare' | 'legendary';

export type EquipSlot = 'weapon' | 'head' | 'chest' | 'gloves' | 'boots' | 'ring1' | 'ring2' | 'amulet';

export type ItemType = EquipSlot | 'potion_hp' | 'potion_mana' | 'gold';

export interface ItemStats {
  attack?: number;
  armor?: number;
  maxHp?: number;
  maxResource?: number;
  critChance?: number; // e.g. 0.05 for 5%
  critDamage?: number; // e.g. 0.5 for +50%
  attackSpeed?: number; // e.g. 0.1 for +10%
  moveSpeed?: number; // e.g. 15 for +15
  lifeSteal?: number; // e.g. 0.04 for 4%
  fireDamage?: number;
  coldDamage?: number;
  lightningDamage?: number;
}

export type LegendaryEffectType =
  | 'cone_slam' // Seismic Slam fires 3 shockwaves
  | 'revenge_burst' // Taking damage has 20% chance to explode
  | 'reaper_frenzy' // Kills grant +10% move & atk spd for 5s
  | 'piercing_orb' // Arcane Bolt pierces all targets and splits
  | 'cinder_trail' // Leaves burning embers that scorch foes
  | 'vortex_nova' // Glacial Nova pulls enemies inward before freezing
  | 'blood_pact' // Crits restore 5% max HP
  | 'thunder_overcharge'; // Chain Lightning jumps to 3 additional targets

export interface LegendaryPower {
  id: LegendaryEffectType;
  name: string;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  level: number;
  icon: string;
  stats: ItemStats;
  legendaryPower?: LegendaryPower;
  value: number; // gold sell value
  description?: string;
}
