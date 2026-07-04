import Phaser, { Scene, GameObjects } from 'phaser';
import { LevelSystem, LEVEL_CONFIGS } from '../utils/LevelSystem';

export class ReportScene extends Scene {
  private levelSystem!: LevelSystem;

  constructor() {
    super('ReportScene');
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
    // 总览卡片
    this.createOverviewCards(width);
    // 模块进度
    this.createModuleProgress(width);
    // 学习建议
    this.createTips(width);
    // 汉字银行/古诗库/成语库 + 重置
    this.createBottomSection(width, height);
  }

  private createTopBar(width: number) {
    const topBar = this.add.graphics();
    topBar.fillStyle(0x2C1810, 0.1);
    topBar.fillRect(0, 0, width, 48);
    topBar.fillStyle(0xCC3333, 0.4);
    topBar.fillRect(0, 48, width, 2);

    const backBtn = this.add.text(18, 25, '← 返回', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#5C3A1E',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainMenu'));
    });
    backBtn.on('pointerover', () => backBtn.setColor('#CC3333'));
    backBtn.on('pointerout', () => backBtn.setColor('#5C3A1E'));

    this.add.text(width / 2, 25, '📊 学习报告', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '24px', color: '#2C1810',
      stroke: '#000000', strokeThickness: 1,
    }).setOrigin(0.5);
  }

  private createOverviewCards(width: number) {
    const totalScore = this.levelSystem.getTotalScore();
    const avgAccuracy = Math.round(this.levelSystem.getAverageAccuracy());
    const totalStars = this.levelSystem.getTotalStars();
    const completedLevels = LEVEL_CONFIGS.filter(l => this.levelSystem.getLevelProgress(l.id)?.completed).length;

    const cards = [
      { label: '总分', value: totalScore.toString(), color: '#5C3A1E' },
      { label: '正确率', value: `${avgAccuracy}%`, color: '#2E7D32' },
      { label: '梅花', value: `🌸${totalStars}`, color: '#CC3333' },
      { label: '完成', value: `${completedLevels}/${LEVEL_CONFIGS.length}`, color: '#8B4513' },
    ];

    const cardW = 170;
    const gap = 20;
    const totalW = cards.length * cardW + (cards.length - 1) * gap;
    const startX = (width - totalW) / 2;

    cards.forEach((card, i) => {
      const x = startX + i * (cardW + gap);
      const y = 65;

      const cardBg = this.add.graphics();
      cardBg.fillStyle(0xFFFFFF, 0.9);
      cardBg.fillRoundedRect(x, y, cardW, 70, 12);
      cardBg.lineStyle(1, 0xD4A574, 0.5);
      cardBg.strokeRoundedRect(x, y, cardW, 70, 12);

      this.add.text(x + cardW / 2, y + 26, card.value, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '22px', color: card.color,
      }).setOrigin(0.5);

      this.add.text(x + cardW / 2, y + 52, card.label, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '13px', color: '#8B6914',
      }).setOrigin(0.5);
    });
  }

  private createModuleProgress(width: number) {
    const modules = [
      { name: '蒙学经典', moduleKey: 'classics', icon: '📜' },
      { name: '古诗词', moduleKey: 'poetry', icon: '📝' },
      { name: '成语故事', moduleKey: 'idiom', icon: '📚' },
      { name: '汉字启蒙', moduleKey: 'char', icon: '🖌️' },
      { name: '传统文化', moduleKey: 'culture', icon: '🏮' },
    ];

    // 面板背景
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xFFFFFF, 0.9);
    panelBg.fillRoundedRect(16, 150, width - 32, 195, 14);
    panelBg.lineStyle(1, 0xD4A574, 0.5);
    panelBg.strokeRoundedRect(16, 150, width - 32, 195, 14);

    this.add.text(34, 158, '📊 各模块学习进度', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '17px', color: '#2C1810',
    });

    modules.forEach((mod, idx) => {
      const progress = this.levelSystem.getModuleProgress(mod.moduleKey);
      const progressPct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

      const rowY = 188 + idx * 35;

      this.add.text(40, rowY, `${mod.icon} ${mod.name}`, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '14px', color: '#5C3A1E',
      });

      // 进度条背景
      const barBg = this.add.graphics();
      barBg.fillStyle(0xE8D5C4, 1);
      barBg.fillRoundedRect(160, rowY - 4, 340, 12, 6);

      // 进度条填充 - 朱红色
      if (progressPct > 0) {
        const barFill = this.add.graphics();
        barFill.fillStyle(0xCC3333, 1);
        barFill.fillRoundedRect(160, rowY - 4, 340 * (progressPct / 100), 12, 6);
      }

      this.add.text(510, rowY, `${progress.completed}/${progress.total} 关`, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '12px', color: '#8B6914',
      }).setOrigin(0, 0.5);

      this.add.text(600, rowY, `🌸${progress.stars}`, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '12px', color: '#CC3333',
      });

      this.add.text(650, rowY, `${progressPct}%`, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '13px',
        color: progressPct >= 80 ? '#2E7D32' : progressPct >= 40 ? '#EAB308' : '#CC3333',
      });
    });
  }

  private createTips(width: number) {
    const avgAccuracy = Math.round(this.levelSystem.getAverageAccuracy());
    const totalStars = this.levelSystem.getTotalStars();
    const completedLevels = LEVEL_CONFIGS.filter(l => this.levelSystem.getLevelProgress(l.id)?.completed).length;

    const tips: { text: string; borderColor: number }[] = [];

    if (avgAccuracy < 60) {
      tips.push({ text: '📖 正确率较低，建议从蒙学经典或汉字启蒙开始巩固基础。', borderColor: 0xF97316 });
    }
    if (avgAccuracy >= 80 && completedLevels >= LEVEL_CONFIGS.length * 0.3) {
      tips.push({ text: '🌟 学得很好！试试成语故事和古诗词模块的挑战吧！', borderColor: 0x22C55E });
    }
    if (totalStars < 20) {
      tips.push({ text: '🎯 还有很多关卡等着你，每天学一点，进步看得见！', borderColor: 0x3B82F6 });
    }
    if (completedLevels >= LEVEL_CONFIGS.length * 0.5) {
      tips.push({ text: '🏆 已经完成一半以上了！继续加油，争取全部通关！', borderColor: 0xA855F7 });
    }
    tips.push({ text: '📝 建议每天学习15-20分钟，保持兴趣最重要哦！', borderColor: 0x6B7280 });

    // 在 module progress 下方直接显示
    tips.forEach((tip, idx) => {
      if (idx >= 2) return;
      const tipY = 360 + idx * 26;
      const tipBg = this.add.graphics();
      tipBg.fillStyle(0xFFFFFF, 0.8);
      tipBg.fillRoundedRect(20, tipY, width - 40, 22, 6);
      const border = this.add.graphics();
      border.fillStyle(tip.borderColor, 1);
      border.fillRoundedRect(20, tipY, 4, 22, 2);

      this.add.text(32, tipY + 11, tip.text, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '12px', color: '#5C3A1E',
      }).setOrigin(0, 0.5);
    });
  }

  private createBottomSection(width: number, height: number) {
    // 学习成就栏
    const panelY = 405;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xFFFFFF, 0.9);
    panelBg.fillRoundedRect(16, panelY, width - 32, 90, 14);
    panelBg.lineStyle(1, 0xD4A574, 0.5);
    panelBg.strokeRoundedRect(16, panelY, width - 32, 90, 14);

    this.add.text(34, panelY + 8, '📚 学习成就', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '16px', color: '#2C1810',
    });

    const learnedPoems = this.levelSystem.getLearnedPoems();
    const learnedIdioms = this.levelSystem.getLearnedIdioms();

    const achivements = [
      { icon: '🖌️', label: '已学汉字', value: `${this.levelSystem.getModuleProgress('char').completed} 关` },
      { icon: '📝', label: '古诗积累', value: `${learnedPoems.length} 首` },
      { icon: '📚', label: '成语掌握', value: `${learnedIdioms.length} 篇` },
    ];

    achivements.forEach((ach, i) => {
      const x = width * (i + 0.5) / 3;
      const y = panelY + 55;
      this.add.text(x - 40, y, ach.icon, { fontSize: '20px' }).setOrigin(0, 0.5);
      this.add.text(x - 10, y, `${ach.label}: ${ach.value}`, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '14px', color: '#5C3A1E',
      }).setOrigin(0, 0.5);
    });

    // 重置按钮
    const resetBtn = this.add.text(width / 2, height - 20, '🔄 重置所有进度', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '14px', color: '#EF4444',
      backgroundColor: '#FFFFFF', padding: { x: 12, y: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resetBtn.on('pointerover', () => resetBtn.setColor('#DC2626'));
    resetBtn.on('pointerout', () => resetBtn.setColor('#EF4444'));
    resetBtn.on('pointerdown', () => {
      const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5).setInteractive();
      const dialog = this.add.graphics();
      dialog.fillStyle(0xFFFFFF, 1);
      dialog.fillRoundedRect(200, 220, 400, 160, 20);

      const confirmText = this.add.text(400, 260, '确定要重置所有学习进度吗？\n此操作不可恢复！', {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#2C1810',
        align: 'center', lineSpacing: 8,
      }).setOrigin(0.5);

      const cancelBtn = this.add.text(300, 340, '取消', {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#6B7280',
        padding: { x: 20, y: 8 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      cancelBtn.on('pointerdown', () => {
        overlay.destroy(); dialog.destroy(); confirmText.destroy();
        cancelBtn.destroy(); okBtn.destroy();
      });

      const okBtn = this.add.text(500, 340, '确定重置', {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#FFFFFF',
        backgroundColor: '#EF4444', padding: { x: 20, y: 8 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      okBtn.on('pointerdown', () => {
        this.levelSystem.resetProgress();
        this.scene.restart();
      });
    });
  }
}
