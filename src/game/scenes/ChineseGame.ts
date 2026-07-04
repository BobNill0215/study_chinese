import Phaser, { Scene, GameObjects } from 'phaser';
import { LEVEL_CONFIGS, LevelSystem, type LevelConfig } from '../utils/LevelSystem';
import { QuestionGenerator, type Question } from '../utils/QuestionGenerator';
import { DifficultyManager } from '../utils/DifficultyManager';
import { SoundManager } from '../utils/SoundManager';
import { RewardEffects } from '../utils/RewardEffects';
import { CLASSIC_PASSAGES, type ClassicPassage } from '../data/classics';
import { SpeechManager } from '../utils/SpeechManager';
import { Settings } from '../utils/Settings';

interface GameData {
  level: number;
  type: string;
  module: string;
  useTimer?: boolean;
  useLives?: boolean;
}

interface RecitationItem {
  lines: string[];
  target: string;
}

export class ChineseGame extends Scene {
  private levelConfig!: LevelConfig;
  private levelSystem!: LevelSystem;
  private difficultyMgr!: DifficultyManager;
  private questions: Question[] = [];
  private currentQuestion: Question | null = null;
  private questionIndex: number = 0;

  private score: number = 0;
  private correctCount: number = 0;
  private combo: number = 0;
  private lives: number = 3;
  private startTime: number = 0;

  // UI elements
  private scoreText!: GameObjects.Text;
  private comboText!: GameObjects.Text;
  private progressText!: GameObjects.Text;
  private livesText!: GameObjects.Text;
  private promptText!: GameObjects.Text;
  private displayLines: GameObjects.Text[] = [];
  private optionButtons: GameObjects.Container[] = [];
  private contentArea!: GameObjects.Container;
  private feedbackText!: GameObjects.Text;

  // 朗读模式
  private isSpeechMode: boolean = false;
  private recitationItems: RecitationItem[] = [];
  private recitationIndex: number = 0;
  private currentTarget: string = '';
  private isRecording: boolean = false;
  private recordedText: string = '';
  private playBtn!: GameObjects.Text;
  private recordBtn!: GameObjects.Container;
  private recordLabel!: GameObjects.Text;
  private recogResultText!: GameObjects.Text;
  private playCaptureBtn!: GameObjects.Text;
  private hasCapture: boolean = false;
  private nextBtn!: GameObjects.Text;

  constructor() {
    super('ChineseGame');
  }

  init(data: GameData) {
    this.levelConfig = LEVEL_CONFIGS.find(l => l.id === data.level)!;
    this.levelSystem = new LevelSystem();
    this.difficultyMgr = new DifficultyManager(this.levelConfig.difficulty);
    this.questionIndex = 0;
    this.recitationIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.combo = 0;
    this.lives = data.useLives ? 3 : 999;
    this.startTime = Date.now();
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.fadeIn(300);

    // 宣纸背景
    const bg = this.add.graphics();
    bg.fillStyle(0xF5E6C8, 1);
    bg.fillRect(0, 0, width, height);

    // 顶部栏 (y: 0~80)
    this.createTopBar(width);
    // 内容区域 (y: 80~480)
    this.contentArea = this.add.container(0, 0);
    // 底部栏 (y: 540~600)
    this.createBottomBar(width, height);

    // 判断是否启用朗读模式（蒙学经典）
    this.isSpeechMode = this.levelConfig.module === 'classics';

    if (this.isSpeechMode) {
      this.initRecitationMode(width);
    } else {
      // 标准出题模式（Settings 覆盖 problemsCount）
      const count = Settings.getQuestionsForLevel(this.levelConfig.id, this.levelConfig.problemsCount);
      this.questions = QuestionGenerator.generateQuestions(this.levelConfig.id, count);
      if (this.questions.length === 0) {
        this.questions = [{
          type: 'choice',
          prompt: '暂时没有题目',
          options: ['好的'],
          correctIndex: 0,
        }];
      }
      this.showQuestion(0);
    }
  }

  // ========== 朗读模式 (蒙学经典) ==========

  private initRecitationMode(width: number) {
    const passage = CLASSIC_PASSAGES.find(p => p.id === this.levelConfig.sourceId);
    if (!passage) {
      this.fallbackToStandard();
      return;
    }

    // 将 passage 的 lines 分段：每 2 句一组（三字经/弟子规=12字，千字文/百家姓≈10字）
    this.recitationItems = this.buildRecitationItems(passage);

    if (this.recitationItems.length === 0) {
      this.fallbackToStandard();
      return;
    }

    // 显示第一题
    this.showRecitationQuestion(0);
  }

  private buildRecitationItems(passage: ClassicPassage): RecitationItem[] {
    const items: RecitationItem[] = [];
    const groupSize = passage.source === '三字经' || passage.source === '弟子规' ? 2 : 1;

    for (let i = 0; i < passage.lines.length; i += groupSize) {
      const chunk = passage.lines.slice(i, i + groupSize);
      const target = chunk.join('。') + '。';
      items.push({ lines: chunk, target });
    }
    return items;
  }

  private showRecitationQuestion(index: number) {
    this.recitationIndex = index;
    if (index >= this.recitationItems.length) {
      this.levelComplete();
      return;
    }

    const item = this.recitationItems[index];
    this.currentTarget = item.target;
    this.recordedText = '';
    this.isRecording = false;
    this.hasCapture = false;
    this.progressText.setText(`${index + 1}/${this.recitationItems.length}`);

    // 清空内容区
    this.contentArea.removeAll(true);
    this.displayLines = [];
    this.optionButtons = [];
    this.feedbackText.setAlpha(0);

    const width = this.cameras.main.width;

    // 提示
    const prompt = this.add.text(width / 2, 85, '📖 请跟读以下句子：', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#8B6914',
    }).setOrigin(0.5);
    this.contentArea.add(prompt);

    // 句子卡片
    const cardW = width - 80;
    const cardX = (width - cardW) / 2;
    const cardBg = this.add.graphics();
    const lineCount = item.lines.length;
    // 每行约 36px + padding
    const cardH = Math.max(90, 40 + lineCount * 36);
    const cardY = 120;

    cardBg.fillStyle(0xFFFFFF, 0.9);
    cardBg.fillRoundedRect(cardX, cardY, cardW, cardH, 12);
    cardBg.lineStyle(2, 0xD4A574, 0.6);
    cardBg.strokeRoundedRect(cardX, cardY, cardW, cardH, 12);
    this.contentArea.add(cardBg);

    // 句子文本
    item.lines.forEach((line, i) => {
      const t = this.add.text(width / 2, cardY + 24 + i * 36, line, {
        fontFamily: 'KaiTi, STKaiti, SimSun, serif',
        fontSize: '30px',
        color: '#2C1810',
        stroke: '#D4A574',
        strokeThickness: 1,
      }).setOrigin(0.5);
      this.contentArea.add(t);
      this.displayLines.push(t);
    });

    // 操作按钮区域 (y: cardY + cardH + 30)
    const btnY = cardY + cardH + 40;
    this.hasCapture = false;

    // ── 播放(TTS)按钮 ──
    this.playBtn = this.add.text(width / 2 - 90, btnY, '🔊 播放', {
      fontFamily: 'KaiTi, STKaiti, serif',
      fontSize: '22px',
      color: '#5C3A1E',
      backgroundColor: '#FFFFFF',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.playBtn.on('pointerdown', () => {
      SpeechManager.speak(item.lines.join('，'));
      this.playBtn.setText('🔊 播放中…');
      this.time.delayedCall(item.target.length * 150, () => {
        this.playBtn.setText('🔊 播放');
      });
    });
    this.contentArea.add(this.playBtn);

    // ── 录音按钮（Container）──
    this.recordBtn = this.add.container(width / 2 + 90, btnY);
    const recW = 170;
    const recH = 52;
    const recBg = this.add.graphics();
    recBg.fillStyle(0xCC3333, 1);
    recBg.fillRoundedRect(-recW / 2, -recH / 2, recW, recH, 26);
    this.recordLabel = this.add.text(0, 0, '🎤 按住录音', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#FFFFFF',
      stroke: '#000000', strokeThickness: 1,
    }).setOrigin(0.5);
    this.recordBtn.add([recBg, this.recordLabel]);
    this.recordBtn.setSize(recW, recH);
    this.recordBtn.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, recW, recH),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.recordBtn.on('pointerdown', () => this.onRecordStart(recBg));
    this.recordBtn.on('pointerup', () => this.onRecordEnd(recBg));
    this.recordBtn.on('pointerout', () => {
      if (this.isRecording) this.onRecordEnd(recBg);
    });
    this.contentArea.add(this.recordBtn);

    // ── 播放录音按钮（灰色 = 未录音，录音后亮起）──
    this.playCaptureBtn = this.add.text(width / 2, btnY + 58, '▶️ 播放录音', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '18px', color: '#AAAAAA',
      backgroundColor: '#E0E0E0', padding: { x: 16, y: 8 },
    }).setOrigin(0.5);
    // 预先绑定点击，等 setInteractive 后生效
    this.playCaptureBtn.on('pointerdown', () => SpeechManager.playCapture());
    this.contentArea.add(this.playCaptureBtn);

    // 识别结果
    this.recogResultText = this.add.text(width / 2, btnY + 108, '', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '18px', color: '#5C3A1E',
    }).setOrigin(0.5);
    this.contentArea.add(this.recogResultText);

    // ── 下一题按钮（录音完成后才显示）──
    this.nextBtn = this.add.text(width / 2, btnY + 148, '下一题 →', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#FFFFFF',
      backgroundColor: '#8B6914', padding: { x: 24, y: 10 },
    }).setOrigin(0.5).setAlpha(0);
    this.nextBtn.on('pointerdown', () => {
      SpeechManager.stopSpeak();
      this.feedbackText.setAlpha(0);
      this.showRecitationQuestion(this.recitationIndex + 1);
    });
    this.contentArea.add(this.nextBtn);
  }

  private onRecordStart(recBg: GameObjects.Graphics) {
    if (this.isRecording) return;
    this.isRecording = true;
    this.recordLabel.setText('🎙️ 录音中…');
    recBg.clear();
    recBg.fillStyle(0x8B0000, 1);
    recBg.fillRoundedRect(-85, -26, 170, 52, 26);
    this.recogResultText.setText('');
    this.nextBtn.setAlpha(0);

    // 录制原始音频
    SpeechManager.startCapture();

    // 语音识别
    SpeechManager.startListening(
      (text) => {
        this.recordedText = text;
        this.onRecordComplete();
      },
      (err) => {
        this.recogResultText.setText(`⚠️ ${err}`);
        this.resetRecordButton();
      }
    );
  }

  private onRecordEnd(_recBg: GameObjects.Graphics) {
    if (!this.isRecording) return;
    SpeechManager.stopListening();
    // 等最多 600ms 让 recognition 的 onresult 回调完成
    this.time.delayedCall(600, () => {
      if (this.isRecording) {
        this.recordedText = '';
        SpeechManager.stopCapture(); // 终止录音，无需保存
        this.onRecordComplete();
      }
    });
  }

  private onRecordComplete() {
    if (!this.isRecording) return;
    this.isRecording = false;

    // 停止原始音频录制，启用播放录音按钮
    SpeechManager.stopCapture((url) => {
      if (url) {
        this.hasCapture = true;
        this.playCaptureBtn.setText('▶️ 播放录音');
        this.playCaptureBtn.setStyle({ color: '#5C3A1E', backgroundColor: '#FFFFFF' });
        this.playCaptureBtn.setInteractive({ useHandCursor: true });
      }
    });

    const text = this.recordedText || '（未检测到语音）';
    this.recogResultText.setText(`🗣️ 你说的是：${text}`);

    const similarity = SpeechManager.compareText(text, this.currentTarget);
    const passed = similarity >= 0.6;

    // 显示下一题按钮（用户听完录音后可手动进入下一题）
    this.nextBtn.setAlpha(1);
    this.nextBtn.setInteractive({ useHandCursor: true });

    if (passed) {
      // 成功
      this.score += 10 + this.combo * 2;
      this.correctCount++;
      this.combo++;
      this.difficultyMgr.recordAnswer(true);
      SoundManager.playCorrect();
      if (this.combo === 3) SoundManager.playCombo3();
      if (this.combo === 5) SoundManager.playCombo5();
      this.scoreText.setText(`🏆 ${this.score}`);
      this.comboText.setText(this.combo >= 2 ? `🔥 ${this.combo}连击` : '');

      this.feedbackText.setText('✅ 读得很好！').setColor('#2E7D32');
      this.feedbackText.setAlpha(1);
    } else {
      // 失败
      this.combo = 0;
      this.comboText.setText('');
      this.difficultyMgr.recordAnswer(false);
      SoundManager.playWrong();

      this.feedbackText.setText(`❌ 再试一次  (相似度: ${Math.round(similarity * 100)}%)`).setColor('#C62828');
      this.feedbackText.setAlpha(1);

      this.time.delayedCall(1500, () => {
        this.feedbackText.setAlpha(0);
        this.resetRecordButton();
      });
    }
  }

  private resetRecordButton() {
    this.isRecording = false;
    this.recordLabel.setText('🎤 按住录音');
    const recBg = this.recordBtn.getAt(0) as GameObjects.Graphics;
    recBg.clear();
    recBg.fillStyle(0xCC3333, 1);
    recBg.fillRoundedRect(-85, -26, 170, 52, 26);
  }

  private fallbackToStandard() {
    this.isSpeechMode = false;
    const count = Settings.getQuestionsForLevel(this.levelConfig.id, this.levelConfig.problemsCount);
    this.questions = QuestionGenerator.generateQuestions(this.levelConfig.id, count);
    if (this.questions.length === 0) {
      this.questions = [{
        type: 'choice',
        prompt: '暂时没有题目',
        options: ['好的'],
        correctIndex: 0,
      }];
    }
    this.showQuestion(0);
  }

  private createTopBar(width: number) {
    const g = this.add.graphics();
    g.fillStyle(0x2C1810, 0.1);
    g.fillRect(0, 0, width, 50);
    g.fillStyle(0xCC3333, 0.5);
    g.fillRect(0, 50, width, 2);

    // 分数
    this.scoreText = this.add.text(16, 25, `🏆 ${this.score}`, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#2C1810',
    }).setOrigin(0, 0.5);

    // 关卡名
    const levelName = this.levelConfig ? this.levelConfig.name : '';
    this.add.text(width / 2, 25, `📖 ${levelName}`, {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#2C1810',
    }).setOrigin(0.5);

    // 连击
    this.comboText = this.add.text(width - 16, 25, '', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '18px', color: '#CC3333',
    }).setOrigin(1, 0.5);

    // 生命（无限制模式不显示）
    this.livesText = this.add.text(100, 25, this.lives < 10 ? '❤️'.repeat(this.lives) : '', {
      fontSize: '16px',
    }).setOrigin(0, 0.5);
  }

  private createBottomBar(width: number, height: number) {
    const g = this.add.graphics();
    g.fillStyle(0x2C1810, 0.1);
    g.fillRect(0, height - 55, width, 55);
    g.fillStyle(0xCC3333, 0.4);
    g.fillRect(0, height - 57, width, 2);

    // 返回
    const backBtn = this.add.text(16, height - 28, '← 返回', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '18px', color: '#5C3A1E',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('LevelSelectScene'));
    });

    // 进度（左对齐，不干扰底部居中的反馈文字）
    this.progressText = this.add.text(100, height - 28, '0/0', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '18px', color: '#8B6914',
    }).setOrigin(0, 0.5);

    // 音效
    const soundBtn = this.add.text(width - 16, height - 28, SoundManager.isEnabled() ? '🔊' : '🔇', {
      fontSize: '20px',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    soundBtn.on('pointerdown', () => {
      SoundManager.toggle();
      soundBtn.setText(SoundManager.isEnabled() ? '🔊' : '🔇');
    });

    // 反馈文字（底部居中）
    this.feedbackText = this.add.text(width / 2, height - 28, '', {
      fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#CC3333',
    }).setOrigin(0.5).setAlpha(0);
  }

  private showQuestion(index: number) {
    this.questionIndex = index;
    if (index >= this.questions.length) {
      this.levelComplete();
      return;
    }

    this.currentQuestion = this.questions[index];
    this.progressText.setText(`${index + 1}/${this.questions.length}`);
    this.renderQuestion();
  }

  private renderQuestion() {
    // 清空旧内容
    this.contentArea.removeAll(true);
    this.displayLines = [];
    this.optionButtons = [];
    this.feedbackText.setAlpha(0);

    const q = this.currentQuestion!;
    const width = this.cameras.main.width;

    // 题干区域 (y: 60~170)
    this.promptText = this.add.text(width / 2, 110, q.prompt, {
      fontFamily: 'KaiTi, STKaiti, SimSun, serif',
      fontSize: '22px',
      color: '#2C1810',
      wordWrap: { width: 700, useAdvancedWrap: true },
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);
    this.contentArea.add(this.promptText);

    // 展示行（如诗句填空的显示行）
    if (q.displayLines && q.displayLines.length > 0) {
      q.displayLines.forEach((line, i) => {
        const t = this.add.text(width / 2, 160 + i * 36, line, {
          fontFamily: 'KaiTi, STKaiti, SimSun, serif',
          fontSize: '28px',
          color: '#2C1810',
          stroke: '#D4A574',
          strokeThickness: 1,
        }).setOrigin(0.5);
        this.contentArea.add(t);
        this.displayLines.push(t);
      });
    }

    // 场景图描述（看图猜成语等）
    if (q.storyImages && q.storyImages.length > 0 && q.type === 'image-select') {
      const sceneText = this.add.text(width / 2, 200, q.storyImages[0], {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '20px', color: '#5C3A1E',
        backgroundColor: '#FFFFFF', padding: { x: 16, y: 12 },
        wordWrap: { width: 400, useAdvancedWrap: true }, align: 'center',
      }).setOrigin(0.5);
      this.contentArea.add(sceneText);
    }

    // 象形 emoji
    if (q.pictoEmoji) {
      const emoji = this.add.text(width / 2, 210, q.pictoEmoji, {
        fontSize: '60px',
        backgroundColor: '#FFFFFF', padding: { x: 20, y: 10 },
      }).setOrigin(0.5);
      this.contentArea.add(emoji);
    }

    // 排序/故事的 items
    if (q.items && q.items.length > 0) {
      const itemText = q.items.map((item, i) => `${i + 1}. ${item}`).join('\n');
      const t = this.add.text(width / 2, 200, itemText, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '18px', color: '#5C3A1E',
        backgroundColor: '#FFFFFF', padding: { x: 12, y: 8 },
        align: 'left',
      }).setOrigin(0.5);
      this.contentArea.add(t);
    }

    // 高亮字（找茬题）
    if (q.highlightChar) {
      const t = this.add.text(width / 2, 190, `找出 " ${q.highlightChar} "`, {
        fontFamily: 'KaiTi, STKaiti, serif', fontSize: '24px', color: '#CC3333',
      }).setOrigin(0.5);
      this.contentArea.add(t);
    }

    // 选项按钮 (y: 280~460)
    this.createOptionButtons(q);
  }

  private createOptionButtons(q: Question) {
    const width = this.cameras.main.width;
    const baseY = q.displayLines?.length ? 280 : q.pictoEmoji ? 310 : q.storyImages?.length ? 310 : 240;
    const cols = 2;
    const btnW = 280;
    const btnH = 76;
    const gapX = 24;
    const gapY = 14;
    const startX = (width - (cols * btnW + (cols - 1) * gapX)) / 2 + btnW / 2;

    q.options.forEach((opt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnW + gapX);
      const y = baseY + row * (btnH + gapY);

      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(0xFFFFFF, 0.95);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);
      bg.lineStyle(2, 0xD4A574, 0.7);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);

      const label = this.add.text(0, 0, opt, {
        fontFamily: 'KaiTi, STKaiti, SimSun, serif',
        fontSize: opt.length > 6 ? '18px' : '22px',
        color: '#2C1810',
        wordWrap: { width: btnW - 20, useAdvancedWrap: true },
        align: 'center',
      }).setOrigin(0.5);

      container.add([bg, label]);
      container.setSize(btnW, btnH);
      container.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, btnW, btnH),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      });

      container.on('pointerdown', () => this.handleAnswer(opt, container));
      container.on('pointerover', () => {
        this.tweens.killTweensOf(container);
        this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
      });
      container.on('pointerout', () => {
        this.tweens.killTweensOf(container);
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
      });

      this.contentArea.add(container);
      this.optionButtons.push(container);
    });
  }

  private handleAnswer(selected: string, btn: GameObjects.Container) {
    const q = this.currentQuestion!;
    const isCorrect = selected === q.options[q.correctIndex];

    // 禁用所有按钮
    this.optionButtons.forEach(b => b.disableInteractive());

    if (isCorrect) {
      this.score += 10 + this.combo * 2;
      this.correctCount++;
      this.combo++;
      this.difficultyMgr.recordAnswer(true);
      SoundManager.playCorrect();
      if (this.combo === 3) SoundManager.playCombo3();
      if (this.combo === 5) SoundManager.playCombo5();

      this.scoreText.setText(`🏆 ${this.score}`);
      this.comboText.setText(this.combo >= 2 ? `🔥 ${this.combo}连击` : '');

      // 正确反馈
      const bg = btn.getAt(0) as GameObjects.Graphics;
      bg.clear();
      bg.fillStyle(0x4CAF50, 0.9);
      bg.fillRoundedRect(-140, -38, 280, 76, 10);
      bg.lineStyle(3, 0x388E3C, 1);
      bg.strokeRoundedRect(-140, -38, 280, 76, 10);

      RewardEffects.playCorrectEffect(this, btn.x, btn.y);
      this.feedbackText.setText('✓ 正确！').setColor('#2E7D32');
      this.feedbackText.setAlpha(1);

      // 自动切换
      this.time.delayedCall(800, () => {
        this.feedbackText.setAlpha(0);
        this.showQuestion(this.questionIndex + 1);
      });
    } else {
      this.combo = 0;
      this.lives--;
      this.comboText.setText('');
      this.difficultyMgr.recordAnswer(false);
      SoundManager.playWrong();

      const bg = btn.getAt(0) as GameObjects.Graphics;
      bg.clear();
      bg.fillStyle(0xEF5350, 0.9);
      bg.fillRoundedRect(-140, -38, 280, 76, 10);
      bg.lineStyle(3, 0xC62828, 1);
      bg.strokeRoundedRect(-140, -38, 280, 76, 10);

      RewardEffects.playWrongEffect(this, btn.x, btn.y);
      this.feedbackText.setText(`✗ 正确答案：${q.options[q.correctIndex]}`).setColor('#C62828');
      this.feedbackText.setAlpha(1);

      if (this.lives <= 0) {
        this.time.delayedCall(1200, () => this.levelComplete());
      } else {
        this.livesText.setText('❤️'.repeat(this.lives));
        this.time.delayedCall(1500, () => {
          this.feedbackText.setAlpha(0);
          this.showQuestion(this.questionIndex + 1);
        });
      }
    }
  }

  /** 场景关闭时清理定时器 + 语音 + 录音，防止跳转后回调仍执行 */
  shutdown() {
    this.time.removeAllEvents();
    SpeechManager.stopListening();
    SpeechManager.stopSpeak();
    SpeechManager.stopCapture();
    this.isRecording = false;
  }

  private levelComplete() {
    const totalTime = (Date.now() - this.startTime) / 1000;
    const accuracy = this.questions.length > 0 ? Math.round((this.correctCount / this.questions.length) * 100) : 0;
    const stars = accuracy >= 95 ? 3 : accuracy >= 80 ? 2 : 1;

    // 保存进度
    this.levelSystem.completeLevel(this.levelConfig.id, this.score, accuracy, totalTime);

    // 切换到结算场景
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LevelComplete', {
        level: this.levelConfig.id,
        module: this.levelConfig.module,
        type: this.levelConfig.type,
        score: this.score,
        correct: this.correctCount,
        total: this.questions.length,
        stars,
        accuracy,
        rating: stars >= 3 ? '🌸🌸🌸' : stars >= 2 ? '🌸🌸' : '🌸',
      });
    });
  }
}
