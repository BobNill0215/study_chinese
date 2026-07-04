import Phaser, { Scene, GameObjects } from 'phaser';
import { LEVEL_CONFIGS, LevelSystem, type LevelConfig } from '../utils/LevelSystem';
import { SoundManager } from '../utils/SoundManager';

export class LevelSelectScene extends Scene {
  private levelSystem!: LevelSystem;
  private selectedModule: string = 'classics';
  private levelCards: GameObjects.Container[] = [];
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private dragging: boolean = false;
  private dragStartY: number = 0;
  private gridContainer!: GameObjects.Container;
  private switchTimer?: Phaser.Time.TimerEvent;
  private categoryButtons: GameObjects.Container[] = [];

  private readonly modules: Record<string, { name: string; icon: string }> = {
    classics: { name: '蒙学经典', icon: '📜' },
    poetry: { name: '古诗词', icon: '📝' },
    idiom: { name: '成语故事', icon: '📚' },
    char: { name: '汉字启蒙', icon: '🖌️' },
    culture: { name: '传统文化', icon: '🏮' },
  };

  constructor() {
    super('LevelSelectScene');
  }

  create() {
    this.levelSystem = new LevelSystem();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.fadeIn(300);

    // 宣纸背景
    const bg = this.add.graphics();
    bg.fillStyle(0xF5E6C8, 1);
    bg.fillRect(0, 0, width, height);

    // 顶部
    this.createTopBar(width);

    // 模块 Tabs（水墨风格）
    this.createCategoryTabs(width);

    // 可滚动关卡网格
    this.createScrollableGrid(width, height);

    // 底部统计
    this.createBottomStats(width, height);

    // 渲染当前模块
    this.renderLevelGrid();
  }

  private createTopBar(width: number) {
    const topBar = this.add.graphics();
    topBar.fillStyle(0x2C1810, 0.1);
    topBar.fillRect(0, 0, width, 48);
    // 底部朱红线
    topBar.fillStyle(0xCC3333, 0.5);
    topBar.fillRect(0, 48, width, 2);

    // 返回按钮
    const backBtn = this.add.text(18, 25, '← 返回', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#5C3A1E',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainMenu'));
    });
    backBtn.on('pointerover', () => backBtn.setColor('#CC3333'));
    backBtn.on('pointerout', () => backBtn.setColor('#5C3A1E'));

    // 标题
    this.add.text(width / 2, 25, '📚 选择课程', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '24px', color: '#2C1810',
      stroke: '#000000', strokeThickness: 1,
    }).setOrigin(0.5);

    // 总星数
    this.add.text(width - 16, 25, `⭐ ${this.levelSystem.getTotalStars()}`, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '18px', color: '#8B6914',
    }).setOrigin(1, 0.5);
  }

  private createCategoryTabs(width: number) {
    const entries = Object.entries(this.modules);
    const tabW = 140;
    const gap = 8;
    const totalW = entries.length * tabW + (entries.length - 1) * gap;
    const startX = (width - totalW) / 2;
    const tabY = 58;
    const tabH = 40;

    this.categoryButtons = [];

    entries.forEach(([key, mod], index) => {
      const x = startX + index * (tabW + gap) + tabW / 2;
      const container = this.add.container(x, tabY + tabH / 2);

      const bg = this.add.graphics();
      this.drawTabBg(bg, tabW, tabH, key === this.selectedModule);

      const text = this.add.text(0, 0, `${mod.icon} ${mod.name}`, {
        fontFamily: 'KaiTi, STKaiti, serif',
        fontSize: '15px',
        color: key === this.selectedModule ? '#FFFFFF' : '#5C3A1E',
      }).setOrigin(0.5);

      container.add([bg, text]);
      container.setSize(tabW, tabH);
      container.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, tabW, tabH),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      });

      container.on('pointerdown', () => {
        if (this.selectedModule === key) return;
        SoundManager.playClick();
        this.tweens.killTweensOf(container);
        container.setScale(1);
        this.tweens.add({
          targets: container, scaleX: 0.9, scaleY: 0.9, duration: 70, yoyo: true, ease: 'Power2',
        });
        this.switchCategory(key);
      });

      container.on('pointerover', () => {
        if (this.selectedModule === key) return;
        this.tweens.killTweensOf(container);
        this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 100 });
      });
      container.on('pointerout', () => {
        if (this.selectedModule === key) return;
        this.tweens.killTweensOf(container);
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
      });

      this.categoryButtons.push(container);
    });
  }

  private drawTabBg(bg: GameObjects.Graphics, w: number, h: number, selected: boolean) {
    bg.clear();
    const halfW = w / 2;
    const halfH = h / 2;
    if (selected) {
      bg.fillStyle(0xCC3333, 1);
      bg.fillRoundedRect(-halfW, -halfH, w, h + 4, { tl: 8, tr: 8, bl: 0, br: 0 });
    } else {
      bg.fillStyle(0xD4A574, 0.4);
      bg.fillRoundedRect(-halfW, -halfH, w, h, 8);
    }
  }

  /** 场景关闭时清理定时器 */
  shutdown() {
    if (this.switchTimer) {
      this.switchTimer.remove();
      this.switchTimer = undefined;
    }
  }

  private switchCategory(key: string) {
    if (this.switchTimer) {
      this.switchTimer.remove();
      this.switchTimer = undefined;
    }
    this.levelCards.forEach(card => this.tweens.killTweensOf(card));
    this.selectedModule = key;
    this.updateTabVisuals();

    const oldCards = this.levelCards.slice();
    if (oldCards.length === 0) {
      this.renderLevelGrid(true);
      return;
    }
    oldCards.forEach(card => {
      this.tweens.add({ targets: card, alpha: 0, scaleX: 0.88, scaleY: 0.88, duration: 100, ease: 'Power2' });
    });
    this.switchTimer = this.time.delayedCall(110, () => {
      this.switchTimer = undefined;
      this.renderLevelGrid(true);
    });
  }

  private updateTabVisuals() {
    const entries = Object.entries(this.modules);
    entries.forEach(([key], index) => {
      const container = this.categoryButtons[index];
      if (!container) return;
      const bg = container.getAt(0) as GameObjects.Graphics;
      const text = container.getAt(1) as GameObjects.Text;
      this.drawTabBg(bg, 140, 40, key === this.selectedModule);
      text.setColor(key === this.selectedModule ? '#FFFFFF' : '#5C3A1E');
    });
  }

  private createScrollableGrid(width: number, height: number) {
    // 面板背景
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xFFFFFF, 0.6);
    panelBg.fillRoundedRect(10, 104, width - 20, height - 168, 10);
    panelBg.lineStyle(1, 0xD4A574, 0.5);
    panelBg.strokeRoundedRect(10, 104, width - 20, height - 168, 10);

    // 遮罩（Phaser 4 GeometryMask 需要 Graphics 对象）
    const maskGraphics = this.add.graphics();
    maskGraphics.fillStyle(0xFFFFFF);
    const maskX = 10;
    const maskY = (height - 64) / 2 + 104 - (height - 190) / 2;
    maskGraphics.fillRect(maskX, maskY, width - 20, height - 190);
    maskGraphics.setVisible(false);

    this.gridContainer = this.add.container(0, 118);
    this.gridContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskGraphics));

    // 滚轮
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY - deltaY * 0.5, -this.maxScrollY, 0);
      this.gridContainer.y = 118 + this.scrollY;
    });

    // 拖拽
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > 100 && pointer.y < height - 65) {
        this.dragging = true;
        this.dragStartY = pointer.y;
      }
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging) return;
      const dy = pointer.y - this.dragStartY;
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy, -this.maxScrollY, 0);
      this.gridContainer.y = 118 + this.scrollY;
      this.dragStartY = pointer.y;
    });
    this.input.on('pointerup', () => { this.dragging = false; });
  }

  private createBottomStats(width: number, height: number) {
    const statsBar = this.add.graphics();
    statsBar.fillStyle(0x2C1810, 0.1);
    statsBar.fillRect(0, height - 55, width, 55);
    statsBar.fillStyle(0xCC3333, 0.4);
    statsBar.fillRect(0, height - 57, width, 2);

    const stats = [
      { label: '总分', value: this.levelSystem.getTotalScore().toString(), color: '#5C3A1E' },
      { label: '正确率', value: `${Math.round(this.levelSystem.getAverageAccuracy())}%`, color: '#2E7D32' },
      { label: '梅花', value: `🌸${this.levelSystem.getTotalStars()}`, color: '#CC3333' },
    ];

    stats.forEach((stat, i) => {
      const x = width * (i + 0.5) / stats.length;
      const y = height - 28;
      this.add.text(x, y - 10, stat.value, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: stat.color,
      }).setOrigin(0.5);
      this.add.text(x, y + 12, stat.label, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '13px', color: '#8B6914',
      }).setOrigin(0.5);
    });
  }

  private renderLevelGrid(animate: boolean = false) {
    this.gridContainer.removeAll(true);
    this.levelCards = [];

    const levels = LEVEL_CONFIGS.filter(l => l.module === this.selectedModule);
    const cardW = 360;
    const cardH = 88;
    const colGap = 20;
    const rowGap = 12;
    const startX = (800 - (cardW * 2 + colGap)) / 2;

    levels.forEach((level, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (cardW + colGap);
      const y = row * (cardH + rowGap);

      const card = this.createLevelCard(x, y, cardW, cardH, level);
      this.gridContainer.add(card);
      this.levelCards.push(card);

      if (animate) {
        card.setAlpha(0);
        card.setScale(0.88);
        this.tweens.add({
          targets: card,
          alpha: 1, scaleX: 1, scaleY: 1,
          duration: 280, delay: index * 45, ease: 'Back.easeOut',
        });
      }
    });

    const totalRows = Math.ceil(levels.length / 2);
    const gridHeight = totalRows * (cardH + rowGap);
    const visibleHeight = 330;
    this.maxScrollY = Math.max(0, gridHeight - visibleHeight);
    this.scrollY = 0;
    this.gridContainer.y = 118;
  }

  private createLevelCard(x: number, y: number, w: number, h: number, level: LevelConfig): GameObjects.Container {
    const container = this.add.container(x + w / 2, y + h / 2);

    const progress = this.levelSystem.getLevelProgress(level.id);
    const isUnlocked = this.levelSystem.isLevelUnlocked(level.id);
    const halfW = w / 2;
    const halfH = h / 2;

    const bg = this.add.graphics();
    if (!isUnlocked) {
      bg.fillStyle(0x9CA3AF, 0.4);
    } else {
      bg.fillStyle(0xFFFFFF, 0.95);
    }
    bg.fillRoundedRect(-halfW, -halfH, w, h, 12);
    if (isUnlocked) {
      bg.lineStyle(2, 0xCC3333, 0.3);
      bg.strokeRoundedRect(-halfW, -halfH, w, h, 12);
    }

    const idText = this.add.text(-halfW + 12, -halfH + 12, `#${level.id}`, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '13px', color: isUnlocked ? '#9CA3AF' : '#D1D5DB',
    });
    const nameText = this.add.text(-halfW + 12, -halfH + 30, level.name, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '18px', color: isUnlocked ? '#2C1810' : '#9CA3AF',
    });
    const descText = this.add.text(-halfW + 12, -halfH + 56, level.description, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '13px', color: isUnlocked ? '#8B6914' : '#D1D5DB',
    });

    const diffColors = ['#22C55E', '#3B82F6', '#EAB308', '#F97316', '#EF4444'];
    const diffColor = diffColors[level.difficulty - 1] || '#6B7280';
    const diffText = this.add.text(halfW - 10, -halfH + 10, '✦'.repeat(level.difficulty), {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '13px', color: diffColor,
    }).setOrigin(1, 0);

    let progressText: GameObjects.Text | null = null;
    if (progress) {
      progressText = this.add.text(halfW - 10, halfH - 10, '🌸'.repeat(progress.stars) + '○'.repeat(3 - progress.stars), {
        fontSize: '13px',
      }).setOrigin(1, 1);
    } else if (isUnlocked) {
      progressText = this.add.text(halfW - 10, halfH - 10, '未开始', {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '12px', color: '#9CA3AF',
      }).setOrigin(1, 1);
    }

    let lockText: GameObjects.Text | null = null;
    if (!isUnlocked) {
      lockText = this.add.text(0, 0, '🔒', { fontSize: '24px' }).setOrigin(0.5);
    }

    const elements: GameObjects.GameObject[] = [bg, idText, nameText, descText, diffText];
    if (progressText) elements.push(progressText);
    if (lockText) elements.push(lockText);
    container.add(elements);

    container.setSize(w, h);
    if (isUnlocked) {
      container.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      });
      container.on('pointerdown', () => this.launchLevel(level));
      container.on('pointerover', () => {
        this.tweens.killTweensOf(container);
        this.tweens.add({ targets: container, scaleX: 1.03, scaleY: 1.03, duration: 100 });
      });
      container.on('pointerout', () => {
        this.tweens.killTweensOf(container);
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
      });
    }
    return container;
  }

  private launchLevel(level: LevelConfig) {
    SoundManager.playClick();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ChineseGame', {
        level: level.id,
        type: level.type,
        module: level.module,
        useTimer: false,
        useLives: false,
      });
    });
  }
}
