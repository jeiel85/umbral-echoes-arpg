import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Projectile } from '../entities/Projectile';
import { AreaEffect } from '../entities/AreaEffect';
import { DropItem } from '../items/DropItem';
import { ItemGenerator } from '../items/ItemGenerator';
import { DamageNumberManager } from './DamageNumber';
import { HitFeedback } from './HitFeedback';
import { SoundEngine } from '../audio/SoundEngine';
import { SKILL_DEFINITIONS } from '../skills/SkillDefinitions';
import { SkillId } from '../skills/SkillTypes';

export class CombatSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private damageNumbers: DamageNumberManager;
  private hitFeedback: HitFeedback;

  public projectiles: Phaser.Physics.Arcade.Group;
  public areaEffects: Phaser.GameObjects.Group;
  public dropItems: Phaser.GameObjects.Group;

  public onEnemyKilledCallback?: (enemy: Enemy) => void;
  public onBossKilledCallback?: (boss: Boss) => void;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.damageNumbers = new DamageNumberManager(scene);
    this.hitFeedback = new HitFeedback(scene);

    this.projectiles = scene.physics.add.group({ classType: Projectile, runChildUpdate: true });
    this.areaEffects = scene.add.group({ classType: AreaEffect, runChildUpdate: true });
    this.dropItems = scene.add.group({ classType: DropItem });
  }

  public update(time: number, delta: number) {
    this.hitFeedback.update(delta);

    // Check cinder trail legendary
    if (this.player.inventory.hasLegendary('cinder_trail') && this.player.body && this.player.body.velocity.length() > 20) {
      if (Math.random() < 0.2) {
        new AreaEffect({
          scene: this.scene,
          x: this.player.x,
          y: this.player.y,
          texture: 'proj_meteor',
          radius: 20,
          duration: 1800,
          damagePerTick: 12,
          fromPlayer: true,
          element: 'fire',
        });
      }
    }
  }

  public executeSkill(
    skillId: SkillId,
    targetWorldX: number,
    targetWorldY: number,
    enemies: Phaser.Physics.Arcade.Group,
    boss?: Boss | null
  ) {
    const def = SKILL_DEFINITIONS[skillId];
    if (!def) return;

    const now = this.scene.time.now;
    if (!this.player.skillManager.isSkillReady(skillId, now)) return;

    // Resource check
    if (this.player.resource < def.resourceCost) return;

    // Pay resource and set cooldown
    this.player.resource -= def.resourceCost;
    this.player.skillManager.triggerCooldown(skillId, now);
    this.player.playAttackAnimation();

    // Skill Implementations
    switch (skillId) {
      case 'cleave':
        this.castCleave(targetWorldX, targetWorldY, enemies, boss);
        break;
      case 'seismic_slam':
        this.castSeismicSlam(targetWorldX, targetWorldY, enemies, boss);
        break;
      case 'iron_rush':
        this.castIronRush(targetWorldX, targetWorldY, enemies, boss);
        break;
      case 'whirlwind':
        this.castWhirlwind(enemies, boss);
        break;
      case 'war_cry':
        this.castWarCry();
        break;
      case 'leap_retribution':
        this.castLeapRetribution(targetWorldX, targetWorldY, enemies, boss);
        break;
      case 'arcane_bolt':
        this.castArcaneBolt(targetWorldX, targetWorldY);
        break;
      case 'glacial_nova':
        this.castGlacialNova(enemies, boss);
        break;
      case 'blink':
        this.castBlink(targetWorldX, targetWorldY);
        break;
      case 'cataclysm_meteor':
        this.castMeteor(targetWorldX, targetWorldY);
        break;
      case 'chain_lightning':
        this.castChainLightning(targetWorldX, targetWorldY, enemies, boss);
        break;
      case 'umbral_ward':
        this.castUmbralWard();
        break;
    }
  }

  // --- VANGUARD SKILLS ---
  private castCleave(tx: number, ty: number, enemies: Phaser.Physics.Arcade.Group, boss?: Boss | null) {
    SoundEngine.getInstance().playSwordSlash();
    const p = this.player;
    const angle = Phaser.Math.Angle.Between(p.x, p.y, tx, ty);

    // Slash visual arc
    const slash = this.scene.add.sprite(p.x + Math.cos(angle) * 35, p.y + Math.sin(angle) * 35, 'fx_slash');
    slash.setRotation(angle);
    slash.setDepth(28);
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 1.3,
      duration: 180,
      onComplete: () => slash.destroy(),
    });

    // Check hit arc
    let hitCount = 0;
    const strikeRange = 75;
    const allTargets: (Enemy | Boss)[] = [...(enemies.getChildren() as Enemy[])];
    if (boss && boss.active) allTargets.push(boss);

    for (const target of allTargets) {
      if (!target.active || target.hp <= 0) continue;
      const d = Phaser.Math.Distance.Between(p.x, p.y, target.x, target.y);
      if (d <= strikeRange) {
        const targetAngle = Phaser.Math.Angle.Between(p.x, p.y, target.x, target.y);
        const diff = Phaser.Math.Angle.Wrap(targetAngle - angle);
        if (Math.abs(diff) < 1.1) {
          // Inside 120 degree frontal arc
          this.applyPlayerDamage(target, p.attack * 1.4, 'physical');
          hitCount++;
        }
      }
    }

    if (hitCount > 0 && p.resourceType === 'fury') {
      p.resource = Math.min(p.maxResource, p.resource + 10);
    }
  }

  private castSeismicSlam(tx: number, ty: number, enemies: Phaser.Physics.Arcade.Group, boss?: Boss | null) {
    SoundEngine.getInstance().playHeavyHit();
    const p = this.player;
    const angle = Phaser.Math.Angle.Between(p.x, p.y, tx, ty);
    const hasCone = p.inventory.hasLegendary('cone_slam');

    const waves = hasCone ? [-0.35, 0, 0.35] : [0];
    for (const offset of waves) {
      const shockAngle = angle + offset;
      const waveX = p.x + Math.cos(shockAngle) * 60;
      const waveY = p.y + Math.sin(shockAngle) * 60;

      // Visual shockwave
      const fx = this.scene.add.sprite(waveX, waveY, 'fx_slash');
      fx.setTint(0xf59e0b);
      fx.setRotation(shockAngle);
      fx.setScale(1.6);
      fx.setDepth(28);
      this.scene.tweens.add({
        targets: fx,
        alpha: 0,
        scale: 2.2,
        duration: 250,
        onComplete: () => fx.destroy(),
      });

      const allTargets: (Enemy | Boss)[] = [...(enemies.getChildren() as Enemy[])];
      if (boss && boss.active) allTargets.push(boss);

      for (const target of allTargets) {
        if (!target.active || target.hp <= 0) continue;
        const d = Phaser.Math.Distance.Between(waveX, waveY, target.x, target.y);
        if (d <= 70) {
          this.applyPlayerDamage(target, p.attack * 2.2, 'physical');
          // Stun briefly
          target.setVelocity(0, 0);
        }
      }
    }
  }

  private castIronRush(tx: number, ty: number, enemies: Phaser.Physics.Arcade.Group, boss?: Boss | null) {
    SoundEngine.getInstance().playDash();
    const p = this.player;
    const angle = Phaser.Math.Angle.Between(p.x, p.y, tx, ty);
    p.setVelocity(Math.cos(angle) * 420, Math.sin(angle) * 420);

    this.scene.time.delayedCall(240, () => {
      p.setVelocity(0, 0);
      // Impact burst at end of rush
      const allTargets: (Enemy | Boss)[] = [...(enemies.getChildren() as Enemy[])];
      if (boss && boss.active) allTargets.push(boss);

      for (const target of allTargets) {
        if (!target.active || target.hp <= 0) continue;
        const d = Phaser.Math.Distance.Between(p.x, p.y, target.x, target.y);
        if (d <= 65) {
          this.applyPlayerDamage(target, p.attack * 1.6, 'physical');
        }
      }
    });
  }

  private castWhirlwind(enemies: Phaser.Physics.Arcade.Group, boss?: Boss | null) {
    SoundEngine.getInstance().playSwordSlash();
    const p = this.player;
    const ticks = 6;
    let currentTick = 0;

    const timer = this.scene.time.addEvent({
      delay: 200,
      repeat: ticks - 1,
      callback: () => {
        currentTick++;
        SoundEngine.getInstance().playSwordSlash();

        // Spin animation
        const fx = this.scene.add.sprite(p.x, p.y, 'fx_slash');
        fx.setRotation(currentTick * 1.2);
        fx.setScale(1.4);
        fx.setDepth(28);
        this.scene.tweens.add({
          targets: fx,
          alpha: 0,
          duration: 150,
          onComplete: () => fx.destroy(),
        });

        const allTargets: (Enemy | Boss)[] = [...(enemies.getChildren() as Enemy[])];
        if (boss && boss.active) allTargets.push(boss);

        for (const target of allTargets) {
          if (!target.active || target.hp <= 0) continue;
          const d = Phaser.Math.Distance.Between(p.x, p.y, target.x, target.y);
          if (d <= 80) {
            this.applyPlayerDamage(target, p.attack * 0.95, 'physical');
          }
        }
      },
    });
  }

  private castWarCry() {
    SoundEngine.getInstance().playHeavyHit();
    this.player.warCryTimer = 8000;
    this.player.recalculateStats();

    // Golden pulse
    const fx = this.scene.add.sprite(this.player.x, this.player.y, 'fx_glacial_nova');
    fx.setTint(0xfacc15);
    fx.setScale(1.2);
    fx.setDepth(28);
    this.scene.tweens.add({
      targets: fx,
      alpha: 0,
      scale: 2.0,
      duration: 350,
      onComplete: () => fx.destroy(),
    });
  }

  private castLeapRetribution(tx: number, ty: number, enemies: Phaser.Physics.Arcade.Group, boss?: Boss | null) {
    SoundEngine.getInstance().playDash();
    const p = this.player;
    // Jump animation tween
    this.scene.tweens.add({
      targets: p,
      x: tx,
      y: ty,
      duration: 280,
      ease: 'Quad.easeOut',
      onComplete: () => {
        SoundEngine.getInstance().playHeavyHit();
        this.scene.cameras.main.shake(120, 0.008);

        const fx = this.scene.add.sprite(tx, ty, 'fx_slash');
        fx.setTint(0xf97316);
        fx.setScale(2.5);
        this.scene.tweens.add({ targets: fx, alpha: 0, duration: 250, onComplete: () => fx.destroy() });

        const allTargets: (Enemy | Boss)[] = [...(enemies.getChildren() as Enemy[])];
        if (boss && boss.active) allTargets.push(boss);

        for (const target of allTargets) {
          if (!target.active || target.hp <= 0) continue;
          const d = Phaser.Math.Distance.Between(tx, ty, target.x, target.y);
          if (d <= 100) {
            this.applyPlayerDamage(target, p.attack * 3.4, 'physical');
          }
        }
      },
    });
  }

  // --- ARCANIST SKILLS ---
  private castArcaneBolt(tx: number, ty: number) {
    SoundEngine.getInstance().playMagicCast();
    const p = this.player;
    const hasPierce = p.inventory.hasLegendary('piercing_orb');

    const proj = new Projectile({
      scene: this.scene,
      x: p.x,
      y: p.y,
      texture: 'proj_arcane_bolt',
      targetX: tx,
      targetY: ty,
      speed: 380,
      damage: Math.round(p.attack * 1.3),
      fromPlayer: true,
      pierce: hasPierce ? 5 : 0,
      element: 'cold',
      onHit: (target) => {
        if (hasPierce) {
          // Spawn twin split shards
          const a = Phaser.Math.Angle.Between(p.x, p.y, target.x, target.y);
          for (const off of [-0.4, 0.4]) {
            const splitA = a + off;
            const splitP = new Projectile({
              scene: this.scene,
              x: target.x,
              y: target.y,
              texture: 'proj_arcane_bolt',
              targetX: target.x + Math.cos(splitA) * 150,
              targetY: target.y + Math.sin(splitA) * 150,
              speed: 300,
              damage: Math.round(p.attack * 0.7),
              fromPlayer: true,
            });
            this.projectiles.add(splitP);
          }
        }
      },
    });
    this.projectiles.add(proj);
  }

  private castGlacialNova(enemies: Phaser.Physics.Arcade.Group, boss?: Boss | null) {
    SoundEngine.getInstance().playIceFreeze();
    const p = this.player;
    const hasVortex = p.inventory.hasLegendary('vortex_nova');

    // Visual nova
    const nova = this.scene.add.sprite(p.x, p.y, 'fx_glacial_nova');
    nova.setDepth(28);
    this.scene.tweens.add({
      targets: nova,
      scale: 2.2,
      alpha: 0,
      duration: 350,
      onComplete: () => nova.destroy(),
    });

    const allTargets: (Enemy | Boss)[] = [...(enemies.getChildren() as Enemy[])];
    if (boss && boss.active) allTargets.push(boss);

    for (const target of allTargets) {
      if (!target.active || target.hp <= 0) continue;
      const d = Phaser.Math.Distance.Between(p.x, p.y, target.x, target.y);
      if (d <= 140) {
        if (hasVortex) {
          // Pull target inward toward player
          const pullA = Phaser.Math.Angle.Between(target.x, target.y, p.x, p.y);
          target.x += Math.cos(pullA) * 35;
          target.y += Math.sin(pullA) * 35;
        }
        this.applyPlayerDamage(target, p.attack * 1.8, 'cold');
        target.setVelocity(0, 0); // slow
      }
    }
  }

  private castBlink(tx: number, ty: number) {
    SoundEngine.getInstance().playDash();
    const p = this.player;
    const maxDist = 240;
    const angle = Phaser.Math.Angle.Between(p.x, p.y, tx, ty);
    const dist = Math.min(maxDist, Phaser.Math.Distance.Between(p.x, p.y, tx, ty));

    // Teleport spark
    const ghost = this.scene.add.sprite(p.x, p.y, 'char_arcanist');
    ghost.setTint(0x38bdf8);
    ghost.setAlpha(0.6);
    this.scene.tweens.add({ targets: ghost, alpha: 0, duration: 250, onComplete: () => ghost.destroy() });

    p.x += Math.cos(angle) * dist;
    p.y += Math.sin(angle) * dist;
    p.isInvulnerable = true;
    this.scene.time.delayedCall(450, () => (p.isInvulnerable = false));
  }

  private castMeteor(tx: number, ty: number) {
    SoundEngine.getInstance().playMagicCast();

    // Shadow on ground
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillCircle(tx, ty, 40);

    // Falling meteor sprite
    const meteor = this.scene.add.sprite(tx - 60, ty - 180, 'proj_meteor');
    meteor.setScale(1.5);
    meteor.setDepth(40);

    this.scene.tweens.add({
      targets: meteor,
      x: tx,
      y: ty,
      duration: 400,
      ease: 'Quad.easeIn',
      onComplete: () => {
        meteor.destroy();
        shadow.destroy();
        SoundEngine.getInstance().playFireExplosion();
        this.scene.cameras.main.shake(120, 0.007);

        // Explode area effect
        new AreaEffect({
          scene: this.scene,
          x: tx,
          y: ty,
          texture: 'proj_meteor',
          radius: 65,
          duration: 3500,
          damagePerTick: Math.round(this.player.attack * 0.4),
          fromPlayer: true,
          element: 'fire',
        });
      },
    });
  }

  private castChainLightning(tx: number, ty: number, enemies: Phaser.Physics.Arcade.Group, boss?: Boss | null) {
    SoundEngine.getInstance().playLightning();
    const p = this.player;
    const maxJumps = p.inventory.hasLegendary('thunder_overcharge') ? 7 : 4;
    const dmgMult = p.inventory.hasLegendary('thunder_overcharge') ? 2.4 : 1.6;

    const allTargets: (Enemy | Boss)[] = [...(enemies.getChildren() as Enemy[])];
    if (boss && boss.active) allTargets.push(boss);

    const hitTargets: (Enemy | Boss)[] = [];
    let currentX = p.x;
    let currentY = p.y;

    for (let i = 0; i < maxJumps; i++) {
      // Find nearest unhit target
      let nearest: Enemy | Boss | null = null;
      let minDist = 220;

      for (const target of allTargets) {
        if (!target.active || target.hp <= 0 || hitTargets.includes(target)) continue;
        const d = Phaser.Math.Distance.Between(currentX, currentY, target.x, target.y);
        if (d < minDist) {
          minDist = d;
          nearest = target;
        }
      }

      if (nearest) {
        hitTargets.push(nearest);
        // Visual lightning bolt line
        const line = this.scene.add.graphics();
        line.lineStyle(3, 0xfacc15, 0.9);
        line.beginPath();
        line.moveTo(currentX, currentY);
        line.lineTo(nearest.x, nearest.y);
        line.stroke();
        line.setDepth(35);
        this.scene.tweens.add({ targets: line, alpha: 0, duration: 180, onComplete: () => line.destroy() });

        this.applyPlayerDamage(nearest, p.attack * dmgMult, 'lightning');
        currentX = nearest.x;
        currentY = nearest.y;
      } else {
        break;
      }
    }
  }

  private castUmbralWard() {
    SoundEngine.getInstance().playMagicCast();
    this.player.shieldHp = Math.round(this.player.maxHp * 0.45);

    const shieldGfx = this.scene.add.sprite(this.player.x, this.player.y, 'fx_glacial_nova');
    shieldGfx.setTint(0xa855f7);
    shieldGfx.setDepth(29);
    this.scene.tweens.add({
      targets: shieldGfx,
      scale: 1.3,
      alpha: 0,
      duration: 300,
      onComplete: () => shieldGfx.destroy(),
    });
  }

  // --- DAMAGE RESOLUTION ---
  public applyPlayerDamage(target: Enemy | Boss, baseDmg: number, element: string = 'physical') {
    const p = this.player;
    const isCrit = Math.random() < p.critChance;
    let dmg = isCrit ? baseDmg * (1.5 + p.critDamage) : baseDmg;

    // Add elemental damage
    if (element === 'fire') dmg += p.fireDamage;
    else if (element === 'cold') dmg += p.coldDamage;
    else if (element === 'lightning') dmg += p.lightningDamage;

    const actualDmg = target.takeDamage(Math.round(dmg), element);

    // Life steal & Blood pact legendary
    if (p.lifeSteal > 0) {
      p.heal(Math.round(actualDmg * p.lifeSteal));
    }
    if (isCrit && p.inventory.hasLegendary('blood_pact')) {
      p.heal(Math.round(p.maxHp * 0.06));
    }

    // Hit feedback
    this.hitFeedback.triggerHit(target, isCrit);
    this.damageNumbers.show(target.x, target.y, actualDmg, isCrit ? 'crit' : 'normal');
    SoundEngine.getInstance().playMonsterHit();

    // Check target death
    if (target.hp <= 0) {
      this.handleTargetDeath(target);
    }
  }

  private handleTargetDeath(target: Enemy | Boss) {
    SoundEngine.getInstance().playMonsterDeath();
    this.player.onEnemyKilled();
    this.player.addExp(target.expValue);

    // Death dissolve tween
    this.scene.tweens.add({
      targets: target,
      alpha: 0,
      scaleY: 0.2,
      duration: 280,
      onComplete: () => {
        target.destroy();
      },
    });

    // Drop loot
    const lvl = target.level;
    const isBoss = target instanceof Boss;
    const isElite = target instanceof Enemy && target.isElite;

    // Guaranteed gold
    const goldDrop = ItemGenerator.generateGold(isBoss ? 80 + lvl * 15 : isElite ? 25 + lvl * 6 : 8 + lvl * 3);
    const goldItem = new DropItem(this.scene, target.x, target.y, goldDrop);
    this.dropItems.add(goldItem);

    // Chance of potion
    if (Math.random() < 0.35 || isBoss) {
      const pot = ItemGenerator.generatePotion(Math.random() < 0.6 ? 'potion_hp' : 'potion_mana');
      const potItem = new DropItem(this.scene, target.x + 20, target.y, pot);
      this.dropItems.add(potItem);
    }

    // Equipment drops
    if (isBoss) {
      // Guaranteed 1 Rare + 1 Legendary
      const leg = ItemGenerator.generateEquipment(lvl, 'legendary');
      const rare = ItemGenerator.generateEquipment(lvl, 'rare');
      this.dropItems.add(new DropItem(this.scene, target.x - 25, target.y + 10, leg));
      this.dropItems.add(new DropItem(this.scene, target.x + 25, target.y + 10, rare));
      this.onBossKilledCallback?.(target as Boss);
    } else if (isElite) {
      // Guaranteed Magic or Rare
      const r = Math.random() < 0.4 ? 'rare' : 'magic';
      const eq = ItemGenerator.generateEquipment(lvl, r);
      this.dropItems.add(new DropItem(this.scene, target.x, target.y - 15, eq));
      this.onEnemyKilledCallback?.(target as Enemy);
    } else {
      // Normal monster drop chance
      if (Math.random() < 0.28) {
        const eq = ItemGenerator.generateEquipment(lvl);
        this.dropItems.add(new DropItem(this.scene, target.x, target.y - 10, eq));
      }
      this.onEnemyKilledCallback?.(target as Enemy);
    }
  }
}
