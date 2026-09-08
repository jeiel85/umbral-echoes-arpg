import { Item, ItemRarity, EquipSlot, ItemStats, LegendaryPower, LegendaryEffectType } from './ItemTypes';

export class ItemGenerator {
  private static legendaryCatalog: {
    slot: EquipSlot;
    name: string;
    icon: string;
    stats: ItemStats;
    power: LegendaryPower;
    lore: string;
  }[] = [
    {
      slot: 'head',
      name: 'Crown of the Primordial King',
      icon: 'icon_head',
      stats: { armor: 18, maxHp: 65, critChance: 0.08 },
      power: {
        id: 'cone_slam',
        name: 'Wrath of the Monolith',
        description: 'Seismic Slam emits 3 fracturing shockwaves in a cone.',
      },
      lore: 'Worn by the subterranean giants before the stars went cold.',
    },
    {
      slot: 'chest',
      name: 'Armor of the Ironclad Juggernaut',
      icon: 'icon_chest',
      stats: { armor: 32, maxHp: 110, lifeSteal: 0.04 },
      power: {
        id: 'revenge_burst',
        name: 'Retaliatory Blast',
        description: 'Taking damage has a 25% chance to trigger an explosive fiery counter-burst.',
      },
      lore: 'Forged in the heart of a falling meteor, heavy enough to warp the earth.',
    },
    {
      slot: 'weapon',
      name: "Grave-Reaper's Edge",
      icon: 'icon_sword',
      stats: { attack: 28, attackSpeed: 0.15, critChance: 0.12, critDamage: 0.4 },
      power: {
        id: 'reaper_frenzy',
        name: 'Harvest Momentum',
        description: 'Killing an enemy grants +12% movement and attack speed for 5s (stacks 5x).',
      },
      lore: 'Every harvest of souls sharpens the edge further.',
    },
    {
      slot: 'weapon',
      name: 'Staff of Infinite Horizons',
      icon: 'icon_staff',
      stats: { attack: 25, maxResource: 60, coldDamage: 14, lightningDamage: 14 },
      power: {
        id: 'piercing_orb',
        name: 'Ethereal Split',
        description: 'Arcane Bolt pierces all targets and fragments into twin homing shards on hit.',
      },
      lore: 'The crystal core bends reality, duplicating spells in mid-flight.',
    },
    {
      slot: 'boots',
      name: 'Cinderfall Greaves',
      icon: 'icon_boots',
      stats: { armor: 12, moveSpeed: 35, fireDamage: 10 },
      power: {
        id: 'cinder_trail',
        name: 'Blazing Footsteps',
        description: 'Leaves a trail of burning embers behind you that scorches pursuing enemies.',
      },
      lore: 'The soles still smolder with eternal hellfire.',
    },
    {
      slot: 'ring1',
      name: 'Ring of the Abyssal Void',
      icon: 'icon_ring',
      stats: { maxHp: 40, maxResource: 40, coldDamage: 12 },
      power: {
        id: 'vortex_nova',
        name: 'Singularity Frost',
        description: 'Glacial Nova pulls all nearby enemies inward before freezing them solid.',
      },
      lore: 'A miniature gravitational vortex trapped inside a band of dark matter.',
    },
    {
      slot: 'amulet',
      name: 'Amulet of the Blood Pact',
      icon: 'icon_amulet',
      stats: { maxHp: 50, lifeSteal: 0.08, critChance: 0.1 },
      power: {
        id: 'blood_pact',
        name: 'Vanguards Thirst',
        description: 'Critical hits instantly restore 6% of your maximum Life.',
      },
      lore: 'Inscribed with crimson runes that drink the agony of your prey.',
    },
    {
      slot: 'gloves',
      name: 'Hands of the Thunderlord',
      icon: 'icon_gloves',
      stats: { attack: 12, armor: 10, attackSpeed: 0.12, lightningDamage: 16 },
      power: {
        id: 'thunder_overcharge',
        name: 'Arcing Storm',
        description: 'Chain Lightning jumps to 3 additional targets with 50% increased damage.',
      },
      lore: 'Sparks continuously leap between the steel knuckles.',
    },
  ];

  private static prefixes = [
    { name: 'Sturdy', stats: { armor: 3, maxHp: 15 } },
    { name: 'Savage', stats: { attack: 4, critChance: 0.03 } },
    { name: 'Gothic', stats: { maxHp: 25, armor: 4 } },
    { name: 'Quick', stats: { attackSpeed: 0.08, moveSpeed: 10 } },
    { name: 'Glacial', stats: { coldDamage: 6, maxResource: 15 } },
    { name: 'Infernal', stats: { fireDamage: 8, attack: 3 } },
    { name: 'Vampiric', stats: { lifeSteal: 0.04, maxHp: 20 } },
    { name: 'Deadly', stats: { critChance: 0.06, critDamage: 0.25 } },
  ];

  private static slotNames: Record<EquipSlot, { names: string[]; icon: string }> = {
    weapon: { names: ['Broadsword', 'Warblade', 'Battleaxe', 'Bone Staff', 'Wand of Ruin'], icon: 'icon_sword' },
    head: { names: ['Bascinet', 'Visored Helm', 'Iron Cap', 'Cowl of Shadows'], icon: 'icon_head' },
    chest: { names: ['Cuirass', 'Plate Mail', 'Hauberk', 'Robe of Night'], icon: 'icon_chest' },
    gloves: { names: ['Gauntlets', 'Bracers', 'Grips', 'War Mitts'], icon: 'icon_gloves' },
    boots: { names: ['Greaves', 'Iron Striders', 'Treads', 'Boots of Strife'], icon: 'icon_boots' },
    ring1: { names: ['Band of Ruin', 'Signet Ring', 'Iron Loop', 'Bone Band'], icon: 'icon_ring' },
    ring2: { names: ['Band of Malice', 'Grave Signet', 'Gilded Loop', 'Crest Ring'], icon: 'icon_ring' },
    amulet: { names: ['Pendant of Anguish', 'Talisman', 'Torc of Wrath', 'Soul Choker'], icon: 'icon_amulet' },
  };

  public static generateEquipment(level: number, forcedRarity?: ItemRarity): Item {
    const slots: EquipSlot[] = ['weapon', 'head', 'chest', 'gloves', 'boots', 'ring1', 'ring2', 'amulet'];
    const slot = slots[Math.floor(Math.random() * slots.length)];

    let rarity: ItemRarity = forcedRarity || 'common';
    if (!forcedRarity) {
      const roll = Math.random();
      if (roll < 0.04 && level >= 3) rarity = 'legendary';
      else if (roll < 0.22) rarity = 'rare';
      else if (roll < 0.55) rarity = 'magic';
      else rarity = 'common';
    }

    if (rarity === 'legendary') {
      const candidates = this.legendaryCatalog.filter((l) => l.slot === slot || !slot);
      const chosen = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : this.legendaryCatalog[0];
      const scale = 1 + (level - 1) * 0.15;
      const scaledStats: ItemStats = {};
      for (const [k, v] of Object.entries(chosen.stats)) {
        scaledStats[k as keyof ItemStats] = Math.round((v as number) * scale * 10) / 10;
      }
      return {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: chosen.name,
        type: chosen.slot,
        rarity: 'legendary',
        level,
        icon: chosen.icon,
        stats: scaledStats,
        legendaryPower: chosen.power,
        value: 120 + level * 25,
        description: chosen.lore,
      };
    }

    const slotInfo = this.slotNames[slot];
    const baseName = slotInfo.names[Math.floor(Math.random() * slotInfo.names.length)];
    let itemName = baseName;
    const stats: ItemStats = {};

    // Base stat according to slot
    const baseMult = 1 + level * 0.3;
    if (slot === 'weapon') {
      stats.attack = Math.max(3, Math.round((4 + Math.random() * 5) * baseMult));
      if (baseName.includes('Staff')) slotInfo.icon = 'icon_staff';
      else if (baseName.includes('Axe')) slotInfo.icon = 'icon_axe';
      else slotInfo.icon = 'icon_sword';
    } else if (slot === 'chest' || slot === 'head' || slot === 'boots' || slot === 'gloves') {
      stats.armor = Math.max(2, Math.round((2 + Math.random() * 4) * baseMult));
      stats.maxHp = Math.round((10 + Math.random() * 15) * baseMult);
    } else {
      stats.maxHp = Math.round((8 + Math.random() * 12) * baseMult);
      stats.maxResource = Math.round((8 + Math.random() * 12) * baseMult);
    }

    // Affixes for Magic & Rare
    const affixCount = rarity === 'magic' ? 1 : rarity === 'rare' ? 3 : 0;
    const chosenAffixes = [...this.prefixes].sort(() => 0.5 - Math.random()).slice(0, affixCount);

    if (chosenAffixes.length > 0) {
      itemName = `${chosenAffixes[0].name} ${baseName}`;
      if (chosenAffixes.length > 1) {
        itemName += ` of ${chosenAffixes[1].name}`;
      }
      for (const aff of chosenAffixes) {
        for (const [k, v] of Object.entries(aff.stats)) {
          const key = k as keyof ItemStats;
          const current = (stats[key] || 0) as number;
          stats[key] = Math.round((current + (v as number) * (1 + level * 0.15)) * 100) / 100;
        }
      }
    }

    const rarityMult = rarity === 'rare' ? 3.5 : rarity === 'magic' ? 2 : 1;
    const value = Math.round((10 + level * 6) * rarityMult);

    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: itemName,
      type: slot,
      rarity,
      level,
      icon: slotInfo.icon,
      stats,
      value,
    };
  }

  public static generatePotion(type: 'potion_hp' | 'potion_mana'): Item {
    const isHp = type === 'potion_hp';
    return {
      id: `pot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: isHp ? 'Crimson Flask' : 'Azure Phial',
      type,
      rarity: 'common',
      level: 1,
      icon: isHp ? 'icon_potion_hp' : 'icon_potion_mana',
      stats: {},
      value: 15,
      description: isHp ? 'Restores 45% of maximum Life.' : 'Restores 50% of maximum Resource.',
    };
  }

  public static generateGold(amount: number): Item {
    return {
      id: `gold_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${amount} Gold Coins`,
      type: 'gold',
      rarity: 'common',
      level: 1,
      icon: 'icon_gold',
      stats: {},
      value: amount,
    };
  }
}
