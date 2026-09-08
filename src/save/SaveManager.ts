import { Player } from '../entities/Player';
import { QuestManager } from '../quests/QuestManager';

export interface SaveData {
  version: number;
  timestamp: number;
  areaId: string;
  player: any;
  quests: any;
}

export class SaveManager {
  private static readonly SAVE_KEY = 'umbral_echoes_save_v1';

  public static hasSave(): boolean {
    try {
      return localStorage.getItem(SaveManager.SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  public static save(player: Player, areaId: string, questManager: QuestManager): boolean {
    try {
      const data: SaveData = {
        version: 1,
        timestamp: Date.now(),
        areaId,
        player: player.serialize(),
        quests: questManager.serialize(),
      };
      localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.warn('Failed to save game to localStorage', err);
      return false;
    }
  }

  public static load(): SaveData | null {
    try {
      const str = localStorage.getItem(SaveManager.SAVE_KEY);
      if (!str) return null;
      return JSON.parse(str) as SaveData;
    } catch (err) {
      console.warn('Failed to parse save game data', err);
      return null;
    }
  }

  public static deleteSave() {
    try {
      localStorage.removeItem(SaveManager.SAVE_KEY);
    } catch (err) {
      console.warn('Failed to remove save data', err);
    }
  }
}
