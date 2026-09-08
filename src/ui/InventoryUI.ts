import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EquipSlot, Item } from '../items/ItemTypes';
import { SoundEngine } from '../audio/SoundEngine';

export class InventoryUI extends Phaser.GameObjects.Container {
  private player: Player;
  private isShopMode: boolean = false;
  public onSellCallback?: (item: Item, index: number) => void;

  private panelBg: Phaser.GameObjects.Graphics;
  private equipSlotsMap: Map<EquipSlot, { container: Phaser.GameObjects.Container; icon: Phaser.GameObjects.Sprite }> = new Map();
  private invSlotsMap: { container: Phaser.GameObjects.Container; icon: Phaser.GameObjects.Sprite; index: number }[] = [];

  // Tooltip
  private tooltipContainer: Phaser.GameObjects.Container;
  private tooltipBg: Phaser.GameObjects.Graphics;
  private tooltipText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 1280 / 2, 720 / 2);
    scene.add.existing(this);

    this.player = player;
    this.setDepth(300);
    this.setScrollFactor(0);
    this.setVisible(false);

    // Panel Window
    const pW = 680;
    const pH = 440;

    this.panelBg = scene.add.graphics();
    this.panelBg.fillStyle(0x0a0c10, 1.0);
    this.panelBg.fillRect(-pW / 2, -pH / 2, pW, pH);
    this.panelBg.lineStyle(3, 0x473d31, 1.0);
    this.panelBg.strokeRect(-pW / 2, -pH / 2, pW, pH);
    this.panelBg.lineStyle(1, 0xb45309, 0.9);
    this.panelBg.strokeRect(-pW / 2 + 4, -pH / 2 + 4, pW - 8, pH - 8);
    this.add(this.panelBg);

    // Title
    const title = scene.add.text(0, -pH / 2 + 18, '가방 및 장비 (INVENTORY & EQUIPMENT)', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 3,
    });
    title.setOrigin(0.5, 0.5);
    this.add(title);

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

    // Build Equipment section (Left side)
    this.buildEquipmentSection();

    // Build Inventory 24-slot grid (Right side)
    this.buildInventoryGrid();

    // Tooltip container
    this.tooltipContainer = scene.add.container(0, 0);
    this.tooltipContainer.setDepth(350);
    this.tooltipContainer.setVisible(false);
    this.add(this.tooltipContainer);

    this.tooltipBg = scene.add.graphics();
    this.tooltipContainer.add(this.tooltipBg);

    this.tooltipText = scene.add.text(0, 0, '', {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: 230 },
      lineSpacing: 4,
    });
    this.tooltipContainer.add(this.tooltipText);

    // Listen to inventory changes
    this.player.inventory.onInventoryChange = () => {
      this.refreshUI();
    };
  }

  private buildEquipmentSection() {
    const equipSlotsConfig: { slot: EquipSlot; label: string; x: number; y: number }[] = [
      { slot: 'head', label: '투구', x: -210, y: -120 },
      { slot: 'amulet', label: '목걸이', x: -140, y: -120 },
      { slot: 'weapon', label: '무기', x: -250, y: -50 },
      { slot: 'chest', label: '갑옷', x: -175, y: -50 },
      { slot: 'gloves', label: '장갑', x: -100, y: -50 },
      { slot: 'ring1', label: '반지 1', x: -230, y: 20 },
      { slot: 'boots', label: '장화', x: -175, y: 20 },
      { slot: 'ring2', label: '반지 2', x: -120, y: 20 },
    ];

    for (const ec of equipSlotsConfig) {
      const slotContainer = this.scene.add.container(ec.x, ec.y);

      const slotBg = this.scene.add.image(0, 0, 'ui_slot');
      slotBg.setInteractive({ useHandCursor: true });
      slotContainer.add(slotBg);

      const icon = this.scene.add.sprite(0, 0, 'icon_sword');
      icon.setVisible(false);
      slotContainer.add(icon);

      const lbl = this.scene.add.text(0, 26, ec.label, {
        fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
        fontSize: '10px',
        color: '#9ca3af',
      });
      lbl.setOrigin(0.5, 0.5);
      slotContainer.add(lbl);

      slotBg.on('pointerdown', () => {
        this.player.inventory.unequipItem(ec.slot);
        this.hideTooltip();
      });

      slotBg.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        const item = this.player.inventory.equipment[ec.slot];
        if (item) this.showTooltip(item, pointer);
      });

      slotBg.on('pointerout', () => this.hideTooltip());

      this.add(slotContainer);
      this.equipSlotsMap.set(ec.slot, { container: slotContainer, icon });
    }
  }

  private buildInventoryGrid() {
    const startX = 30;
    const startY = -120;
    const slotSize = 48;
    const cols = 6;
    const rows = 4;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const x = startX + c * slotSize;
        const y = startY + r * slotSize;

        const slotContainer = this.scene.add.container(x, y);

        const slotBg = this.scene.add.image(0, 0, 'ui_slot');
        slotBg.setInteractive({ useHandCursor: true });
        slotContainer.add(slotBg);

        const icon = this.scene.add.sprite(0, 0, 'icon_sword');
        icon.setVisible(false);
        slotContainer.add(icon);

        slotBg.on('pointerdown', () => {
          if (this.isShopMode && this.onSellCallback) {
            const it = this.player.inventory.items[index];
            if (it) this.onSellCallback(it, index);
          } else {
            this.player.inventory.equipItem(index);
          }
          this.hideTooltip();
        });

        slotBg.on('pointerover', (pointer: Phaser.Input.Pointer) => {
          const item = this.player.inventory.items[index];
          if (item) this.showTooltip(item, pointer);
        });

        slotBg.on('pointerout', () => this.hideTooltip());

        this.add(slotContainer);
        this.invSlotsMap.push({ container: slotContainer, icon, index });
      }
    }
  }

  public showTooltip(item: Item, pointer: Phaser.Input.Pointer) {
    const RARITY_KR: Record<string, string> = {
      common: '일반 (Common)',
      magic: '마법 (Magic)',
      rare: '희귀 (Rare)',
      legendary: '전설 (Legendary)',
    };
    const STAT_NAMES_KR: Record<string, string> = {
      maxHp: '최대 생명력',
      maxResource: '최대 자원',
      attackDamage: '공격력',
      armor: '방어력',
      critChance: '치명타 확률',
      critDamage: '치명타 피해',
      attackSpeed: '공격 속도',
      moveSpeed: '이동 속도',
      lifeSteal: '생명력 흡수',
      fireDamage: '화염 피해',
      coldDamage: '냉기 피해',
      lightningDamage: '번개 피해',
    };

    let text = `${item.name}\n요구 레벨: Lv.${item.level} [${RARITY_KR[item.rarity] || item.rarity}]\n\n`;

    // Stats
    for (const [k, v] of Object.entries(item.stats)) {
      if (typeof v === 'number' && v !== 0) {
        const sign = v > 0 ? '+' : '';
        const isPct = k.includes('Chance') || k.includes('Damage') || k.includes('Speed') || k.includes('Steal');
        const displayVal = isPct ? `${Math.round(v * 100)}%` : String(v);
        const statLabel = STAT_NAMES_KR[k] || k;
        text += `${statLabel}: ${sign}${displayVal}\n`;
      }
    }

    if (item.legendaryPower) {
      text += `\n★ 고유 효과: ${item.legendaryPower.name}\n${item.legendaryPower.description}\n`;
    }

    if (item.description) {
      text += `\n"${item.description}"\n`;
    }

    text += `\n판매 가치: ${item.value} G`;

    this.tooltipText.setText(text);
    const bounds = this.tooltipText.getBounds();

    this.tooltipBg.clear();
    this.tooltipBg.fillStyle(0x0a0c10, 1.0);
    this.tooltipBg.fillRect(-6, -6, bounds.width + 12, bounds.height + 12);
    this.tooltipBg.lineStyle(
      1,
      item.rarity === 'legendary' ? 0xf97316 : item.rarity === 'rare' ? 0xfacc15 : item.rarity === 'magic' ? 0x38bdf8 : 0x9ca3af
    );
    this.tooltipBg.strokeRect(-6, -6, bounds.width + 12, bounds.height + 12);

    this.tooltipContainer.setPosition(pointer.x - 1280 / 2 + 15, pointer.y - 720 / 2 + 15);
    this.tooltipContainer.setVisible(true);
  }

  public hideTooltip() {
    this.tooltipContainer.setVisible(false);
  }

  public refreshUI() {
    // Update equipment slots
    for (const [slot, data] of this.equipSlotsMap.entries()) {
      const item = this.player.inventory.equipment[slot];
      if (item) {
        data.icon.setTexture(item.icon);
        data.icon.setVisible(true);
      } else {
        data.icon.setVisible(false);
      }
    }

    // Update inventory slots
    for (const slot of this.invSlotsMap) {
      const item = this.player.inventory.items[slot.index];
      if (item) {
        slot.icon.setTexture(item.icon);
        slot.icon.setVisible(true);
      } else {
        slot.icon.setVisible(false);
      }
    }
  }

  public toggle(shopMode: boolean = false) {
    this.isShopMode = shopMode;
    this.setVisible(!this.visible);
    if (this.visible) {
      this.refreshUI();
      SoundEngine.getInstance().playItemPickup();
    } else {
      this.hideTooltip();
    }
  }

  public close() {
    this.setVisible(false);
    this.hideTooltip();
  }
}
