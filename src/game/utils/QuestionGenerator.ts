/**
 * 题目生成器
 * 根据关卡配置和题型生成题目
 */

import { LEVEL_CONFIGS, type LevelConfig } from './LevelSystem';
import { CLASSIC_PASSAGES } from '../data/classics';
import { POEMS } from '../data/poems';
import { IDIOMS } from '../data/idioms';
import { CHINESE_CHARS, RADICAL_CATEGORIES } from '../data/characters';
import { FESTIVALS, FESTIVAL_MATCH_QUESTIONS, FACIAL_MAKEUPS, ZODIAC_ANIMALS } from '../data/culture';

export interface Question {
  type: string;
  prompt: string;
  displayLines?: string[];
  options: string[];
  correctIndex: number;
  // 特殊字段
  blanks?: string[];        // 填空模板
  pairs?: { a: string; b: string }[];    // 配对题
  items?: string[];         // 排序/分类用
  storyImages?: string[];   // 故事图片
  highlightChar?: string;   // 找茬题目标字
  matchItems?: { id: string; label: string; group: string }[]; // 归类用
  pictoEmoji?: string;      // 象形 emoji
  sceneImage?: string;      // 场景图描述（看图猜成语）
}

export class QuestionGenerator {
  static generateQuestions(levelId: number, overrideCount?: number): Question[] {
    const config = LEVEL_CONFIGS.find(l => l.id === levelId);
    if (!config) return [];

    const count = overrideCount && overrideCount > 0 ? overrideCount : config.problemsCount;
    const cfg: LevelConfig = { ...config, problemsCount: count };

    switch (config.type) {
      case 'fill-blank': return this.genFillBlank(cfg);
      case 'match-pair': return this.genMatchPair(cfg);
      case 'sequence': return this.genSequence(cfg);
      case 'choice': return this.genChoice(cfg);
      case 'classify': return this.genClassify(cfg);
      case 'image-select': return this.genImageSelect(cfg);
      case 'drag-match': return this.genDragMatch(cfg);
      case 'story-sort': return this.genStorySort(cfg);
      case 'find-diff': return this.genFindDiff(cfg);
      case 'sort': return this.genSort(cfg);
      case 'chain': return this.genChain(cfg);
      default: return this.genFillBlank(cfg);
    }
  }

  /** 工具：从池中尽量取 count 个；不足时循环复用 + 重新洗牌 */
  private static sampleWithReuse<T>(pool: T[], count: number): T[] {
    if (pool.length === 0) return [];
    const result: T[] = [];
    let i = 0;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    while (result.length < count) {
      if (i >= shuffled.length) {
        // 二次洗牌保证复用时顺序不同
        shuffled.sort(() => Math.random() - 0.5);
        i = 0;
      }
      result.push(shuffled[i++]);
    }
    return result;
  }

  // ---- 选字填空 ----
  private static genFillBlank(config: LevelConfig): Question[] {
    const count = config.problemsCount;
    const questions: Question[] = [];

    // 蒙学经典填空
    if (config.sourceId && config.module === 'classics') {
      const passage = CLASSIC_PASSAGES.find(p => p.id === config.sourceId);
      if (passage) return this.makeClassicFillBlank(passage, count);
    }

    // 古诗填空（跨诗抽数）
    if (config.module === 'poetry') {
      return this.makePoemsFillBlank(count, config.sourceId);
    }

    // 成语填空（跨成语抽数）
    if (config.module === 'idiom') {
      const shuffled = this.sampleWithReuse(IDIOMS, count);
      shuffled.forEach((idiom) => {
        const chars = [...idiom.idiom];
        const blankIdx = Math.floor(Math.random() * chars.length);
        const correctChar = chars[blankIdx];
        const options = this.getDistractors(correctChar, 3, idiom.idiom);
        const display = chars.map((c, idx) => idx === blankIdx ? '___' : c).join('');
        questions.push({
          type: 'fill-blank',
          prompt: `请选出"${idiom.idiom}"中缺少的字`,
          displayLines: [display],
          options: [correctChar, ...options].sort(() => Math.random() - 0.5),
          correctIndex: -1,
          blanks: [correctChar],
        });
        const q = questions[questions.length - 1];
        q.correctIndex = q.options.indexOf(correctChar);
      });
      return questions;
    }

    // 通用填空
    for (let i = 0; i < count; i++) {
      questions.push({
        type: 'fill-blank',
        prompt: '请选出正确的字',
        options: ['字', '词', '句', '文'],
        correctIndex: 0,
      });
    }
    return questions;
  }

  private static makeClassicFillBlank(passage: typeof CLASSIC_PASSAGES[0], count: number): Question[] {
    const questions: Question[] = [];
    // 每行每个 keyword 都可挖空 →（行数×平均关键字）个独特题；不足再循环复用
    const slots: { line: string; char: string }[] = [];
    passage.lines.forEach((line) => {
      const keywords = [...new Set(line.replace(/[，。、？]/g, '').split(''))];
      keywords.forEach((ch) => slots.push({ line, char: ch }));
    });
    const sampled = this.sampleWithReuse(slots, count);
    sampled.forEach(({ line, char: blankChar }) => {
      const display = line.replace(blankChar, '___');
      const distractors = this.getDistractors(blankChar, 3, line);
      const options = [blankChar, ...distractors].sort(() => Math.random() - 0.5);
      questions.push({
        type: 'fill-blank',
        prompt: `"${passage.source}" ${passage.title}，选字填空`,
        displayLines: [display],
        options,
        correctIndex: options.indexOf(blankChar),
        blanks: [blankChar],
      });
    });
    return questions;
  }

  /**
   * 古诗选字填空（跨诗抽数）
   * - 优先使用 sourceId 指定诗，集中挖空；
   * - 不够时跨其他诗补；
   * - 同一句允许不同干扰项 → 视为新题（用户已确认这种"重复题干"算新题）。
   */
  private static makePoemsFillBlank(count: number, sourceId?: string): Question[] {
    const sourcePoem = sourceId ? POEMS.find(p => p.id === sourceId) : undefined;
    const allPoems = sourcePoem ? [sourcePoem, ...POEMS.filter(p => p.id !== sourceId)] : [...POEMS];

    // 1) 构建"诗 × 句 × 字"槽位池
    const slots: { poem: typeof POEMS[0]; line: string; charIdx: number; char: string }[] = [];
    allPoems.forEach((poem) => {
      poem.lines.forEach((line) => {
        const chars = [...line.replace(/[，。、？]/g, '')];
        chars.forEach((c, idx) => slots.push({ poem, line, charIdx: idx, char: c }));
      });
    });

    // 2) 优先 source-poem 槽位；不足时跨诗补
    const prioritySlots = sourcePoem
      ? slots.filter(s => s.poem.id === sourcePoem.id)
      : slots;
    const otherSlots = sourcePoem
      ? slots.filter(s => s.poem.id !== sourcePoem.id)
      : slots;

    const picks: typeof slots = [];
    // 先尽量取首诗各槽位（每槽位重复取时换不同干扰项）
    while (picks.length < count) {
      if (prioritySlots.length > 0 && picks.length < prioritySlots.length * 4) {
        // 首诗每槽位最多重复 4 次（不同干扰项）
        picks.push(prioritySlots[picks.length % prioritySlots.length]);
      } else {
        // 跨诗补
        const idx = Math.floor(Math.random() * otherSlots.length);
        picks.push(otherSlots[idx]);
      }
    }

    return picks.map(({ poem, line, charIdx, char: blankChar }) => {
      const chars = [...line.replace(/[，。、？]/g, '')];
      const display = chars.map((c, ci) => ci === charIdx ? '___' : c).join('');
      const distractors = this.getDistractors(blankChar, 3, line);
      const options = [blankChar, ...distractors].sort(() => Math.random() - 0.5);
      return {
        type: 'fill-blank',
        prompt: `"${poem.title}"（${poem.author}），选字填空`,
        displayLines: [display],
        options,
        correctIndex: options.indexOf(blankChar),
        blanks: [blankChar],
      } as Question;
    });
  }

  // ---- 配对题 ----
  private static genMatchPair(config: LevelConfig): Question[] {
    const count = config.problemsCount;

    // 节日配对
    if (config.module === 'culture') {
      if (config.id === 38) return this.genFestivalMatch(count);
      if (config.id === 43) return this.genFaceMatch(count);
    }

    // 蒙学经典 / 古诗上下句配对（跨内容抽数）
    if (config.module === 'classics' && config.sourceId) {
      const passage = CLASSIC_PASSAGES.find(p => p.id === config.sourceId);
      if (passage) return this.genLineMatch(passage.lines, count, `${passage.source} ${passage.title}`);
    }
    if (config.module === 'poetry') {
      // 跨诗生成上下句配对：每首诗每句都可作为"上一句"
      return this.genPoemsLineMatch(count, config.sourceId);
    }

    // 成语配对（跨成语抽数）
    if (config.module === 'idiom') {
      const shuffled = this.sampleWithReuse(IDIOMS, count);
      const pairs: Question[] = shuffled.map((idiom) => {
        const wrongMeanings = IDIOMS
          .filter(d => d.id !== idiom.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(d => d.meaning);
        const options = [idiom.meaning, ...wrongMeanings].sort(() => Math.random() - 0.5);
        return {
          type: 'match-pair',
          prompt: `"${idiom.idiom}" 的意思是什么？`,
          options,
          correctIndex: options.indexOf(idiom.meaning),
        } as Question;
      });
      return pairs;
    }

    return [];
  }

  /** 古诗上下句配对 —— 跨诗抽数，每首诗每相邻两句配对 */
  private static genPoemsLineMatch(count: number, sourceId?: string): Question[] {
    const sourcePoem = sourceId ? POEMS.find(p => p.id === sourceId) : undefined;
    const ordered = sourcePoem
      ? [sourcePoem, ...POEMS.filter(p => p.id !== sourceId)]
      : [...POEMS];

    const slots: { title: string; line: string; others: string[] }[] = [];
    ordered.forEach((poem) => {
      for (let i = 0; i < poem.lines.length - 1; i++) {
        const line = poem.lines[i];
        const next = poem.lines[i + 1];
        // 干扰项：本诗其他句 + 其他诗的句
        const others = [
          ...poem.lines.filter((_, idx) => idx !== i + 1),
          ...POEMS.filter(p => p.id !== poem.id).flatMap(p => p.lines),
        ];
        slots.push({ title: poem.title, line, others: [next, ...others] });
      }
    });

    const sampled = this.sampleWithReuse(slots, count);
    return sampled.map((s) => {
      const correct = s.others[0];
      const wrong = s.others.slice(1).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
      return {
        type: 'match-pair',
        prompt: `"${s.title}" 中上句是"${s.line.slice(0, s.line.length > 4 ? 4 : s.line.length)}……"，下句是？`,
        options,
        correctIndex: options.indexOf(correct),
      } as Question;
    });
  }

  private static genFestivalMatch(count: number): Question[] {
    const questions: Question[] = [];
    const shuffled = [...FESTIVAL_MATCH_QUESTIONS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const q = shuffled[i];
      const festivals = ['春节', '元宵节', '端午节', '中秋节', '重阳节'];
      const others = festivals.filter(f => f !== q.festival);
      const options = [q.festival, ...others.sort(() => Math.random() - 0.5).slice(0, 3)];
      questions.push({
        type: 'match-pair',
        prompt: `"${q.custom}" 是哪个节日的习俗？`,
        options: options.sort(() => Math.random() - 0.5),
        correctIndex: -1,
      });
      const last = questions[questions.length - 1];
      last.correctIndex = last.options.indexOf(q.festival);
    }
    return questions;
  }

  private static genFaceMatch(count: number): Question[] {
    const questions: Question[] = [];
    const shuffled = [...FACIAL_MAKEUPS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const face = shuffled[i];
      const meanings = ['忠勇', '奸诈', '正直', '刚强', '勇猛', '稳重'];
      const others = meanings.filter(m => m !== face.meaning);
      const options = [face.meaning, ...others.sort(() => Math.random() - 0.5).slice(0, 3)];
      questions.push({
        type: 'match-pair',
        prompt: `京剧脸谱中，"${face.color}"脸代表什么性格？`,
        options: options.sort(() => Math.random() - 0.5),
        correctIndex: -1,
      });
      const last = questions[questions.length - 1];
      last.correctIndex = last.options.indexOf(face.meaning);
    }
    return questions;
  }

  private static genLineMatch(lines: string[], count: number, title: string): Question[] {
    const questions: Question[] = [];
    const shuffled = [...lines].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, lines.length); i++) {
      const line = shuffled[i];
      const display = `___${line.slice(line.length > 3 ? -3 : 0)}`;
      const others = lines.filter(l => l !== line).sort(() => Math.random() - 0.5).slice(0, 3);
      questions.push({
        type: 'match-pair',
        prompt: `"${title}" 中，上句是"${line.slice(0, line.length > 3 ? -3 : 0)}……"，下句是？`,
        options: [line, ...others].sort(() => Math.random() - 0.5),
        correctIndex: -1,
      });
      const last = questions[questions.length - 1];
      last.correctIndex = last.options.indexOf(line);
    }
    return questions;
  }

  // ---- 排序题 ----
  private static genSequence(config: LevelConfig): Question[] {
    const count = config.problemsCount;
    const questions: Question[] = [];

    // 蒙学经典：固定 sourceId 时返回单题；否则跨段落
    if (config.module === 'classics' && config.sourceId) {
      const passage = CLASSIC_PASSAGES.find(p => p.id === config.sourceId);
      if (passage) {
        const lines = passage.lines.slice(0, Math.min(4, passage.lines.length));
        return [{
          type: 'sequence',
          prompt: `请将"${passage.title}"的诗句按正确顺序排列`,
          items: [...lines].sort(() => Math.random() - 0.5),
          options: lines,
          correctIndex: 0,
        }];
      }
    }

    // 古诗：跨诗排序（每首 1 题），不足时复用并洗牌
    if (config.module === 'poetry') {
      const sourcePoem = config.sourceId ? POEMS.find(p => p.id === config.sourceId) : undefined;
      const ordered = sourcePoem
        ? [sourcePoem, ...POEMS.filter(p => p.id !== sourcePoem.id)]
        : [...POEMS];

      // 每首诗产生 1 题；不足通过重洗牌+不同句序复用
      const sampled = this.sampleWithReuse(ordered, count);
      return sampled.map((poem) => {
        const lines = poem.lines.slice(0, Math.min(4, poem.lines.length));
        return {
          type: 'sequence',
          prompt: `请将"${poem.title}"的诗句按正确顺序排列`,
          items: [...lines].sort(() => Math.random() - 0.5),
          options: lines,
          correctIndex: 0,
        } as Question;
      });
    }

    // 通用兜底
    for (let i = 0; i < count; i++) {
      const poem = POEMS[i % POEMS.length];
      const lines = poem.lines.slice(0, Math.min(4, poem.lines.length));
      questions.push({
        type: 'sequence',
        prompt: `请将"${poem.title}"的诗句按正确顺序排列`,
        items: [...lines].sort(() => Math.random() - 0.5),
        options: lines,
        correctIndex: 0,
      });
    }
    return questions;
  }

  // ---- 选择题 ----
  private static genChoice(config: LevelConfig): Question[] {
    const count = config.problemsCount;
    const questions: Question[] = [];

    // 百家姓认识
    if (config.module === 'classics' && config.type === 'choice') {
      const allLines = CLASSIC_PASSAGES.filter(p => p.source === '百家姓').flatMap(p => p.lines);
      const chars = [...new Set(allLines.join('').replace(/[，。、？]/g, '').split(''))];
      const shuffled = chars.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const char = shuffled[i];
        const distractors = this.getDistractors(char, 3, '');
        questions.push({
          type: 'choice',
          prompt: '下面哪个是百家姓中的姓氏？',
          options: [char, ...distractors].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(char);
      }
      return questions;
    }

    // 生肖推理
    if (config.module === 'culture' && config.id === 41) {
      const shuffled = [...ZODIAC_ANIMALS].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const animal = shuffled[i];
        const others = ZODIAC_ANIMALS.filter(a => a.name !== animal.name).sort(() => Math.random() - 0.5).slice(0, 3);
        questions.push({
          type: 'choice',
          prompt: `十二生肖中排名第${animal.order}的是什么？`,
          options: [animal.name, ...others.map(a => a.name)].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(animal.name);
      }
      return questions;
    }

    // 诗词情感理解
    if (config.id === 20) {
      const shuffled = this.sampleWithReuse(POEMS, count);
      shuffled.forEach((poem) => {
        if (!poem.emotion) return;
        const emotions = ['喜悦', '思念', '赞美', '惜时', '励志', '悲悯'];
        const others = emotions.filter(e => e !== poem.emotion).sort(() => Math.random() - 0.5).slice(0, 3);
        questions.push({
          type: 'choice',
          prompt: `"${poem.title}"（${poem.author}）这首诗主要表达了什么样的情感？`,
          displayLines: poem.lines.slice(0, 2),
          options: [poem.emotion, ...others].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(poem.emotion);
      });
      return questions;
    }

    // 汉字笔画
    if (config.id === 36) {
      const shuffled = [...CHINESE_CHARS].filter(c => c.strokes > 0).sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const ch = shuffled[i];
        const wrongCounts = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12].filter(n => n !== ch.strokes).sort(() => Math.random() - 0.5).slice(0, 3);
        questions.push({
          type: 'choice',
          prompt: `"${ch.char}" 字有多少笔画？`,
          options: [ch.strokes.toString(), ...wrongCounts.map(n => n.toString())].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(ch.strokes.toString());
      }
      return questions;
    }

    // 节日故事选择
    if (config.id === 39) {
      const shuffled = [...FESTIVALS].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const fest = shuffled[i];
        const others = FESTIVALS.filter(f => f.id !== fest.id).sort(() => Math.random() - 0.5).slice(0, 3);
        questions.push({
          type: 'choice',
          prompt: `以下哪个是"${fest.name}"的习俗？`,
          options: [fest.customs[0], ...others.map(o => o.customs[0])].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(fest.customs[0]);
      }
      return questions;
    }

    // 成语释义选择（成语初识·故事篇等）
    if (config.module === 'idiom' && config.id !== 29) {
      const shuffled = this.sampleWithReuse(IDIOMS, count);
      shuffled.forEach((idiom) => {
        // 从其他成语中取 3 个不同释义作为干扰项
        const wrongMeanings = IDIOMS
          .filter(d => d.id !== idiom.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(d => d.meaning);
        const options = [idiom.meaning, ...wrongMeanings].sort(() => Math.random() - 0.5);
        questions.push({
          type: 'choice',
          prompt: `"${idiom.idiom}" 这个成语的意思是什么？`,
          options,
          correctIndex: options.indexOf(idiom.meaning),
        });
      });
      return questions;
    }

    // 成语综合挑战
    if (config.id === 29) {
      const shuffled = this.sampleWithReuse(IDIOMS, count);
      shuffled.forEach((idiom) => {
        const wrongChars = [...idiom.similarChars].sort(() => Math.random() - 0.5).slice(0, 3);
        const blankIdx = Math.floor(Math.random() * 4);
        const char = idiom.idiom[blankIdx];
        const display = idiom.idiom.split('').map((c, idx) => idx === blankIdx ? '___' : c).join('');
        questions.push({
          type: 'choice',
          prompt: `成语填空：${display}`,
          options: [char, ...wrongChars].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(char);
      });
      return questions;
    }

    // 默认选择
    for (let i = 0; i < count; i++) {
      questions.push({
        type: 'choice',
        prompt: '请选出正确答案',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
      });
    }
    return questions;
  }

  // ---- 分类题 ----
  private static genClassify(config: LevelConfig): Question[] {
    // 诗词季节分类
    if (config.id === 19) {
      const seasons: Record<string, typeof POEMS> = { '春': [], '夏': [], '秋': [], '冬': [] };
      POEMS.forEach(p => { if (p.season && seasons[p.season]) seasons[p.season].push(p); });
      const questions: Question[] = [];
      const count = config.problemsCount;
      // 季节池中所有诗，跨诗随机抽；不足时复用并重新洗牌不同干扰项组合
      for (let i = 0; i < count; i++) {
        const season = (['春', '夏', '秋', '冬'] as const)[Math.floor(Math.random() * 4)];
        const pool = seasons[season];
        if (pool.length === 0) continue;
        const poem = pool[Math.floor(Math.random() * pool.length)];
        const otherSeasons = ['春', '夏', '秋', '冬'].filter(s => s !== season);
        questions.push({
          type: 'classify',
          prompt: `"${poem.lines[0]}" 描写的是哪个季节？`,
          displayLines: poem.lines.slice(0, 2),
          options: [season, ...otherSeasons].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(season);
      }
      return questions;
    }

    // 偏旁部首归类
    if (config.module === 'char' && (config.id === 33 || config.id === 34)) {
      const radicalKey = config.id === 33 ? '氵' : '木';
      const cat = RADICAL_CATEGORIES[radicalKey];
      const questions: Question[] = [];
      const shuffled = [...cat.chars].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(config.problemsCount, shuffled.length); i++) {
        const char = shuffled[i];
        const otherRadicals = Object.keys(RADICAL_CATEGORIES).filter(k => k !== radicalKey).slice(0, 3);
        questions.push({
          type: 'classify',
          prompt: `"${char}" 字的偏旁是什么？`,
          options: [radicalKey, ...otherRadicals].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(radicalKey);
      }
      return questions;
    }

    // 汉字结构分类
    if (config.id === 35) {
      const structures = ['左右', '上下', '包围', '独体'];
      const questions: Question[] = [];
      const shuffled = [...CHINESE_CHARS].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(config.problemsCount, shuffled.length); i++) {
        const ch = shuffled[i];
        const others = structures.filter(s => s !== ch.structure);
        questions.push({
          type: 'classify',
          prompt: `"${ch.char}" 字是什么结构？`,
          options: [ch.structure, ...others].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(ch.structure);
      }
      return questions;
    }

    // 传统艺术分类
    if (config.id === 42) {
      const arts = ['书法', '国画', '剪纸', '京剧'];
      const features: Record<string, string[]> = {
        '书法': ['文房四宝', '毛笔字', '五种字体'],
        '国画': ['水墨', '留白', '花鸟山水'],
        '剪纸': ['红纸', '剪刀', '窗花'],
        '京剧': ['脸谱', '唱念做打', '角色分工'],
      };
      const questions: Question[] = [];
      const allFeatures = Object.entries(features);
      const shuffled = allFeatures.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(config.problemsCount, allFeatures.length); i++) {
        const [art, feats] = shuffled[i % shuffled.length];
        const feat = feats[i % feats.length];
        const others = arts.filter(a => a !== art);
        questions.push({
          type: 'classify',
          prompt: `"${feat}" 属于哪种传统艺术？`,
          options: [art, ...others].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(art);
      }
      return questions;
    }

    // 弟子规归类判断
    if (config.id === 6) {
      const shuffled = [...CLASSIC_PASSAGES.filter(p => p.source === '弟子规')].sort(() => Math.random() - 0.5);
      const questions: Question[] = [];
      for (let i = 0; i < Math.min(config.problemsCount, 8); i++) {
        const p = shuffled[i % shuffled.length];
        const line = p.lines[i % p.lines.length];
        const texts = ['孝顺', '礼貌', '学习', '诚信'];
        questions.push({
          type: 'classify',
          prompt: `"${line}" 说的是什么道理？`,
          options: texts.sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf('孝顺');
      }
      return questions;
    }

    return [];
  }

  // ---- 看图选择 ----
  private static genImageSelect(config: LevelConfig): Question[] {
    const count = config.problemsCount;
    const questions: Question[] = [];

    // 成语看图猜：跨成语抽数，题干可重复（不同干扰项视作新题）
    if (config.module === 'idiom') {
      const shuffled = this.sampleWithReuse(IDIOMS, count);
      shuffled.forEach((idiom) => {
        const sceneImage = idiom.storyImages[0];
        const others = IDIOMS.filter(d => d.id !== idiom.id).sort(() => Math.random() - 0.5).slice(0, 3);
        questions.push({
          type: 'image-select',
          prompt: `图中画的是哪个成语？`,
          sceneImage,
          storyImages: [sceneImage],
          options: [idiom.idiom, ...others.map(o => o.idiom)].sort(() => Math.random() - 0.5),
          correctIndex: -1,
        });
        const last = questions[questions.length - 1];
        last.correctIndex = last.options.indexOf(idiom.idiom);
      });
      return questions;
    }

    return questions;
  }

  // ---- 拖拽配对（象形字） ----
  private static genDragMatch(config: LevelConfig): Question[] {
    const questions: Question[] = [];
    const shuffled = [...CHINESE_CHARS].filter(c => c.pictographEmoji).sort(() => Math.random() - 0.5);
    const count = Math.min(config.problemsCount, shuffled.length);
    for (let i = 0; i < count; i++) {
      const ch = shuffled[i];
      const others = CHINESE_CHARS.filter(c => c.char !== ch.char && c.pictographEmoji).sort(() => Math.random() - 0.5).slice(0, 3);
      questions.push({
        type: 'drag-match',
        prompt: `"${ch.pictographEmoji}" 对应哪个汉字？`,
        pictoEmoji: ch.pictographEmoji,
        options: [ch.char, ...others.map(o => o.char)].sort(() => Math.random() - 0.5),
        correctIndex: -1,
      });
      const last = questions[questions.length - 1];
      last.correctIndex = last.options.indexOf(ch.char);
    }
    return questions;
  }

  // ---- 故事排序 ----
  private static genStorySort(config: LevelConfig): Question[] {
    const count = config.problemsCount;
    // 跨成语抽数：有 sourceId 时优先用该成语，否则全 IDIOMS
    const sourceIdiom = config.sourceId ? IDIOMS.find(d => d.id === config.sourceId) : undefined;
    const pool = sourceIdiom
      ? [sourceIdiom, ...IDIOMS.filter(d => d.id !== sourceIdiom.id)]
      : [...IDIOMS];

    const sampled = this.sampleWithReuse(pool, count);
    return sampled.map((idiom) => {
      const images = [...idiom.storyImages];
      return {
        type: 'story-sort',
        prompt: `请将"${idiom.idiom}"的故事按顺序排列`,
        items: [...images].sort(() => Math.random() - 0.5),
        options: images,
        correctIndex: 0,
        storyImages: images,
      } as Question;
    });
  }

  // ---- 找茬 ----
  private static genFindDiff(config: LevelConfig): Question[] {
    const questions: Question[] = [];
    // 相似字找茬
    const similarPairs = [
      { target: '日', distractors: ['曰', '田', '白'] },
      { target: '木', distractors: ['本', '末', '禾'] },
      { target: '人', distractors: ['入', '八', '大'] },
      { target: '大', distractors: ['太', '天', '犬'] },
      { target: '土', distractors: ['士', '干', '上'] },
    ];
    const count = Math.min(config.problemsCount, similarPairs.length);
    for (let i = 0; i < count; i++) {
      const pair = similarPairs[i];
      const all = [pair.target, ...pair.distractors].sort(() => Math.random() - 0.5);
      questions.push({
        type: 'find-diff',
        prompt: `下面哪个字是"${pair.target}"？`,
        options: all,
        correctIndex: all.indexOf(pair.target),
        highlightChar: pair.target,
      });
    }
    return questions;
  }

  // ---- 排序（生肖） ----
  private static genSort(config: LevelConfig): Question[] {
    if (config.id === 40) {
      const shuffled = [...ZODIAC_ANIMALS].sort(() => Math.random() - 0.5);
      return [{
        type: 'sort',
        prompt: '请将十二生肖按正确顺序排列',
        items: shuffled.map(a => a.name),
        options: ZODIAC_ANIMALS.map(a => a.name),
        correctIndex: 0,
      }];
    }
    return [];
  }

  // ---- 接龙 ----
  private static genChain(_config: LevelConfig): Question[] {
    return [];
  }

  // ---- 工具：生成干扰项 ----
  private static getDistractors(correct: string, count: number, excludeStr: string): string[] {
    const allChars = '天地人大小上下左右日月水火山石田土木禾竹口目手足心风云雨雪花草鸟鱼虫牛羊马龙古今中外出入来去远近高低长短明暗黑白红绿青蓝紫春秋冬夏东西南北前后左右里外多'.split('');
    const excluded = new Set([...excludeStr.split(''), correct]);
    const candidates = allChars.filter(c => !excluded.has(c) && c.length === correct.length);
    return candidates.sort(() => Math.random() - 0.5).slice(0, count);
  }

  // ---- 工具：打乱数组 ----
  static shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }
}
