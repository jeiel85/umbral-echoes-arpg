import { Item, EquipSlot, ItemStats, LegendaryEffectType } from './ItemTypes';
import { SoundEngine } from '../audio/SoundEngine';

export class InventoryManager {
  public static readonly MAX_SLOTS = 24;
  public items: (Item | null)[] = new Array(InventoryManager.MAX_SLOTS).fill(null);
  public equipment: Record<EquipSlot, Item | null> = {
    weapon: null,
    head: null,
    chest: null,
    gloves: null,
    boots: null,
    ring1: null,
    ring2: null,
    amulet: null,
  };

  public gold: number = 50;
  public hpPotions: number = 3;
  public manaPotions: number = 3;

  public onInventoryChange?: () => void;

  public addItem(item: Item): boolean {
    if (item.type === 'gold') {
      this.gold += item.value;
      SoundEngine.getInstance().playItemPickup();
      this.onInventoryChange?.();
      return true;
    }
    if (item.type === 'potion_hp') {
      this.hpPotions++;
      SoundEngine.getInstance().playItemPickup();
      this.onInventoryChange?.();
      return true;
    }
    if (item.type === 'potion_mana') {
      this.manaPotions++;
      SoundEngine.getInstance().playItemPickup();
      this.onInventoryChange?.();
      return true;
    }

    const emptyIdx = this.items.findIndex((i) => i === null);
    if (emptyIdx === -1) {
      return false; // Inventory full!
    }

    this.items[emptyIdx] = item;
    SoundEngine.getInstance().playItemPickup();
    this.onInventoryChange?.();
    return true;
  }

  public removeItem(index: number): Item | null {
    if (index < 0 || index >= this.items.length) return null;
    const item = this.items[index];
    this.items[index] = null;
    this.onInventoryChange?.();
    return item;
  }

  public equipItem(index: number): boolean {
    const item = this.items[index];
    if (!item) return false;

    // Determine target slot
    let targetSlot: EquipSlot | null = null;
    if (
      item.type === 'weapon' ||
      item.type === 'head' ||
      item.type === 'chest' ||
      item.type === 'gloves' ||
      item.type === 'boots' ||
      item.type === 'amulet'
    ) {
      targetSlot = item.type;
    } else if (item.type === 'ring1' || item.type === 'ring2') {
      // Pick empty ring slot or ring1
      if (!this.equipment.ring1) targetSlot = 'ring1';
      else if (!this.equipment.ring2) targetSlot = 'ring2';
      else targetSlot = 'ring1';
    }

    if (!targetSlot) return false;

    const currentEquipped = this.equipment[targetSlot];
    this.equipment[targetSlot] = item;
    this.items[index] = currentEquipped; // Swap or null

    SoundEngine.getInstance().playItemPickup();
    this.onInventoryChange?.();
    return true;
  }

  public unequipItem(slot: EquipSlot): boolean {
    const equipped = this.equipment[slot];
    if (!equipped) return false;

    const emptyIdx = this.items.findIndex((i) => i === null);
    if (emptyIdx === -1) return false; // inventory full

    this.equipment[slot] = null;
    this.items[emptyIdx] = equipped;

    SoundEngine.getInstance().playItemPickup();
    this.onInventoryChange?.();
    return true;
  }

  public sellItem(index: number): number {
    const item = this.items[index];
    if (!item) return 0;
    const price = Math.max(1, Math.round(item.value * 0.7));
    this.items[index] = null;
    this.gold += price;
    SoundEngine.getInstance().playItemPickup();
    this.onInventoryChange?.();
    return price;
  }

  public calculateEquipStats(): ItemStats {
    const total: ItemStats = {
      attack: 0,
      armor: 0,
      maxHp: 0,
      maxResource: 0,
      critChance: 0,
      critDamage: 0,
      attackSpeed: 0,
      moveSpeed: 0,
      lifeSteal: 0,
      fireDamage: 0,
      coldDamage: 0,
      lightningDamage: 0,
    };

    for (const item of Object.values(this.equipment)) {
      if (!item) continue;
      for (const [key, val] of Object.entries(item.stats)) {
        const k = key as keyof ItemStats;
        if (typeof val === 'number') {
          total[k] = (total[k] || 0) + val;
        }
      }
    }

    return total;
  }

  public hasLegendary(id: LegendaryEffectType): boolean {
    for (const item of Object.values(this.equipment)) {
      if (item?.legendaryPower?.id === id) {
        return true;
      }
    }
    return false;
  }

  public serialize(): any {
    return {
      items: this.items,
      equipment: this.equipment,
      gold: this.gold,
      hpPotions: this.hpPotions,
      manaPotions: this.manaPotions,
    };
  }

  public deserialize(data: any) {
    if (!data) return;
    this.items = Array.isArray(data.items) ? data.items : new Array(InventoryManager.MAX_SLOTS).fill(null);
    this.equipment = data.equipment || this.equipment;
    this.gold = data.gold ?? 50;
    this.hpPotions = data.hpPotions ?? 3;
    this.manaPotions = data.manaPotions ?? 3;
    this.onInventoryChange?.();
  }
}
