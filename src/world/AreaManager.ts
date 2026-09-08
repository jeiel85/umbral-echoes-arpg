import Phaser from 'phaser';
import { AreaDefinition, AREAS } from './WorldData';
import { DropItem } from '../items/DropItem';
import { ItemGenerator } from '../items/ItemGenerator';

export class AreaManager {
  private scene: Phaser.Scene;
  public currentArea: AreaDefinition;
  public wallsGroup: Phaser.Physics.Arcade.StaticGroup;
  public chestsGroup: Phaser.GameObjects.Group;
  public portalsGroup: Phaser.GameObjects.Group;
  public environmentGroup: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.currentArea = AREAS.town;
    this.wallsGroup = scene.physics.add.staticGroup();
    this.chestsGroup = scene.add.group();
    this.portalsGroup = scene.add.group();
    this.environmentGroup = scene.add.group();
  }

  public cleanupEnvironment() {
    this.wallsGroup.clear(true, true);
    this.chestsGroup.clear(true, true);
    this.portalsGroup.clear(true, true);
    this.environmentGroup.clear(true, true);
  }

  public loadArea(areaId: string): AreaDefinition {
    const area = AREAS[areaId] || AREAS.town;
    this.currentArea = area;
    return area;
  }

  public buildEnvironment(
    area: AreaDefinition,
    onPortalOverlap: (portal: any) => void,
    onChestOpen: (chest: Phaser.GameObjects.Sprite) => void
  ) {
    const TILE_SIZE = 32;
    const mapW = area.width * TILE_SIZE;
    const mapH = area.height * TILE_SIZE;

    // Set world & camera bounds
    this.scene.physics.world.setBounds(0, 0, mapW, mapH);
    this.scene.cameras.main.setBounds(0, 0, mapW, mapH);

    this.cleanupEnvironment();

    // Floor tiles
    for (let x = 0; x < area.width; x++) {
      for (let y = 0; y < area.height; y++) {
        const floor = this.scene.add.image(x * TILE_SIZE + 16, y * TILE_SIZE + 16, area.floorTile);
        floor.setDepth(1);
        this.environmentGroup.add(floor);
      }
    }

    // Boundary walls (Top, Bottom, Left, Right)
    for (let x = 0; x < area.width; x++) {
      // Top wall
      this.createWall(x * TILE_SIZE + 16, 16, area.wallTile);
      // Bottom wall
      this.createWall(x * TILE_SIZE + 16, (area.height - 1) * TILE_SIZE + 16, area.wallTile);
    }
    for (let y = 1; y < area.height - 1; y++) {
      // Left wall
      this.createWall(16, y * TILE_SIZE + 16, area.wallTile);
      // Right wall
      this.createWall((area.width - 1) * TILE_SIZE + 16, y * TILE_SIZE + 16, area.wallTile);
    }

    // Decorative Torches
    for (const t of area.torches) {
      const torch = this.scene.add.sprite(t.x, t.y, 'prop_torch');
      torch.setDepth(5);
      this.environmentGroup.add(torch);
      // Torch light flicker
      this.scene.tweens.add({
        targets: torch,
        alpha: 0.75,
        duration: 250 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
      });
    }

    // Portals
    for (const p of area.portals) {
      const portal = this.scene.add.sprite(p.x, p.y, 'prop_portal');
      portal.setDepth(6);
      portal.setData('portalData', p);
      this.portalsGroup.add(portal);

      // Label above portal
      const lbl = this.scene.add.text(p.x, p.y - 35, p.label, {
        fontFamily: 'serif',
        fontSize: '12px',
        color: '#67e8f9',
        backgroundColor: 'rgba(5, 5, 8, 0.8)',
        padding: { x: 4, y: 2 },
        stroke: '#000',
        strokeThickness: 2,
      });
      lbl.setOrigin(0.5, 0.5);
      lbl.setDepth(7);
      this.environmentGroup.add(lbl);

      // Pulse rotation
      this.scene.tweens.add({
        targets: portal,
        angle: 360,
        duration: 8000,
        repeat: -1,
      });
    }

    // Chests
    for (const c of area.chests) {
      const chest = this.scene.add.sprite(c.x, c.y, 'prop_chest');
      chest.setDepth(6);
      chest.setData('opened', false);
      chest.setInteractive({ useHandCursor: true });
      chest.on('pointerdown', () => onChestOpen(chest));
      this.chestsGroup.add(chest);
    }

    // Town props
    if (area.isTown) {
      const fountain = this.scene.add.sprite(550, 360, 'prop_fountain');
      fountain.setDepth(5);
      this.environmentGroup.add(fountain);
    }
  }

  private createWall(x: number, y: number, texture: string) {
    const wall = this.wallsGroup.create(x, y, texture);
    wall.setDepth(4);
    wall.refreshBody();
  }
}
