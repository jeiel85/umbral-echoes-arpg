import Phaser from 'phaser';

export class HitFeedback {
  private scene: Phaser.Scene;
  private hitStopRemaining: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public update(delta: number) {
    if (this.hitStopRemaining > 0) {
      this.hitStopRemaining -= delta;
    }
  }

  public isHitStopped(): boolean {
    return this.hitStopRemaining > 0;
  }

  public triggerHit(target: Phaser.GameObjects.Sprite, isCrit: boolean = false) {
    // 1. Hit Flash: tint white for 90ms
    target.setTintFill(0xffffff);
    this.scene.time.delayedCall(90, () => {
      if (target && target.active) {
        target.clearTint();
      }
    });

    // 2. Micro Hit-stop (freezes physics/movement slightly for impact weight)
    this.hitStopRemaining = isCrit ? 70 : 40;

    // 3. Camera Shake
    const intensity = isCrit ? 0.007 : 0.003;
    const duration = isCrit ? 120 : 70;
    this.scene.cameras.main.shake(duration, intensity);

    // 4. Hit Particles
    this.spawnSparks(target.x, target.y, isCrit ? 0xfacc15 : 0xffffff);
  }

  public spawnSparks(x: number, y: number, tint: number = 0xffffff, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.sprite(x, y, 'fx_dot');
      p.setTint(tint);
      p.setScale(0.8);
      p.setDepth(90);

      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: p,
        x: x + vx * 0.25,
        y: y + vy * 0.25,
        alpha: 0,
        scale: 0.2,
        duration: 250 + Math.random() * 150,
        onComplete: () => {
          p.destroy();
        },
      });
    }
  }

  public spawnBlood(x: number, y: number, count: number = 6) {
    this.spawnSparks(x, y, 0x991b1b, count);
  }

  public spawnFrost(x: number, y: number, count: number = 10) {
    this.spawnSparks(x, y, 0x38bdf8, count);
  }

  public spawnFlame(x: number, y: number, count: number = 10) {
    this.spawnSparks(x, y, 0xf97316, count);
  }
}
