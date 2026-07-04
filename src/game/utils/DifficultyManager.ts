/**
 * 动态难度调整
 * 根据玩家表现调整题目难度
 */

export class DifficultyManager {
  private currentDifficulty: number = 1;
  private consecutiveCorrect: number = 0;
  private consecutiveWrong: number = 0;
  private recentScores: number[] = [];
  private maxHistory = 10;

  constructor(startDifficulty: number = 1) {
    this.currentDifficulty = startDifficulty;
  }

  /** 记录答题结果，返回调整后的难度 */
  recordAnswer(isCorrect: boolean): number {
    if (isCorrect) {
      this.consecutiveCorrect++;
      this.consecutiveWrong = 0;
    } else {
      this.consecutiveWrong++;
      this.consecutiveCorrect = 0;
    }

    this.recentScores.push(isCorrect ? 1 : 0);
    if (this.recentScores.length > this.maxHistory) {
      this.recentScores.shift();
    }

    this.adjustDifficulty();
    return this.currentDifficulty;
  }

  private adjustDifficulty() {
    // 连续答对 3 题 → 提升难度
    if (this.consecutiveCorrect >= 3 && this.currentDifficulty < 5) {
      this.currentDifficulty++;
      this.consecutiveCorrect = 0;
    }
    // 连续答错 2 题 → 降低难度
    if (this.consecutiveWrong >= 2 && this.currentDifficulty > 1) {
      this.currentDifficulty--;
      this.consecutiveWrong = 0;
    }
  }

  getDifficulty(): number {
    return this.currentDifficulty;
  }

  getRecentAccuracy(): number {
    if (this.recentScores.length === 0) return 1;
    const sum = this.recentScores.reduce((a, b) => a + b, 0);
    return sum / this.recentScores.length;
  }

  reset(difficulty: number = 1) {
    this.currentDifficulty = difficulty;
    this.consecutiveCorrect = 0;
    this.consecutiveWrong = 0;
    this.recentScores = [];
  }
}
