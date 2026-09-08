import Phaser from 'phaser';
import { NPC } from '../entities/NPC';
import { Player } from '../entities/Player';
import { QuestManager } from '../quests/QuestManager';
import { ItemGenerator } from '../items/ItemGenerator';
import { SoundEngine } from '../audio/SoundEngine';

export class DialogueUI extends Phaser.GameObjects.Container {
  private player: Player;
  private questManager: QuestManager;
  private onOpenShopCallback: (type: 'blacksmith' | 'alchemist') => void;

  private nameText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private actionBtn: Phaser.GameObjects.Text;
  private closeBtn: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    questManager: QuestManager,
    onOpenShop: (type: 'blacksmith' | 'alchemist') => void
  ) {
    super(scene, 1280 / 2, 720 - 180);
    scene.add.existing(this);

    this.player = player;
    this.questManager = questManager;
    this.onOpenShopCallback = onOpenShop;

    this.setDepth(320);
    this.setScrollFactor(0);
    this.setVisible(false);

    const pW = 760;
    const pH = 180;

    // Frame
    const bg = scene.add.graphics();
    bg.fillStyle(0x0f1117, 0.96);
    bg.fillRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(2, 0x473d31, 0.95);
    bg.strokeRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(1, 0xb45309, 0.8);
    bg.strokeRect(-pW / 2 + 3, -pH / 2 + 3, pW - 6, pH - 6);
    this.add(bg);

    // NPC Name & Title
    this.nameText = scene.add.text(-pW / 2 + 25, -pH / 2 + 15, 'Elder Corvus', {
      fontFamily: 'serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 3,
    });
    this.add(this.nameText);

    // Body Text
    this.bodyText = scene.add.text(-pW / 2 + 25, -pH / 2 + 45, '', {
      fontFamily: 'serif',
      fontSize: '13px',
      color: '#e2e8f0',
      wordWrap: { width: pW - 50 },
      lineSpacing: 6,
    });
    this.add(this.bodyText);

    // Primary Action Button (Trade / Turn In Quest)
    this.actionBtn = scene.add.text(pW / 2 - 190, pH / 2 - 40, '[ TRADE ]', {
      fontFamily: 'serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fbbf24',
      backgroundColor: '#78350f',
      padding: { x: 12, y: 6 },
    });
    this.actionBtn.setInteractive({ useHandCursor: true });
    this.add(this.actionBtn);

    // Close Button
    this.closeBtn = scene.add.text(pW / 2 - 80, pH / 2 - 40, '[ CLOSE ]', {
      fontFamily: 'serif',
      fontSize: '13px',
      color: '#9ca3af',
      backgroundColor: '#1f2937',
      padding: { x: 10, y: 6 },
    });
    this.closeBtn.setInteractive({ useHandCursor: true });
    this.closeBtn.on('pointerdown', () => {
      SoundEngine.getInstance().playButtonClick();
      this.close();
    });
    this.add(this.closeBtn);
  }

  public open(npc: NPC) {
    this.nameText.setText(`${npc.npcName} — ${npc.npcTitle}`);
    SoundEngine.getInstance().playButtonClick();

    if (npc.npcType === 'blacksmith') {
      this.bodyText.setText(
        '"The forge never sleeps while abominations roam the kingdom. Bring me coin or scrap, and I will fit you with tempered iron that can turn a fiend\'s claws."'
      );
      this.actionBtn.setText('[ BROWSE WARES ]');
      this.actionBtn.setVisible(true);
      this.actionBtn.off('pointerdown');
      this.actionBtn.on('pointerdown', () => {
        this.close();
        this.onOpenShopCallback('blacksmith');
      });
    } else if (npc.npcType === 'alchemist') {
      this.bodyText.setText(
        '"Roots of deathflower and distilled mana... keep your flasks full, traveler. Out in the blighted mire, poison seeps into the soul without warning."'
      );
      this.actionBtn.setText('[ BUY POTIONS ]');
      this.actionBtn.setVisible(true);
      this.actionBtn.off('pointerdown');
      this.actionBtn.on('pointerdown', () => {
        this.close();
        this.onOpenShopCallback('alchemist');
      });
    } else {
      // Elder Corvus (Quest dialogue)
      this.actionBtn.off('pointerdown');
      const q = this.questManager.getActiveMainQuest();

      if (!q) {
        this.bodyText.setText(
          '"The dark eclipse has lifted. You have banished the Void Sovereign and preserved what remains of humanity. You are forever etched into our annals."'
        );
        this.actionBtn.setVisible(false);
      } else if (q.isCompleted && !q.isTurnedIn) {
        this.bodyText.setText(
          `"Remarkable! You have completed: ${q.title}. Take this reward, and ready your strength for what lurks deeper in the dark."`
        );
        this.actionBtn.setText('[ CLAIM REWARD ]');
        this.actionBtn.setVisible(true);
        this.actionBtn.on('pointerdown', () => {
          q.isTurnedIn = true;
          this.player.addExp(q.reward.exp);
          this.player.inventory.gold += q.reward.gold;
          if (q.reward.itemRarity) {
            const rewardItem = ItemGenerator.generateEquipment(this.player.level + 1, q.reward.itemRarity);
            this.player.inventory.addItem(rewardItem);
          }
          SoundEngine.getInstance().playLevelUp();
          this.questManager.onQuestUpdated?.();
          this.close();
        });
      } else {
        this.bodyText.setText(
          `"Current Mission: ${q.title}\n${q.description}\n\nBe vigilant, traveler. Do not let your resolve waver."`
        );
        this.actionBtn.setVisible(false);
      }
    }

    this.setVisible(true);
  }

  public close() {
    this.setVisible(false);
  }
}
