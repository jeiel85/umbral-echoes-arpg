import Phaser from 'phaser';

export interface AreaEffectOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  radius: number;
  duration: number;
  damagePerTick: number;
  tickInterval?: number;
  fromPlayer: boolean;
  element?: string;
  slowPercent?: number;
  onTick?: (targets: any[]) => void;
}

export class AreaEffect extends Phaser.GameObjects.Sprite {
  public radius: number;
  public damagePerTick: number;
  public fromPlayer: boolean;
  public element: string;
  public slowPercent: number;
  public tickInterval: number;
  public nextTickTime: number = 0;
  private durationTimer: Phaser.Time.TimerEvent;

  constructor(opts: AreaEffectOptions) {
    super(opts.scene, opts.x, opts.y, opts.texture);
    this.scene.add.existing(this);

    this.radius = opts.radius;
    this.damagePerTick = opts.damagePerTick;
    this.fromPlayer = opts.fromPlayer;
    this.element = opts.element || 'physical';
    this.slowPercent = opts.slowPercent || 0;
    this.tickInterval = opts.tickInterval || 500;

    this.setDepth(15);
    this.setAlpha(0.85);

    this.durationTimer = this.scene.time.delayedCall(opts.duration, () => {
      this.destroy();
    });
  }

  public canTick(time: number): boolean {
    if (time >= this.nextTickTime) {
      this.nextTickTime = time + this.tickInterval;
      return true;
    }
    return false;
  }

  public override destroy(fromScene?: boolean) {
    if (this.durationTimer) {
      this.durationTimer.destroy();
    }
    super.destroy(fromScene);
  }
}
