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

    // Frame (100% opaque)
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0c10, 1.0);
    bg.fillRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(2, 0x473d31, 1.0);
    bg.strokeRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(1, 0xb45309, 0.9);
    bg.strokeRect(-pW / 2 + 3, -pH / 2 + 3, pW - 6, pH - 6);
    this.add(bg);

    // NPC Name & Title
    this.nameText = scene.add.text(-pW / 2 + 25, -pH / 2 + 15, '장로 코르부스 (Elder Corvus)', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 3,
    });
    this.add(this.nameText);

    // Body Text
    this.bodyText = scene.add.text(-pW / 2 + 25, -pH / 2 + 45, '', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '13px',
      color: '#e2e8f0',
      wordWrap: { width: pW - 50 },
      lineSpacing: 6,
    });
    this.add(this.bodyText);

    // Primary Action Button (Trade / Turn In Quest)
    this.actionBtn = scene.add.text(pW / 2 - 210, pH / 2 - 42, '[ 거래하기 ]', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fbbf24',
      backgroundColor: '#78350f',
      padding: { x: 12, y: 6 },
    });
    this.actionBtn.setInteractive({ useHandCursor: true });
    this.add(this.actionBtn);

    // Close Button
    this.closeBtn = scene.add.text(pW / 2 - 85, pH / 2 - 42, '[ 닫기 ]', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
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
        '"흉측한 마물들이 왕국을 뒤덮고 있는 한, 대장간의 불길은 결코 꺼지지 않소. 단련된 강철만이 놈들의 발톱과 이빨을 막아낼 수 있지. 필요한 장비가 있다면 골라보시오."'
      );
      this.actionBtn.setText('[ 장비 거래 ]');
      this.actionBtn.setVisible(true);
      this.actionBtn.off('pointerdown');
      this.actionBtn.on('pointerdown', () => {
        this.close();
        this.onOpenShopCallback('blacksmith');
      });
    } else if (npc.npcType === 'alchemist') {
      this.bodyText.setText(
        '"죽음꽃의 뿌리와 정제된 마나수... 물약 플라스크를 늘 넉넉히 챙기세요, 방랑자여. 오염된 늪지대의 맹독은 순식간에 영혼까지 파고드니까요."'
      );
      this.actionBtn.setText('[ 물약 구매 ]');
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
          '"칠흑 같던 개기일식이 물러가고 영원한 안식이 찾아왔네. 자네가 공허의 군주를 추방하고 인류의 명맥을 지켜냈어. 이 땅은 자네의 이름을 영원히 기억할 걸세."'
        );
        this.actionBtn.setVisible(false);
      } else if (q.isCompleted && !q.isTurnedIn) {
        this.bodyText.setText(
          `"훌륭하네! [ ${q.title} ] 임무를 성공적으로 완수했군. 여기 약속된 보상과 장비를 받게나. 어둠의 심연은 아직 깊으니 다음 여정을 서두르게."`
        );
        this.actionBtn.setText('[ 보상 받기 ]');
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
          `"현재 목표: ${q.title}\n${q.description}\n\n경계를 늦추지 말게, 여행자여. 공허의 그림자는 결코 쉬지 않는다네."`
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
