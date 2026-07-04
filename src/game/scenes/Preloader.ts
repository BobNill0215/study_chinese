import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 宣纸背景
    this.add.rectangle(width / 2, height / 2, width, height, 0xF5E6C8);

    // 标题
    this.add.text(width / 2, height / 2 - 80, '国学小书房', {
      fontFamily: 'KaiTi, STKaiti, SimSun, STSong, serif',
      fontSize: '48px',
      color: '#2C1810',
    }).setOrigin(0.5);

    // 进度条背景（卷轴样式）
    const barBg = this.add.graphics();
    barBg.fillStyle(0xD4A574, 0.6);
    barBg.fillRoundedRect(width / 2 - 180, height / 2 + 10, 360, 20, 10);
    barBg.lineStyle(2, 0x8B6914, 0.8);
    barBg.strokeRoundedRect(width / 2 - 180, height / 2 + 10, 360, 20, 10);

    // 进度条（朱红色）
    const progressBar = this.add.rectangle(width / 2 - 178, height / 2 + 20, 4, 16, 0xCC3333);
    progressBar.setOrigin(0, 0.5);

    // 加载文字
    const loadingText = this.add.text(width / 2, height / 2 + 50, '墨迹晕染中……', {
      fontFamily: 'KaiTi, STKaiti, serif',
      fontSize: '18px',
      color: '#8B6914',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.width = 356 * value;
      if (value >= 1) {
        loadingText.setText('加载完成！');
      }
    });

    this.loadAssets();
  }

  private loadAssets() {
    // 目前使用程序生成的图形，后续可以添加真实素材
    // this.load.image('plum', 'assets/images/plum.png');
    // this.load.audio('correct', 'assets/audio/correct.mp3');
    // this.load.audio('wrong', 'assets/audio/wrong.mp3');
  }

  create() {
    // 淡入过渡到主菜单
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenu');
    });
  }
}
