import Phaser, { Scene, GameObjects } from 'phaser';
import { LevelSystem } from '../utils/LevelSystem';
import { SoundManager } from '../utils/SoundManager';
import { Settings, MIN_QUESTIONS, MAX_QUESTIONS, STEP_QUESTIONS } from '../utils/Settings';

export class MainMenu extends Scene {
  private bgGraphics!: GameObjects.Graphics;
  private settingsOverlay!: GameObjects.Container;
  private settingsValueText!: GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const levelSystem = new LevelSystem();

    this.cameras.main.fadeIn(300);

    // 宣纸背景 + 国风装饰
    this.bgGraphics = this.add.graphics();
    this.drawBackground(width, height);

    // 水墨山水装饰（简化）
    this.drawMountainDecor(width, height);

    // 统计卡片（右上角）
    const completed = levelSystem.getAllLevels().filter(l => levelSystem.getLevelProgress(l.id)?.completed).length;
    const accuracy = levelSystem.getTotalScore() > 0 ? Math.round(levelSystem.getAverageAccuracy()) : 0;

    const statsBg = this.add.graphics();
    statsBg.fillStyle(0x2C1810, 0.15);
    statsBg.fillRoundedRect(width - 200, 10, 180, 55, 10);
    statsBg.lineStyle(1, 0x8B6914, 0.4);
    statsBg.strokeRoundedRect(width - 200, 10, 180, 55, 10);

    this.add.text(width - 110, 22, `${completed}/${levelSystem.getAllLevels().length} 关`, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '16px', color: '#5C3A1E',
    }).setOrigin(0.5);
    this.add.text(width - 110, 48, `⭐ ${levelSystem.getTotalStars()} · ${accuracy}%`, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '15px', color: '#8B6914',
    }).setOrigin(0.5);

    // 标题
    const title = this.add.text(width / 2, 120, '国 学 小 书 房', {
      fontFamily: 'KaiTi, STKaiti, SimSun, STSong, serif',
      fontSize: '60px',
      color: '#2C1810',
      stroke: '#8B6914',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 126,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 副标题
    this.add.text(width / 2, 180, '幼小衔接国学启蒙', {
      fontFamily: 'KaiTi, STKaiti, serif',
      fontSize: '20px',
      color: '#8B6914',
    }).setOrigin(0.5);

    // 功能说明卡片
    this.createFeatureCards(width);

    // 主入口按钮
    this.createMainButton(width / 2, 380, '📖 开始学习', 0xCC3333, () => {
      SoundManager.playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LevelSelectScene');
      });
    });

    // 快捷入口
    const quickY = 460;
    this.add.text(width / 2, quickY - 20, '— 快捷入口 —', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '14px', color: '#8B6914',
    }).setOrigin(0.5).setAlpha(0.6);

    this.createSmallButton(width / 2 - 130, quickY + 15, '📜 今日诵读', 0x8B4513, () => {
      SoundManager.playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ChineseGame', {
          level: 1, type: 'fill-blank', module: 'classics',
          useTimer: false, useLives: false,
        });
      });
    });
    this.createSmallButton(width / 2 + 130, quickY + 15, '📊 学习报告', 0x8B6914, () => {
      SoundManager.playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ReportScene');
      });
    });

    // 音效开关
    const soundBtn = this.add.text(width / 2, height - 25, SoundManager.isEnabled() ? '🔊 音效' : '🔇 静音', {
      fontFamily: 'KaiTi, STKaiti, serif',
      fontSize: '14px',
      color: '#8B6914',
    }).setOrigin(0.5).setAlpha(0.6).setInteractive({ useHandCursor: true });
    soundBtn.on('pointerdown', () => {
      const isOn = SoundManager.toggle();
      soundBtn.setText(isOn ? '🔊 音效' : '🔇 静音');
    });
    soundBtn.on('pointerover', () => soundBtn.setAlpha(1));
    soundBtn.on('pointerout', () => soundBtn.setAlpha(0.6));

    // 设置按钮（右下角）
    const settingsBtn = this.add.text(width - 60, height - 25, '⚙️ 设置', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '14px', color: '#8B6914',
    }).setOrigin(0.5).setAlpha(0.6).setInteractive({ useHandCursor: true });
    settingsBtn.on('pointerover', () => settingsBtn.setAlpha(1));
    settingsBtn.on('pointerout', () => settingsBtn.setAlpha(0.6));
    settingsBtn.on('pointerdown', () => this.showSettings(width, height));

    // 预创建设置面板（默认隐藏）
    this.createSettingsPanel(width, height);
  }

  // ============== 设置面板 ==============

  private createSettingsPanel(width: number, height: number) {
    this.settingsOverlay = this.add.container(0, 0).setDepth(1000).setAlpha(0).setVisible(false);
    // 半透明遮罩
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0.4);
    dim.fillRect(0, 0, width, height);
    dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.settingsOverlay.add(dim);

    // 面板背景
    const panelW = 420;
    const panelH = 260;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;
    const panel = this.add.graphics();
    panel.fillStyle(0xF5E6C8, 1);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 16);
    panel.lineStyle(2, 0xCC3333, 0.5);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 16);
    this.settingsOverlay.add(panel);

    // 标题
    const title = this.add.text(width / 2, panelY + 36, '⚙️ 每关题目数量', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '26px', color: '#2C1810',
    }).setOrigin(0.5);
    this.settingsOverlay.add(title);

    // 说明
    const hint = this.add.text(width / 2, panelY + 72, `范围 ${MIN_QUESTIONS} ~ ${MAX_QUESTIONS}，步长 ${STEP_QUESTIONS}`, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '14px', color: '#8B6914',
    }).setOrigin(0.5);
    this.settingsOverlay.add(hint);

    // 数字 + 加减
    const cy = panelY + 130;
    const minusBtn = this.createStepButton(width / 2 - 120, cy, '−', () => this.adjustQuestions(-STEP_QUESTIONS));
    const plusBtn = this.createStepButton(width / 2 + 120, cy, '+', () => this.adjustQuestions(STEP_QUESTIONS));
    this.settingsOverlay.add(minusBtn);
    this.settingsOverlay.add(plusBtn);

    this.settingsValueText = this.add.text(width / 2, cy, `${Settings.get().questionsPerLevel}`, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '48px', color: '#CC3333',
      stroke: '#FFFFFF', strokeThickness: 4,
    }).setOrigin(0.5);
    this.settingsOverlay.add(this.settingsValueText);

    // 确定按钮
    const okBtn = this.createOkButton(width / 2, panelY + panelH - 40);
    this.settingsOverlay.add(okBtn);
  }

  private createStepButton(x: number, y: number, label: string, onClick: () => void): GameObjects.Container {
    const container = this.add.container(x, y);
    const w = 56;
    const h = 56;
    const bg = this.add.graphics();
    bg.fillStyle(0xCC3333, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 28);
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '32px', color: '#FFFFFF',
    }).setOrigin(0.5);
    container.add([bg, txt]);
    container.setSize(w, h);
    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    container.on('pointerdown', () => {
      SoundManager.playClick();
      this.tweens.killTweensOf(container);
      this.tweens.add({ targets: container, scaleX: 0.9, scaleY: 0.9, duration: 80, yoyo: true });
      onClick();
    });
    return container;
  }

  private createOkButton(x: number, y: number): GameObjects.Container {
    const container = this.add.container(x, y);
    const w = 140;
    const h = 44;
    const bg = this.add.graphics();
    bg.fillStyle(0x2E7D32, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    const txt = this.add.text(0, 0, '✓ 确定', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#FFFFFF',
    }).setOrigin(0.5);
    container.add([bg, txt]);
    container.setSize(w, h);
    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    container.on('pointerdown', () => {
      SoundManager.playClick();
      this.hideSettings();
    });
    return container;
  }

  private adjustQuestions(delta: number) {
    const cur = Settings.get().questionsPerLevel;
    let next = cur + delta;
    if (next < MIN_QUESTIONS) next = MIN_QUESTIONS;
    if (next > MAX_QUESTIONS) next = MAX_QUESTIONS;
    Settings.setQuestionsPerLevel(next);
    this.settingsValueText.setText(`${next}`);
  }

  private showSettings(_width: number, _height: number) {
    this.settingsValueText.setText(`${Settings.get().questionsPerLevel}`);
    this.settingsOverlay.setVisible(true);
    this.tweens.add({ targets: this.settingsOverlay, alpha: 1, duration: 200 });
  }

  private hideSettings() {
    this.tweens.add({
      targets: this.settingsOverlay, alpha: 0, duration: 200,
      onComplete: () => this.settingsOverlay.setVisible(false),
    });
  }

  private drawBackground(width: number, height: number) {
    const g = this.bgGraphics;
    // 宣纸底色
    g.fillStyle(0xF5E6C8, 1);
    g.fillRect(0, 0, width, height);
    // 上下朱红装饰条
    g.fillStyle(0xCC3333, 0.6);
    g.fillRect(0, 0, width, 4);
    g.fillRect(0, height - 4, width, 4);
  }

  private drawMountainDecor(width: number, height: number) {
    const g = this.add.graphics();
    // 远山（淡墨）
    g.fillStyle(0x2C1810, 0.08);
    g.beginPath();
    g.moveTo(0, height);
    g.lineTo(150, height - 100);
    g.lineTo(300, height - 60);
    g.lineTo(450, height - 130);
    g.lineTo(600, height - 50);
    g.lineTo(750, height - 110);
    g.lineTo(width, height - 40);
    g.lineTo(width, height);
    g.closePath();
    g.fillPath();

    // 第二层远山（更淡）
    g.fillStyle(0x2C1810, 0.05);
    g.beginPath();
    g.moveTo(0, height);
    g.lineTo(100, height - 70);
    g.lineTo(250, height - 40);
    g.lineTo(400, height - 90);
    g.lineTo(550, height - 30);
    g.lineTo(700, height - 80);
    g.lineTo(width, height - 20);
    g.lineTo(width, height);
    g.closePath();
    g.fillPath();

    // 梅花枝（右下角装饰）
    g.fillStyle(0xCC3333, 0.3);
    g.fillCircle(width - 60, height - 80, 6);
    g.fillCircle(width - 40, height - 65, 5);
    g.fillCircle(width - 55, height - 55, 4);
    g.fillCircle(width - 75, height - 70, 5);
    // 枝干
    g.lineStyle(3, 0x2C1810, 0.2);
    g.beginPath();
    g.moveTo(width - 20, height - 50);
    g.lineTo(width - 50, height - 70);
    g.lineTo(width - 35, height - 90);
    g.strokePath();
  }

  private createFeatureCards(width: number) {
    const features = [
      { icon: '📜', title: '蒙学经典', desc: '三字经、弟子规' },
      { icon: '📝', title: '古诗词', desc: '唐诗宋词启蒙' },
      { icon: '📚', title: '成语故事', desc: '学成语明事理' },
    ];
    const cardW = 210;
    const gap = 20;
    const totalW = features.length * cardW + (features.length - 1) * gap;
    const startX = (width - totalW) / 2;
    const y = 215;

    features.forEach((f, i) => {
      const x = startX + i * (cardW + gap);
      const card = this.add.graphics();
      card.fillStyle(0xFFFFFF, 0.85);
      card.fillRoundedRect(x, y, cardW, 110, 12);
      card.lineStyle(1, 0xD4A574, 0.6);
      card.strokeRoundedRect(x, y, cardW, 110, 12);

      this.add.text(x + cardW / 2, y + 28, f.icon, { fontSize: '34px' }).setOrigin(0.5);
      this.add.text(x + cardW / 2, y + 60, f.title, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '18px', color: '#2C1810',
      }).setOrigin(0.5);
      this.add.text(x + cardW / 2, y + 85, f.desc, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '13px', color: '#8B6914',
      }).setOrigin(0.5);
    });
  }

  private createMainButton(x: number, y: number, text: string, color: number, onClick: () => void) {
    const container = this.add.container(x, y);
    const w = 260;
    const h = 56;
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 28);
    bg.lineStyle(3, 0xFFFFFF, 0.4);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 28);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'KaiTi, STKaiti, serif',
      fontSize: '28px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(w, h);
    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    container.on('pointerover', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 120 });
    });
    container.on('pointerout', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120 });
    });
    container.on('pointerdown', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets: container, scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true,
        onComplete: onClick,
      });
    });
    return container;
  }

  private createSmallButton(x: number, y: number, text: string, color: number, onClick: () => void) {
    const container = this.add.container(x, y);
    const w = 160;
    const h = 44;
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'KaiTi, STKaiti, serif',
      fontSize: '20px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(w, h);
    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    container.on('pointerover', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({ targets: container, scaleX: 1.08, scaleY: 1.08, duration: 100 });
    });
    container.on('pointerout', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });
    container.on('pointerdown', () => {
      SoundManager.playClick();
      this.tweens.killTweensOf(container);
      this.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true, onComplete: onClick });
    });
    return container;
  }
}
