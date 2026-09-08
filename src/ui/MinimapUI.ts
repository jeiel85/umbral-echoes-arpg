import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { AreaDefinition } from '../world/WorldData';

export class MinimapUI extends Phaser.GameObjects.Container {
  private player: Player;
  private mapGfx: Phaser.GameObjects.Graphics;
  private isExpanded: boolean = false;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 1280 - 100, 150);
    scene.add.existing(this);

    this.player = player;
    this.setDepth(210);
    this.setScrollFactor(0);

    this.mapGfx = scene.add.graphics();
    this.add(this.mapGfx);
  }

  public updateMinimap(
    area: AreaDefinition,
    enemies: Phaser.Physics.Arcade.Group,
    portals: Phaser.GameObjects.Group,
    boss?: Phaser.Physics.Arcade.Sprite | null
  ) {
    this.mapGfx.clear();

    const mW = 140;
    const mH = 100;
    const scaleX = mW / (area.width * 32);
    const scaleY = mH / (area.height * 32);

    // Frame
    this.mapGfx.fillStyle(0x0a0c10, 0.75);
    this.mapGfx.fillRect(-mW / 2, -mH / 2, mW, mH);
    this.mapGfx.lineStyle(1, 0x473d31, 0.9);
    this.mapGfx.strokeRect(-mW / 2, -mH / 2, mW, mH);

    // Portals (Cyan dots)
    this.mapGfx.fillStyle(0x38bdf8, 0.9);
    portals.getChildren().forEach((p: any) => {
      const px = -mW / 2 + p.x * scaleX;
      const py = -mH / 2 + p.y * scaleY;
      this.mapGfx.fillRect(px - 2, py - 2, 4, 4);
    });

    // Enemies (Red dots)
    this.mapGfx.fillStyle(0xef4444, 0.8);
    enemies.getChildren().forEach((e: any) => {
      if (e.active && e.hp > 0) {
        const ex = -mW / 2 + e.x * scaleX;
        const ey = -mH / 2 + e.y * scaleY;
        this.mapGfx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
      }
    });

    // Boss (Yellow/Purple dot)
    if (boss && boss.active && (boss as any).hp > 0) {
      this.mapGfx.fillStyle(0xfacc15, 1);
      const bx = -mW / 2 + boss.x * scaleX;
      const by = -mH / 2 + boss.y * scaleY;
      this.mapGfx.fillCircle(bx, by, 4);
    }

    // Player (Bright Green dot)
    this.mapGfx.fillStyle(0x22c55e, 1);
    const px = -mW / 2 + this.player.x * scaleX;
    const py = -mH / 2 + this.player.y * scaleY;
    this.mapGfx.fillCircle(px, py, 3);
  }

  public toggleExpand() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.setPosition(1280 / 2, 720 / 2);
      this.setScale(2.5);
    } else {
      this.setPosition(1280 - 100, 150);
      this.setScale(1);
    }
  }
}
