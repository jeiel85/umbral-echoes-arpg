import Phaser from 'phaser';
import { Player } from './Player';
import { Projectile } from './Projectile';
import { AreaEffect } from './AreaEffect';

export type EnemyType =
  | 'hollow'
  | 'bloodhound'
  | 'skeleton_archer'
  | 'blight_spitter'
  | 'bone_breaker'
  | 'shadow_wraith'
  | 'cultist'
  | 'gargoyle'
  | 'plague_bomber'
  | 'void_chanter';

export type EliteAffix = 'Fast' | 'Vampiric' | 'Flame Aura' | 'Frost' | 'Poison' | 'Shielded' | 'Berserk';

export interface EnemyConfig {
  type: EnemyType;
  level: number;
  x: number;
  y: number;
  isElite?: boolean;
  affix?: EliteAffix;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public enemyType: EnemyType;
  public level: number;
  public maxHp: number;
  public hp: number;
  public attackDamage: number;
  public armor: number;
  public moveSpeed: number;
  public expValue: number;

  public isElite: boolean;
  public affix?: EliteAffix;
  public shieldHp: number = 0;
  private flameAuraTimer: number = 0;
  private attackCooldownTimer: number = 0;
  private specialAbilityTimer: number = 0;
  private isCharging: boolean = false;

  private eliteAuraGfx?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, cfg: EnemyConfig) {
    const texture = `enemy_${cfg.type}`;
    super(scene, cfg.x, cfg.y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = cfg.type;
    this.level = cfg.level;
    this.isElite = cfg.isElite || false;
    this.affix = cfg.affix;

    // Base stats scaled by level
    const lvlMult = 1 + (cfg.level - 1) * 0.22;
    let hp = 45 * lvlMult;
    let atk = 7 * lvlMult;
    let arm = 3 * lvlMult;
    let spd = 90;
    let exp = 20 * lvlMult;

    // Type-specific adjustments
    switch (cfg.type) {
      case 'bloodhound':
        spd = 145;
        hp *= 0.85;
        atk *= 0.9;
        break;
      case 'skeleton_archer':
        spd = 85;
        hp *= 0.8;
        atk *= 1.1;
        break;
      case 'blight_spitter':
        spd = 70;
        hp *= 1.1;
        break;
      case 'bone_breaker':
        spd = 65;
        hp *= 2.2;
        arm *= 2.0;
        atk *= 1.4;
        break;
      case 'shadow_wraith':
        spd = 110;
        hp *= 0.9;
        atk *= 1.25;
        break;
      case 'cultist':
        spd = 75;
        hp *= 1.0;
        break;
      case 'gargoyle':
        spd = 95;
        hp *= 1.6;
        arm *= 2.5;
        break;
      case 'plague_bomber':
        spd = 135;
        hp *= 0.7;
        atk *= 2.0;
        break;
      case 'void_chanter':
        spd = 80;
        hp *= 1.3;
        break;
    }

    // Elite bonuses
    if (this.isElite) {
      hp *= 2.6;
      atk *= 1.35;
      exp *= 3.5;
      if (this.affix === 'Fast') spd *= 1.45;
      if (this.affix === 'Shielded') this.shieldHp = Math.round(hp * 0.5);

      // Add visual elite halo
      this.eliteAuraGfx = scene.add.graphics();
      this.eliteAuraGfx.setDepth(19);
    }

    this.maxHp = Math.round(hp);
    this.hp = this.maxHp;
    this.attackDamage = Math.round(atk);
    this.armor = Math.round(arm);
    this.moveSpeed = Math.round(spd);
    this.expValue = Math.round(exp);

    this.setDepth(20);
    this.setCollideWorldBounds(true);
  }

  public updateEnemy(
    time: number,
    delta: number,
    player: Player,
    projectiles: Phaser.Physics.Arcade.Group,
    areaEffects: Phaser.GameObjects.Group,
    onSuicideExplode?: (e: Enemy) => void
  ) {
    if (!this.active || this.hp <= 0) return;

    // Update elite aura position
    if (this.eliteAuraGfx) {
      this.eliteAuraGfx.clear();
      this.eliteAuraGfx.lineStyle(2, this.affix === 'Flame Aura' ? 0xf97316 : 0xfacc15, 0.8);
      this.eliteAuraGfx.strokeCircle(this.x, this.y + 4, 18);
    }

    // Elite Flame Aura tick
    if (this.isElite && this.affix === 'Flame Aura') {
      this.flameAuraTimer += delta;
      if (this.flameAuraTimer >= 800) {
        this.flameAuraTimer = 0;
        const distToP = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distToP < 100) {
          player.takeDamage(Math.round(this.attackDamage * 0.4), 'fire');
        }
      }
    }

    // Elite Berserk check
    if (this.isElite && this.affix === 'Berserk' && this.hp < this.maxHp * 0.5) {
      this.setTint(0xef4444);
      this.moveSpeed = 150;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    this.setFlipX(player.x < this.x);

    // AI Behavior by Type
    this.attackCooldownTimer -= delta;
    this.specialAbilityTimer += delta;

    switch (this.enemyType) {
      case 'hollow':
      case 'bloodhound': {
        // Melee chasers
        if (dist > 30) {
          this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
        } else {
          this.setVelocity(0, 0);
          if (this.attackCooldownTimer <= 0) {
            this.attackCooldownTimer = 1000;
            this.performMeleeAttack(player);
          }
        }
        break;
      }

      case 'skeleton_archer': {
        // Kiting ranged archer: stays around 200px
        if (dist < 130) {
          // Retreat
          this.setVelocity(-Math.cos(angle) * this.moveSpeed, -Math.sin(angle) * this.moveSpeed);
        } else if (dist > 250) {
          // Approach
          this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
        } else {
          // Hold and shoot
          this.setVelocity(0, 0);
          if (this.attackCooldownTimer <= 0) {
            this.attackCooldownTimer = 1600;
            this.shootProjectile(projectiles, 'proj_bone_arrow', player.x, player.y, 240);
          }
        }
        break;
      }

      case 'blight_spitter': {
        if (dist > 200) {
          this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
        } else {
          this.setVelocity(0, 0);
          if (this.attackCooldownTimer <= 0) {
            this.attackCooldownTimer = 2200;
            const proj = this.shootProjectile(projectiles, 'proj_poison_spit', player.x, player.y, 200);
            proj.onHitCallback = (target) => {
              // Spawn poison puddle on impact
              new AreaEffect({
                scene: this.scene,
                x: target.x,
                y: target.y,
                texture: 'fx_poison_puddle',
                radius: 40,
                duration: 4000,
                damagePerTick: Math.round(this.attackDamage * 0.35),
                fromPlayer: false,
                element: 'poison',
                slowPercent: 0.3,
              });
            };
          }
        }
        break;
      }

      case 'bone_breaker': {
        // Slow walk, then wind-up charge
        if (!this.isCharging) {
          if (this.specialAbilityTimer >= 4000 && dist < 220) {
            this.specialAbilityTimer = 0;
            this.isCharging = true;
            this.setTint(0xffaa00);
            // Windup for 400ms then charge
            this.setVelocity(0, 0);
            this.scene.time.delayedCall(450, () => {
              if (this.active) {
                const chargeAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                this.setVelocity(Math.cos(chargeAngle) * 280, Math.sin(chargeAngle) * 280);
                this.scene.time.delayedCall(700, () => {
                  this.isCharging = false;
                  this.clearTint();
                });
              }
            });
          } else {
            this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
            if (dist < 38 && this.attackCooldownTimer <= 0) {
              this.attackCooldownTimer = 1400;
              this.performMeleeAttack(player);
            }
          }
        }
        break;
      }

      case 'shadow_wraith': {
        // Teleport flanker
        if (this.specialAbilityTimer >= 3500 && dist < 300) {
          this.specialAbilityTimer = 0;
          // Teleport behind player
          const behindAngle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y) + Math.PI;
          this.x = player.x + Math.cos(behindAngle) * 60;
          this.y = player.y + Math.sin(behindAngle) * 60;
          this.attackCooldownTimer = 200;
        } else {
          this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
          if (dist < 35 && this.attackCooldownTimer <= 0) {
            this.attackCooldownTimer = 1100;
            this.performMeleeAttack(player);
          }
        }
        break;
      }

      case 'cultist': {
        // Ranged dark bolt chanter
        if (dist > 180) {
          this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
        } else {
          this.setVelocity(0, 0);
          if (this.attackCooldownTimer <= 0) {
            this.attackCooldownTimer = 1900;
            this.shootProjectile(projectiles, 'proj_void_orb', player.x, player.y, 180);
          }
        }
        break;
      }

      case 'gargoyle': {
        this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
        if (dist < 36 && this.attackCooldownTimer <= 0) {
          this.attackCooldownTimer = 1200;
          this.performMeleeAttack(player);
        }
        break;
      }

      case 'plague_bomber': {
        // Rushes straight to player and explodes when close
        this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
        if (dist < 32) {
          onSuicideExplode?.(this);
        }
        break;
      }

      case 'void_chanter': {
        // Orbit player at distance, casting dark pulses
        if (dist > 190) {
          this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
        } else {
          this.setVelocity(0, 0);
          if (this.attackCooldownTimer <= 0) {
            this.attackCooldownTimer = 1800;
            this.shootProjectile(projectiles, 'proj_void_orb', player.x, player.y, 190);
          }
        }
        break;
      }
    }
  }

  private performMeleeAttack(player: Player) {
    let dmg = this.attackDamage;
    if (this.isElite && this.affix === 'Vampiric') {
      const healed = Math.round(dmg * 0.4);
      this.hp = Math.min(this.maxHp, this.hp + healed);
    }
    player.takeDamage(dmg, this.affix === 'Frost' ? 'cold' : this.affix === 'Poison' ? 'poison' : 'physical');
  }

  private shootProjectile(
    group: Phaser.Physics.Arcade.Group,
    texture: string,
    tx: number,
    ty: number,
    speed: number
  ): Projectile {
    const proj = new Projectile({
      scene: this.scene,
      x: this.x,
      y: this.y,
      texture,
      targetX: tx,
      targetY: ty,
      speed,
      damage: this.attackDamage,
      fromPlayer: false,
    });
    group.add(proj);
    return proj;
  }

  public takeDamage(damage: number, element: string = 'physical'): number {
    if (this.hp <= 0) return 0;

    // Check armor reduction
    const red = this.armor / (this.armor + 50);
    let finalDmg = Math.max(1, Math.round(damage * (1 - red)));

    if (this.shieldHp > 0) {
      if (this.shieldHp >= finalDmg) {
        this.shieldHp -= finalDmg;
        return 0;
      } else {
        finalDmg -= this.shieldHp;
        this.shieldHp = 0;
      }
    }

    this.hp -= finalDmg;
    return finalDmg;
  }

  public override destroy(fromScene?: boolean) {
    if (this.eliteAuraGfx) {
      this.eliteAuraGfx.destroy();
    }
    super.destroy(fromScene);
  }
}
