/**
 * 汉字数据
 * 象形字 / 偏旁部首 / 汉字结构
 */

export interface ChineseChar {
  char: string;
  pinyin: string;
  radical: string;
  strokes: number;
  structure: '左右' | '上下' | '包围' | '独体' | '左中右' | '上中下' | '品字';
  pictograph?: string;     // 象形描述
  pictographEmoji?: string; // 象形对应 emoji
}

export const CHINESE_CHARS: ChineseChar[] = [
  // ========== 象形字 ==========
  { char: '日', pinyin: 'rì', radical: '日', strokes: 4, structure: '独体', pictograph: '太阳的形状', pictographEmoji: '☀️' },
  { char: '月', pinyin: 'yuè', radical: '月', strokes: 4, structure: '独体', pictograph: '月牙的形状', pictographEmoji: '🌙' },
  { char: '水', pinyin: 'shuǐ', radical: '水', strokes: 4, structure: '独体', pictograph: '流动的水流', pictographEmoji: '💧' },
  { char: '火', pinyin: 'huǒ', radical: '火', strokes: 4, structure: '独体', pictograph: '燃烧的火焰', pictographEmoji: '🔥' },
  { char: '山', pinyin: 'shān', radical: '山', strokes: 3, structure: '独体', pictograph: '山峰的形状', pictographEmoji: '⛰️' },
  { char: '石', pinyin: 'shí', radical: '石', strokes: 5, structure: '独体', pictograph: '山崖下有石块', pictographEmoji: '🪨' },
  { char: '田', pinyin: 'tián', radical: '田', strokes: 5, structure: '独体', pictograph: '井字形的田地', pictographEmoji: '🌾' },
  { char: '土', pinyin: 'tǔ', radical: '土', strokes: 3, structure: '独体', pictograph: '地面上有土堆', pictographEmoji: '🏔️' },
  { char: '木', pinyin: 'mù', radical: '木', strokes: 4, structure: '独体', pictograph: '一棵树的形状', pictographEmoji: '🌳' },
  { char: '禾', pinyin: 'hé', radical: '禾', strokes: 5, structure: '独体', pictograph: '稻谷垂穗的形状', pictographEmoji: '🌾' },
  { char: '竹', pinyin: 'zhú', radical: '竹', strokes: 6, structure: '左右', pictograph: '竹叶下垂的形状', pictographEmoji: '🎋' },
  { char: '人', pinyin: 'rén', radical: '人', strokes: 2, structure: '独体', pictograph: '侧面站立的人形', pictographEmoji: '🚶' },
  { char: '口', pinyin: 'kǒu', radical: '口', strokes: 3, structure: '独体', pictograph: '张开的嘴巴', pictographEmoji: '👄' },
  { char: '手', pinyin: 'shǒu', radical: '手', strokes: 4, structure: '独体', pictograph: '手掌和手指的形状', pictographEmoji: '✋' },
  { char: '目', pinyin: 'mù', radical: '目', strokes: 5, structure: '独体', pictograph: '眼睛的形状', pictographEmoji: '👁️' },
  { char: '耳', pinyin: 'ěr', radical: '耳', strokes: 6, structure: '独体', pictograph: '耳朵的形状', pictographEmoji: '👂' },
  { char: '牛', pinyin: 'niú', radical: '牛', strokes: 4, structure: '独体', pictograph: '牛头正面', pictographEmoji: '🐮' },
  { char: '羊', pinyin: 'yáng', radical: '羊', strokes: 6, structure: '独体', pictograph: '羊头正面', pictographEmoji: '🐑' },
  { char: '马', pinyin: 'mǎ', radical: '马', strokes: 3, structure: '独体', pictograph: '马侧面的形状', pictographEmoji: '🐴' },
  { char: '鱼', pinyin: 'yú', radical: '鱼', strokes: 8, structure: '上下', pictograph: '鱼在水中游', pictographEmoji: '🐟' },
  { char: '鸟', pinyin: 'niǎo', radical: '鸟', strokes: 5, structure: '独体', pictograph: '鸟飞翔的形状', pictographEmoji: '🐦' },
  { char: '虫', pinyin: 'chóng', radical: '虫', strokes: 6, structure: '独体', pictograph: '一条蠕虫的形状', pictographEmoji: '🐛' },
  { char: '云', pinyin: 'yún', radical: '云', strokes: 4, structure: '独体', pictograph: '云朵飘浮', pictographEmoji: '☁️' },
  { char: '雨', pinyin: 'yǔ', radical: '雨', strokes: 8, structure: '独体', pictograph: '下雨的样子', pictographEmoji: '🌧️' },
  { char: '心', pinyin: 'xīn', radical: '心', strokes: 4, structure: '独体', pictograph: '心脏的形状', pictographEmoji: '❤️' },
  { char: '王', pinyin: 'wáng', radical: '王', strokes: 4, structure: '独体', pictograph: '一把大斧的形状', pictographEmoji: '👑' },
  { char: '门', pinyin: 'mén', radical: '门', strokes: 3, structure: '独体', pictograph: '两扇门的形状', pictographEmoji: '🚪' },
  { char: '车', pinyin: 'chē', radical: '车', strokes: 4, structure: '独体', pictograph: '古代战车的形状', pictographEmoji: '🚗' },
  { char: '大', pinyin: 'dà', radical: '大', strokes: 3, structure: '独体', pictograph: '人展开双臂表示大', pictographEmoji: '🙆' },
  { char: '小', pinyin: 'xiǎo', radical: '小', strokes: 3, structure: '独体', pictograph: '细小的沙粒', pictographEmoji: '🔹' },

  // ========== 偏旁部首示例字 ==========
  // 氵（水）
  { char: '江', pinyin: 'jiāng', radical: '氵', strokes: 6, structure: '左右' },
  { char: '河', pinyin: 'hé', radical: '氵', strokes: 8, structure: '左右' },
  { char: '海', pinyin: 'hǎi', radical: '氵', strokes: 10, structure: '左右' },
  { char: '湖', pinyin: 'hú', radical: '氵', strokes: 12, structure: '左中右' },
  // 木
  { char: '林', pinyin: 'lín', radical: '木', strokes: 8, structure: '左右' },
  { char: '树', pinyin: 'shù', radical: '木', strokes: 9, structure: '左中右' },
  { char: '桥', pinyin: 'qiáo', radical: '木', strokes: 10, structure: '左右' },
  { char: '板', pinyin: 'bǎn', radical: '木', strokes: 8, structure: '左右' },
  // 口
  { char: '吃', pinyin: 'chī', radical: '口', strokes: 6, structure: '左右' },
  { char: '唱', pinyin: 'chàng', radical: '口', strokes: 11, structure: '左右' },
  { char: '和', pinyin: 'hé', radical: '口', strokes: 8, structure: '左右' },
  { char: '知', pinyin: 'zhī', radical: '口', strokes: 8, structure: '左右' },
  // 人
  { char: '从', pinyin: 'cóng', radical: '人', strokes: 4, structure: '左右' },
  { char: '众', pinyin: 'zhòng', radical: '人', strokes: 6, structure: '品字' },
  { char: '会', pinyin: 'huì', radical: '人', strokes: 6, structure: '上下' },
  { char: '合', pinyin: 'hé', radical: '人', strokes: 6, structure: '上下' },
  // 扌（手）
  { char: '打', pinyin: 'dǎ', radical: '扌', strokes: 5, structure: '左右' },
  { char: '拍', pinyin: 'pāi', radical: '扌', strokes: 8, structure: '左右' },
  { char: '拉', pinyin: 'lā', radical: '扌', strokes: 8, structure: '左右' },
  { char: '推', pinyin: 'tuī', radical: '扌', strokes: 11, structure: '左右' },

  // ========== 不同结构字 ==========
  // 上下结构
  { char: '花', pinyin: 'huā', radical: '艹', strokes: 7, structure: '上下' },
  { char: '草', pinyin: 'cǎo', radical: '艹', strokes: 9, structure: '上下' },
  { char: '星', pinyin: 'xīng', radical: '日', strokes: 9, structure: '上下' },
  { char: '想', pinyin: 'xiǎng', radical: '心', strokes: 13, structure: '上下' },
  { char: '笔', pinyin: 'bǐ', radical: '竹', strokes: 10, structure: '上下' },
  { char: '笑', pinyin: 'xiào', radical: '竹', strokes: 10, structure: '上下' },
  // 左右结构
  { char: '明', pinyin: 'míng', radical: '日', strokes: 8, structure: '左右' },
  { char: '好', pinyin: 'hǎo', radical: '女', strokes: 6, structure: '左右' },
  { char: '红', pinyin: 'hóng', radical: '纟', strokes: 6, structure: '左右' },
  { char: '绿', pinyin: 'lǜ', radical: '纟', strokes: 11, structure: '左右' },
  // 包围结构
  { char: '国', pinyin: 'guó', radical: '口', strokes: 8, structure: '包围' },
  { char: '园', pinyin: 'yuán', radical: '口', strokes: 7, structure: '包围' },
  { char: '回', pinyin: 'huí', radical: '口', strokes: 6, structure: '包围' },
  { char: '风', pinyin: 'fēng', radical: '风', strokes: 4, structure: '包围' },
  { char: '问', pinyin: 'wèn', radical: '门', strokes: 6, structure: '包围' },
  // 左中右结构
  { char: '做', pinyin: 'zuò', radical: '亻', strokes: 11, structure: '左中右' },
  { char: '谢', pinyin: 'xiè', radical: '讠', strokes: 12, structure: '左中右' },
  { char: '脚', pinyin: 'jiǎo', radical: '月', strokes: 11, structure: '左中右' },
  // 上中下结构
  { char: '高', pinyin: 'gāo', radical: '高', strokes: 10, structure: '上中下' },
  { char: '亮', pinyin: 'liàng', radical: '亠', strokes: 9, structure: '上中下' },
  // 品字结构
  { char: '品', pinyin: 'pǐn', radical: '口', strokes: 9, structure: '品字' },
  { char: '晶', pinyin: 'jīng', radical: '日', strokes: 12, structure: '品字' },
  { char: '森', pinyin: 'sēn', radical: '木', strokes: 12, structure: '品字' },
];

// 偏旁部首分类（用于偏旁归类题目）
export const RADICAL_CATEGORIES: Record<string, { name: string; chars: string[] }> = {
  '氵': { name: '三点水（水）', chars: ['江', '河', '海', '湖', '流', '波'] },
  '木': { name: '木字旁', chars: ['林', '树', '桥', '板', '枝', '根'] },
  '口': { name: '口字旁', chars: ['吃', '唱', '和', '知', '喊', '听'] },
  '亻': { name: '单人旁（人）', chars: ['从', '众', '会', '合', '你', '他'] },
  '扌': { name: '提手旁（手）', chars: ['打', '拍', '拉', '推', '抱', '找'] },
  '艹': { name: '草字头', chars: ['花', '草', '芽', '苗', '茶', '菊'] },
  '日': { name: '日字旁', chars: ['明', '晴', '昨', '时', '晚', '暖'] },
  '纟': { name: '绞丝旁', chars: ['红', '绿', '细', '经', '纸', '线'] },
  '火': { name: '火字旁', chars: ['灯', '烧', '烟', '炒', '炸', '炉'] },
  '月': { name: '月字旁', chars: ['明', '脸', '脚', '胖', '朋', '腿'] },
};
