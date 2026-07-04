/**
 * 奖励特效
 * 梅花飘落 / 墨迹晕染 / 烟花粒子
 */

import Phaser, { Scene } from 'phaser';

export class RewardEffects {
  /** 正确反馈：梅花飘落 */
  static playCorrectEffect(scene: Scene, x: number, y: number) {
    // 水墨扩散效果
    const circle = scene.add.circle(x, y, 5, 0x000000, 0.3);
    scene.tweens.add({
      targets: circle,
      scaleX: 6,
      scaleY: 6,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => circle.destroy(),
    });

    // 梅花飘落 1 朵
    const plum = scene.add.text(x, y, '🌸', { fontSize: '28px' });
    scene.tweens.add({
      targets: plum,
      y: y - 60,
      alpha: 0,
      angle: Phaser.Math.Between(-30, 30),
      duration: 800,
      ease: 'Power1',
      onComplete: () => plum.destroy(),
    });
  }

  /** 错误反馈：墨滴溅落 */
  static playWrongEffect(scene: Scene, x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const drop = scene.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-10, 10),
        Phaser.Math.Between(2, 5),
        0x000000,
        0.5
      );
      scene.tweens.add({
        targets: drop,
        y: y + Phaser.Math.Between(20, 50),
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 600,
        delay: i * 80,
        ease: 'Power2',
        onComplete: () => drop.destroy(),
      });
    }
  }

  /** 过关特效：毛笔书写 + 烟花 */
  static playLevelCompleteEffect(scene: Scene, width: number, height: number) {
    // "太棒了！"文字动画 —— 放在顶部，避免被成绩卡片覆盖
    const text = scene.add.text(width / 2, 100, '🎉 太棒了！', {
      fontFamily: 'KaiTi, STKaiti, serif',
      fontSize: '52px',
      color: '#8B0000',
      stroke: '#FFD700',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);

    scene.tweens.add({
      targets: text,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // 梅花雨
    const plumEmojis = ['🌸', '🏵️', '🌺'];
    for (let i = 0; i < 20; i++) {
      const plum = scene.add.text(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(-200, -50),
        plumEmojis[Phaser.Math.Between(0, plumEmojis.length - 1)],
        { fontSize: `${Phaser.Math.Between(16, 28)}px` }
      );

      scene.tweens.add({
        targets: plum,
        y: height + 50,
        x: plum.x + Phaser.Math.Between(-80, 80),
        angle: Phaser.Math.Between(-180, 180),
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(200, 1500),
        ease: 'Sine.easeIn',
        onComplete: () => plum.destroy(),
      });
    }
  }

  /** 连击特效 */
  static playComboEffect(scene: Scene, combo: number, width: number) {
    const color = combo >= 10 ? '#FFD700' : combo >= 5 ? '#FF8C00' : '#FF6347';
    const text = scene.add.text(width / 2, 120, `🔥 ${combo}连击！`, {
      fontFamily: 'KaiTi, STKaiti, serif',
      fontSize: '32px',
      color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    scene.tweens.add({
      targets: text,
      alpha: 1,
      y: 100,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      hold: 400,
      onComplete: () => text.destroy(),
    });
  }
}
