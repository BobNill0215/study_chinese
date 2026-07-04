/**
 * 蒙学经典数据
 * 三字经 / 弟子规 / 千字文 / 百家姓
 */

export interface ClassicPassage {
  id: string;
  source: '三字经' | '弟子规' | '千字文' | '百家姓';
  title: string;
  lines: string[];
  keywords: string[];
  pinyin: string[];
}

export const CLASSIC_PASSAGES: ClassicPassage[] = [
  // ========== 三字经 ==========
  {
    id: 'sanzi-01',
    source: '三字经',
    title: '人之初',
    lines: [
      '人之初，性本善',
      '性相近，习相远',
      '苟不教，性乃迁',
      '教之道，贵以专',
    ],
    keywords: ['初', '善', '近', '远', '教', '专'],
    pinyin: [
      'rén zhī chū，xìng běn shàn',
      'xìng xiāng jìn，xí xiāng yuǎn',
      'gǒu bù jiào，xìng nǎi qiān',
      'jiào zhī dào，guì yǐ zhuān',
    ],
  },
  {
    id: 'sanzi-02',
    source: '三字经',
    title: '昔孟母',
    lines: [
      '昔孟母，择邻处',
      '子不学，断机杼',
      '窦燕山，有义方',
      '教五子，名俱扬',
    ],
    keywords: ['母', '邻', '学', '断', '义', '扬'],
    pinyin: [
      'xī mèng mǔ，zé lín chǔ',
      'zǐ bù xué，duàn jī zhù',
      'dòu yàn shān，yǒu yì fāng',
      'jiào wǔ zǐ，míng jù yáng',
    ],
  },
  {
    id: 'sanzi-03',
    source: '三字经',
    title: '养不教',
    lines: [
      '养不教，父之过',
      '教不严，师之惰',
      '子不学，非所宜',
      '幼不学，老何为',
    ],
    keywords: ['养', '教', '过', '严', '宜', '幼'],
    pinyin: [
      'yǎng bù jiào，fù zhī guò',
      'jiào bù yán，shī zhī duò',
      'zǐ bù xué，fēi suǒ yí',
      'yòu bù xué，lǎo hé wéi',
    ],
  },

  // ========== 弟子规 ==========
  {
    id: 'dizigui-01',
    source: '弟子规',
    title: '父母呼',
    lines: [
      '父母呼，应勿缓',
      '父母命，行勿懒',
      '父母教，须敬听',
      '父母责，须顺承',
    ],
    keywords: ['呼', '缓', '命', '懒', '敬', '顺'],
    pinyin: [
      'fù mǔ hū，yìng wù huǎn',
      'fù mǔ mìng，xíng wù lǎn',
      'fù mǔ jiào，xū jìng tīng',
      'fù mǔ zé，xū shùn chéng',
    ],
  },
  {
    id: 'dizigui-02',
    source: '弟子规',
    title: '冬则温',
    lines: [
      '冬则温，夏则凊',
      '晨则省，昏则定',
      '出必告，反必面',
      '居有常，业无变',
    ],
    keywords: ['冬', '温', '夏', '晨', '出', '居'],
    pinyin: [
      'dōng zé wēn，xià zé qìng',
      'chén zé xǐng，hūn zé dìng',
      'chū bì gào，fǎn bì miàn',
      'jū yǒu cháng，yè wú biàn',
    ],
  },
  {
    id: 'dizigui-03',
    source: '弟子规',
    title: '事虽小',
    lines: [
      '事虽小，勿擅为',
      '苟擅为，子道亏',
      '物虽小，勿私藏',
      '苟私藏，亲心伤',
    ],
    keywords: ['事', '擅', '亏', '物', '私', '藏'],
    pinyin: [
      'shì suī xiǎo，wù shàn wéi',
      'gǒu shàn wéi，zǐ dào kuī',
      'wù suī xiǎo，wù sī cáng',
      'gǒu sī cáng，qīn xīn shāng',
    ],
  },

  // ========== 千字文 ==========
  {
    id: 'qianziwen-01',
    source: '千字文',
    title: '天地玄黄',
    lines: [
      '天地玄黄，宇宙洪荒',
      '日月盈昃，辰宿列张',
      '寒来暑往，秋收冬藏',
      '闰余成岁，律吕调阳',
    ],
    keywords: ['天', '地', '日', '月', '寒', '收'],
    pinyin: [
      'tiān dì xuán huáng，yǔ zhòu hóng huāng',
      'rì yuè yíng zè，chén xiù liè zhāng',
      'hán lái shǔ wǎng，qiū shōu dōng cáng',
      'rùn yú chéng suì，lǜ lǚ tiáo yáng',
    ],
  },
  {
    id: 'qianziwen-02',
    source: '千字文',
    title: '云腾致雨',
    lines: [
      '云腾致雨，露结为霜',
      '金生丽水，玉出昆冈',
      '剑号巨阙，珠称夜光',
      '果珍李柰，菜重芥姜',
    ],
    keywords: ['云', '雨', '金', '玉', '剑', '果'],
    pinyin: [
      'yún téng zhì yǔ，lù jié wéi shuāng',
      'jīn shēng lì shuǐ，yù chū kūn gāng',
      'jiàn hào jù què，zhū chēng yè guāng',
      'guǒ zhēn lǐ nài，cài zhòng jiè jiāng',
    ],
  },

  // ========== 百家姓 ==========
  {
    id: 'baijiaxing-01',
    source: '百家姓',
    title: '赵钱孙李',
    lines: [
      '赵钱孙李，周吴郑王',
      '冯陈褚卫，蒋沈韩杨',
      '朱秦尤许，何吕施张',
      '孔曹严华，金魏陶姜',
    ],
    keywords: ['赵', '钱', '孙', '李', '周', '吴'],
    pinyin: [
      'zhào qián sūn lǐ，zhōu wú zhèng wáng',
      'féng chén chǔ wèi，jiǎng shěn hán yáng',
      'zhū qín yóu xǔ，hé lǚ shī zhāng',
      'kǒng cáo yán huá，jīn wèi táo jiāng',
    ],
  },
  {
    id: 'baijiaxing-02',
    source: '百家姓',
    title: '戚谢邹喻',
    lines: [
      '戚谢邹喻，柏水窦章',
      '云苏潘葛，奚范彭郎',
      '鲁韦昌马，苗凤花方',
      '俞任袁柳，酆鲍史唐',
    ],
    keywords: ['戚', '谢', '邹', '柏', '鲁', '韦'],
    pinyin: [
      'qī xiè zōu yù，bǎi shuǐ dòu zhāng',
      'yún sū pān gě，xī fàn péng láng',
      'lǔ wéi chāng mǎ，miáo fèng huā fāng',
      'yú rèn yuán liǔ，fēng bào shǐ táng',
    ],
  },
];
