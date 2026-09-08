import Phaser from 'phaser';

export type DamageNumberType = 'normal' | 'crit' | 'player_hit' | 'heal' | 'elemental';

export class DamageNumberManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public show(x: number, y: number, text: string | number, type: DamageNumberType = 'normal') {
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 10 - 20;

    let color = '#ffffff';
    let fontSize = '14px';
    let strokeColor = '#000000';
    let strokeThickness = 3;

    switch (type) {
      case 'crit':
        color = '#facc15';
        fontSize = '18px';
        strokeThickness = 4;
        break;
      case 'player_hit':
        color = '#ef4444';
        fontSize = '16px';
        break;
      case 'heal':
        color = '#22c55e';
        fontSize = '14px';
        break;
      case 'elemental':
        color = '#a855f7';
        fontSize = '15px';
        break;
      default:
        color = '#e2e8f0';
        fontSize = '13px';
        break;
    }

    const txt = this.scene.add.text(x + offsetX, y + offsetY, String(text), {
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      fontSize,
      fontStyle: type === 'crit' ? 'bold' : 'normal',
      color,
      stroke: strokeColor,
      strokeThickness,
    });
    txt.setOrigin(0.5, 0.5);
    txt.setDepth(100);

    this.scene.tweens.add({
      targets: txt,
      y: y + offsetY - 35,
      alpha: 0,
      scale: type === 'crit' ? 1.25 : 1.0,
      duration: type === 'crit' ? 900 : 700,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        txt.destroy();
      },
    });
  }
}
