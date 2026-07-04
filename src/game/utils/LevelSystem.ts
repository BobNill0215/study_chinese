/**
 * 关卡系统
 * 管理关卡进度、解锁条件、奖励
 */

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  module: 'classics' | 'poetry' | 'idiom' | 'char' | 'culture';
  type: 'fill-blank' | 'match-pair' | 'sequence' | 'image-select' | 'classify' | 'drag-match' | 'find-diff' | 'chain' | 'sort' | 'story-sort' | 'choice';
  difficulty: number;
  requiredScore: number;
  requiredAccuracy: number;
  problemsCount: number;
  sourceId?: string;         // 关联内容 ID
  timeLimit?: number;
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  score: number;
  accuracy: number;
  stars: number;
  bestTime?: number;
}

// ========== 关卡配置 ==========
export const LEVEL_CONFIGS: LevelConfig[] = [
  // ===== 模块1：蒙学经典 =====
  { id: 1,  name: '三字经·人之初',   description: '人之初，性本善', module: 'classics', type: 'fill-blank', difficulty: 1, requiredScore: 0,   requiredAccuracy: 0,   problemsCount: 8,  sourceId: 'sanzi-01' },
  { id: 2,  name: '三字经·昔孟母',   description: '昔孟母，择邻处', module: 'classics', type: 'sequence',   difficulty: 2, requiredScore: 50,  requiredAccuracy: 60, problemsCount: 8,  sourceId: 'sanzi-02' },
  { id: 3,  name: '三字经·养不教',   description: '养不教，父之过', module: 'classics', type: 'fill-blank', difficulty: 2, requiredScore: 80,  requiredAccuracy: 60, problemsCount: 8,  sourceId: 'sanzi-03' },
  { id: 4,  name: '弟子规·父母呼',   description: '父母呼，应勿缓', module: 'classics', type: 'match-pair',  difficulty: 1, requiredScore: 0,   requiredAccuracy: 0,   problemsCount: 8,  sourceId: 'dizigui-01' },
  { id: 5,  name: '弟子规·冬则温',   description: '冬则温，夏则凊', module: 'classics', type: 'fill-blank', difficulty: 2, requiredScore: 80,  requiredAccuracy: 60, problemsCount: 8,  sourceId: 'dizigui-02' },
  { id: 6,  name: '弟子规·事虽小',   description: '事虽小，勿擅为', module: 'classics', type: 'classify',    difficulty: 2, requiredScore: 100, requiredAccuracy: 65, problemsCount: 8,  sourceId: 'dizigui-03' },
  { id: 7,  name: '千字文·天地玄黄', description: '天地玄黄，宇宙洪荒', module: 'classics', type: 'fill-blank', difficulty: 3, requiredScore: 120, requiredAccuracy: 65, problemsCount: 8,  sourceId: 'qianziwen-01' },
  { id: 8,  name: '千字文·云腾致雨', description: '云腾致雨，露结为霜', module: 'classics', type: 'sequence',   difficulty: 3, requiredScore: 150, requiredAccuracy: 70, problemsCount: 8,  sourceId: 'qianziwen-02' },
  { id: 9,  name: '百家姓·赵钱孙李', description: '赵钱孙李，周吴郑王', module: 'classics', type: 'choice',     difficulty: 1, requiredScore: 0,   requiredAccuracy: 0,   problemsCount: 8,  sourceId: 'baijiaxing-01' },
  { id: 10, name: '百家姓·戚谢邹喻', description: '戚谢邹喻，柏水窦章', module: 'classics', type: 'match-pair',  difficulty: 2, requiredScore: 50,  requiredAccuracy: 60, problemsCount: 8,  sourceId: 'baijiaxing-02' },

  // ===== 模块2：古诗词 =====
  { id: 11, name: '唐诗五言·静夜思', description: '床前明月光', module: 'poetry', type: 'fill-blank', difficulty: 1, requiredScore: 0,   requiredAccuracy: 0,   problemsCount: 8,  sourceId: 'poem-01' },
  { id: 12, name: '唐诗五言·春晓',   description: '春眠不觉晓', module: 'poetry', type: 'match-pair',  difficulty: 1, requiredScore: 50,  requiredAccuracy: 60, problemsCount: 8,  sourceId: 'poem-02' },
  { id: 13, name: '唐诗五言·登楼',   description: '更上一层楼', module: 'poetry', type: 'fill-blank', difficulty: 2, requiredScore: 80,  requiredAccuracy: 60, problemsCount: 8,  sourceId: 'poem-03' },
  { id: 14, name: '唐诗七言·咏柳',   description: '二月春风似剪刀', module: 'poetry', type: 'sequence',   difficulty: 2, requiredScore: 100, requiredAccuracy: 65, problemsCount: 8,  sourceId: 'poem-11' },
  { id: 15, name: '唐诗七言·瀑布',   description: '疑是银河落九天', module: 'poetry', type: 'fill-blank', difficulty: 2, requiredScore: 120, requiredAccuracy: 65, problemsCount: 8,  sourceId: 'poem-12' },
  { id: 16, name: '唐诗七言·绝句',   description: '两个黄鹂鸣翠柳', module: 'poetry', type: 'image-select', difficulty: 3, requiredScore: 150, requiredAccuracy: 70, problemsCount: 8,  sourceId: 'poem-13' },
  { id: 17, name: '宋诗·元日',       description: '总把新桃换旧符', module: 'poetry', type: 'fill-blank', difficulty: 2, requiredScore: 120, requiredAccuracy: 65, problemsCount: 8,  sourceId: 'poem-19' },
  { id: 18, name: '宋诗·西林壁',     description: '只缘身在此山中', module: 'poetry', type: 'classify',    difficulty: 3, requiredScore: 150, requiredAccuracy: 70, problemsCount: 8,  sourceId: 'poem-20' },
  { id: 19, name: '诗词赏析·季节',   description: '诗歌的季节分类', module: 'poetry', type: 'classify',    difficulty: 2, requiredScore: 100, requiredAccuracy: 65, problemsCount: 10, sourceId: undefined },
  { id: 20, name: '诗词赏析·情感',   description: '诗歌的情感理解', module: 'poetry', type: 'choice',      difficulty: 3, requiredScore: 150, requiredAccuracy: 70, problemsCount: 10, sourceId: undefined },

  // ===== 模块3：成语 =====
  { id: 21, name: '成语初识·动物篇', description: '守株待兔等',      module: 'idiom', type: 'image-select', difficulty: 1, requiredScore: 0,   requiredAccuracy: 0,   problemsCount: 8,  sourceId: undefined },
  { id: 22, name: '成语初识·故事篇', description: '画蛇添足等',      module: 'idiom', type: 'choice',       difficulty: 1, requiredScore: 50,  requiredAccuracy: 60, problemsCount: 8,  sourceId: undefined },
  { id: 23, name: '成语初识·寓意篇', description: '亡羊补牢等',      module: 'idiom', type: 'fill-blank',   difficulty: 2, requiredScore: 80,  requiredAccuracy: 60, problemsCount: 8,  sourceId: undefined },
  { id: 24, name: '成语故事·狐假虎威', description: '狐假虎威的故事', module: 'idiom', type: 'story-sort',   difficulty: 2, requiredScore: 100, requiredAccuracy: 65, problemsCount: 6,  sourceId: 'idiom-06' },
  { id: 25, name: '成语故事·刻舟求剑', description: '刻舟求剑的故事', module: 'idiom', type: 'story-sort',   difficulty: 2, requiredScore: 120, requiredAccuracy: 65, problemsCount: 6,  sourceId: 'idiom-08' },
  { id: 26, name: '成语故事·井底之蛙', description: '井底之蛙的故事', module: 'idiom', type: 'story-sort',   difficulty: 3, requiredScore: 150, requiredAccuracy: 70, problemsCount: 6,  sourceId: 'idiom-09' },
  { id: 27, name: '成语运用·配对',   description: '成语与释义配对',  module: 'idiom', type: 'match-pair',   difficulty: 2, requiredScore: 120, requiredAccuracy: 65, problemsCount: 8,  sourceId: undefined },
  { id: 28, name: '成语运用·填词',   description: '在句中填成语',    module: 'idiom', type: 'fill-blank',   difficulty: 3, requiredScore: 150, requiredAccuracy: 70, problemsCount: 8,  sourceId: undefined },
  { id: 29, name: '成语大挑战',       description: '综合成语挑战',    module: 'idiom', type: 'choice',       difficulty: 4, requiredScore: 200, requiredAccuracy: 75, problemsCount: 12, sourceId: undefined },

  // ===== 模块4：汉字启蒙 =====
  { id: 30, name: '象形识字·自然',   description: '日月水火',        module: 'char', type: 'drag-match',   difficulty: 1, requiredScore: 0,   requiredAccuracy: 0,   problemsCount: 8,  sourceId: undefined },
  { id: 31, name: '象形识字·动物',   description: '牛羊马鸟鱼',      module: 'char', type: 'drag-match',   difficulty: 1, requiredScore: 50,  requiredAccuracy: 60, problemsCount: 8,  sourceId: undefined },
  { id: 32, name: '象形识字·人体',   description: '人目口耳手',      module: 'char', type: 'find-diff',    difficulty: 2, requiredScore: 80,  requiredAccuracy: 60, problemsCount: 8,  sourceId: undefined },
  { id: 33, name: '偏旁部首·三点水', description: '氵江海河湖',      module: 'char', type: 'classify',     difficulty: 2, requiredScore: 100, requiredAccuracy: 65, problemsCount: 8,  sourceId: undefined },
  { id: 34, name: '偏旁部首·木字旁', description: '木林树桥板',      module: 'char', type: 'classify',     difficulty: 2, requiredScore: 120, requiredAccuracy: 65, problemsCount: 8,  sourceId: undefined },
  { id: 35, name: '汉字结构·识别',   description: '上下左右包围',    module: 'char', type: 'classify',     difficulty: 3, requiredScore: 150, requiredAccuracy: 70, problemsCount: 10, sourceId: undefined },
  { id: 36, name: '汉字结构·笔画',   description: '数笔画',          module: 'char', type: 'choice',       difficulty: 3, requiredScore: 150, requiredAccuracy: 70, problemsCount: 10, sourceId: undefined },
  { id: 37, name: '识字大挑战',       description: '综合汉字挑战',    module: 'char', type: 'choice',       difficulty: 4, requiredScore: 200, requiredAccuracy: 75, problemsCount: 12, sourceId: undefined },

  // ===== 模块5：传统文化 =====
  { id: 38, name: '传统节日·习俗',   description: '节日习俗配对',    module: 'culture', type: 'match-pair',  difficulty: 1, requiredScore: 0,   requiredAccuracy: 0,   problemsCount: 8,  sourceId: undefined },
  { id: 39, name: '传统节日·故事',   description: '节日传说故事',    module: 'culture', type: 'choice',      difficulty: 2, requiredScore: 80,  requiredAccuracy: 60, problemsCount: 8,  sourceId: undefined },
  { id: 40, name: '十二生肖·排序',   description: '生肖顺序',        module: 'culture', type: 'sort',        difficulty: 1, requiredScore: 0,   requiredAccuracy: 0,   problemsCount: 12, sourceId: undefined },
  { id: 41, name: '十二生肖·推理',   description: '生肖推理',        module: 'culture', type: 'choice',      difficulty: 2, requiredScore: 100, requiredAccuracy: 65, problemsCount: 8,  sourceId: undefined },
  { id: 42, name: '传统艺术·认识',   description: '书法国画剪纸',    module: 'culture', type: 'classify',    difficulty: 1, requiredScore: 50,  requiredAccuracy: 60, problemsCount: 8,  sourceId: undefined },
  { id: 43, name: '传统艺术·脸谱',   description: '脸谱颜色性格',    module: 'culture', type: 'match-pair',  difficulty: 2, requiredScore: 100, requiredAccuracy: 65, problemsCount: 8,  sourceId: undefined },
];

export class LevelSystem {
  private progress: Map<number, LevelProgress>;
  private currentLevelId: number;

  constructor() {
    this.progress = new Map();
    this.currentLevelId = 1;
    this.loadProgress();
  }

  getLevelConfig(levelId: number): LevelConfig | undefined {
    return LEVEL_CONFIGS.find(l => l.id === levelId);
  }

  getAllLevels(): LevelConfig[] {
    return LEVEL_CONFIGS;
  }

  isLevelUnlocked(levelId: number): boolean {
    const config = this.getLevelConfig(levelId);
    if (!config) return false;
    if (this.isFirstLevelInModule(levelId)) return true;

    const prevLevel = this.progress.get(levelId - 1);
    if (!prevLevel?.completed) return false;

    const prevConfig = this.getLevelConfig(levelId - 1);
    if (prevConfig && prevConfig.module !== config.module) {
      const totalScore = this.getTotalScore();
      const avgAccuracy = this.getAverageAccuracy();
      return totalScore >= config.requiredScore && avgAccuracy >= config.requiredAccuracy;
    }
    return true;
  }

  private isFirstLevelInModule(levelId: number): boolean {
    const firstOfModule = new Map<string, number>();
    for (const config of LEVEL_CONFIGS) {
      if (!firstOfModule.has(config.module)) {
        firstOfModule.set(config.module, config.id);
      }
    }
    const config = this.getLevelConfig(levelId);
    if (!config) return false;
    return firstOfModule.get(config.module) === levelId;
  }

  completeLevel(levelId: number, score: number, accuracy: number, time?: number): LevelProgress {
    const stars = this.calculateStars(accuracy, time);
    const existing = this.progress.get(levelId);
    const newProgress: LevelProgress = {
      levelId,
      completed: true,
      score: Math.max(score, existing?.score || 0),
      accuracy: Math.max(accuracy, existing?.accuracy || 0),
      stars: Math.max(stars, existing?.stars || 0),
      bestTime: time ? Math.min(time, existing?.bestTime || Infinity) : existing?.bestTime,
    };
    this.progress.set(levelId, newProgress);
    this.saveProgress();
    return newProgress;
  }

  private calculateStars(accuracy: number, _time?: number): number {
    if (accuracy >= 95) return 3;
    if (accuracy >= 80) return 2;
    if (accuracy >= 60) return 1;
    return 1;
  }

  getLevelProgress(levelId: number): LevelProgress | undefined {
    return this.progress.get(levelId);
  }

  getTotalScore(): number {
    let total = 0;
    this.progress.forEach(p => { total += p.score; });
    return total;
  }

  getAverageAccuracy(): number {
    let totalAccuracy = 0;
    let count = 0;
    this.progress.forEach(p => {
      if (p.completed) { totalAccuracy += p.accuracy; count++; }
    });
    return count > 0 ? totalAccuracy / count : 0;
  }

  getTotalStars(): number {
    let total = 0;
    this.progress.forEach(p => { total += p.stars; });
    return total;
  }

  setCurrentLevel(levelId: number): void {
    this.currentLevelId = levelId;
  }

  getCurrentLevel(): number {
    return this.currentLevelId;
  }

  getLevelsByModule(module: string): LevelConfig[] {
    return LEVEL_CONFIGS.filter(l => l.module === module);
  }

  getModuleProgress(module: string): { completed: number; total: number; stars: number } {
    const levels = this.getLevelsByModule(module);
    const completed = levels.filter(l => this.getLevelProgress(l.id)?.completed).length;
    const stars = levels.reduce((sum, l) => sum + (this.getLevelProgress(l.id)?.stars || 0), 0);
    return { completed, total: levels.length, stars };
  }

  getLearnedChars(): string[] {
    // 从已完成的汉字相关关卡中收集汉字
    const charLevels = LEVEL_CONFIGS.filter(l => l.module === 'char');
    const learned: string[] = [];
    charLevels.forEach(l => {
      if (this.getLevelProgress(l.id)?.completed) learned.push(l.name);
    });
    return learned;
  }

  getLearnedPoems(): string[] {
    const poemLevels = LEVEL_CONFIGS.filter(l => l.module === 'poetry');
    const poems: string[] = [];
    poemLevels.forEach(l => {
      if (this.getLevelProgress(l.id)?.completed) poems.push(l.name);
    });
    return poems;
  }

  getLearnedIdioms(): string[] {
    const idiomLevels = LEVEL_CONFIGS.filter(l => l.module === 'idiom');
    const idioms: string[] = [];
    idiomLevels.forEach(l => {
      if (this.getLevelProgress(l.id)?.completed) idioms.push(l.name);
    });
    return idioms;
  }

  private saveProgress(): void {
    const data = Array.from(this.progress.entries());
    localStorage.setItem('chinese-study-levels', JSON.stringify(data));
  }

  private loadProgress(): void {
    try {
      const data = localStorage.getItem('chinese-study-levels');
      if (data) {
        const parsed = JSON.parse(data);
        this.progress = new Map(parsed);
      }
    } catch (e) {
      console.error('加载关卡进度失败:', e);
    }
  }

  resetProgress(): void {
    this.progress.clear();
    this.currentLevelId = 1;
    localStorage.removeItem('chinese-study-levels');
  }
}
