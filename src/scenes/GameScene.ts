import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { NPC } from '../entities/NPC';
import { AreaManager } from '../world/AreaManager';
import { AreaDefinition, AREAS } from '../world/WorldData';
import { QuestManager } from '../quests/QuestManager';
import { CombatSystem } from '../combat/CombatSystem';
import { SaveManager, SaveData } from '../save/SaveManager';
import { SoundEngine } from '../audio/SoundEngine';
import { ItemGenerator } from '../items/ItemGenerator';
import { DropItem } from '../items/DropItem';

// UI
import { HUD } from '../ui/HUD';
import { InventoryUI } from '../ui/InventoryUI';
import { CharacterUI } from '../ui/CharacterUI';
import { SkillTreeUI } from '../ui/SkillTreeUI';
import { ShopUI } from '../ui/ShopUI';
import { DialogueUI } from '../ui/DialogueUI';
import { MinimapUI } from '../ui/MinimapUI';
import { PauseMenuUI } from '../ui/PauseMenuUI';

export class GameScene extends Phaser.Scene {
  private className: 'vanguard' | 'arcanist' = 'vanguard';
  private loadFromSave: boolean = false;
  private initialSaveData?: SaveData;

  // Entities
  public player!: Player;
  public enemiesGroup!: Phaser.Physics.Arcade.Group;
  public activeBoss: Boss | null = null;
  public npcsGroup: Phaser.GameObjects.Group | null = null;

  // Systems
  public areaManager!: AreaManager;
  public questManager!: QuestManager;
  public combatSystem!: CombatSystem;

  // UI
  public hud!: HUD;
  public inventoryUI!: InventoryUI;
  public characterUI!: CharacterUI;
  public skillTreeUI!: SkillTreeUI;
  public shopUI!: ShopUI;
  public dialogueUI!: DialogueUI;
  public minimapUI!: MinimapUI;
  public pauseMenuUI!: PauseMenuUI;

  // Statistics
  public totalMonstersKilled: number = 0;
  public totalLegendariesFound: number = 0;

  // Timers
  private autoSaveTimer: number = 0;
  private isTransitioning: boolean = false;
  private isGameOver: boolean = false;

  constructor() {
    super('GameScene');
  }

  public init(data: any) {
    this.className = data.className || 'vanguard';
    this.loadFromSave = data.loadFromSave || false;
    this.initialSaveData = data.saveData;
    this.isTransitioning = false;
    this.isGameOver = false;
  }

  public create() {
    const startAreaId = this.loadFromSave && this.initialSaveData ? this.initialSaveData.areaId : 'town';

    // 1. Systems setup
    this.areaManager = new AreaManager(this);
    this.questManager = new QuestManager();

    // 2. Player setup
    const startX = startAreaId === 'town' ? 400 : 100;
    const startY = startAreaId === 'town' ? 360 : 380;
    this.player = new Player(this, startX, startY, this.className);

    // 3. Combat System
    this.combatSystem = new CombatSystem(this, this.player);

    // 4. Groups
    this.enemiesGroup = this.physics.add.group({ classType: Enemy, runChildUpdate: false });
    this.npcsGroup = this.add.group({ classType: NPC });

    // 5. Build starting area
    this.loadArea(startAreaId, startX, startY);

    // 6. Restore save if requested
    if (this.loadFromSave && this.initialSaveData) {
      this.player.deserialize(this.initialSaveData.player);
      this.questManager.deserialize(this.initialSaveData.quests);
    }

    // 7. UI Components
    this.initUI();

    // 8. Camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.15);

    // 9. Input & Combat bindings
    this.initInput();

    // 10. Kill callbacks
    this.combatSystem.onEnemyKilledCallback = (enemy) => {
      this.totalMonstersKilled++;
      this.questManager.onKill(enemy.enemyType);
    };

    this.combatSystem.onBossKilledCallback = (boss) => {
      this.totalMonstersKilled++;
      this.questManager.onBossKill(boss.bossId);

      // Check final boss victory
      if (boss.bossId === 'malagath') {
        this.time.delayedCall(3000, () => {
          this.scene.start('EndingScene', {
            className: this.player.className,
            level: this.player.level,
            gold: this.player.inventory.gold,
            monstersKilled: this.totalMonstersKilled,
            legendariesFound: this.totalLegendariesFound + 1,
          });
        });
      }
    };
  }

  private initUI() {
    this.hud = new HUD(this, this.player, this.questManager);

    this.inventoryUI = new InventoryUI(this, this.player);
    this.inventoryUI.onSellCallback = (item, index) => {
      this.player.inventory.sellItem(index);
      if (this.shopUI.visible) this.shopUI.refreshUI();
    };

    this.characterUI = new CharacterUI(this, this.player);
    this.skillTreeUI = new SkillTreeUI(this, this.player);

    this.shopUI = new ShopUI(this, this.player);
    this.dialogueUI = new DialogueUI(this, this.player, this.questManager, (type) => {
      this.shopUI.openShop(type);
      this.inventoryUI.toggle(true);
    });

    this.minimapUI = new MinimapUI(this, this.player);

    this.pauseMenuUI = new PauseMenuUI(
      this,
      () => {},
      () => {
        SaveManager.save(this.player, this.areaManager.currentArea.id, this.questManager);
      },
      () => {
        SoundEngine.getInstance().stopAmbience();
        this.scene.start('MainMenuScene');
      }
    );
  }

  private initInput() {
    if (!this.input.keyboard) return;

    // Hotkey UI toggles
    this.input.keyboard.on('keydown-I', () => this.inventoryUI.toggle());
    this.input.keyboard.on('keydown-C', () => this.characterUI.toggle());
    this.input.keyboard.on('keydown-K', () => this.skillTreeUI.toggle());
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.inventoryUI.visible) this.inventoryUI.close();
      else if (this.characterUI.visible) this.characterUI.close();
      else if (this.skillTreeUI.visible) this.skillTreeUI.close();
      else if (this.shopUI.visible) this.shopUI.close();
      else if (this.dialogueUI.visible) this.dialogueUI.close();
      else this.pauseMenuUI.open();
    });
    this.input.keyboard.on('keydown-TAB', (e: KeyboardEvent) => {
      e.preventDefault();
      this.minimapUI.toggleExpand();
    });

    // Skill keys 1, 2, 3, 4
    this.input.keyboard.on('keydown-ONE', () => this.triggerSkillSlot('slot1'));
    this.input.keyboard.on('keydown-TWO', () => this.triggerSkillSlot('slot2'));
    this.input.keyboard.on('keydown-THREE', () => this.triggerSkillSlot('slot3'));
    this.input.keyboard.on('keydown-FOUR', () => this.triggerSkillSlot('slot4'));

    // Mouse pointer skill triggers (Left & Right click)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isPointerOverUI(pointer)) return;

      if (pointer.leftButtonDown()) {
        this.triggerSkillSlot('left');
      } else if (pointer.rightButtonDown()) {
        this.triggerSkillSlot('right');
      }
    });

    // Disable default browser right-click context menu on game canvas
    this.input.mouse?.disableContextMenu();
  }

  public isPointerOverUI(pointer: Phaser.Input.Pointer): boolean {
    if (
      this.inventoryUI.visible ||
      this.characterUI.visible ||
      this.skillTreeUI.visible ||
      this.shopUI.visible ||
      this.dialogueUI.visible ||
      this.pauseMenuUI.visible
    ) {
      return true;
    }
    // Bottom hotbar / globes area
    if (pointer.y > 640) return true;
    return false;
  }

  private triggerSkillSlot(slot: 'left' | 'right' | 'slot1' | 'slot2' | 'slot3' | 'slot4') {
    const skillId = this.player.skillManager.slots[slot];
    if (!skillId) return;

    const pointer = this.input.activePointer;
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;

    this.combatSystem.executeSkill(skillId, worldX, worldY, this.enemiesGroup, this.activeBoss);
  }

  public loadArea(areaId: string, spawnX: number, spawnY: number) {
    const area = this.areaManager.loadArea(areaId);

    // Clear previous entities
    this.enemiesGroup.clear(true, true);
    if (this.activeBoss) {
      this.activeBoss.destroy();
      this.activeBoss = null;
    }
    if (this.npcsGroup) {
      this.npcsGroup.clear(true, true);
    }
    this.combatSystem.projectiles.clear(true, true);
    this.combatSystem.areaEffects.clear(true, true);
    this.combatSystem.dropItems.clear(true, true);

    // Set player position
    this.player.setPosition(spawnX, spawnY);
    if (this.player.body) {
      this.player.body.reset(spawnX, spawnY);
    }

    // Build map tiles & walls
    this.areaManager.buildEnvironment(
      area,
      (portal) => this.onPortalStep(portal),
      (chest) => this.onChestClick(chest)
    );

    // Collisions with walls
    this.physics.add.collider(this.player, this.areaManager.wallsGroup);
    this.physics.add.collider(this.enemiesGroup, this.areaManager.wallsGroup);

    // Collisions: Player projectiles vs Enemies & Boss
    this.physics.add.overlap(this.combatSystem.projectiles, this.enemiesGroup, (projObj, enemyObj) => {
      const proj = projObj as any;
      const enemy = enemyObj as Enemy;
      if (proj.fromPlayer && enemy.active && enemy.hp > 0) {
        this.combatSystem.applyPlayerDamage(enemy, proj.damage, proj.element);
        proj.onHitCallback?.(enemy);
        if (proj.pierce <= 0) {
          proj.destroy();
        } else {
          proj.pierce--;
        }
      }
    });

    // Overlap: Enemy Projectiles vs Player
    this.physics.add.overlap(this.combatSystem.projectiles, this.player, (projObj) => {
      const proj = projObj as any;
      if (!proj.fromPlayer && this.player.active && this.player.hp > 0) {
        this.player.takeDamage(proj.damage, proj.element);
        proj.onHitCallback?.(this.player);
        proj.destroy();
      }
    });

    // Overlap: Ground Area Effects vs Player & Enemies
    this.physics.add.overlap(this.enemiesGroup, this.combatSystem.areaEffects, (enemyObj, areaObj) => {
      const enemy = enemyObj as Enemy;
      const ae = areaObj as any;
      if (ae.fromPlayer && ae.canTick(this.time.now) && enemy.active && enemy.hp > 0) {
        this.combatSystem.applyPlayerDamage(enemy, ae.damagePerTick, ae.element);
      }
    });

    // Overlap: Drop Items pickup
    this.physics.add.overlap(this.player, this.combatSystem.dropItems, (_p, dropObj) => {
      const drop = dropObj as DropItem;
      if (drop.active && drop.item) {
        const added = this.player.inventory.addItem(drop.item);
        if (added) {
          if (drop.item.rarity === 'legendary') this.totalLegendariesFound++;
          drop.destroy();
        }
      }
    });

    // Spawn NPCs if in town
    if (area.isTown) {
      const smith = new NPC(this, {
        type: 'blacksmith',
        name: 'Valerius the Ironbound',
        title: 'Master Weaponsmith',
        x: 300,
        y: 280,
      });
      const alchemist = new NPC(this, {
        type: 'alchemist',
        name: 'Mara of the Low Bog',
        title: 'Alchemist & Apothecary',
        x: 700,
        y: 280,
      });
      const elder = new NPC(this, {
        type: 'elder',
        name: 'Elder Corvus',
        title: 'Keeper of the Old Order',
        x: 500,
        y: 220,
      });

      this.npcsGroup?.add(smith);
      this.npcsGroup?.add(alchemist);
      this.npcsGroup?.add(elder);

      // NPC click interactions
      [smith, alchemist, elder].forEach((npc) => {
        npc.on('pointerdown', () => {
          this.dialogueUI.open(npc);
        });
      });
    }

    // Spawn Monsters if combat area
    for (const sp of area.spawns) {
      const enemy = new Enemy(this, {
        type: sp.enemyType,
        level: sp.level,
        x: sp.x,
        y: sp.y,
        isElite: sp.isElite,
        affix: sp.affix,
      });
      this.enemiesGroup.add(enemy);
    }

    // Spawn Boss if area has one
    if (area.bossId && area.bossPos) {
      const bossConfig = {
        bossId: area.bossId,
        name:
          area.bossId === 'malakor'
            ? 'Grave Lord Malakor'
            : area.bossId === 'vane'
            ? 'Arch-Inquisitor Vane'
            : 'Malagath, the Void Sovereign',
        title:
          area.bossId === 'malakor'
            ? 'Ruler of the Restless Crypt'
            : area.bossId === 'vane'
            ? 'Zealot of the Dark Sun'
            : 'Lord of the Abyssal Rift',
        level: area.level,
        x: area.bossPos.x,
        y: area.bossPos.y,
      };
      this.activeBoss = new Boss(this, bossConfig);
      this.physics.add.collider(this.activeBoss, this.areaManager.wallsGroup);

      // Collisions with boss
      this.physics.add.overlap(this.combatSystem.projectiles, this.activeBoss, (projObj) => {
        const proj = projObj as any;
        if (proj.fromPlayer && this.activeBoss && this.activeBoss.active && this.activeBoss.hp > 0) {
          this.combatSystem.applyPlayerDamage(this.activeBoss, proj.damage, proj.element);
          proj.onHitCallback?.(this.activeBoss);
          if (proj.pierce <= 0) proj.destroy();
          else proj.pierce--;
        }
      });
    }

    // Auto-save on area entry
    SaveManager.save(this.player, area.id, this.questManager);
  }

  private onPortalStep(portalData: any) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    SoundEngine.getInstance().playMagicCast();
    this.cameras.main.fade(300, 0, 0, 0);

    this.time.delayedCall(320, () => {
      this.loadArea(portalData.targetAreaId, portalData.targetX, portalData.targetY);
      this.cameras.main.fadeIn(300, 0, 0, 0);
      this.time.delayedCall(350, () => {
        this.isTransitioning = false;
      });
    });
  }

  private onChestClick(chest: Phaser.GameObjects.Sprite) {
    if (chest.getData('opened')) return;

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
    if (dist > 90) return; // Too far away

    chest.setData('opened', true);
    chest.setTexture('prop_chest_open');
    SoundEngine.getInstance().playItemPickup();

    // Drop items
    const lvl = this.areaManager.currentArea.level;
    const gold = ItemGenerator.generateGold(20 + lvl * 10);
    const item = ItemGenerator.generateEquipment(lvl, Math.random() < 0.4 ? 'rare' : 'magic');
    const pot = ItemGenerator.generatePotion('potion_hp');

    this.combatSystem.dropItems.add(new DropItem(this, chest.x, chest.y + 15, gold));
    this.combatSystem.dropItems.add(new DropItem(this, chest.x - 25, chest.y + 20, item));
    this.combatSystem.dropItems.add(new DropItem(this, chest.x + 25, chest.y + 20, pot));

    this.questManager.onChestOpen();
  }

  public override update(time: number, delta: number) {
    if (this.isGameOver) return;

    // Check player death
    if (this.player.hp <= 0 && !this.isGameOver) {
      this.handlePlayerDeath();
      return;
    }

    const mousePointer = this.input.activePointer;

    // 1. Update Player
    this.player.updatePlayer(time, delta, mousePointer);

    // 2. Update Enemies AI
    this.enemiesGroup.getChildren().forEach((eObj: any) => {
      const enemy = eObj as Enemy;
      if (enemy.active) {
        enemy.updateEnemy(
          time,
          delta,
          this.player,
          this.combatSystem.projectiles,
          this.combatSystem.areaEffects,
          (suicideEnemy) => {
            // Plague bomber explosion
            SoundEngine.getInstance().playFireExplosion();
            this.player.takeDamage(suicideEnemy.attackDamage * 1.6, 'poison');
            suicideEnemy.destroy();
          }
        );
      }
    });

    // 3. Update Boss AI
    if (this.activeBoss && this.activeBoss.active) {
      this.activeBoss.updateBoss(
        time,
        delta,
        this.player,
        this.combatSystem.projectiles,
        this.combatSystem.areaEffects,
        (mx, my) => {
          // Spawn minion
          const minion = new Enemy(this, {
            type: 'skeleton_archer',
            level: this.activeBoss?.level || 4,
            x: mx,
            y: my,
          });
          this.enemiesGroup.add(minion);
        }
      );
    }

    // 4. Update NPCs
    if (this.npcsGroup) {
      this.npcsGroup.getChildren().forEach((nObj: any) => {
        const npc = nObj as NPC;
        npc.updatePrompt(this.player.x, this.player.y);
      });
    }

    // 5. Update Portals overlap
    this.areaManager.portalsGroup.getChildren().forEach((pObj: any) => {
      const portal = pObj as Phaser.GameObjects.Sprite;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, portal.x, portal.y);
      if (dist < 40 && !this.isTransitioning) {
        const data = portal.getData('portalData');
        if (data) this.onPortalStep(data);
      }
    });

    // 6. Update Combat Systems
    this.combatSystem.update(time, delta);

    // 7. Update HUD & Minimap
    this.hud.updateHUD(time, delta, this.areaManager.currentArea.name, this.activeBoss);
    this.minimapUI.updateMinimap(
      this.areaManager.currentArea,
      this.enemiesGroup,
      this.areaManager.portalsGroup,
      this.activeBoss
    );

    // 8. Auto-save every 30s
    this.autoSaveTimer += delta;
    if (this.autoSaveTimer >= 30000) {
      this.autoSaveTimer = 0;
      SaveManager.save(this.player, this.areaManager.currentArea.id, this.questManager);
    }
  }

  private handlePlayerDeath() {
    this.isGameOver = true;
    SoundEngine.getInstance().playMonsterDeath();
    this.player.setVelocity(0, 0);

    const W = 1280;
    const H = 720;
    const overlay = this.add.graphics();
    overlay.setDepth(600);
    overlay.setScrollFactor(0);
    overlay.fillStyle(0x3b0707, 0.7);
    overlay.fillRect(0, 0, W, H);

    const deathText = this.add.text(W / 2, H / 2 - 40, 'YOU HAVE FALLEN', {
      fontFamily: 'serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#ef4444',
      stroke: '#000',
      strokeThickness: 6,
    });
    deathText.setOrigin(0.5, 0.5);
    deathText.setDepth(601);
    deathText.setScrollFactor(0);

    const subText = this.add.text(W / 2, H / 2 + 15, 'Your soul crawls back to the sanctuary of Oakhaven Refuge...', {
      fontFamily: 'serif',
      fontSize: '16px',
      color: '#e2e8f0',
    });
    subText.setOrigin(0.5, 0.5);
    subText.setDepth(601);
    subText.setScrollFactor(0);

    const respawnBtn = this.add.text(W / 2, H / 2 + 75, '[ RESPAWN IN TOWN ]', {
      fontFamily: 'serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24',
      backgroundColor: '#78350f',
      padding: { x: 24, y: 10 },
      stroke: '#000',
      strokeThickness: 3,
    });
    respawnBtn.setOrigin(0.5, 0.5);
    respawnBtn.setDepth(601);
    respawnBtn.setScrollFactor(0);
    respawnBtn.setInteractive({ useHandCursor: true });

    respawnBtn.on('pointerdown', () => {
      overlay.destroy();
      deathText.destroy();
      subText.destroy();
      respawnBtn.destroy();

      this.isGameOver = false;
      this.player.hp = this.player.maxHp;
      this.player.resource = this.player.resourceType === 'fury' ? 0 : this.player.maxResource;
      this.player.inventory.gold = Math.max(0, Math.round(this.player.inventory.gold * 0.8)); // 20% gold penalty
      this.loadArea('town', 400, 360);
    });
  }
}
