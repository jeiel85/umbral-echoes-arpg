import Phaser from 'phaser';

export type NPCType = 'blacksmith' | 'alchemist' | 'elder';

export interface NPCConfig {
  type: NPCType;
  name: string;
  title: string;
  x: number;
  y: number;
}

export class NPC extends Phaser.GameObjects.Sprite {
  public npcType: NPCType;
  public npcName: string;
  public npcTitle: string;
  private promptText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, cfg: NPCConfig) {
    const texture = `npc_${cfg.type}`;
    super(scene, cfg.x, cfg.y, texture);
    scene.add.existing(this);

    this.npcType = cfg.type;
    this.npcName = cfg.name;
    this.npcTitle = cfg.title;

    this.setDepth(20);

    // Interaction prompt
    this.promptText = scene.add.text(cfg.x, cfg.y - 30, `${cfg.name}\n[클릭 / Space 로 대화]`, {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize: '11px',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    });
    this.promptText.setOrigin(0.5, 0.5);
    this.promptText.setDepth(25);
    this.promptText.setVisible(false);

    this.setInteractive({ useHandCursor: true });
  }

  public updatePrompt(playerX: number, playerY: number) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    this.promptText.setVisible(dist < 70);
  }

  public override destroy(fromScene?: boolean) {
    if (this.promptText) {
      this.promptText.destroy();
    }
    super.destroy(fromScene);
  }
}
