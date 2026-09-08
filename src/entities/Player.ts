import Phaser from 'phaser';
import { InventoryManager } from '../items/InventoryManager';
import { SkillManager } from '../skills/SkillManager';
import { SoundEngine } from '../audio/SoundEngine';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public className: 'vanguard' | 'arcanist';
  public level: number = 1;
  public exp: number = 0;
  public maxHp: number = 120;
  public hp: number = 120;
  public resourceType: 'fury' | 'mana';
  public maxResource: number = 100;
  public resource: number = 0;

  // Combat stats
  public baseAttack: number = 10;
  public attack: number = 10;
  public armor: number = 5;
  public critChance: number = 0.05;
  public critDamage: number = 0.5;
  public attackSpeed: number = 1.0;
  public moveSpeed: number = 180;
  public lifeSteal: number = 0.0;
  public fireDamage: number = 0;
  public coldDamage: number = 0;
  public lightningDamage: number = 0;

  // Buffs / Shields
  public shieldHp: number = 0;
  public warCryTimer: number = 0;
  public reaperFrenzyStacks: number = 0;
  public reaperFrenzyTimer: number = 0;

  // Evade / Dash
  public isDashing: boolean = false;
  public isInvulnerable: boolean = false;
  public evadeCooldown: number = 1.2; // seconds
  public lastEvadeTime: number = 0;

  // Subsystems
  public inventory: InventoryManager;
  public skillManager: SkillManager;

  // Key controls
  private cursors!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    q: Phaser.Input.Keyboard.Key;
    e: Phaser.Input.Keyboard.Key;
    k: Phaser.Input.Keyboard.Key;
    i: Phaser.Input.Keyboard.Key;
    c: Phaser.Input.Keyboard.Key;
  };

  public isAttacking: boolean = false;
  public attackAnimTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, className: 'vanguard' | 'arcanist') {
    const texture = className === 'vanguard' ? 'char_vanguard' : 'char_arcanist';
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.className = className;
    this.resourceType = className === 'vanguard' ? 'fury' : 'mana';
    this.resource = this.resourceType === 'fury' ? 0 : 100;

    this.inventory = new InventoryManager();
    this.skillManager = new SkillManager(className);

    this.setDepth(30);
    this.setCollideWorldBounds(true);
    if (this.body) {
      this.body.setSize(20, 24);
      this.body.setOffset(6, 14);
    }

    this.initKeys();
    this.recalculateStats();

    // Inventory stat listener
    this.inventory.onInventoryChange = () => {
      this.recalculateStats();
    };
  }

  private initKeys() {
    if (!this.scene.input.keyboard) return;
    this.cursors = {
      w: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      q: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      e: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      k: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      i: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
      c: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
    };
  }

  public getExpRequiredForLevel(lvl: number): number {
    return Math.round(75 * Math.pow(lvl, 1.6));
  }

  public addExp(amount: number): boolean {
    this.exp += amount;
    let leveledUp = false;
    while (this.exp >= this.getExpRequiredForLevel(this.level) && this.level < 15) {
      this.exp -= this.getExpRequiredForLevel(this.level);
      this.level++;
      this.skillManager.skillPoints++;
      leveledUp = true;
    }
    if (leveledUp) {
      this.recalculateStats();
      this.hp = this.maxHp;
      if (this.resourceType === 'mana') this.resource = this.maxResource;
      SoundEngine.getInstance().playLevelUp();
    }
    return leveledUp;
  }

  public recalculateStats() {
    const isVanguard = this.className === 'vanguard';
    const lvl = this.level;

    // Base attributes by class & level
    let baseHp = isVanguard ? 140 + (lvl - 1) * 28 : 95 + (lvl - 1) * 18;
    let baseRes = isVanguard ? 100 : 100 + (lvl - 1) * 15;
    let baseAtk = isVanguard ? 12 + (lvl - 1) * 4 : 14 + (lvl - 1) * 4.5;
    let baseArm = isVanguard ? 8 + (lvl - 1) * 2.5 : 3 + (lvl - 1) * 1.2;
    let baseSpd = isVanguard ? 185 : 180;
    let critCh = 0.05;
    let critDm = 0.5;
    let atkSpd = 1.0;
    let lSteal = 0.0;
    let fire = 0;
    let cold = 0;
    let light = 0;

    // Passives
    if (isVanguard) {
      if (this.skillManager.unlockedSkills.has('iron_will')) {
        baseHp *= 1.25;
        baseArm *= 1.2;
      }
      if (this.skillManager.unlockedSkills.has('bloodthirst')) {
        lSteal += 0.05;
        atkSpd += 0.15;
      }
    } else {
      if (this.skillManager.unlockedSkills.has('arcane_overflow')) {
        baseRes += 50;
        baseAtk *= 1.2;
      }
      if (this.skillManager.unlockedSkills.has('elemental_ruin')) {
        critCh += 0.1;
      }
    }

    // Equipment bonuses
    const eq = this.inventory.calculateEquipStats();
    baseHp += eq.maxHp || 0;
    baseRes += eq.maxResource || 0;
    baseAtk += eq.attack || 0;
    baseArm += eq.armor || 0;
    critCh += eq.critChance || 0;
    critDm += eq.critDamage || 0;
    atkSpd += eq.attackSpeed || 0;
    baseSpd += eq.moveSpeed || 0;
    lSteal += eq.lifeSteal || 0;
    fire += eq.fireDamage || 0;
    cold += eq.coldDamage || 0;
    light += eq.lightningDamage || 0;

    // War cry buff
    if (this.warCryTimer > 0) {
      baseArm *= 1.35;
      baseAtk *= 1.25;
    }

    // Reaper frenzy buff
    if (this.reaperFrenzyStacks > 0) {
      const bonus = this.reaperFrenzyStacks * 0.12;
      baseSpd += bonus * 100;
      atkSpd += bonus;
    }

    this.maxHp = Math.round(baseHp);
    this.maxResource = Math.round(baseRes);
    this.attack = Math.round(baseAtk);
    this.armor = Math.round(baseArm);
    this.critChance = Math.min(0.8, Math.round(critCh * 100) / 100);
    this.critDamage = Math.round(critDm * 100) / 100;
    this.attackSpeed = Math.round(atkSpd * 100) / 100;
    this.moveSpeed = Math.round(baseSpd);
    this.lifeSteal = Math.round(lSteal * 100) / 100;
    this.fireDamage = fire;
    this.coldDamage = cold;
    this.lightningDamage = light;

    // Clamp current values
    this.hp = Math.min(this.hp, this.maxHp);
    this.resource = Math.min(this.resource, this.maxResource);
  }

  public updatePlayer(time: number, delta: number, mousePointer: Phaser.Input.Pointer) {
    if (!this.active) return;

    // Timers
    if (this.warCryTimer > 0) {
      this.warCryTimer -= delta;
      if (this.warCryTimer <= 0) this.recalculateStats();
    }
    if (this.reaperFrenzyTimer > 0) {
      this.reaperFrenzyTimer -= delta;
      if (this.reaperFrenzyTimer <= 0) {
        this.reaperFrenzyStacks = 0;
        this.recalculateStats();
      }
    }

    // Passive Resource generation/decay
    if (this.resourceType === 'mana') {
      // Mana regenerates: 8 mana/sec
      this.resource = Math.min(this.maxResource, this.resource + (8 * delta) / 1000);
    } else {
      // Fury decays slowly out of combat
      this.resource = Math.max(0, this.resource - (2 * delta) / 1000);
    }

    // Potion keybinds: Q for HP, E for Resource
    if (Phaser.Input.Keyboard.JustDown(this.cursors.q)) {
      this.useHpPotion();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.e)) {
      this.useManaPotion();
    }

    // Spacebar Evade / Dash
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.tryEvade(time, mousePointer);
    }

    // Face cursor
    if (mousePointer) {
      this.setFlipX(mousePointer.worldX < this.x);
    }

    // Movement if not dashing
    if (!this.isDashing) {
      let vx = 0;
      let vy = 0;
      if (this.cursors.a.isDown) vx -= 1;
      if (this.cursors.d.isDown) vx += 1;
      if (this.cursors.w.isDown) vy -= 1;
      if (this.cursors.s.isDown) vy += 1;

      if (vx !== 0 && vy !== 0) {
        vx *= 0.7071;
        vy *= 0.7071;
      }

      this.setVelocity(vx * this.moveSpeed, vy * this.moveSpeed);
    }

    // Attack anim revert
    if (this.isAttacking) {
      this.attackAnimTimer -= delta;
      if (this.attackAnimTimer <= 0) {
        this.isAttacking = false;
        this.setTexture(this.className === 'vanguard' ? 'char_vanguard' : 'char_arcanist');
      }
    }
  }

  public playAttackAnimation() {
    this.isAttacking = true;
    this.attackAnimTimer = 160;
    this.setTexture(this.className === 'vanguard' ? 'char_vanguard_atk' : 'char_arcanist_atk');
  }

  public tryEvade(time: number, pointer: Phaser.Input.Pointer) {
    if (time < this.lastEvadeTime + this.evadeCooldown * 1000) return;
    this.lastEvadeTime = time;

    this.isDashing = true;
    this.isInvulnerable = true;
    SoundEngine.getInstance().playDash();

    const angle = pointer ? Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY) : 0;
    const dashSpeed = this.moveSpeed * 2.8;

    this.setVelocity(Math.cos(angle) * dashSpeed, Math.sin(angle) * dashSpeed);

    // Afterimage ghost effect
    const ghost = this.scene.add.sprite(this.x, this.y, this.texture.key);
    ghost.setTint(this.className === 'vanguard' ? 0xffffff : 0xa855f7);
    ghost.setAlpha(0.6);
    ghost.setDepth(28);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 300,
      onComplete: () => ghost.destroy(),
    });

    this.scene.time.delayedCall(220, () => {
      this.isDashing = false;
      this.isInvulnerable = false;
      this.setVelocity(0, 0);
    });
  }

  public useHpPotion(): boolean {
    if (this.inventory.hpPotions <= 0 || this.hp >= this.maxHp) return false;
    this.inventory.hpPotions--;
    const heal = Math.round(this.maxHp * 0.5);
    this.heal(heal);
    SoundEngine.getInstance().playPotionUse();
    this.inventory.onInventoryChange?.();
    return true;
  }

  public useManaPotion(): boolean {
    if (this.inventory.manaPotions <= 0 || this.resource >= this.maxResource) return false;
    this.inventory.manaPotions--;
    this.resource = Math.min(this.maxResource, this.resource + Math.round(this.maxResource * 0.5));
    SoundEngine.getInstance().playPotionUse();
    this.inventory.onInventoryChange?.();
    return true;
  }

  public heal(amount: number) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  public takeDamage(rawDamage: number, element: string = 'physical'): number {
    if (this.isInvulnerable || this.hp <= 0) return 0;

    // Armor damage reduction: 1 - armor / (armor + 60)
    const reduction = this.armor / (this.armor + 60);
    let finalDamage = Math.max(1, Math.round(rawDamage * (1 - reduction)));

    // Umbral Ward shield absorption
    if (this.shieldHp > 0) {
      if (this.shieldHp >= finalDamage) {
        this.shieldHp -= finalDamage;
        return 0;
      } else {
        finalDamage -= this.shieldHp;
        this.shieldHp = 0;
      }
    }

    this.hp -= finalDamage;

    // Gain Fury when taking damage if Vanguard
    if (this.resourceType === 'fury') {
      this.resource = Math.min(this.maxResource, this.resource + 5);
    }

    return finalDamage;
  }

  public onEnemyKilled() {
    // Check Reaper Frenzy legendary
    if (this.inventory.hasLegendary('reaper_frenzy')) {
      this.reaperFrenzyStacks = Math.min(5, this.reaperFrenzyStacks + 1);
      this.reaperFrenzyTimer = 5000;
      this.recalculateStats();
    }
  }

  public serialize(): any {
    return {
      className: this.className,
      level: this.level,
      exp: this.exp,
      hp: this.hp,
      resource: this.resource,
      inventory: this.inventory.serialize(),
      skills: this.skillManager.serialize(),
    };
  }

  public deserialize(data: any) {
    if (!data) return;
    this.level = data.level || 1;
    this.exp = data.exp || 0;
    this.inventory.deserialize(data.inventory);
    this.skillManager.deserialize(data.skills);
    this.recalculateStats();
    this.hp = data.hp ?? this.maxHp;
    this.resource = data.resource ?? (this.resourceType === 'fury' ? 0 : this.maxResource);
  }
}
