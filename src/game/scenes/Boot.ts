import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // 加载加载界面所需的最小资源
  }

  create() {
    this.scene.start('Preloader');
  }
}
