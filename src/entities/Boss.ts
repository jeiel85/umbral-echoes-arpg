import Phaser from 'phaser';
import { Player } from './Player';
import { Projectile } from './Projectile';
import { AreaEffect } from './AreaEffect';
import { SoundEngine } from '../audio/SoundEngine';

export type BossId = 'malakor' | 'vane' | 'malagath';

export interface BossConfig {
  bossId: BossId;
  name: string;
  title: string;
  level: number;
  x: number;
  y: number;
}

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public bossId: BossId;
  public bossName: string;
  public bossTitle: string;
  public level: number;
  public maxHp: number;
  public hp: number;
  public attackDamage: number;
  public armor: number;
  public moveSpeed: number;
  public expValue: number;

  public phase: number = 1;
  private attackTimer: number = 0;
  private specialTimer: number = 0;
  private telegraphGfx: Phaser.GameObjects.Graphics;
  private isTelegraphing: boolean = false;

  constructor(scene: Phaser.Scene, cfg: BossConfig) {
    const texture = `boss_${cfg.bossId}`;
    super(scene, cfg.x, cfg.y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.bossId = cfg.bossId;
    this.bossName = cfg.name;
    this.bossTitle = cfg.title;
    this.level = cfg.level;

    // Stat scaling
    if (cfg.bossId === 'malakor') {
      this.maxHp = 850;
      this.attackDamage = 26;
      this.armor = 18;
      this.moveSpeed = 80;
      this.expValue = 350;
    } else if (cfg.bossId === 'vane') {
      this.maxHp = 1400;
      this.attackDamage = 38;
      this.armor = 26;
      this.moveSpeed = 95;
      this.expValue = 650;
    } else {
      // Final Boss: Malagath
      this.maxHp = 2600;
      this.attackDamage = 52;
      this.armor = 34;
      this.moveSpeed = 105;
      this.expValue = 1800;
    }

    this.hp = this.maxHp;
    this.setDepth(22);
    this.setCollideWorldBounds(true);

    this.telegraphGfx = scene.add.graphics();
    this.telegraphGfx.setDepth(18);

    SoundEngine.getInstance().playBossRoar();
  }

  public updateBoss(
    time: number,
    delta: number,
    player: Player,
    projectiles: Phaser.Physics.Arcade.Group,
    areaEffects: Phaser.GameObjects.Group,
    spawnMinionCallback?: (x: number, y: number) => void
  ) {
    if (!this.active || this.hp <= 0) return;

    this.attackTimer += delta;
    this.specialTimer += delta;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setFlipX(player.x < this.x);

    // Phase Transitions
    const hpRatio = this.hp / this.maxHp;
    if (this.bossId === 'malagath') {
      if (hpRatio < 0.35 && this.phase < 3) {
        this.phase = 3;
        this.moveSpeed = 135;
        this.attackDamage = 62;
        this.setTint(0xff0055);
        SoundEngine.getInstance().playBossRoar();
      } else if (hpRatio < 0.7 && this.phase < 2) {
        this.phase = 2;
        this.moveSpeed = 115;
        this.setTint(0xd946ef);
        SoundEngine.getInstance().playBossRoar();
      }
    } else {
      if (hpRatio < 0.5 && this.phase < 2) {
        this.phase = 2;
        this.moveSpeed *= 1.25;
        this.setTint(0xf97316);
        SoundEngine.getInstance().playBossRoar();
      }
    }

    // AI Patterns based on Boss
    if (this.bossId === 'malakor') {
      this.updateMalakor(dist, angle, player, projectiles, spawnMinionCallback);
    } else if (this.bossId === 'vane') {
      this.updateVane(dist, angle, player, projectiles, areaEffects);
    } else {
      this.updateMalagath(dist, angle, player, projectiles, areaEffects, spawnMinionCallback);
    }
  }

  private updateMalakor(
    dist: number,
    angle: number,
    player: Player,
    projectiles: Phaser.Physics.Arcade.Group,
    spawnMinionCallback?: (x: number, y: number) => void
  ) {
    // Movement
    if (dist > 45 && !this.isTelegraphing) {
      this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
    } else {
      this.setVelocity(0, 0);
    }

    // Melee Scythe Cleave
    if (dist < 60 && this.attackTimer >= 1500) {
      this.attackTimer = 0;
      player.takeDamage(this.attackDamage, 'physical');
      SoundEngine.getInstance().playSwordSlash();
    }

    // Special: Soul Barrage or Minion Summon
    if (this.specialTimer >= (this.phase === 2 ? 3500 : 5000)) {
      this.specialTimer = 0;
      if (this.phase === 2 && Math.random() < 0.5 && spawnMinionCallback) {
        // Summon 2 skeletons
        spawnMinionCallback(this.x - 40, this.y);
        spawnMinionCallback(this.x + 40, this.y);
      } else {
        // Fire 5 soul orbs in arc
        const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        for (let i = -2; i <= 2; i++) {
          const spread = baseAngle + i * 0.22;
          const targetX = this.x + Math.cos(spread) * 300;
          const targetY = this.y + Math.sin(spread) * 300;
          const p = new Projectile({
            scene: this.scene,
            x: this.x,
            y: this.y,
            texture: 'proj_void_orb',
            targetX,
            targetY,
            speed: 210,
            damage: Math.round(this.attackDamage * 0.75),
            fromPlayer: false,
          });
          projectiles.add(p);
        }
      }
    }
  }

  private updateVane(
    dist: number,
    angle: number,
    player: Player,
    projectiles: Phaser.Physics.Arcade.Group,
    areaEffects: Phaser.GameObjects.Group
  ) {
    if (dist > 50 && !this.isTelegraphing) {
      this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
    } else {
      this.setVelocity(0, 0);
    }

    // Heavy Cleave
    if (dist < 65 && this.attackTimer >= 1600) {
      this.attackTimer = 0;
      player.takeDamage(this.attackDamage, 'fire');
      SoundEngine.getInstance().playHeavyHit();
    }

    // Special: Flame Pillar Telegraph
    if (this.specialTimer >= (this.phase === 2 ? 3200 : 4500) && !this.isTelegraphing) {
      this.specialTimer = 0;
      this.isTelegraphing = true;
      const targetX = player.x;
      const targetY = player.y;

      // Telegraph circle
      this.telegraphGfx.clear();
      this.telegraphGfx.fillStyle(0xef4444, 0.35);
      this.telegraphGfx.fillCircle(targetX, targetY, 45);
      this.telegraphGfx.lineStyle(2, 0xff0000, 0.8);
      this.telegraphGfx.strokeCircle(targetX, targetY, 45);

      this.scene.time.delayedCall(1000, () => {
        this.telegraphGfx.clear();
        this.isTelegraphing = false;
        if (!this.active) return;

        SoundEngine.getInstance().playFireExplosion();
        new AreaEffect({
          scene: this.scene,
          x: targetX,
          y: targetY,
          texture: 'proj_meteor',
          radius: 45,
          duration: 3500,
          damagePerTick: Math.round(this.attackDamage * 0.5),
          fromPlayer: false,
          element: 'fire',
        });
      });
    }
  }

  private updateMalagath(
    dist: number,
    angle: number,
    player: Player,
    projectiles: Phaser.Physics.Arcade.Group,
    areaEffects: Phaser.GameObjects.Group,
    spawnMinionCallback?: (x: number, y: number) => void
  ) {
    if (dist > 55 && !this.isTelegraphing) {
      this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
    } else {
      this.setVelocity(0, 0);
    }

    // Melee attack
    if (dist < 70 && this.attackTimer >= 1300) {
      this.attackTimer = 0;
      player.takeDamage(this.attackDamage, 'physical');
      SoundEngine.getInstance().playSwordSlash();
    }

    // Special attacks by phase
    const cool = this.phase === 3 ? 2400 : this.phase === 2 ? 3400 : 4500;
    if (this.specialTimer >= cool) {
      this.specialTimer = 0;

      if (this.phase === 3) {
        // Bullet Hell: 360 degree ring of void orbs!
        const count = 12;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          const p = new Projectile({
            scene: this.scene,
            x: this.x,
            y: this.y,
            texture: 'proj_void_orb',
            targetX: this.x + Math.cos(a) * 200,
            targetY: this.y + Math.sin(a) * 200,
            speed: 190,
            damage: Math.round(this.attackDamage * 0.6),
            fromPlayer: false,
          });
          projectiles.add(p);
        }
      } else if (this.phase === 2) {
        // Void Vortex: Pull player toward boss + create poison puddles
        const pullAngle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
        player.setVelocity(Math.cos(pullAngle) * 160, Math.sin(pullAngle) * 160);

        // Spawn 4 dark orbs at player
        for (let i = -1; i <= 1; i++) {
          const spread = angle + i * 0.3;
          const p = new Projectile({
            scene: this.scene,
            x: this.x,
            y: this.y,
            texture: 'proj_void_orb',
            targetX: this.x + Math.cos(spread) * 250,
            targetY: this.y + Math.sin(spread) * 250,
            speed: 220,
            damage: Math.round(this.attackDamage * 0.7),
            fromPlayer: false,
          });
          projectiles.add(p);
        }
      } else {
        // Phase 1: Direct triple volley
        for (let i = -1; i <= 1; i++) {
          const spread = angle + i * 0.25;
          const p = new Projectile({
            scene: this.scene,
            x: this.x,
            y: this.y,
            texture: 'proj_void_orb',
            targetX: this.x + Math.cos(spread) * 250,
            targetY: this.y + Math.sin(spread) * 250,
            speed: 210,
            damage: Math.round(this.attackDamage * 0.7),
            fromPlayer: false,
          });
          projectiles.add(p);
        }
      }
    }
  }

  public takeDamage(damage: number, element: string = 'physical'): number {
    if (this.hp <= 0) return 0;
    const red = this.armor / (this.armor + 60);
    const finalDmg = Math.max(1, Math.round(damage * (1 - red)));
    this.hp -= finalDmg;
    return finalDmg;
  }

  public override destroy(fromScene?: boolean) {
    if (this.telegraphGfx) {
      this.telegraphGfx.destroy();
    }
    super.destroy(fromScene);
  }
}
