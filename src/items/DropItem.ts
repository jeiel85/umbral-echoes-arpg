import Phaser from 'phaser';
import { Item } from './ItemTypes';
import { SoundEngine } from '../audio/SoundEngine';

export class DropItem extends Phaser.GameObjects.Container {
  public item: Item;
  private beamSprite: Phaser.GameObjects.Sprite;
  private labelText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, item: Item) {
    super(scene, x, y);
    scene.add.existing(this);

    this.item = item;
    this.setDepth(16);

    const rarity = item.rarity;
    this.beamSprite = scene.add.sprite(0, -18, `drop_beam_${rarity}`);
    this.add(this.beamSprite);

    let textColor = '#e2e8f0';
    if (rarity === 'magic') textColor = '#38bdf8';
    else if (rarity === 'rare') textColor = '#facc15';
    else if (rarity === 'legendary') textColor = '#fb923c';
    if (item.type === 'gold') textColor = '#fbbf24';

    this.labelText = scene.add.text(0, -42, item.name, {
      fontFamily: 'serif',
      fontSize: rarity === 'legendary' ? '12px' : '11px',
      fontStyle: rarity === 'legendary' || rarity === 'rare' ? 'bold' : 'normal',
      color: textColor,
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      padding: { x: 4, y: 2 },
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.labelText.setOrigin(0.5, 0.5);
    this.add(this.labelText);

    // Subtle bobbing tween
    scene.tweens.add({
      targets: this.beamSprite,
      y: -22,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    SoundEngine.getInstance().playItemDrop(rarity);

    // Interactive pickup on click
    this.setSize(36, 48);
    this.setInteractive({ useHandCursor: true });
  }
}
