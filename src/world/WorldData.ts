import { EnemyType, EliteAffix } from '../entities/Enemy';

export interface AreaPortal {
  x: number;
  y: number;
  targetAreaId: string;
  targetX: number;
  targetY: number;
  label: string;
}

export interface AreaSpawnPoint {
  x: number;
  y: number;
  enemyType: EnemyType;
  level: number;
  isElite?: boolean;
  affix?: EliteAffix;
}

export interface AreaDefinition {
  id: string;
  name: string;
  level: number;
  floorTile: string;
  wallTile: string;
  width: number;
  height: number;
  ambientLight: number; // e.g. 0x222233
  isTown: boolean;
  portals: AreaPortal[];
  spawns: AreaSpawnPoint[];
  bossId?: 'malakor' | 'vane' | 'malagath';
  bossPos?: { x: number; y: number };
  chests: { x: number; y: number }[];
  torches: { x: number; y: number }[];
}

export const AREAS: Record<string, AreaDefinition> = {
  town: {
    id: 'town',
    name: '잿빛 안식처 (Oakhaven Refuge)',
    level: 1,
    floorTile: 'tile_town_floor',
    wallTile: 'tile_town_wall',
    width: 32,
    height: 24,
    ambientLight: 0x44403c,
    isTown: true,
    portals: [
      {
        x: 950,
        y: 380,
        targetAreaId: 'outskirts',
        targetX: 80,
        targetY: 380,
        label: '잿빛 외곽으로 ▶',
      },
    ],
    spawns: [],
    chests: [{ x: 300, y: 150 }],
    torches: [
      { x: 200, y: 120 },
      { x: 500, y: 120 },
      { x: 800, y: 120 },
      { x: 200, y: 550 },
      { x: 800, y: 550 },
    ],
  },
  outskirts: {
    id: 'outskirts',
    name: '잿빛 외곽 (Ashen Outskirts)',
    level: 2,
    floorTile: 'tile_stone_floor',
    wallTile: 'tile_stone_wall',
    width: 48,
    height: 32,
    ambientLight: 0x27272a,
    isTown: false,
    portals: [
      {
        x: 40,
        y: 380,
        targetAreaId: 'town',
        targetX: 900,
        targetY: 380,
        label: '◀ 잿빛 안식처(마을)로',
      },
      {
        x: 1450,
        y: 500,
        targetAreaId: 'graveyard',
        targetX: 80,
        targetY: 500,
        label: '저주받은 묘지로 ▶',
      },
    ],
    spawns: [
      { x: 300, y: 300, enemyType: 'hollow', level: 2 },
      { x: 400, y: 450, enemyType: 'hollow', level: 2 },
      { x: 550, y: 250, enemyType: 'bloodhound', level: 2 },
      { x: 650, y: 600, enemyType: 'skeleton_archer', level: 2 },
      { x: 800, y: 350, enemyType: 'hollow', level: 3 },
      { x: 900, y: 220, enemyType: 'bloodhound', level: 3 },
      { x: 1050, y: 450, enemyType: 'hollow', level: 3, isElite: true, affix: 'Fast' },
      { x: 1200, y: 300, enemyType: 'skeleton_archer', level: 3 },
      { x: 1300, y: 600, enemyType: 'hollow', level: 3 },
      { x: 700, y: 750, enemyType: 'bloodhound', level: 2 },
    ],
    chests: [
      { x: 500, y: 200 },
      { x: 1250, y: 200 },
    ],
    torches: [
      { x: 250, y: 200 },
      { x: 750, y: 200 },
      { x: 1150, y: 200 },
    ],
  },
  graveyard: {
    id: 'graveyard',
    name: '저주받은 묘지 (Cursed Graveyard)',
    level: 4,
    floorTile: 'tile_stone_floor',
    wallTile: 'tile_stone_wall',
    width: 48,
    height: 36,
    ambientLight: 0x18181b,
    isTown: false,
    bossId: 'malakor',
    bossPos: { x: 1250, y: 550 },
    portals: [
      {
        x: 50,
        y: 500,
        targetAreaId: 'outskirts',
        targetX: 1400,
        targetY: 500,
        label: '◀ 잿빛 외곽으로',
      },
      {
        x: 1450,
        y: 550,
        targetAreaId: 'swamp',
        targetX: 80,
        targetY: 550,
        label: '오염된 늪지대로 ▶',
      },
    ],
    spawns: [
      { x: 250, y: 350, enemyType: 'skeleton_archer', level: 4 },
      { x: 350, y: 600, enemyType: 'shadow_wraith', level: 4 },
      { x: 500, y: 400, enemyType: 'hollow', level: 4 },
      { x: 650, y: 300, enemyType: 'bone_breaker', level: 4, isElite: true, affix: 'Shielded' },
      { x: 750, y: 650, enemyType: 'skeleton_archer', level: 4 },
      { x: 900, y: 400, enemyType: 'shadow_wraith', level: 5 },
      { x: 1050, y: 550, enemyType: 'cultist', level: 5 },
      { x: 800, y: 250, enemyType: 'hollow', level: 4 },
      { x: 450, y: 800, enemyType: 'bloodhound', level: 4 },
    ],
    chests: [
      { x: 600, y: 250 },
      { x: 1350, y: 300 },
    ],
    torches: [
      { x: 300, y: 200 },
      { x: 900, y: 200 },
      { x: 1250, y: 450 },
    ],
  },
  swamp: {
    id: 'swamp',
    name: '오염된 늪지대 (Blighted Swampland)',
    level: 7,
    floorTile: 'tile_swamp_floor',
    wallTile: 'tile_swamp_wall',
    width: 52,
    height: 38,
    ambientLight: 0x141f14,
    isTown: false,
    portals: [
      {
        x: 50,
        y: 550,
        targetAreaId: 'graveyard',
        targetX: 1380,
        targetY: 550,
        label: '◀ 저주받은 묘지로',
      },
      {
        x: 1550,
        y: 550,
        targetAreaId: 'catacombs',
        targetX: 80,
        targetY: 550,
        label: '가라앉은 지하묘지로 ▶',
      },
    ],
    spawns: [
      { x: 300, y: 450, enemyType: 'blight_spitter', level: 7 },
      { x: 450, y: 300, enemyType: 'plague_bomber', level: 7 },
      { x: 600, y: 650, enemyType: 'blight_spitter', level: 7 },
      { x: 750, y: 400, enemyType: 'gargoyle', level: 7 },
      { x: 900, y: 300, enemyType: 'blight_spitter', level: 8, isElite: true, affix: 'Poison' },
      { x: 1050, y: 600, enemyType: 'plague_bomber', level: 8 },
      { x: 1200, y: 450, enemyType: 'gargoyle', level: 8 },
      { x: 1350, y: 350, enemyType: 'blight_spitter', level: 8 },
      { x: 650, y: 850, enemyType: 'bloodhound', level: 7 },
    ],
    chests: [
      { x: 750, y: 250 },
      { x: 1400, y: 250 },
    ],
    torches: [
      { x: 400, y: 200 },
      { x: 1100, y: 200 },
    ],
  },
  catacombs: {
    id: 'catacombs',
    name: '가라앉은 지하묘지 (Sunken Catacombs)',
    level: 10,
    floorTile: 'tile_stone_floor',
    wallTile: 'tile_stone_wall',
    width: 52,
    height: 40,
    ambientLight: 0x13111c,
    isTown: false,
    bossId: 'vane',
    bossPos: { x: 1350, y: 600 },
    portals: [
      {
        x: 50,
        y: 550,
        targetAreaId: 'swamp',
        targetX: 1480,
        targetY: 550,
        label: '◀ 오염된 늪지대로',
      },
      {
        x: 1550,
        y: 600,
        targetAreaId: 'abyss',
        targetX: 80,
        targetY: 600,
        label: '심연의 성채로 ▶',
      },
    ],
    spawns: [
      { x: 300, y: 400, enemyType: 'bone_breaker', level: 10 },
      { x: 450, y: 650, enemyType: 'cultist', level: 10 },
      { x: 600, y: 350, enemyType: 'shadow_wraith', level: 10 },
      { x: 750, y: 550, enemyType: 'gargoyle', level: 10, isElite: true, affix: 'Flame Aura' },
      { x: 900, y: 350, enemyType: 'cultist', level: 11 },
      { x: 1050, y: 700, enemyType: 'bone_breaker', level: 11 },
      { x: 1200, y: 450, enemyType: 'void_chanter', level: 11 },
      { x: 500, y: 850, enemyType: 'shadow_wraith', level: 10 },
    ],
    chests: [
      { x: 650, y: 200 },
      { x: 1150, y: 250 },
    ],
    torches: [
      { x: 300, y: 150 },
      { x: 800, y: 150 },
      { x: 1350, y: 450 },
    ],
  },
  abyss: {
    id: 'abyss',
    name: '심연의 성채 (Abyssal Citadel)',
    level: 13,
    floorTile: 'tile_abyss_floor',
    wallTile: 'tile_abyss_wall',
    width: 56,
    height: 44,
    ambientLight: 0x120a22,
    isTown: false,
    bossId: 'malagath',
    bossPos: { x: 1400, y: 700 },
    portals: [
      {
        x: 50,
        y: 600,
        targetAreaId: 'catacombs',
        targetX: 1480,
        targetY: 600,
        label: '◀ 가라앉은 지하묘지로',
      },
    ],
    spawns: [
      { x: 300, y: 500, enemyType: 'void_chanter', level: 13 },
      { x: 450, y: 350, enemyType: 'shadow_wraith', level: 13 },
      { x: 600, y: 700, enemyType: 'gargoyle', level: 13, isElite: true, affix: 'Berserk' },
      { x: 750, y: 450, enemyType: 'bone_breaker', level: 14 },
      { x: 900, y: 650, enemyType: 'void_chanter', level: 14 },
      { x: 1050, y: 400, enemyType: 'shadow_wraith', level: 14, isElite: true, affix: 'Vampiric' },
      { x: 1200, y: 600, enemyType: 'plague_bomber', level: 14 },
    ],
    chests: [
      { x: 700, y: 250 },
      { x: 1200, y: 250 },
    ],
    torches: [
      { x: 400, y: 200 },
      { x: 900, y: 200 },
      { x: 1400, y: 550 },
    ],
  },
};
