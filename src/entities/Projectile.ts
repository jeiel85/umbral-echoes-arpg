import Phaser from 'phaser';

export interface ProjectileOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  isCrit?: boolean;
  element?: 'physical' | 'cold' | 'fire' | 'lightning' | 'poison';
  fromPlayer: boolean;
  pierce?: number;
  lifetime?: number;
  onHit?: (target: any) => void;
}

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number;
  public isCrit: boolean;
  public element: string;
  public fromPlayer: boolean;
  public pierce: number;
  private lifetime: number;
  public onHitCallback?: (target: any) => void;

  constructor(opts: ProjectileOptions) {
    super(opts.scene, opts.x, opts.y, opts.texture);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.damage = opts.damage;
    this.isCrit = opts.isCrit || false;
    this.element = opts.element || 'physical';
    this.fromPlayer = opts.fromPlayer;
    this.pierce = opts.pierce || 0;
    this.lifetime = opts.lifetime || 2500;
    this.onHitCallback = opts.onHit;

    this.setDepth(25);

    // Aim toward target
    const angle = Phaser.Math.Angle.Between(opts.x, opts.y, opts.targetX, opts.targetY);
    this.setRotation(angle);

    const vx = Math.cos(angle) * opts.speed;
    const vy = Math.sin(angle) * opts.speed;
    this.setVelocity(vx, vy);

    this.scene.time.delayedCall(this.lifetime, () => {
      if (this.active) {
        this.destroy();
      }
    });
  }
}
