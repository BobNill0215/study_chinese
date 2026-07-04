import Phaser, { Scene, GameObjects } from 'phaser';
import { LEVEL_CONFIGS } from '../utils/LevelSystem';
import { SoundManager } from '../utils/SoundManager';
import { RewardEffects } from '../utils/RewardEffects';

interface LevelCompleteData {
  level: number;
  module: string;
  type: string;
  score: number;
  correct: number;
  total: number;
  stars: number;
  accuracy: number;
  rating: string;
}

export class LevelComplete extends Scene {
  private levelData!: LevelCompleteData;

  constructor() {
    super('LevelComplete');
  }

  init(data: LevelCompleteData) {
    this.levelData = data;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.fadeIn(300);

    // 宣纸背景
    const bg = this.add.graphics();
    bg.fillStyle(0xF5E6C8, 1);
    bg.fillRect(0, 0, width, height);

    // 红色祥云装饰
    const decor = this.add.graphics();
    decor.fillStyle(0xCC3333, 0.08);
    decor.fillCircle(100, 80, 120);
    decor.fillCircle(700, 80, 100);
    decor.fillCircle(150, 520, 80);
    decor.fillCircle(650, 530, 90);

    // 过关特效
    RewardEffects.playLevelCompleteEffect(this, width, height);
    SoundManager.playCelebrate();

    // 评级显示（梅花）
    const ratingText = this.add.text(width / 2, 180, this.levelData.rating, {
      fontSize: '56px',
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({
      targets: ratingText, scaleX: 1, scaleY: 1, duration: 500, delay: 300, ease: 'Back.easeOut',
    });

    // 成绩卡片
    const card = this.add.graphics();
    card.fillStyle(0xFFFFFF, 0.95);
    card.fillRoundedRect(width / 2 - 180, 230, 360, 210, 16);
    card.lineStyle(2, 0xCC3333, 0.4);
    card.strokeRoundedRect(width / 2 - 180, 230, 360, 210, 16);

    // 成绩信息
    const details = [
      { label: '得分', value: `${this.levelData.score}`, color: '#2C1810' },
      { label: '正确率', value: `${this.levelData.accuracy}%`, color: this.levelData.accuracy >= 80 ? '#2E7D32' : '#CC3333' },
      { label: '答对题数', value: `${this.levelData.correct}/${this.levelData.total}`, color: '#2C1810' },
    ];

    details.forEach((d, i) => {
      const x = width / 2;
      const y = 270 + i * 52;
      this.add.text(x - 60, y, d.label, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '22px', color: '#8B6914',
      }).setOrigin(0, 0.5);
      this.add.text(x + 60, y, d.value, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '26px', color: d.color,
      }).setOrigin(1, 0.5);
    });

    // 按钮
    this.createButtons(width, height);
  }

  private createButtons(width: number, height: number) {
    const retryBtn = this.createButton(width / 2 - 120, height - 110, '🔄 再来一次', 0x8B4513, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ChineseGame', {
          level: this.levelData.level, type: this.levelData.type, module: this.levelData.module,
        });
      });
    });

    const nextBtn = this.createButton(width / 2 + 120, height - 110, '➡️ 下一关', 0xCC3333, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        const nextLevel = this.levelData.level + 1;
        const nextConfig = LEVEL_CONFIGS.find(l => l.id === nextLevel);
        if (nextConfig) {
          this.scene.start('ChineseGame', {
            level: nextLevel, type: nextConfig.type, module: nextConfig.module,
          });
        } else {
          this.scene.start('LevelSelectScene');
        }
      });
    });

    const menuBtn = this.createSmallText(width / 2, height - 40, '返回课程列表', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('LevelSelectScene'));
    });

    [retryBtn, nextBtn, menuBtn].forEach((btn, i) => {
      btn.setScale(0);
      this.tweens.add({
        targets: btn, scaleX: 1, scaleY: 1, duration: 300, delay: 600 + i * 100, ease: 'Back.easeOut',
      });
    });
  }

  private createButton(x: number, y: number, text: string, color: number, onClick: () => void): GameObjects.Container {
    const container = this.add.container(x, y);
    const w = 180;
    const h = 50;
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 25);
    bg.lineStyle(2, 0xFFFFFF, 0.3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 25);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '22px', color: '#FFFFFF',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(w, h);
    container.setInteractive({ hitArea: new Phaser.Geom.Rectangle(0, 0, w, h), hitAreaCallback: Phaser.Geom.Rectangle.Contains });
    container.on('pointerdown', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true, onComplete: onClick });
    });
    container.on('pointerover', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({ targets: container, scaleX: 1.08, scaleY: 1.08, duration: 100 });
    });
    container.on('pointerout', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });
    return container;
  }

  private createSmallText(x: number, y: number, text: string, onClick: () => void): GameObjects.Text {
    const t = this.add.text(x, y, text, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '16px', color: '#8B6914',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    t.on('pointerdown', onClick);
    t.on('pointerover', () => t.setColor('#CC3333'));
    t.on('pointerout', () => t.setColor('#8B6914'));
    return t;
  }
}
