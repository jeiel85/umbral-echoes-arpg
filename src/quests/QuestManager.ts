import { Quest } from './QuestTypes';
import { SoundEngine } from '../audio/SoundEngine';

export class QuestManager {
  public quests: Quest[] = [
    // Main Campaign
    {
      id: 'main_1',
      type: 'main',
      title: '사라진 파수꾼 (The Vanishing Sentinel)',
      description: '잿빛 외곽을 수색하여 배회하는 언데드(할로우) 처치',
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
      title: '잊혀진 자들의 유골 (Bones of the Forgotten)',
      description: '저주받은 묘지를 돌파하여 무덤 군주 말라코르 처치',
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
      title: '부패의 늪지 (Mire of Decay)',
      description: '오염된 늪지대에서 맹독 역병 뿜이(Blight Spitter) 처치',
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
      title: '대심문관의 몰락 (Inquisitor\'s Fall)',
      description: '가라앉은 지하묘지로 내려가 대심문관 베인 처치',
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
      title: '공허의 옥좌 (Throne of the Void)',
      description: '심연의 성채에서 공허의 군주 말라가스 처치',
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
      title: '안개 속의 맹수 (Beasts of the Mist)',
      description: '잿빛 외곽을 배회하는 광포한 블러드하운드 처치',
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
      title: '고대의 유물 (Relics of Old)',
      description: '필드 곳곳에 숨겨진 고대 보물상자 개봉',
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
      title: '석상의 파수병 (Stone Sentinels)',
      description: '고대 유적을 지키는 가고일 파괴',
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
