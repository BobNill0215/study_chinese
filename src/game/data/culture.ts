/**
 * 传统文化数据
 * 传统节日 / 十二生肖 / 传统艺术
 */

// ========== 传统节日 ==========
export interface Festival {
  id: string;
  name: string;
  date: string;        // 农历日期
  description: string;
  customs: string[];
  foods: string[];
  story: string;
}

export const FESTIVALS: Festival[] = [
  {
    id: 'fest-01',
    name: '春节',
    date: '正月初一',
    description: '中国最重要的传统节日，庆祝新年的到来。',
    customs: ['贴春联', '放鞭炮', '拜年', '发红包', '守岁', '舞龙舞狮'],
    foods: ['饺子', '年糕', '鱼', '汤圆'],
    story: '传说古时候有一种叫"年"的怪兽，每到除夕就出来伤害人畜。后来人们发现年兽怕红色、火光和响声，于是每年除夕就贴红对联、放鞭炮来驱赶年兽。',
  },
  {
    id: 'fest-02',
    name: '元宵节',
    date: '正月十五',
    description: '春节后的第一个重要节日，标志着春节庆祝活动的结束。',
    customs: ['赏花灯', '猜灯谜', '吃元宵', '舞龙灯'],
    foods: ['元宵（汤圆）'],
    story: '元宵节起源于汉代。汉明帝提倡佛教，听说佛教有正月十五观佛舍利、点灯敬佛的做法，就下令在这一天夜晚点灯。后来这种佛教礼仪逐渐演变成民间盛大的节日。',
  },
  {
    id: 'fest-03',
    name: '端午节',
    date: '五月初五',
    description: '纪念爱国诗人屈原的节日，也是驱邪避毒的节日。',
    customs: ['赛龙舟', '包粽子', '挂艾草', '佩香囊', '饮雄黄酒'],
    foods: ['粽子', '咸鸭蛋'],
    story: '战国时期，楚国诗人屈原在五月初五投汨罗江自尽。百姓们划船打捞他的遗体，并向江中投掷粽子，防止鱼虾伤害他的身体。从此每年五月初五，人们用赛龙舟、吃粽子的方式来纪念屈原。',
  },
  {
    id: 'fest-04',
    name: '中秋节',
    date: '八月十五',
    description: '丰收团圆之日，家人团聚赏月。',
    customs: ['赏月', '吃月饼', '提灯笼', '猜灯谜'],
    foods: ['月饼', '柚子', '桂花糕'],
    story: '传说后羿射下九个太阳后，得到了长生不老药。他的妻子嫦娥偷吃了仙药，飞向了月亮。后羿思念妻子，每年八月十五就在院子里摆上嫦娥爱吃的点心，遥望月亮。百姓们也纷纷效仿，形成了中秋赏月的习俗。',
  },
  {
    id: 'fest-05',
    name: '重阳节',
    date: '九月初九',
    description: '尊老敬老、登高祈福的节日。',
    customs: ['登高', '赏菊', '插茱萸', '饮菊花酒', '敬老'],
    foods: ['重阳糕', '菊花酒'],
    story: '相传东汉时期，桓景跟随费长房学道。一天费长房告诉他，九月九日他家将有灾祸，要他带着家人登高、饮菊花酒、佩戴茱萸。桓景照做了，傍晚回家时发现家中的鸡犬牛羊都死了。从此登高避灾的习俗就流传了下来。',
  },
  {
    id: 'fest-06',
    name: '清明节',
    date: '阳历四月五日前后',
    description: '祭祖扫墓、踏青插柳的节日。',
    customs: ['扫墓', '踏青', '插柳', '荡秋千', '放风筝'],
    foods: ['青团', '馓子'],
    story: '春秋时期，晋国公子重耳流亡在外，大臣介子推曾割股为他充饥。重耳回国即位后，介子推不愿做官，隐居绵山。重耳放火烧山想逼他出来，介子推却抱树而死。重耳悲痛，下令此日禁止生火，故称寒食节，后与清明合并。',
  },
  {
    id: 'fest-07',
    name: '七夕节',
    date: '七月初七',
    description: '牛郎织女相会的日子，中国情人节。',
    customs: ['乞巧', '拜织女', '穿针引线', '观星'],
    foods: ['巧果', '酥糖'],
    story: '传说天上织女与人间的牛郎相爱结为夫妇。王母娘娘震怒，把织女抓回天庭，用银河将两人隔开。喜鹊同情他们，每年七月初七搭鹊桥让两人相会一次。',
  },
  {
    id: 'fest-08',
    name: '冬至',
    date: '阳历十二月二十二日前后',
    description: '北半球白昼最短的一天，有"冬至大如年"之说。',
    customs: ['吃饺子', '吃汤圆', '祭祖', '数九'],
    foods: ['饺子', '汤圆', '羊肉汤'],
    story: '古人认为冬至是阴极阳生的关键时刻，应隆重纪念。汉代把冬至定为"冬节"，官府放假庆祝。北方有"冬至不端饺子碗，冻掉耳朵没人管"的俗语；南方则吃汤圆象征团圆。',
  },
  {
    id: 'fest-09',
    name: '腊八节',
    date: '腊月初八',
    description: '佛祖释迦牟尼成道之日，春节序幕的开始。',
    customs: ['熬腊八粥', '泡腊八蒜', '祭祀祖先'],
    foods: ['腊八粥', '腊八蒜'],
    story: '传说佛祖释迦牟尼在菩提树下悟道前，曾接受牧牛女供养的乳糜。寺院于是从腊八起熬粥供佛，民间相沿成俗。也有说腊八是祭祀祖先神灵、庆丰收的日子。',
  },
  {
    id: 'fest-10',
    name: '龙抬头',
    date: '二月初二',
    description: '春耕开始的节日，又称"春耕节"。',
    customs: ['剃龙头', '吃龙食', '熏虫', '引龙'],
    foods: ['春饼', '面条', '爆米花'],
    story: '古人认为二月二是苍龙从地平线升起的日子，预示春雨增多、万物复苏。民间有"二月二，剃龙头"的习俗，孩子在这天理发，借龙气求吉利，一年好运。',
  },
];

// ========== 十二生肖 ==========
export interface ZodiacAnimal {
  name: string;
  order: number;
  yearMod: number;    // year % 12 === this
  traits: string[];
  story: string;
}

export const ZODIAC_ANIMALS: ZodiacAnimal[] = [
  { name: '鼠', order: 1, yearMod: 0, traits: ['聪明', '机灵', '活泼', '善积财', '适应力强'], story: '老鼠在玉帝的比赛中跳上了牛背，快到终点时跳到牛前面，得了第一名。' },
  { name: '牛', order: 2, yearMod: 1, traits: ['勤劳', '踏实', '坚强', '稳重', '有耐力'], story: '牛本来可以得第一，但被老鼠占了便宜，只好屈居第二。' },
  { name: '虎', order: 3, yearMod: 2, traits: ['勇敢', '威猛', '自信', '果断', '有领导力'], story: '老虎是森林之王，勇猛无比，得了第三名。' },
  { name: '兔', order: 4, yearMod: 3, traits: ['温柔', '敏捷', '可爱', '细腻', '善良'], story: '兔子跑得很快，但中途打了个盹，只得了第四名。' },
  { name: '龙', order: 5, yearMod: 4, traits: ['威严', '智慧', '强大', '有抱负', '慷慨'], story: '龙本来可以早到，但它为了帮助村庄降雨耽误了时间，得了第五名。' },
  { name: '蛇', order: 6, yearMod: 5, traits: ['智慧', '冷静', '神秘', '优雅', '直觉敏锐'], story: '蛇缠在龙的脚上一起到达，被列为第六名。' },
  { name: '马', order: 7, yearMod: 6, traits: ['奔放', '忠诚', '自由', '热情', '善交际'], story: '马跑得很快，一路领先，却被突然窜出的蛇吓了一跳，得了第七名。' },
  { name: '羊', order: 8, yearMod: 7, traits: ['温顺', '善良', '优雅', '有同情心', '艺术天赋'], story: '羊和猴、鸡一起合作渡河，互相帮助，得了第八名。' },
  { name: '猴', order: 9, yearMod: 8, traits: ['机灵', '活泼', '好动', '聪慧', '幽默'], story: '猴子和羊、鸡合作渡河，跳到岸上得了第九名。' },
  { name: '鸡', order: 10, yearMod: 9, traits: ['守信', '勤劳', '骄傲', '勇敢', '善言辞'], story: '鸡在河边找到木筏，和猴、羊一起渡河，得了第十名。' },
  { name: '狗', order: 11, yearMod: 10, traits: ['忠诚', '友善', '警觉', '诚实', '有责任感'], story: '狗在河里贪玩了一会儿，错过了前面的名次，得了第十一名。' },
  { name: '猪', order: 12, yearMod: 11, traits: ['诚实', '憨厚', '知足', '宽容', '乐观'], story: '猪因为贪吃贪睡，比赛途中还睡了一觉，最后一个到达，排在了第十二名。' },
];

// ========== 传统艺术 ==========
export interface TraditionalArt {
  id: string;
  name: string;
  description: string;
  features: string[];
  funFact: string;
}

export const TRADITIONAL_ARTS: TraditionalArt[] = [
  {
    id: 'art-01',
    name: '书法',
    description: '用毛笔书写汉字的艺术，是中国特有的传统艺术形式。',
    features: ['文房四宝：笔、墨、纸、砚', '五种字体：篆、隶、楷、行、草', '讲究"字如其人"'],
    funFact: '中国的书法被联合国教科文组织列入人类非物质文化遗产代表作名录。',
  },
  {
    id: 'art-02',
    name: '国画',
    description: '用毛笔在宣纸上作画，以山水、花鸟、人物为主要题材。',
    features: ['水墨为主，讲究"神似而非形似"', '留白：画面上留有空白，给人想象空间', '诗书画印一体'],
    funFact: '国画和西方油画最大的不同是，国画讲究"意境"，不追求逼真。',
  },
  {
    id: 'art-03',
    name: '剪纸',
    description: '用剪刀在纸上剪出各种图案的民间艺术。',
    features: ['多用红纸，象征吉祥喜庆', '常见图案：福字、窗花、生肖', '贴在窗户上装饰'],
    funFact: '中国剪纸有1500多年的历史，是最古老的民间艺术之一。',
  },
  {
    id: 'art-04',
    name: '京剧脸谱',
    description: '京剧演员在脸上画的不同颜色和图案，代表不同的人物性格。',
    features: ['红脸代表忠勇（如关羽）', '白脸代表奸诈（如曹操）', '黑脸代表正直（如包拯）', '蓝脸代表刚强'],
    funFact: '京剧被称为"国剧"，是中国最大的戏曲剧种，有200多年历史。',
  },
  {
    id: 'art-05',
    name: '茶道',
    description: '煮茶、品茶的传统礼仪，体现禅意与待客之道。',
    features: ['六大茶类：绿、红、青、白、黄、黑', '讲究水温、茶具、环境', '禅茶一味：以茶悟道'],
    funFact: '中国是茶的故乡，唐代陆羽的《茶经》是世界上最早的茶叶专著。',
  },
  {
    id: 'art-06',
    name: '古琴',
    description: '中国最古老的弹拨乐器之一，被誉为"圣人琴"。',
    features: ['七根弦，十三徽位', '讲究"清、微、淡、远"的意境', '文人四艺"琴棋书画"之首'],
    funFact: '古琴有3000多年历史，被联合国教科文组织列入人类非物质文化遗产代表作名录。',
  },
  {
    id: 'art-07',
    name: '刺绣',
    description: '用针线在织物上绣出图案的工艺，四大名绣广为流传。',
    features: ['四大名绣：苏绣、湘绣、粤绣、蜀绣', '绣法多样：平针、抢针、套绣', '图案题材：花鸟、人物、山水'],
    funFact: '苏绣以"精细雅洁"闻名，一件作品常需绣上数月。',
  },
  {
    id: 'art-08',
    name: '陶瓷',
    description: '用陶土或瓷土烧制的器具，是中国对世界文明的伟大贡献。',
    features: ['陶器粗朴，瓷器细腻', '著名窑口：汝、官、哥、定、钧', '青花瓷：白底蓝花，享誉世界'],
    funFact: '中国英文名"China"即来自"瓷"，可见瓷器对中国的重要地位。',
  },
];

// ========== 节日配对题数据 ==========
export interface FestivalMatchQuestion {
  festival: string;
  custom: string;
}

export const FESTIVAL_MATCH_QUESTIONS: FestivalMatchQuestion[] = [
  // 春节
  { festival: '春节', custom: '贴春联' },
  { festival: '春节', custom: '发红包' },
  { festival: '春节', custom: '放鞭炮' },
  { festival: '春节', custom: '守岁' },
  { festival: '春节', custom: '舞龙舞狮' },
  // 元宵节
  { festival: '元宵节', custom: '赏花灯' },
  { festival: '元宵节', custom: '猜灯谜' },
  { festival: '元宵节', custom: '吃元宵' },
  { festival: '元宵节', custom: '舞龙灯' },
  // 端午节
  { festival: '端午节', custom: '赛龙舟' },
  { festival: '端午节', custom: '包粽子' },
  { festival: '端午节', custom: '挂艾草' },
  { festival: '端午节', custom: '佩香囊' },
  // 中秋节
  { festival: '中秋节', custom: '赏月' },
  { festival: '中秋节', custom: '吃月饼' },
  { festival: '中秋节', custom: '提灯笼' },
  // 重阳节
  { festival: '重阳节', custom: '登高' },
  { festival: '重阳节', custom: '赏菊' },
  { festival: '重阳节', custom: '敬老' },
  // 清明节
  { festival: '清明节', custom: '扫墓' },
  { festival: '清明节', custom: '踏青' },
  { festival: '清明节', custom: '插柳' },
  // 七夕节
  { festival: '七夕节', custom: '乞巧' },
  { festival: '七夕节', custom: '拜织女' },
  { festival: '七夕节', custom: '穿针引线' },
  // 冬至
  { festival: '冬至', custom: '吃饺子' },
  { festival: '冬至', custom: '吃汤圆' },
  { festival: '冬至', custom: '数九' },
  // 腊八节
  { festival: '腊八节', custom: '熬腊八粥' },
  { festival: '腊八节', custom: '泡腊八蒜' },
  // 龙抬头
  { festival: '龙抬头', custom: '剃龙头' },
  { festival: '龙抬头', custom: '吃春饼' },
];

// ========== 脸谱颜色对应性格 ==========
export interface FacialMakeup {
  color: string;
  meaning: string;
  character: string;
}

export const FACIAL_MAKEUPS: FacialMakeup[] = [
  { color: '红色', meaning: '忠勇', character: '关羽' },
  { color: '白色', meaning: '奸诈', character: '曹操' },
  { color: '黑色', meaning: '正直', character: '包拯' },
  { color: '蓝色', meaning: '刚强', character: '窦尔敦' },
  { color: '黄色', meaning: '勇猛', character: '典韦' },
  { color: '紫色', meaning: '稳重', character: '张郃' },
  { color: '金色', meaning: '神通', character: '孙悟空' },
  { color: '银色', meaning: '妖魔', character: '银角大王' },
  { color: '绿色', meaning: '草莽', character: '程咬金' },
  { color: '粉红', meaning: '年迈', character: '廉颇' },
];
