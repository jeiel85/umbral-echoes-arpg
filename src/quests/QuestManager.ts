import { Quest } from './QuestTypes';
import { SoundEngine } from '../audio/SoundEngine';

export class QuestManager {
  public quests: Quest[] = [
    // Main Campaign
    {
      id: 'main_1',
      type: 'main',
      title: 'The Vanishing Sentinel',
      description: 'Scour the Ashen Outskirts and eradicate the shambling undead.',
      targetType: 'kill',
      targetKey: 'hollow',
      targetCount: 6,
      currentCount: 0,
      isCompleted: false,
      isTurnedIn: false,
      reward: { exp: 80, gold: 40, itemRarity: 'magic' },
    },
    {
      id: 'main_2',
      type: 'main',
      title: 'Bones of the Forgotten',
      description: 'Breach the Cursed Graveyard and slay Grave Lord Malakor.',
      targetType: 'boss',
      targetKey: 'malakor',
      targetCount: 1,
      currentCount: 0,
      isCompleted: false,
      isTurnedIn: false,
      reward: { exp: 350, gold: 120, itemRarity: 'rare' },
    },
    {
      id: 'main_3',
      type: 'main',
      title: 'Mire of Decay',
      description: 'Purge 6 toxic Blight Spitters festering in the Blighted Swampland.',
      targetType: 'kill',
      targetKey: 'blight_spitter',
      targetCount: 6,
      currentCount: 0,
      isCompleted: false,
      isTurnedIn: false,
      reward: { exp: 550, gold: 180, itemRarity: 'rare' },
    },
    {
      id: 'main_4',
      type: 'main',
      title: "Inquisitor's Fall",
      description: 'Descend into the Sunken Catacombs and defeat Arch-Inquisitor Vane.',
      targetType: 'boss',
      targetKey: 'vane',
      targetCount: 1,
      currentCount: 0,
      isCompleted: false,
      isTurnedIn: false,
      reward: { exp: 900, gold: 300, itemRarity: 'legendary' },
    },
    {
      id: 'main_5',
      type: 'main',
      title: 'Throne of the Void',
      description: 'Confront and conquer Malagath, the Void Sovereign, at the Abyssal Citadel.',
      targetType: 'boss',
      targetKey: 'malagath',
      targetCount: 1,
      currentCount: 0,
      isCompleted: false,
      isTurnedIn: false,
      reward: { exp: 2500, gold: 1000, itemRarity: 'legendary' },
    },
    // Side Quests
    {
      id: 'side_1',
      type: 'side',
      title: 'Beasts of the Mist',
      description: 'Cull 5 Dire Bloodhounds roaming the outskirts.',
      targetType: 'kill',
      targetKey: 'bloodhound',
      targetCount: 5,
      currentCount: 0,
      isCompleted: false,
      isTurnedIn: false,
      reward: { exp: 120, gold: 60 },
    },
    {
      id: 'side_2',
      type: 'side',
      title: 'Relics of Old',
      description: 'Open 3 ancient treasure chests scattered throughout the wild.',
      targetType: 'chest',
      targetKey: 'chest',
      targetCount: 3,
      currentCount: 0,
      isCompleted: false,
      isTurnedIn: false,
      reward: { exp: 200, gold: 100, itemRarity: 'magic' },
    },
    {
      id: 'side_3',
      type: 'side',
      title: 'Stone Sentinels',
      description: 'Destroy 4 Gargoyles guarding the ancient ruins.',
      targetType: 'kill',
      targetKey: 'gargoyle',
      targetCount: 4,
      currentCount: 0,
      isCompleted: false,
      isTurnedIn: false,
      reward: { exp: 400, gold: 150, itemRarity: 'rare' },
    },
  ];

  public onQuestUpdated?: () => void;

  public getActiveMainQuest(): Quest | undefined {
    return this.quests.find((q) => q.type === 'main' && !q.isTurnedIn);
  }

  public onKill(enemyKey: string) {
    let changed = false;
    for (const q of this.quests) {
      if (!q.isCompleted && q.targetType === 'kill' && q.targetKey === enemyKey) {
        q.currentCount = Math.min(q.targetCount, q.currentCount + 1);
        if (q.currentCount >= q.targetCount) {
          q.isCompleted = true;
          SoundEngine.getInstance().playLevelUp();
        }
        changed = true;
      }
    }
    if (changed) this.onQuestUpdated?.();
  }

  public onBossKill(bossKey: string) {
    let changed = false;
    for (const q of this.quests) {
      if (!q.isCompleted && q.targetType === 'boss' && q.targetKey === bossKey) {
        q.currentCount = 1;
        q.isCompleted = true;
        SoundEngine.getInstance().playLevelUp();
        changed = true;
      }
    }
    if (changed) this.onQuestUpdated?.();
  }

  public onChestOpen() {
    let changed = false;
    for (const q of this.quests) {
      if (!q.isCompleted && q.targetType === 'chest') {
        q.currentCount = Math.min(q.targetCount, q.currentCount + 1);
        if (q.currentCount >= q.targetCount) {
          q.isCompleted = true;
          SoundEngine.getInstance().playLevelUp();
        }
        changed = true;
      }
    }
    if (changed) this.onQuestUpdated?.();
  }

  public serialize(): any {
    return this.quests.map((q) => ({
      id: q.id,
      currentCount: q.currentCount,
      isCompleted: q.isCompleted,
      isTurnedIn: q.isTurnedIn,
    }));
  }

  public deserialize(data: any) {
    if (!Array.isArray(data)) return;
    for (const item of data) {
      const q = this.quests.find((quest) => quest.id === item.id);
      if (q) {
        q.currentCount = item.currentCount ?? q.currentCount;
        q.isCompleted = item.isCompleted ?? q.isCompleted;
        q.isTurnedIn = item.isTurnedIn ?? q.isTurnedIn;
      }
    }
    this.onQuestUpdated?.();
  }
}
