/**
 * 用户设置（持久化到 localStorage）
 * - 每关题数：用户在设置面板调节，运行时覆盖 LevelConfig.problemsCount
 */

const STORAGE_KEY = 'chinese-study-settings';

export const MIN_QUESTIONS = 5;
export const MAX_QUESTIONS = 300;
export const DEFAULT_QUESTIONS = 10;
/** 加减按钮单步 */
export const STEP_QUESTIONS = 5;

export interface AppSettings {
  /** 每关题数（默认值），所有关卡共用；后续可扩展为 per-level override */
  questionsPerLevel: number;
}

export class Settings {
  private static cache: AppSettings | null = null;

  /** 读取设置（带内存缓存） */
  static get(): AppSettings {
    if (this.cache) return this.cache;
    this.cache = this.load();
    return this.cache;
  }

  private static load(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        return {
          questionsPerLevel: clamp(parsed.questionsPerLevel ?? DEFAULT_QUESTIONS),
        };
      }
    } catch { /* ignore */ }
    return { questionsPerLevel: DEFAULT_QUESTIONS };
  }

  /** 保存设置 */
  static save(settings: AppSettings): void {
    this.cache = { questionsPerLevel: clamp(settings.questionsPerLevel) };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch { /* ignore */ }
  }

  /** 仅设置每关题数 */
  static setQuestionsPerLevel(n: number): void {
    const s = this.get();
    s.questionsPerLevel = clamp(n);
    this.save(s);
  }

  /** 取某关实际题数 —— Settings 优先于 problemsCount */
  static getQuestionsForLevel(_levelId: number, fallback: number): number {
    const s = this.get();
    // 当前：全局统一值；如未来引入 per-level override，在此扩展
    void _levelId;
    return s.questionsPerLevel || clamp(fallback);
  }
}

function clamp(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_QUESTIONS;
  return Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, Math.floor(n)));
}