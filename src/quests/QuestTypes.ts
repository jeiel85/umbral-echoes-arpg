export type QuestType = 'main' | 'side';

export interface QuestReward {
  exp: number;
  gold: number;
  itemRarity?: 'magic' | 'rare' | 'legendary';
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  targetType: 'kill' | 'boss' | 'chest' | 'talk';
  targetKey: string; // e.g. 'hollow', 'malakor', 'chest'
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  isTurnedIn: boolean;
  reward: QuestReward;
}
