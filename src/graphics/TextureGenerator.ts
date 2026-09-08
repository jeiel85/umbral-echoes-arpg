import Phaser from 'phaser';

/**
 * Procedural texture generator for Umbral Echoes: Forsaken Depths.
 * Creates pixel-art style gothic fantasy sprites, tiles, props, UI, and effects directly in canvas.
 */
export class TextureGenerator {
  public static generateAll(scene: Phaser.Scene) {
    TextureGenerator.generateTiles(scene);
    TextureGenerator.generateProps(scene);
    TextureGenerator.generateCharacters(scene);
    TextureGenerator.generateMonsters(scene);
    TextureGenerator.generateBosses(scene);
    TextureGenerator.generateNPCs(scene);
    TextureGenerator.generateProjectilesAndFX(scene);
    TextureGenerator.generateItemIcons(scene);
    TextureGenerator.generateUIFrames(scene);
  }

  // Helper to draw a pixel rect
  private static px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // Helper to create a canvas texture in Phaser
  private static makeTexture(scene: Phaser.Scene, key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, width, height);
    if (!canvas) return;
    const ctx = canvas.getContext();
    drawFn(ctx);
    canvas.refresh();
  }

  // 1. TILES
  private static generateTiles(scene: Phaser.Scene) {
    const S = 32;

    // Stone floor (Weathered dungeon flagstones)
    this.makeTexture(scene, 'tile_stone_floor', S, S, (ctx) => {
      ctx.fillStyle = '#1e1c24';
      ctx.fillRect(0, 0, S, S);
      // Stones
      const stones = [
        { x: 0, y: 0, w: 15, h: 15, c: '#282531' },
        { x: 17, y: 0, w: 15, h: 15, c: '#23202b' },
        { x: 0, y: 17, w: 15, h: 15, c: '#201d27' },
        { x: 17, y: 17, w: 15, h: 15, c: '#2a2635' },
      ];
      for (const s of stones) {
        ctx.fillStyle = s.c;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        // Bevel highlight
        ctx.fillStyle = '#3a3547';
        ctx.fillRect(s.x, s.y, s.w, 1);
        ctx.fillRect(s.x, s.y, 1, s.h);
        // Bevel shadow
        ctx.fillStyle = '#141219';
        ctx.fillRect(s.x, s.y + s.h - 1, s.w, 1);
        ctx.fillRect(s.x + s.w - 1, s.y, 1, s.h);
      }
      // Cracks & pebble speckles
      this.px(ctx, 6, 8, 3, 1, '#15131a');
      this.px(ctx, 22, 5, 2, 2, '#353042');
      this.px(ctx, 10, 24, 2, 1, '#15131a');
    });

    // Stone Wall (Gothic dungeon masonry)
    this.makeTexture(scene, 'tile_stone_wall', S, S, (ctx) => {
      ctx.fillStyle = '#111016';
      ctx.fillRect(0, 0, S, S);
      // Bricks
      ctx.fillStyle = '#2f2b3b';
      ctx.fillRect(1, 1, 14, 13);
      ctx.fillRect(17, 1, 14, 13);
      ctx.fillRect(1, 16, 22, 14);
      ctx.fillRect(25, 16, 6, 14);

      // Highlights
      ctx.fillStyle = '#474159';
      ctx.fillRect(1, 1, 14, 2);
      ctx.fillRect(17, 1, 14, 2);
      ctx.fillRect(1, 16, 22, 2);
      ctx.fillRect(25, 16, 6, 2);

      // Dark mortar
      ctx.fillStyle = '#0a090e';
      ctx.fillRect(0, 14, S, 2);
      ctx.fillRect(15, 0, 2, 14);
      ctx.fillRect(23, 14, 2, 18);
    });

    // Town Cobblestone
    this.makeTexture(scene, 'tile_town_floor', S, S, (ctx) => {
      ctx.fillStyle = '#26221c';
      ctx.fillRect(0, 0, S, S);
      // Warm stone pavers
      const cobbles = [
        { x: 1, y: 1, w: 9, h: 9, c: '#3b342b' },
        { x: 12, y: 2, w: 8, h: 7, c: '#483f34' },
        { x: 22, y: 1, w: 9, h: 10, c: '#362f27' },
        { x: 2, y: 12, w: 12, h: 8, c: '#453c31' },
        { x: 16, y: 11, w: 14, h: 9, c: '#3c352c' },
        { x: 1, y: 22, w: 14, h: 9, c: '#363028' },
        { x: 17, y: 22, w: 13, h: 9, c: '#443c32' },
      ];
      for (const b of cobbles) {
        ctx.fillStyle = b.c;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = '#54473a';
        ctx.fillRect(b.x, b.y, b.w, 1);
        ctx.fillRect(b.x, b.y, 1, b.h);
      }
    });

    // Town Wood Wall
    this.makeTexture(scene, 'tile_town_wall', S, S, (ctx) => {
      ctx.fillStyle = '#1c1511';
      ctx.fillRect(0, 0, S, S);
      // Wooden planks
      for (let y = 0; y < S; y += 8) {
        ctx.fillStyle = '#3d2e24';
        ctx.fillRect(0, y, S, 7);
        ctx.fillStyle = '#523e31';
        ctx.fillRect(0, y, S, 1);
        ctx.fillStyle = '#251b14';
        ctx.fillRect(0, y + 6, S, 1);
      }
      // Vertical studs
      ctx.fillStyle = '#2e2118';
      ctx.fillRect(6, 0, 4, S);
      ctx.fillRect(22, 0, 4, S);
    });

    // Blighted Mire / Swamp Floor
    this.makeTexture(scene, 'tile_swamp_floor', S, S, (ctx) => {
      ctx.fillStyle = '#141c14';
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = '#1d2a1c';
      ctx.fillRect(2, 3, 14, 12);
      ctx.fillRect(15, 14, 15, 16);
      // Murky puddles
      ctx.fillStyle = '#0f241a';
      ctx.beginPath();
      ctx.ellipse(12, 20, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Toxic algae speckles
      this.px(ctx, 10, 19, 2, 2, '#38632f');
      this.px(ctx, 22, 6, 3, 2, '#2e4e26');
      this.px(ctx, 5, 8, 2, 1, '#4a7c3e');
    });

    // Swamp Thicket Wall
    this.makeTexture(scene, 'tile_swamp_wall', S, S, (ctx) => {
      ctx.fillStyle = '#0d130d';
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = '#1b2a1a';
      ctx.fillRect(1, 1, 30, 30);
      // Twisted brambles & dead thorns
      ctx.fillStyle = '#2a3d28';
      ctx.fillRect(4, 8, 24, 4);
      ctx.fillRect(8, 16, 16, 6);
      ctx.fillRect(6, 24, 20, 5);
      // Thorns
      ctx.fillStyle = '#44663e';
      this.px(ctx, 10, 6, 2, 3, '#44663e');
      this.px(ctx, 20, 14, 3, 2, '#44663e');
    });

    // Abyssal Citadel Floor (Dark Obsidian & Runes)
    this.makeTexture(scene, 'tile_abyss_floor', S, S, (ctx) => {
      ctx.fillStyle = '#0d0b14';
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = '#171424';
      ctx.fillRect(2, 2, 28, 28);
      // Glowing purple runic inlay
      ctx.fillStyle = '#3c1d59';
      ctx.fillRect(8, 8, 16, 1);
      ctx.fillRect(8, 24, 16, 1);
      ctx.fillRect(8, 8, 1, 16);
      ctx.fillRect(24, 8, 1, 16);
      this.px(ctx, 16, 16, 2, 2, '#8537b8');
      this.px(ctx, 15, 15, 4, 1, '#b15beb');
    });

    // Abyssal Citadel Wall
    this.makeTexture(scene, 'tile_abyss_wall', S, S, (ctx) => {
      ctx.fillStyle = '#07050a';
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = '#1d172e';
      ctx.fillRect(1, 1, 30, 30);
      // Spire bevels
      ctx.fillStyle = '#2f244a';
      ctx.fillRect(3, 3, 26, 2);
      ctx.fillRect(3, 3, 2, 26);
      ctx.fillStyle = '#4a2b7a';
      this.px(ctx, 14, 8, 4, 16, '#381c61');
      this.px(ctx, 15, 10, 2, 12, '#7e35b8');
    });
  }

  // 2. PROPS
  private static generateProps(scene: Phaser.Scene) {
    // Torch (32x32)
    this.makeTexture(scene, 'prop_torch', 32, 32, (ctx) => {
      // Sconce
      ctx.fillStyle = '#4a443a';
      ctx.fillRect(14, 14, 4, 12);
      ctx.fillRect(12, 18, 8, 3);
      // Flame core
      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.arc(16, 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffa500';
      ctx.beginPath();
      ctx.arc(16, 11, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff7b2';
      ctx.beginPath();
      ctx.arc(16, 10, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Tombstone (32x32)
    this.makeTexture(scene, 'prop_tombstone', 32, 32, (ctx) => {
      ctx.fillStyle = '#16141a';
      ctx.fillRect(4, 26, 24, 4); // dirt mound
      ctx.fillStyle = '#383344';
      // Rounded top cross tombstone
      ctx.fillRect(9, 8, 14, 19);
      ctx.fillRect(6, 12, 20, 5);
      // Highlight
      ctx.fillStyle = '#524b63';
      ctx.fillRect(9, 8, 14, 2);
      ctx.fillRect(6, 12, 2, 5);
      // Carving
      ctx.fillStyle = '#1f1b26';
      ctx.fillRect(15, 11, 2, 8);
      ctx.fillRect(13, 14, 6, 2);
    });

    // Chest (32x32)
    this.makeTexture(scene, 'prop_chest', 32, 32, (ctx) => {
      // Base wood
      ctx.fillStyle = '#452d1a';
      ctx.fillRect(6, 12, 20, 14);
      // Lid curvature
      ctx.fillStyle = '#5a3d24';
      ctx.fillRect(6, 8, 20, 6);
      // Iron bands
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(8, 8, 3, 18);
      ctx.fillRect(21, 8, 3, 18);
      ctx.fillRect(6, 14, 20, 2);
      // Golden lock
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(14, 13, 4, 5);
      ctx.fillStyle = '#111827';
      ctx.fillRect(15, 15, 2, 2);
    });

    // Open Chest
    this.makeTexture(scene, 'prop_chest_open', 32, 32, (ctx) => {
      ctx.fillStyle = '#3a2312';
      ctx.fillRect(6, 14, 20, 12);
      // Raised open lid
      ctx.fillStyle = '#5a3d24';
      ctx.fillRect(6, 4, 20, 6);
      // Inside gold glow
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(9, 12, 14, 4);
      ctx.fillStyle = '#fef08a';
      this.px(ctx, 12, 13, 3, 2, '#fff');
    });

    // Town Portal / Rift (48x48)
    this.makeTexture(scene, 'prop_portal', 48, 48, (ctx) => {
      // Outer stone ring
      ctx.strokeStyle = '#383344';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(24, 24, 20, 22, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing swirling vortex
      const grad = ctx.createRadialGradient(24, 24, 4, 24, 24, 20);
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(0.8, '#1d4ed8');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(24, 24, 18, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Energy particles
      this.px(ctx, 18, 14, 3, 3, '#fff');
      this.px(ctx, 30, 28, 2, 3, '#bae6fd');
      this.px(ctx, 22, 32, 3, 2, '#fff');
    });

    // Healing Fountain (48x48)
    this.makeTexture(scene, 'prop_fountain', 48, 48, (ctx) => {
      // Basin
      ctx.fillStyle = '#2d333b';
      ctx.beginPath();
      ctx.ellipse(24, 26, 22, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#444c56';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pure glowing blue water
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(24, 26, 17, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Center pedestal
      ctx.fillStyle = '#57606a';
      ctx.fillRect(21, 12, 6, 15);
      // Water spray
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(24, 11, 4, 0, Math.PI * 2);
      ctx.fill();
      this.px(ctx, 23, 10, 2, 2, '#fff');
    });
  }

  // 3. CHARACTERS (Vanguard & Arcanist)
  private static generateCharacters(scene: Phaser.Scene) {
    const W = 32;
    const H = 40;

    // Vanguard (Heavy Steel Plate, Red Plume & Cape, Greatsword)
    this.makeTexture(scene, 'char_vanguard', W, H, (ctx) => {
      // Cape (behind)
      ctx.fillStyle = '#831818';
      ctx.fillRect(9, 14, 14, 20);

      // Boots & Greaves
      ctx.fillStyle = '#374151';
      ctx.fillRect(9, 28, 5, 10);
      ctx.fillRect(18, 28, 5, 10);
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(9, 34, 6, 4);
      ctx.fillRect(17, 34, 6, 4);

      // Plate Breastplate & Faulds
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(8, 14, 16, 14);
      ctx.fillStyle = '#9ca3af'; // highlight line
      ctx.fillRect(11, 15, 10, 2);
      ctx.fillRect(15, 17, 2, 10);
      // Gold trim
      ctx.fillStyle = '#d97706';
      ctx.fillRect(8, 14, 16, 2);
      ctx.fillRect(8, 24, 16, 2);

      // Pauldrons (Shoulders)
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(5, 13, 6, 7);
      ctx.fillRect(21, 13, 6, 7);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(5, 13, 6, 2);
      ctx.fillRect(21, 13, 6, 2);

      // Helmet (Armored Bascinet + Red Plume)
      ctx.fillStyle = '#991b1b'; // plume
      ctx.fillRect(14, 1, 4, 5);
      this.px(ctx, 13, 3, 6, 2, '#b91c1c');

      ctx.fillStyle = '#4b5563'; // helmet
      ctx.fillRect(10, 6, 12, 9);
      ctx.fillStyle = '#111827'; // visor slit
      ctx.fillRect(12, 10, 8, 2);
      // Visor eye glow (fierce amber)
      this.px(ctx, 14, 10, 2, 1, '#f59e0b');
      this.px(ctx, 17, 10, 2, 1, '#f59e0b');

      // Heavy Jagged Greatsword on right hand
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(25, 4, 3, 26);
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(25, 4, 1, 26);
      ctx.fillStyle = '#d97706'; // crossguard & hilt
      ctx.fillRect(23, 26, 7, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(25, 29, 3, 5);
    });

    // Vanguard Attack Stance / Swing
    this.makeTexture(scene, 'char_vanguard_atk', W + 12, H, (ctx) => {
      // Shifted body with sword swung forward
      ctx.fillStyle = '#831818';
      ctx.fillRect(5, 14, 12, 18);
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(7, 14, 15, 14);
      ctx.fillRect(8, 28, 5, 10);
      ctx.fillRect(16, 28, 6, 10);
      // Head turned
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(12, 2, 4, 5);
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(9, 6, 11, 9);
      ctx.fillStyle = '#111827';
      ctx.fillRect(12, 9, 7, 2);

      // Sword swung horizontally with slash arc
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(22, 16, 20, 4);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(19, 14, 3, 8);
    });

    // Arcanist (Deep Violet Robe, Gold Runes, Cowl, Floating Bone Staff)
    this.makeTexture(scene, 'char_arcanist', W, H, (ctx) => {
      // Robe body
      ctx.fillStyle = '#2e1065';
      ctx.fillRect(9, 14, 14, 23);
      // Robe trim & mystic gold runes
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(15, 15, 2, 21);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(10, 22, 12, 2);
      this.px(ctx, 12, 28, 2, 2, '#fbbf24');
      this.px(ctx, 18, 30, 2, 2, '#fbbf24');

      // Sleeves
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(6, 15, 4, 11);
      ctx.fillRect(22, 15, 4, 11);

      // Dark Hooded Cowl
      ctx.fillStyle = '#1e073d';
      ctx.beginPath();
      ctx.ellipse(16, 10, 7, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Shadow face
      ctx.fillStyle = '#090314';
      ctx.fillRect(12, 9, 8, 6);
      // Piercing Cyan Eyes
      this.px(ctx, 13, 11, 2, 2, '#38bdf8');
      this.px(ctx, 17, 11, 2, 2, '#38bdf8');

      // Ancient Bone Staff
      ctx.fillStyle = '#78350f';
      ctx.fillRect(26, 8, 2, 28);
      // Floating glowing orb head
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(27, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e9d5ff';
      ctx.beginPath();
      ctx.arc(27, 5, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Arcanist Cast Stance
    this.makeTexture(scene, 'char_arcanist_atk', W + 10, H, (ctx) => {
      ctx.fillStyle = '#2e1065';
      ctx.fillRect(7, 14, 14, 23);
      ctx.fillStyle = '#1e073d';
      ctx.beginPath();
      ctx.ellipse(14, 10, 7, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#090314';
      ctx.fillRect(11, 9, 8, 6);
      this.px(ctx, 13, 10, 2, 2, '#38bdf8');
      this.px(ctx, 17, 10, 2, 2, '#38bdf8');

      // Hands outstretched with magic flare
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(28, 16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f3e8ff';
      ctx.beginPath();
      ctx.arc(28, 16, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 4. MONSTERS (10 distinct types)
  private static generateMonsters(scene: Phaser.Scene) {
    const S = 32;

    // 1. Hollow Wanderer (Tattered ghoul, rusted sickle)
    this.makeTexture(scene, 'enemy_hollow', S, S, (ctx) => {
      // Rotting flesh
      ctx.fillStyle = '#4b5548';
      ctx.fillRect(11, 10, 10, 14);
      ctx.fillRect(10, 23, 4, 8);
      ctx.fillRect(17, 23, 4, 8);
      // Rags
      ctx.fillStyle = '#2a2624';
      ctx.fillRect(9, 13, 13, 10);
      // Skull
      ctx.fillStyle = '#8b9385';
      ctx.fillRect(12, 4, 8, 7);
      ctx.fillStyle = '#0d0f0c';
      this.px(ctx, 13, 6, 2, 2, '#f87171');
      this.px(ctx, 17, 6, 2, 2, '#f87171');
      // Sickle
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(23, 8, 2, 14);
      ctx.fillRect(19, 6, 6, 2);
    });

    // 2. Dire Bloodhound (Fast quadruped demonic hound)
    this.makeTexture(scene, 'enemy_bloodhound', 36, 26, (ctx) => {
      ctx.fillStyle = '#3f1515';
      // Body
      ctx.fillRect(8, 8, 18, 9);
      // Legs
      ctx.fillRect(6, 17, 4, 8);
      ctx.fillRect(12, 17, 3, 8);
      ctx.fillRect(20, 17, 3, 8);
      ctx.fillRect(24, 17, 4, 8);
      // Head & Snout
      ctx.fillRect(22, 5, 10, 7);
      ctx.fillRect(28, 8, 6, 4);
      // Glowing red eyes & fangs
      this.px(ctx, 28, 6, 2, 2, '#ef4444');
      this.px(ctx, 30, 12, 1, 3, '#fef2f2');
      this.px(ctx, 32, 12, 1, 2, '#fef2f2');
      // Back spines
      this.px(ctx, 10, 5, 2, 3, '#7f1d1d');
      this.px(ctx, 15, 5, 2, 3, '#7f1d1d');
      this.px(ctx, 20, 5, 2, 3, '#7f1d1d');
    });

    // 3. Skeleton Archer (Bleached bones, recurve bow)
    this.makeTexture(scene, 'enemy_skeleton_archer', S, S, (ctx) => {
      // Bone ribcage & legs
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(13, 11, 6, 9);
      ctx.fillRect(12, 20, 3, 10);
      ctx.fillRect(17, 20, 3, 10);
      // Skull
      ctx.fillRect(12, 3, 8, 8);
      ctx.fillStyle = '#111827';
      this.px(ctx, 13, 6, 2, 2, '#111827');
      this.px(ctx, 17, 6, 2, 2, '#111827');
      // Tattered hood
      ctx.fillStyle = '#374151';
      ctx.fillRect(11, 2, 10, 3);
      // Wood Bow
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.arc(6, 16, 11, -Math.PI / 2, Math.PI / 2, true);
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 4. Blight Spitter (Bloated toxic abomination)
    this.makeTexture(scene, 'enemy_blight_spitter', 36, 36, (ctx) => {
      // Bloated body
      ctx.fillStyle = '#1e3a1e';
      ctx.beginPath();
      ctx.ellipse(18, 18, 14, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      // Oozing yellow boils
      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.arc(12, 13, 4, 0, Math.PI * 2);
      ctx.arc(22, 11, 3, 0, Math.PI * 2);
      ctx.arc(16, 23, 4, 0, Math.PI * 2);
      ctx.fill();
      // Gaping maw
      ctx.fillStyle = '#052e16';
      ctx.fillRect(14, 16, 8, 4);
      this.px(ctx, 16, 18, 4, 2, '#84cc16');
    });

    // 5. Bone Breaker (Armored hulking brute)
    this.makeTexture(scene, 'enemy_bone_breaker', 40, 44, (ctx) => {
      // Huge armor body
      ctx.fillStyle = '#374151';
      ctx.fillRect(10, 12, 20, 18);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(11, 29, 7, 13);
      ctx.fillRect(22, 29, 7, 13);
      // Spiked shoulder pads
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(4, 10, 8, 9);
      ctx.fillRect(28, 10, 8, 9);
      this.px(ctx, 6, 7, 3, 3, '#9ca3af');
      this.px(ctx, 31, 7, 3, 3, '#9ca3af');
      // Horned horned iron helmet
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(14, 3, 12, 10);
      this.px(ctx, 16, 7, 3, 2, '#ef4444');
      this.px(ctx, 21, 7, 3, 2, '#ef4444');
      // Giant spiked club
      ctx.fillStyle = '#78350f';
      ctx.fillRect(33, 8, 4, 28);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(31, 4, 8, 10);
    });

    // 6. Shadow Wraith (Spectral floating phantom)
    this.makeTexture(scene, 'enemy_shadow_wraith', 32, 36, (ctx) => {
      // Semi-translucent dark purple mist
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(16, 15, 10, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wispy bottom tails
      ctx.fillRect(8, 22, 5, 10);
      ctx.fillRect(15, 23, 4, 12);
      ctx.fillRect(21, 22, 5, 8);
      // Sinister glowing eyes
      this.px(ctx, 13, 11, 3, 2, '#a855f7');
      this.px(ctx, 18, 11, 3, 2, '#a855f7');
      // Ethereal scythe claw
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(26, 14, 6, 0, Math.PI);
      ctx.stroke();
    });

    // 7. Cultist Necromancer (Crimson robe & skull staff)
    this.makeTexture(scene, 'enemy_cultist', S, S, (ctx) => {
      // Crimson Robe
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(10, 11, 12, 18);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(11, 5, 10, 7);
      // Dark cowl interior
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(13, 7, 6, 4);
      this.px(ctx, 14, 8, 1, 1, '#fbbf24');
      this.px(ctx, 17, 8, 1, 1, '#fbbf24');
      // Staff with horned skull
      ctx.fillStyle = '#52525b';
      ctx.fillRect(23, 4, 2, 24);
      ctx.fillStyle = '#e4e4e7';
      ctx.fillRect(21, 2, 6, 5);
    });

    // 8. Gargoyle Sentinel (Winged stone beast)
    this.makeTexture(scene, 'enemy_gargoyle', 38, 36, (ctx) => {
      // Stone Wings
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(19, 14);
      ctx.lineTo(2, 4);
      ctx.lineTo(8, 22);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(19, 14);
      ctx.lineTo(36, 4);
      ctx.lineTo(30, 22);
      ctx.closePath();
      ctx.fill();

      // Stone Body & Horns
      ctx.fillStyle = '#475569';
      ctx.fillRect(13, 11, 12, 16);
      ctx.fillRect(14, 4, 10, 8);
      // Horns
      this.px(ctx, 13, 1, 3, 4, '#64748b');
      this.px(ctx, 22, 1, 3, 4, '#64748b');
      // Glowing Ruby Eyes
      this.px(ctx, 16, 7, 2, 2, '#f43f5e');
      this.px(ctx, 20, 7, 2, 2, '#f43f5e');
    });

    // 9. Volatile Corpse / Plague Bomber (Infested suicide zombie)
    this.makeTexture(scene, 'enemy_plague_bomber', S, S, (ctx) => {
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(10, 12, 12, 14);
      ctx.fillRect(10, 25, 4, 6);
      ctx.fillRect(18, 25, 4, 6);
      // Swollen glowing sulfur pustules on torso
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(14, 15, 5, 0, Math.PI * 2);
      ctx.arc(20, 18, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      this.px(ctx, 14, 14, 2, 2, '#fff');
    });

    // 10. Void Chanter (Aura buffer, obsidian halo)
    this.makeTexture(scene, 'enemy_void_chanter', S, 36, (ctx) => {
      // Ethereal dark robe
      ctx.fillStyle = '#18181b';
      ctx.fillRect(10, 12, 12, 20);
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(12, 6, 8, 7);
      // Floating purple halo ring above head
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(16, 4, 7, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Glowing core in chest
      this.px(ctx, 14, 17, 4, 4, '#c084fc');
      this.px(ctx, 15, 18, 2, 2, '#f3e8ff');
    });
  }

  // 5. BOSSES (3 Bosses)
  private static generateBosses(scene: Phaser.Scene) {
    // Mini-Boss 1: Grave Lord Malakor (64x64)
    this.makeTexture(scene, 'boss_malakor', 64, 64, (ctx) => {
      // Grand dark tattered cloak
      ctx.fillStyle = '#18181b';
      ctx.fillRect(16, 18, 32, 40);

      // Huge ornate bone-forged armor
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(20, 20, 24, 24);
      ctx.fillStyle = '#71717a';
      ctx.fillRect(20, 20, 24, 4);

      // Massive spiked skull pauldrons
      ctx.fillStyle = '#e4e4e7';
      ctx.fillRect(10, 16, 12, 12);
      ctx.fillRect(42, 16, 12, 12);
      this.px(ctx, 8, 12, 4, 5, '#a1a1aa');
      this.px(ctx, 52, 12, 4, 5, '#a1a1aa');

      // Bleached giant horned skull & Crown of the Crypt
      ctx.fillStyle = '#f4f4f5';
      ctx.fillRect(24, 8, 16, 14);
      // Spiked Crown
      ctx.fillStyle = '#38bdf8'; // Soul ice crown
      this.px(ctx, 24, 4, 3, 5, '#38bdf8');
      this.px(ctx, 30, 2, 4, 7, '#38bdf8');
      this.px(ctx, 37, 4, 3, 5, '#38bdf8');

      // Glowing Soulfire Eyes
      this.px(ctx, 27, 13, 3, 3, '#0ea5e9');
      this.px(ctx, 34, 13, 3, 3, '#0ea5e9');

      // Giant Soul Scythe
      ctx.fillStyle = '#52525b';
      ctx.fillRect(52, 8, 4, 50);
      // Massive curving blade
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(42, 14, 18, -Math.PI / 2, 0);
      ctx.stroke();
    });

    // Mini-Boss 2: Arch-Inquisitor Vane (56x60)
    this.makeTexture(scene, 'boss_vane', 56, 60, (ctx) => {
      // Blackened steel plate armor & crimson tabard
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(16, 18, 24, 34);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(24, 18, 8, 34);

      // Inquisitor iron hood & golden sunburst mask
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, 6, 16, 14);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(24, 10, 8, 8);
      // Flaming eye slits
      this.px(ctx, 25, 12, 2, 2, '#ef4444');
      this.px(ctx, 29, 12, 2, 2, '#ef4444');

      // Heavy executioner greatsword with blazing runes
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(44, 4, 5, 48);
      ctx.fillStyle = '#ef4444'; // flame channel
      ctx.fillRect(45, 6, 2, 42);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(40, 44, 13, 4);
    });

    // Final Boss: Malagath, the Void Sovereign (80x80)
    this.makeTexture(scene, 'boss_malagath', 80, 80, (ctx) => {
      // Immense Void Wings
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.moveTo(40, 30);
      ctx.lineTo(4, 6);
      ctx.lineTo(10, 50);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(40, 30);
      ctx.lineTo(76, 6);
      ctx.lineTo(70, 50);
      ctx.closePath();
      ctx.fill();

      // Wing ribs (violet glowing veins)
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 30);
      ctx.lineTo(8, 10);
      ctx.moveTo(40, 30);
      ctx.lineTo(72, 10);
      ctx.stroke();

      // Obsidian Demonic Body
      ctx.fillStyle = '#0f0a1c';
      ctx.fillRect(26, 24, 28, 38);

      // Pulsing Abyssal Core in chest
      const core = ctx.createRadialGradient(40, 36, 2, 40, 36, 12);
      core.addColorStop(0, '#ffffff');
      core.addColorStop(0.3, '#c084fc');
      core.addColorStop(0.8, '#7e22ce');
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(40, 36, 12, 0, Math.PI * 2);
      ctx.fill();

      // Quad-Horned Demonic Visage
      ctx.fillStyle = '#1c132e';
      ctx.fillRect(30, 8, 20, 18);
      // Horns
      ctx.fillStyle = '#a855f7';
      this.px(ctx, 26, 4, 4, 8, '#7e22ce');
      this.px(ctx, 22, 1, 4, 5, '#a855f7');
      this.px(ctx, 50, 4, 4, 8, '#7e22ce');
      this.px(ctx, 54, 1, 4, 5, '#a855f7');
      // Glowing 3 Void Eyes
      this.px(ctx, 33, 14, 3, 3, '#e879f9');
      this.px(ctx, 44, 14, 3, 3, '#e879f9');
      this.px(ctx, 38, 10, 4, 3, '#f43f5e');

      // Giant Voidblade
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(66, 12, 6, 56);
      ctx.fillStyle = '#d8b4fe';
      ctx.fillRect(68, 14, 2, 50);
    });
  }

  // 6. NPCS
  private static generateNPCs(scene: Phaser.Scene) {
    const S = 32;

    // Blacksmith Valerius
    this.makeTexture(scene, 'npc_blacksmith', S, 36, (ctx) => {
      // Leather apron & muscles
      ctx.fillStyle = '#78350f';
      ctx.fillRect(10, 12, 12, 18);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(11, 14, 10, 14);
      // Bald head with thick beard
      ctx.fillStyle = '#d97706';
      ctx.fillRect(11, 9, 10, 6); // beard
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(12, 4, 8, 6);
      // Hammer
      ctx.fillStyle = '#52525b';
      ctx.fillRect(23, 10, 6, 8);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(25, 16, 2, 12);
    });

    // Alchemist Mara
    this.makeTexture(scene, 'npc_alchemist', S, 36, (ctx) => {
      // Emerald gown & satchels
      ctx.fillStyle = '#065f46';
      ctx.fillRect(10, 12, 12, 20);
      ctx.fillStyle = '#047857';
      ctx.fillRect(11, 14, 10, 16);
      // Hood with red hair fringe
      ctx.fillStyle = '#022c22';
      ctx.fillRect(11, 3, 10, 9);
      ctx.fillStyle = '#ea580c';
      this.px(ctx, 12, 7, 8, 2, '#ea580c');
      // Potion flask in hand
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(24, 22, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Elder Corvus
    this.makeTexture(scene, 'npc_elder', S, 36, (ctx) => {
      // Grey scholarly robe
      ctx.fillStyle = '#334155';
      ctx.fillRect(10, 12, 12, 20);
      // Long white beard
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(13, 9, 6, 12);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(12, 4, 8, 6);
      // Ancient scroll
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(22, 16, 6, 9);
    });
  }

  // 7. PROJECTILES & FX
  private static generateProjectilesAndFX(scene: Phaser.Scene) {
    // Arcane Bolt
    this.makeTexture(scene, 'proj_arcane_bolt', 24, 12, (ctx) => {
      const g = ctx.createLinearGradient(0, 6, 24, 6);
      g.addColorStop(0, 'rgba(168, 85, 247, 0)');
      g.addColorStop(0.5, '#a855f7');
      g.addColorStop(1, '#ffffff');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(12, 6, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bone Arrow
    this.makeTexture(scene, 'proj_bone_arrow', 20, 6, (ctx) => {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(2, 2, 14, 2);
      // Arrowhead
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(20, 3);
      ctx.lineTo(16, 6);
      ctx.closePath();
      ctx.fill();
    });

    // Poison Spit
    this.makeTexture(scene, 'proj_poison_spit', 16, 16, (ctx) => {
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d9f99d';
      ctx.beginPath();
      ctx.arc(8, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Void Orb
    this.makeTexture(scene, 'proj_void_orb', 20, 20, (ctx) => {
      const g = ctx.createRadialGradient(10, 10, 2, 10, 10, 9);
      g.addColorStop(0, '#f5d0fe');
      g.addColorStop(0.5, '#a21caf');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(10, 10, 9, 0, Math.PI * 2);
      ctx.fill();
    });

    // Glacial Nova Ring (64x64)
    this.makeTexture(scene, 'fx_glacial_nova', 64, 64, (ctx) => {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(32, 32, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(32, 32, 25, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Meteor (32x32)
    this.makeTexture(scene, 'proj_meteor', 32, 32, (ctx) => {
      const g = ctx.createRadialGradient(16, 16, 3, 16, 16, 14);
      g.addColorStop(0, '#fef08a');
      g.addColorStop(0.4, '#f97316');
      g.addColorStop(0.8, '#dc2626');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sword Slash Arc FX (40x40)
    this.makeTexture(scene, 'fx_slash', 40, 40, (ctx) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(20, 20, 16, -Math.PI / 3, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(20, 20, 14, -Math.PI / 3, Math.PI / 2);
      ctx.stroke();
    });

    // Poison Puddle (Ground hazard)
    this.makeTexture(scene, 'fx_poison_puddle', 48, 32, (ctx) => {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
      ctx.beginPath();
      ctx.ellipse(24, 16, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
      ctx.beginPath();
      ctx.ellipse(24, 16, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particle Dot (for blood, spark, dust)
    this.makeTexture(scene, 'fx_dot', 8, 8, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 4, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 8. ITEM ICONS (28x28)
  private static generateItemIcons(scene: Phaser.Scene) {
    const S = 28;

    // Helper frame for all icons
    const makeIcon = (key: string, draw: (ctx: CanvasRenderingContext2D) => void) => {
      this.makeTexture(scene, key, S, S, (ctx) => {
        // Dark metallic background
        ctx.fillStyle = '#111318';
        ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = '#333842';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, S - 1, S - 1);
        draw(ctx);
      });
    };

    // Health Potion
    makeIcon('icon_potion_hp', (ctx) => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(14, 16, 8, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(12, 5, 4, 5);
      ctx.fillStyle = '#e2e8f0'; // glass cork
      ctx.fillRect(11, 3, 6, 2);
      this.px(ctx, 11, 13, 3, 4, '#fca5a5'); // glass shine
    });

    // Mana / Resource Potion
    makeIcon('icon_potion_mana', (ctx) => {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.ellipse(14, 16, 8, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(12, 5, 4, 5);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(11, 3, 6, 2);
      this.px(ctx, 11, 13, 3, 4, '#93c5fd');
    });

    // Weapon: Sword
    makeIcon('icon_sword', (ctx) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(6, 6, 3, 14);
      ctx.fillStyle = '#d97706'; // guard
      ctx.fillRect(3, 18, 9, 2);
      ctx.fillStyle = '#78350f'; // grip
      ctx.fillRect(6, 20, 3, 4);
    });

    // Weapon: Staff
    makeIcon('icon_staff', (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, 6, 2, 18);
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(7, 6, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Weapon: Axe
    makeIcon('icon_axe', (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, 6, 3, 18);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(11, 7, 7, 7);
      ctx.fillRect(4, 8, 4, 5);
    });

    // Armor: Head (Helmet)
    makeIcon('icon_head', (ctx) => {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(6, 6, 16, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(9, 12, 10, 3);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(6, 6, 16, 2);
    });

    // Armor: Chest (Chestplate)
    makeIcon('icon_chest', (ctx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(6, 7, 16, 16);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(9, 7, 10, 3);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(13, 10, 2, 11);
    });

    // Armor: Gloves
    makeIcon('icon_gloves', (ctx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(7, 8, 14, 14);
      ctx.fillStyle = '#334155';
      ctx.fillRect(9, 6, 3, 4);
      ctx.fillRect(13, 5, 3, 5);
      ctx.fillRect(17, 6, 3, 4);
    });

    // Armor: Boots
    makeIcon('icon_boots', (ctx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(7, 8, 6, 10);
      ctx.fillRect(15, 8, 6, 10);
      ctx.fillRect(5, 17, 8, 5);
      ctx.fillRect(15, 17, 8, 5);
    });

    // Jewelry: Ring
    makeIcon('icon_ring', (ctx) => {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(14, 15, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ef4444'; // ruby gem
      ctx.fillRect(12, 6, 4, 4);
    });

    // Jewelry: Amulet
    makeIcon('icon_amulet', (ctx) => {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(14, 10, 8, 0, Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8'; // sapphire pendant
      ctx.beginPath();
      ctx.moveTo(14, 16);
      ctx.lineTo(19, 21);
      ctx.lineTo(14, 26);
      ctx.lineTo(9, 21);
      ctx.closePath();
      ctx.fill();
    });

    // Gold Pile
    makeIcon('icon_gold', (ctx) => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(12, 18, 5, 0, Math.PI * 2);
      ctx.arc(17, 18, 5, 0, Math.PI * 2);
      ctx.arc(14, 12, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      this.px(ctx, 13, 11, 2, 2, '#fff');
    });

    // Drop Item Ground Marker with Rarity Beams
    const rarities = [
      { name: 'common', col: '#e5e7eb', beam: 'rgba(229, 231, 235, 0.4)' },
      { name: 'magic', col: '#38bdf8', beam: 'rgba(56, 189, 248, 0.6)' },
      { name: 'rare', col: '#facc15', beam: 'rgba(250, 204, 21, 0.7)' },
      { name: 'legendary', col: '#fb923c', beam: 'rgba(251, 146, 60, 0.9)' },
    ];

    for (const r of rarities) {
      this.makeTexture(scene, `drop_beam_${r.name}`, 16, 48, (ctx) => {
        // Vertical upward light beam
        const g = ctx.createLinearGradient(8, 48, 8, 0);
        g.addColorStop(0, r.beam);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(4, 0, 8, 48);

        // Bright item gleam at bottom
        ctx.fillStyle = r.col;
        ctx.beginPath();
        ctx.arc(8, 42, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8, 42, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  // 9. UI FRAMES & GLOBES
  private static generateUIFrames(scene: Phaser.Scene) {
    // Health Globe Background & Frame (80x80)
    this.makeTexture(scene, 'ui_globe_frame', 80, 80, (ctx) => {
      // Outer brass/dark iron border
      ctx.strokeStyle = '#473d31';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(40, 40, 37, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(40, 40, 35, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Red Globe Liquid
    this.makeTexture(scene, 'ui_liquid_red', 70, 70, (ctx) => {
      const g = ctx.createRadialGradient(25, 25, 5, 35, 35, 35);
      g.addColorStop(0, '#f87171');
      g.addColorStop(0.5, '#dc2626');
      g.addColorStop(1, '#450a0a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(35, 35, 34, 0, Math.PI * 2);
      ctx.fill();
    });

    // Blue Globe Liquid (Mana)
    this.makeTexture(scene, 'ui_liquid_blue', 70, 70, (ctx) => {
      const g = ctx.createRadialGradient(25, 25, 5, 35, 35, 35);
      g.addColorStop(0, '#60a5fa');
      g.addColorStop(0.5, '#2563eb');
      g.addColorStop(1, '#172554');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(35, 35, 34, 0, Math.PI * 2);
      ctx.fill();
    });

    // Orange Globe Liquid (Fury)
    this.makeTexture(scene, 'ui_liquid_amber', 70, 70, (ctx) => {
      const g = ctx.createRadialGradient(25, 25, 5, 35, 35, 35);
      g.addColorStop(0, '#fde047');
      g.addColorStop(0.5, '#f97316');
      g.addColorStop(1, '#7c2d12');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(35, 35, 34, 0, Math.PI * 2);
      ctx.fill();
    });

    // Skill Hotbar Slot (44x44)
    this.makeTexture(scene, 'ui_slot', 44, 44, (ctx) => {
      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, 44, 44);
      // Gothic brass bevel
      ctx.strokeStyle = '#574837';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 42, 42);
      ctx.strokeStyle = '#856f54';
      ctx.lineWidth = 1;
      ctx.strokeRect(3, 3, 38, 38);
    });

    // Panel Window Background (9-slice style frame) (64x64)
    this.makeTexture(scene, 'ui_panel_bg', 64, 64, (ctx) => {
      ctx.fillStyle = 'rgba(12, 14, 20, 0.94)';
      ctx.fillRect(0, 0, 64, 64);
      // Border
      ctx.strokeStyle = '#493e32';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 62, 62);
      // Golden inner border
      ctx.strokeStyle = '#b89b5f';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 4, 56, 56);
    });
  }
}
