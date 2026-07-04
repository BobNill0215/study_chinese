import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { ChineseGame } from './scenes/ChineseGame';
import { LevelComplete } from './scenes/LevelComplete';
import { ReportScene } from './scenes/ReportScene';

// 游戏配置
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#F5E6C8', // 宣纸米黄底色
  scale: {
    mode: Phaser.Scale.FIT,
    // 不用 CENTER_BOTH——由 #game-container 的 flex 居中负责画布定位
    autoCenter: Phaser.Scale.NO_CENTER,
    min: {
      width: 400,
      height: 300,
    },
    max: {
      width: 1600,
      height: 1200,
    },
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    LevelSelectScene,
    ReportScene,
    ChineseGame,
    LevelComplete,
  ],
};

// 创建游戏实例的工厂函数
export const createGame = (parent: string) => {
  return new Phaser.Game({
    ...gameConfig,
    parent,
  });
};
