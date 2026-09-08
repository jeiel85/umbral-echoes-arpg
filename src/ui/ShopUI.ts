import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Item } from '../items/ItemTypes';
import { ItemGenerator } from '../items/ItemGenerator';
import { SoundEngine } from '../audio/SoundEngine';

export class ShopUI extends Phaser.GameObjects.Container {
  private player: Player;
  private shopItems: Item[] = [];
  private itemsContainer: Phaser.GameObjects.Container;
  private titleText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 1280 / 2, 720 / 2);
    scene.add.existing(this);

    this.player = player;
    this.setDepth(310);
    this.setScrollFactor(0);
    this.setVisible(false);

    const pW = 540;
    const pH = 440;

    // Background (100% opaque)
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0c10, 1.0);
    bg.fillRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(3, 0x473d31, 1.0);
    bg.strokeRect(-pW / 2, -pH / 2, pW, pH);
    bg.lineStyle(1, 0xb45309, 0.9);
    bg.strokeRect(-pW / 2 + 4, -pH / 2 + 4, pW - 8, pH - 8);
    this.add(bg);

    // Title
    this.titleText = scene.add.text(0, -pH / 2 + 20, '상점 (MERCHANT)', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 3,
    });
    this.titleText.setOrigin(0.5, 0.5);
    this.add(this.titleText);

    // Tip: Click inventory items to sell
    const tip = scene.add.text(0, pH / 2 - 25, '💡 팁: 가방의 아이템을 클릭하면 상점에 판매할 수 있습니다.', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '11px',
      color: '#9ca3af',
    });
    tip.setOrigin(0.5, 0.5);
    this.add(tip);

    // Close Button [X]
    const closeBtn = scene.add.text(pW / 2 - 25, -pH / 2 + 15, '✕', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#f87171',
    });
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      SoundEngine.getInstance().playButtonClick();
      this.close();
    });
    this.add(closeBtn);

    this.itemsContainer = scene.add.container(0, 0);
    this.add(this.itemsContainer);
  }

  public openShop(merchantType: 'blacksmith' | 'alchemist') {
    this.titleText.setText(merchantType === 'blacksmith' ? '대장장이 브론의 무기고' : '연금술사 엘레나의 물약상점');
    this.generateStock(merchantType);
    this.refreshUI();
    this.setVisible(true);
    SoundEngine.getInstance().playButtonClick();
  }

  private generateStock(merchantType: 'blacksmith' | 'alchemist') {
    this.shopItems = [];
    const lvl = this.player.level;

    if (merchantType === 'alchemist') {
      this.shopItems.push(ItemGenerator.generatePotion('potion_hp'));
      this.shopItems.push(ItemGenerator.generatePotion('potion_mana'));
    } else {
      // Blacksmith stock: 4 pieces of gear (magic/rare)
      this.shopItems.push(ItemGenerator.generateEquipment(lvl, 'magic'));
      this.shopItems.push(ItemGenerator.generateEquipment(lvl, 'magic'));
      this.shopItems.push(ItemGenerator.generateEquipment(lvl, 'rare'));
      this.shopItems.push(ItemGenerator.generateEquipment(lvl + 1, 'rare'));
    }
  }

  public refreshUI() {
    this.itemsContainer.removeAll(true);
    const startY = -140;
    const spacingY = 60;

    this.shopItems.forEach((item, idx) => {
      const y = startY + idx * spacingY;
      const price = item.type === 'potion_hp' || item.type === 'potion_mana' ? 20 : Math.round(item.value * 1.3);

      const icon = this.scene.add.sprite(-210, y, item.icon);
      this.itemsContainer.add(icon);

      let col = '#e2e8f0';
      if (item.rarity === 'magic') col = '#38bdf8';
      else if (item.rarity === 'rare') col = '#facc15';
      else if (item.rarity === 'legendary') col = '#fb923c';

      const name = this.scene.add.text(-180, y - 10, `${item.name} (Lv.${item.level})`, {
        fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
        fontSize: '13px',
        fontStyle: 'bold',
        color: col,
      });
      this.itemsContainer.add(name);

      const buyBtn = this.scene.add.text(130, y - 8, `구매 (${price} G)`, {
        fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
        fontSize: '12px',
        fontStyle: 'bold',
        color: this.player.inventory.gold >= price ? '#4ade80' : '#ef4444',
        backgroundColor: '#1f2937',
        padding: { x: 8, y: 4 },
      });
      buyBtn.setInteractive({ useHandCursor: true });
      buyBtn.on('pointerdown', () => {
        if (this.player.inventory.gold >= price) {
          this.player.inventory.gold -= price;
          this.player.inventory.addItem(item);
          SoundEngine.getInstance().playItemPickup();
          this.refreshUI();
        }
      });
      this.itemsContainer.add(buyBtn);
    });
  }

  public close() {
    this.setVisible(false);
  }
}
