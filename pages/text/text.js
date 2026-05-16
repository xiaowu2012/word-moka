/**
 * 课文阅读页 - 单音频 + 时间戳高亮 + 慢/快切换
 * 
 * 逻辑：
 * 1. 加载 Unit1_full.mp3 或 Unit1_slow.mp3
 * 2. 时间戳决定句子高亮和跳转
 * 3. 播放全文 → onTimeUpdate 实时算当前时间落在哪句 → 高亮
 * 4. 点某句 → seek 到对应时间位置
 * 5. 顶部"慢/快"按钮切换语速
 */

/* 从 data/texts.json 自动生成 - 25句, 与PDF核对一致 */

// ===== 数据 =====

// ===== 数据 =====


// ===== 数据 =====


// ===== 数据 =====
const TIMESTAMPS_FAST = {
  unit: "Unit1",
  title: "Art in safe hands",
  totalSentences: 25,
  audioDuration: 109.04,
  sentences: [
    { "index": 0, "en": "Good evening, ladies and gentlemen. I'm Zhan Haojing, a high school student.", "cn": "\u665a\u4e0a\u597d\uff0c\u5973\u58eb\u4eec\u5148\u751f\u4eec\u3002\u6211\u662f\u8a79\u660a\u6676\uff0c\u4e00\u540d\u9ad8\u4e2d\u751f\u3002", "start": 0, "end": 4.11, "vocab": ["gentleman", "lady"],
        "detailed": [{"part": "Good evening", "explain": "晚上好。good 好的，evening 傍晚/晚上"}, {"part": "ladies and gentlemen", "explain": "女士们先生们。lady 女士，gentleman 先生，固定招呼用语"}, {"part": "I'm Zhan Haojing", "explain": "我是詹昊晶。I'm = I am 缩写"}, {"part": "a high school student", "explain": "一名高中生。high school 高中，student 学生"}] },
    { "index": 1, "en": "I'm also a puppet performer.", "cn": "\u6211\u8fd8\u662f\u4e00\u540d\u6728\u5076\u8868\u6f14\u8005\u3002", "start": 4.354, "end": 5.933, "vocab": ["performer", "puppet"],
        "detailed": [{"part": "also", "explain": "也，还。放在 be 动词 am 之后"}, {"part": "a puppet performer", "explain": "一名木偶表演者。puppet 木偶，performer 表演者"}] },
    { "index": 2, "en": "Look at this puppet. If I move my fingers, it will come to life!", "cn": "\u770b\u770b\u8fd9\u4e2a\u6728\u5076\u3002\u5982\u679c\u6211\u52a8\u52a8\u624b\u6307\uff0c\u5b83\u5c31\u4f1a\u6d3b\u8fc7\u6765\uff01", "start": 6.211, "end": 10.101, "vocab": ["finger", "puppet"],
        "detailed": [{"part": "Look at", "explain": "看。look at 固定搭配，后接宾语"}, {"part": "this puppet", "explain": "这个木偶。this 指示代词"}, {"part": "If I move my fingers", "explain": "如果我动动手指。if 如果(条件状语从句)，finger 手指"}, {"part": "it will come to life", "explain": "它就会活过来。come to life 活过来，固定搭配"}] },
    { "index": 3, "en": "I was born into a family of Minnan puppet performers.", "cn": "\u6211\u51fa\u751f\u5728\u95fd\u5357\u7684\u4e00\u4e2a\u6728\u5076\u620f\u8868\u6f14\u4e16\u5bb6\u3002", "start": 10.542, "end": 13.653, "vocab": ["performer", "puppet"],
        "detailed": [{"part": "I was born into", "explain": "我出生于(某家庭)。be born into 出生于"}, {"part": "a family of Minnan puppet performers", "explain": "闽南木偶表演世家。Minnan 闽南，puppet performer 木偶表演者"}] },
    { "index": 4, "en": "My grandpa and my mum are both among the best.", "cn": "\u6211\u7684\u5916\u516c\u548c\u6211\u7684\u6bcd\u4eb2\u90fd\u662f\u8fd9\u884c\u4e2d\u7684\u4f7c\u4f7c\u8005\u3002", "start": 14.036, "end": 17.02, "vocab": [],
        "detailed": [{"part": "My grandpa and my mum", "explain": "我的外公和我的母亲。grandpa 外公，mum 妈妈(英式)"}, {"part": "are both among the best", "explain": "都是佼佼者。both 两者都，among the best 最优秀之列"}] },
    { "index": 5, "en": "When I was little, I loved the amazing stories they told with their hands.", "cn": "\u5c0f\u7684\u65f6\u5019\uff0c\u6211\u559c\u6b22\u4ed6\u4eec\u7528\u624b\u8bb2\u8ff0\u7684\u7cbe\u5f69\u6545\u4e8b\u3002", "start": 17.972, "end": 22.953, "vocab": [],
        "detailed": [{"part": "When I was little", "explain": "我小时候。when 当，little 小(年纪)"}, {"part": "I loved the amazing stories", "explain": "我喜欢那些精彩的故事。amazing 令人惊叹的"}, {"part": "they told with their hands", "explain": "他们用手讲述的。tell stories with hands 用手讲故事"}] },
    { "index": 6, "en": "However, things changed when I became a teenager.", "cn": "\u7136\u800c\uff0c\u5f53\u6211\u6210\u4e3a\u4e00\u540d\u9752\u5c11\u5e74\u65f6\uff0c\u60c5\u51b5\u53d1\u751f\u4e86\u53d8\u5316\u3002", "start": 23.649, "end": 26.68, "vocab": ["teenager"],
        "detailed": [{"part": "However", "explain": "然而。转折连词，比 but 更正式"}, {"part": "things changed", "explain": "情况变了。change 改变(过去式 changed)"}, {"part": "when I became a teenager", "explain": "当我成为青少年。teenager 青少年(13-19岁)"}] },
    { "index": 7, "en": "I felt less close to the art because people thought puppets were too old-fashioned.", "cn": "\u6211\u89c9\u5f97\u4e0e\u8fd9\u95e8\u827a\u672f\u4e0d\u90a3\u4e48\u4eb2\u8fd1\u4e86\uff0c\u56e0\u4e3a\u4eba\u4eec\u8ba4\u4e3a\u6728\u5076\u592a\u8001\u5f0f\u4e86\u3002", "start": 27.121, "end": 31.556, "vocab": ["old-fashioned", "puppet"],
        "detailed": [{"part": "felt less close to", "explain": "感觉不那么亲近了。feel 感觉(过去 felt)，less 更少地"}, {"part": "the art", "explain": "这门艺术"}, {"part": "because people thought puppets were too old-fashioned", "explain": "因为人们认为木偶太老式了。old-fashioned 老式的"}] },
    { "index": 8, "en": "I didn't want to be part of puppetry unless I was asked to.", "cn": "\u9664\u975e\u6709\u4eba\u8981\u6c42\uff0c\u5426\u5219\u6211\u4e0d\u60f3\u53c2\u4e0e\u6728\u5076\u8868\u6f14\u3002", "start": 31.881, "end": 34.876, "vocab": ["puppetry", "unless"],
        "detailed": [{"part": "didn't want to be part of", "explain": "不想参与。be part of 成为的一部分"}, {"part": "puppetry", "explain": "木偶表演艺术"}, {"part": "unless I was asked to", "explain": "除非有人要求。unless 除非(条件连词)"}] },
    { "index": 9, "en": "One day my mum showed me a performance by my grandpa's teacher.", "cn": "\u4e00\u5929\uff0c\u5988\u5988\u7ed9\u6211\u770b\u4e86\u5916\u516c\u8001\u5e08\u7684\u4e00\u573a\u8868\u6f14\u3002", "start": 35.318, "end": 38.754, "vocab": ["performance"],
        "detailed": [{"part": "One day", "explain": "有一天。讲故事常用开头"}, {"part": "my mum showed me", "explain": "我妈妈给我看了。show sb. sth. 给某人看"}, {"part": "a performance by my grandpa's teacher", "explain": "外公老师的一场表演。by 由"}] },
    { "index": 10, "en": "The finely made puppets and their exciting movements brought back childhood memories.", "cn": "\u7cbe\u81f4\u7684\u6728\u5076\u548c\u5b83\u4eec\u6fc0\u52a8\u4eba\u5fc3\u7684\u52a8\u4f5c\u5e26\u56de\u4e86\u7ae5\u5e74\u7684\u8bb0\u5fc6\u3002", "start": 39.079, "end": 43.596, "vocab": ["puppet"],
        "detailed": [{"part": "The finely made puppets", "explain": "制作精良的木偶。finely 精细地"}, {"part": "their exciting movements", "explain": "激动人心的动作。exciting 令人兴奋的，movement 动作"}, {"part": "brought back childhood memories", "explain": "带回童年回忆。bring back 带回，memory 记忆"}] },
    { "index": 11, "en": "Then and there, my love for puppetry started to grow again.", "cn": "\u5c31\u5728\u90a3\u65f6\uff0c\u6211\u5bf9\u6728\u5076\u8868\u6f14\u7684\u70ed\u7231\u91cd\u65b0\u71c3\u8d77\u3002", "start": 43.921, "end": 47.799, "vocab": ["puppetry"],
        "detailed": [{"part": "Then and there", "explain": "就在那时。固定短语"}, {"part": "my love for puppetry", "explain": "我对木偶表演的爱"}, {"part": "started to grow again", "explain": "重新燃起。start to do 开始，grow 增长"}] },
    { "index": 12, "en": "I posted my doubts about the future of puppetry online.", "cn": "\u6211\u5728\u7f51\u4e0a\u53d1\u5e03\u4e86\u5173\u4e8e\u6728\u5076\u8868\u6f14\u672a\u6765\u7684\u56f0\u60d1\u3002", "start": 48.31, "end": 51.549, "vocab": ["puppetry"],
        "detailed": [{"part": "I posted my doubts", "explain": "我发布了困惑。post 发帖，doubt 困惑"}, {"part": "about the future of puppetry", "explain": "关于木偶表演的未来"}] },
    { "index": 13, "en": "To my surprise, the post was flooded with comments expressing warm feelings.", "cn": "\u4ee4\u6211\u60ca\u8bb6\u7684\u662f\uff0c\u5e16\u5b50\u88ab\u8868\u8fbe\u6e29\u6696\u60c5\u611f\u7684\u8bc4\u8bba\u6df9\u6ca1\u4e86\u3002", "start": 51.874, "end": 56.309, "vocab": [],
        "detailed": [{"part": "To my surprise", "explain": "令我惊讶的是。固定短语"}, {"part": "the post was flooded with comments", "explain": "帖子被评论淹没。be flooded with 被淹没"}, {"part": "expressing warm feelings", "explain": "表达温暖的情感。express 表达，warm 温暖的"}] },
    { "index": 14, "en": "Many people showed their love for the art of puppetry and encouraged me to hold on.", "cn": "\u8bb8\u591a\u4eba\u8868\u8fbe\u4e86\u5bf9\u6728\u5076\u8868\u6f14\u827a\u672f\u7684\u70ed\u7231\uff0c\u5e76\u9f13\u52b1\u6211\u575a\u6301\u3002", "start": 56.75, "end": 61.406, "vocab": ["puppetry"],
        "detailed": [{"part": "Many people showed their love", "explain": "许多人表达了爱。show one's love 表达某人的爱"}, {"part": "for the art of puppetry", "explain": "对木偶表演艺术"}, {"part": "encouraged me to hold on", "explain": "鼓励我坚持。encourage sb. to do 鼓励，hold on 坚持"}] },
    { "index": 15, "en": "A truth hit me - it was my duty to keep the art alive because puppetry was in my blood.", "cn": "\u4e00\u4e2a\u771f\u76f8\u51fb\u4e2d\u4e86\u6211\u2014\u2014\u8ba9\u8fd9\u95e8\u827a\u672f\u4fdd\u6301\u6d3b\u529b\u662f\u6211\u7684\u8d23\u4efb\uff0c\u56e0\u4e3a\u6728\u5076\u8868\u6f14\u5728\u6211\u7684\u8840\u6db2\u91cc\u3002", "start": 62.01, "end": 67.652, "vocab": ["blood", "puppetry"],
        "detailed": [{"part": "A truth hit me", "explain": "一个真相击中了我。hit 击中(过去式 hit)"}, {"part": "it was my duty", "explain": "这是我的责任。duty 责任"}, {"part": "to keep the art alive", "explain": "让艺术保持活力。keep alive 保持活力"}, {"part": "because puppetry was in my blood", "explain": "因为木偶在我血液里。be in one's blood 与生俱来"}] },
    { "index": 16, "en": "The art will be popular again if young people are interested in it.", "cn": "\u5982\u679c\u5e74\u8f7b\u4eba\u5bf9\u5b83\u611f\u5174\u8da3\uff0c\u8fd9\u95e8\u827a\u672f\u5c31\u4f1a\u518d\u6b21\u6d41\u884c\u8d77\u6765\u3002", "start": 68.093, "end": 71.483, "vocab": [],
        "detailed": [{"part": "The art will be popular again", "explain": "艺术会再次流行。popular 流行的"}, {"part": "if young people are interested in it", "explain": "如果年轻人感兴趣。be interested in 对感兴趣"}] },
    { "index": 17, "en": "So I held a puppet show at school.", "cn": "\u4e8e\u662f\u6211\u5728\u5b66\u6821\u4e3e\u529e\u4e86\u4e00\u573a\u6728\u5076\u8868\u6f14\u3002", "start": 72.087, "end": 74.073, "vocab": ["puppet"],
        "detailed": [{"part": "So I held a puppet show", "explain": "于是我举办了一场木偶表演。hold 举办(过去 held)"}, {"part": "at school", "explain": "在学校"}] },
    { "index": 18, "en": "When I finished performing, I looked up and saw a surprising picture: the students were on the edge of their seats.", "cn": "\u5f53\u6211\u8868\u6f14\u5b8c\uff0c\u62ac\u5934\u770b\u5230\u4e00\u5e45\u4ee4\u4eba\u60ca\u8bb6\u7684\u753b\u9762\uff1a\u5b66\u751f\u4eec\u90fd\u805a\u7cbe\u4f1a\u795e\u5730\u770b\u7740\u3002", "start": 74.456, "end": 82.142, "vocab": ["edge", "perform"],
        "detailed": [{"part": "When I finished performing", "explain": "当我表演完。finish doing 做完某事"}, {"part": "I looked up", "explain": "我抬头看。look up 抬头"}, {"part": "saw a surprising picture", "explain": "看到惊人的画面。surprising 令人惊讶的"}, {"part": "the students were on the edge of their seats", "explain": "学生们聚精会神。on the edge of one's seat 全神贯注"}] },
    { "index": 19, "en": "Their eyes were glued to the puppets.", "cn": "\u4ed6\u4eec\u7684\u773c\u775b\u7d27\u76ef\u7740\u6728\u5076\u3002", "start": 82.351, "end": 84.603, "vocab": ["puppet"],
        "detailed": [{"part": "Their eyes were glued to the puppets", "explain": "眼睛紧盯着木偶。be glued to 紧盯着"}] },
    { "index": 20, "en": "After a warm cheer, they came to ask where they could see a full performance.", "cn": "\u5728\u70ed\u70c8\u7684\u6b22\u547c\u4e4b\u540e\uff0c\u4ed6\u4eec\u6765\u8be2\u95ee\u5728\u54ea\u91cc\u80fd\u770b\u5230\u5b8c\u6574\u7684\u8868\u6f14\u3002", "start": 84.986, "end": 89.873, "vocab": ["performance"],
        "detailed": [{"part": "After a warm cheer", "explain": "热烈的欢呼后。cheer 欢呼声"}, {"part": "they came to ask", "explain": "他们来询问。come to do 来做"}, {"part": "where they could see a full performance", "explain": "哪里能看到完整表演。full 完整的"}] },
    { "index": 21, "en": "The positive reply from the young viewers gave me more courage.", "cn": "\u5e74\u8f7b\u89c2\u4f17\u4eec\u7684\u79ef\u6781\u56de\u5e94\u7ed9\u4e86\u6211\u66f4\u591a\u52c7\u6c14\u3002", "start": 90.57, "end": 94.041, "vocab": ["viewer"],
        "detailed": [{"part": "The positive reply", "explain": "积极的回应。positive 积极的，reply 回应"}, {"part": "from the young viewers", "explain": "来自年轻观众。viewer 观看者(复数 viewers)"}, {"part": "gave me more courage", "explain": "给了我更多勇气。give 给(过去 gave)，courage 勇气"}] },
    { "index": 22, "en": "Since then, my puppet shows have drawn more attention both from home and abroad.", "cn": "\u4ece\u6b64\uff0c\u6211\u7684\u6728\u5076\u8868\u6f14\u5728\u56fd\u5185\u5916\u90fd\u5f15\u8d77\u4e86\u66f4\u591a\u7684\u5173\u6ce8\u3002", "start": 94.645, "end": 99.672, "vocab": ["puppet"],
        "detailed": [{"part": "Since then", "explain": "从那时起。since 自以后"}, {"part": "my puppet shows have drawn more attention", "explain": "我的表演吸引了更多关注。draw attention 吸引注意(完成时 have drawn)"}, {"part": "both from home and abroad", "explain": "国内外。home 国内，abroad 国外"}] },
    { "index": 23, "en": "The old art is getting more interest and new stories.", "cn": "\u8fd9\u95e8\u53e4\u8001\u7684\u827a\u672f\u6b63\u5728\u83b7\u5f97\u66f4\u591a\u7684\u5174\u8da3\u548c\u65b0\u6545\u4e8b\u3002", "start": 99.997, "end": 102.935, "vocab": [],
        "detailed": [{"part": "The old art", "explain": "古老的艺术。old 古老的"}, {"part": "is getting more interest", "explain": "正在获得更多关注。get interest 获得关注(现在进行时)"}] },
    { "index": 24, "en": "With more and more people joining in, I believe the special magic of this traditional art will last forever!", "cn": "\u968f\u7740\u8d8a\u6765\u8d8a\u591a\u7684\u4eba\u52a0\u5165\uff0c\u6211\u76f8\u4fe1\u8fd9\u95e8\u4f20\u7edf\u827a\u672f\u7684\u7279\u6b8a\u9b54\u529b\u5c06\u6c38\u8fdc\u6301\u7eed\u4e0b\u53bb\uff01", "start": 103.318, "end": 109.042, "vocab": [],
        "detailed": [{"part": "With more and more people joining in", "explain": "随着越来越多人加入。more and more 越来越多，独立主格结构"}, {"part": "I believe", "explain": "我相信。believe 相信"}, {"part": "the special magic of this traditional art", "explain": "这门传统艺术的特殊魔力。magic 魔力，traditional 传统的"}, {"part": "will last forever", "explain": "将永远持续。last 持续，forever 永远"}] }
  ],
  paragraphs: [
  {
    "sentenceIndices": [
      0,
      1,
      2
    ],
    "start": 0,
    "end": 10.101
  },
  {
    "sentenceIndices": [
      3,
      4,
      5
    ],
    "start": 10.542,
    "end": 22.953
  },
  {
    "sentenceIndices": [
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15
    ],
    "start": 23.649,
    "end": 67.652
  },
  {
    "sentenceIndices": [
      16,
      17,
      18,
      19,
      20
    ],
    "start": 68.093,
    "end": 89.873
  },
  {
    "sentenceIndices": [
      21,
      22,
      23,
      24
    ],
    "start": 90.57,
    "end": 109.042
  }
]
};

const SCALE = 1 / 0.86
const TIMESTAMPS_SLOW = {
  unit: "Unit1",
  title: "Art in safe hands",
  totalSentences: 25,
  audioDuration: +(109.04 * SCALE).toFixed(2),
  sentences: TIMESTAMPS_FAST.sentences.map(s => ({ ...s, start: +(s.start * SCALE).toFixed(3), end: +(s.end * SCALE).toFixed(3) })),
  paragraphs: TIMESTAMPS_FAST.paragraphs.map(p => ({ ...p, start: +(p.start * SCALE).toFixed(3), end: +(p.end * SCALE).toFixed(3) }))
}

const VOCAB_DATA = {
    "artist": { "word": "artist", "cn": "艺术家", "ph": "/\'a:tust/", "key": true },
    "blood": { "word": "blood", "cn": "血，血液", "ph": "/bld/", "key": true },
    "burst": { "word": "burst", "cn": "冲，闯；（使）爆裂", "ph": "/b3:st/", "key": false },
    "claw": { "word": "claw", "cn": "爪", "ph": "/klo:/", "key": false },
    "creativity": { "word": "creativity", "cn": "独创性", "ph": "/，kri:er\'tvsti/", "key": true },
    "creator": { "word": "creator", "cn": "创作者；创造者", "ph": "/kri\'eite/", "key": true },
    "dust": { "word": "dust", "cn": "灰尘，尘埃", "ph": "/dast/", "key": false },
    "eagle": { "word": "eagle", "cn": "鹰", "ph": "", "key": true },
    "edge": { "word": "edge", "cn": "边缘", "ph": "/eds/", "key": false },
    "educator": { "word": "educator", "cn": "教育家", "ph": "/\'edjukerta/", "key": false },
    "finger": { "word": "finger", "cn": "手指", "ph": "/\'fuga/", "key": true },
    "gentleman": { "word": "gentleman", "cn": "先生", "ph": "/\'dsentlman/", "key": true },
    "grand": { "word": "grand", "cn": "宏伟的，壮丽的", "ph": "/graend/", "key": false },
    "group": { "word": "group", "cn": "组，群；团体", "ph": "/grup/", "key": true },
    "hidden": { "word": "hidden", "cn": "隐藏的，隐秘的", "ph": "/\'hrcdn/", "key": true },
    "inspire": { "word": "inspire", "cn": "鼓舞，激励", "ph": "/m\'spars/", "key": false },
    "intelligent": { "word": "intelligent", "cn": "有智", "ph": "/m \'teladgont/", "key": false },
    "kill": { "word": "kill", "cn": "弄死，杀死", "ph": "/kal/", "key": true },
    "lady": { "word": "lady", "cn": "女士，女子", "ph": "/\'lerdi/", "key": true },
    "lie": { "word": "lie", "cn": "躺；说谎", "ph": "", "key": true },
    "old-fashioned": { "word": "old-fashioned", "cn": "老式的，过时的", "ph": "", "key": true },
    "perform": { "word": "perform", "cn": "表演，演出", "ph": "/pe \'fo:m/", "key": true },
    "performance": { "word": "performance", "cn": "表演", "ph": "/pa \'fo:mans/", "key": true },
    "performer": { "word": "performer", "cn": "表演者", "ph": "/pe \'fo:ma/", "key": true },
    "puppet": { "word": "puppet", "cn": "（牵线）木偶", "ph": "/\'pAprt/", "key": false },
    "puppetry": { "word": "puppetry", "cn": "木偶表演艺术", "ph": "/\'pApatri/", "key": false },
    "roar": { "word": "roar", "cn": "吼叫，呼啸", "ph": "/ro:/", "key": false },
    "scaled": { "word": "scaled", "cn": "有鳞的", "ph": "/skerld/", "key": false },
    "scare": { "word": "scare", "cn": "使惊恐，吓唬", "ph": "/skea/", "key": true },
    "scarecrow": { "word": "scarecrow", "cn": "稻草人", "ph": "/\'skeokru/", "key": false },
    "teenager": { "word": "teenager", "cn": "青少年", "ph": "/\'tinerdga/", "key": true },
    "tender": { "word": "tender", "cn": "娇嫩的，幼嫩", "ph": "/\'tenda/", "key": false },
    "unless": { "word": "unless", "cn": "除非•.", "ph": "/an\'les/", "key": true },
    "valley": { "word": "valley", "cn": "谷；山谷", "ph": "/\'vaeli/", "key": false },
    "vast": { "word": "vast", "cn": "广大无边的，极大的13", "ph": "/vast/", "key": false },
    "viewer": { "word": "viewer", "cn": "观看者", "ph": "/\'vjua/", "key": true },
    "volunteer": { "word": "volunteer", "cn": "志愿者", "ph": "/，volon\'tra/", "key": false },
    "wealthy": { "word": "wealthy", "cn": "富有的；富", "ph": "/\'welfi/", "key": true },
    "wildly": { "word": "wildly", "cn": "激动地", "ph": "/\'warldli/", "key": true },
    "wing": { "word": "wing", "cn": "翅膀，翼", "ph": "/wu/", "key": true },
    "youth": { "word": "youth", "cn": "青年，年轻人", "ph": "/ju:6/", "key": true }
}

let app = null

Page({
  data: {
    unitId: '',
    title: '',
    totalSentences: 0,
    audioDuration: 0,
    paragraphs: [],
    sentences: [],
    sentenceTokens: [],
    showWordCard: false,
    selectedWord: null,
    playingSentenceIdx: -1,
    showCn: true,
    showDetailed: true,
    isPlaying: false,
    isSlow: true,
    // 预格式化好的时间显示
    progressTime: '0s',
    totalTime: '0s',

    // 弹窗
    showWordCard: false,
    selectedWord: null,
  },

  async onLoad(options) {
    const unitId = options.unit || 'Unit1'
    app = getApp()
    this._unitId = unitId
    this._audioCtx = null

    // 默认慢速
    this._setTimestamps(TIMESTAMPS_SLOW)
    this._audioCtx = await this._initAudio('slow')
  },

  _setTimestamps(ts) {
    this._ts = ts
    const totalTime = this._fmtSec(ts.audioDuration)

    // 分词：每句拆成 token 数组
    const sentenceTokens = ts.sentences.map(s => this._tokenize(s.en, s.vocab))

    this.setData({
      unitId: ts.unit || this._unitId,
      title: ts.title,
      totalSentences: ts.totalSentences,
      audioDuration: ts.audioDuration,
      paragraphs: ts.paragraphs,
      sentences: ts.sentences,
      sentenceTokens,
      totalTime,
    })
  },

  // 秒数 -> 友好时间格式: 23s / 1m49s
  _fmtSec(n) {
    if (typeof n !== 'number') return '0s'
    const s = Math.round(n)
    if (s < 60) return s + 's'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return sec > 0 ? m + 'm' + sec + 's' : m + 'm'
  },
  _formatTime(idx) {
    const s = this._ts && this._ts.sentences
    if (s && s[idx]) return this._fmtSec(s[idx].end)
    return '0s'
  },

  // 对应两个音频文件（云存储 fileID）
  _audioFiles: {
    'normal': 'cloud://cloudbase-d2gs4fpbhca51e19f.636c-cloudbase-d2gs4fpbhca51e19f-1433289257/audio/Unit1_full.mp3',
    'slow': 'cloud://cloudbase-d2gs4fpbhca51e19f.636c-cloudbase-d2gs4fpbhca51e19f-1433289257/audio/Unit1_slow.mp3',
  },

  // 初始化音频，返回 Promise，resolve 后 src 才可用
  _initAudio(mode = 'normal') {
    return new Promise((resolve) => {
      // 销毁旧音频
      if (this._audioCtx) {
        this._audioCtx.stop()
        this._audioCtx.destroy()
        this._audioCtx = null
      }

      const ctx = wx.createInnerAudioContext()

      // 云存储 fileID 需先转临时链接才能播放
      wx.cloud.getTempFileURL({
        fileList: [this._audioFiles[mode]],
        success: res => {
          const url = res.fileList && res.fileList[0] && res.fileList[0].tempFileURL
          ctx.src = url || `/audio/${mode === 'slow' ? 'Unit1_slow.mp3' : 'Unit1_full.mp3'}`
        },
        fail: () => {
          // 降级到本地文件
          ctx.src = `/audio/${mode === 'slow' ? 'Unit1_slow.mp3' : 'Unit1_full.mp3'}`
        },
        complete: () => {
          resolve(ctx)
        }
      })
    })
  },
    
  _initAudio(mode = 'normal') {
    return new Promise((resolve) => {
      if (this._audioCtx) {
        this._audioCtx.stop()
        this._audioCtx.destroy()
        this._audioCtx = null
      }

      const ctx = wx.createInnerAudioContext()
      ctx.autoplay = false
      ctx.obeyMuteSwitch = false

      this._seeking = false

      ctx.onTimeUpdate(() => {
        if (this._seeking) return
        const t = ctx.currentTime
        const sentences = this._ts.sentences
        let foundIdx = -1
        for (let i = 0; i < sentences.length; i++) {
          if (t >= sentences[i].start && t < sentences[i].end) {
            foundIdx = i
            break
          }
        }
        if (foundIdx !== this.data.playingSentenceIdx) {
          if (foundIdx === -1) return
          this.setData({
            playingSentenceIdx: foundIdx,
            progressTime: this._formatTime(foundIdx),
          })
          this._scrollToSentence(foundIdx)
        }
      })

      ctx.onEnded(() => {
        this.setData({ isPlaying: false, playingSentenceIdx: -1 })
      })

      ctx.onStop(() => { this.setData({ isPlaying: false }) })
      ctx.onPause(() => { this.setData({ isPlaying: false }) })

      this._audioCtx = ctx

      wx.cloud.getTempFileURL({
        fileList: [this._audioFiles[mode]],
        success: res => {
          const url = res.fileList && res.fileList[0] && res.fileList[0].tempFileURL
          ctx.src = url || `/audio/${mode === 'slow' ? 'Unit1_slow.mp3' : 'Unit1_full.mp3'}`
        },
        fail: () => {
          ctx.src = `/audio/${mode === 'slow' ? 'Unit1_slow.mp3' : 'Unit1_full.mp3'}`
        },
        complete: () => {
          resolve(ctx)
        }
      })
    })
  },

async onToggleSpeed() {
    const isSlow = !this.data.isSlow
    const mode = isSlow ? 'slow' : 'normal'
    const ts = isSlow ? TIMESTAMPS_SLOW : TIMESTAMPS_FAST
    const wasPlaying = this._audioCtx && !this._audioCtx.paused
    const currentTime = this._audioCtx ? this._audioCtx.currentTime : 0

    // 找当前句，换算到新时间线
    let seekTime = 0
    const oldTs = this._ts
    if (wasPlaying && oldTs) {
      const oldSentences = oldTs.sentences
      let curIdx = -1
      for (let i = 0; i < oldSentences.length; i++) {
        if (currentTime >= oldSentences[i].start && currentTime < oldSentences[i].end) {
          curIdx = i
          break
        }
      }
      if (curIdx >= 0 && ts.sentences[curIdx]) {
        const ratio = oldTs.audioDuration / ts.audioDuration
        seekTime = currentTime * ratio
      }
    }

    // 按钮颜色立刻变，不用等云存储
    this.setData({ isSlow })
    this._setTimestamps(ts)
    this._audioCtx = await this._initAudio(mode)

    if (wasPlaying && seekTime > 0) {
      this._seeking = true
      this._audioCtx.seek(seekTime)
      const h = () => {
        this._audioCtx.offSeeked(h)
        this._seeking = false
        this._audioCtx.play()
      }
      this._audioCtx.onSeeked(h)
    }
  },

  _scrollToSentence(idx) {
    if (idx < 0) return
    const query = wx.createSelectorQuery()
    query.select(`#sentence-${idx}`).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec((res) => {
      if (res[0] && res[1]) {
        wx.pageScrollTo({
          scrollTop: res[1].scrollTop + res[0].top - 200,
          duration: 200,
        })
      }
    })
  },

  // === 播放控制 ===

  onPlaySentence(e) {
    const idx = parseInt(e.currentTarget.dataset.idx)
    if (isNaN(idx)) return
    if (idx === this.data.playingSentenceIdx && this.data.isPlaying) {
      this._pause()
      return
    }
    this._playFrom(idx)
  },

  onTogglePlayAll() {
    if (this.data.isPlaying) {
      this._pause()
    } else {
      this._playFrom(this.data.playingSentenceIdx >= 0 ? this.data.playingSentenceIdx : 0)
    }
  },

  _playFrom(idx) {
    if (!this._audioCtx) return
    const sentences = this._ts.sentences
    if (idx >= sentences.length) return

    this._seeking = true

    this.setData({
      isPlaying: true,
      playingSentenceIdx: idx,
      progressTime: this._formatTime(idx),
    })

    const target = sentences[idx].start

    const done = () => {
      this._seeking = false
      this._audioCtx.play()
    }

    // seek(0) 不会触发 onSeeked（已经在0位），直接play
    if (target === 0) {
      this._audioCtx.seek(0)
      done()
      return
    }

    // 先seek到位再play，否则seek异步会先播0再跳转
    this._audioCtx.seek(target)
    const handler = () => {
      this._audioCtx.offSeeked(handler)
      done()
    }
    this._audioCtx.onSeeked(handler)
  },

  _pause() {
    if (this._audioCtx) this._audioCtx.pause()
    this.setData({ isPlaying: false })
  },

  // === 显示控制 ===

  onToggleCn() {
    this.setData({ showCn: !this.data.showCn })
  },

  onToggleDetail() {
    this.setData({ showDetailed: !this.data.showDetailed })
  },

  // ===== 重点词分词 + 行内卡片 =====

  // 检查单词是否匹配某个重点词（处理变形）
  _matchVocab(word, vocabList) {
    if (!vocabList || vocabList.length === 0) return null
    const w = word.toLowerCase().replace(/[^a-z]/g, '')
    if (!w) return null

    // 直接匹配
    if (vocabList.includes(w)) return w

    // 规则suffix: +s, +es, +ed, +ing, +er, +ers, +tion, +sions
    const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'ers', 'tion', 'tions', 'sion', 'sions', 'ance', 'ances']
    for (const suf of suffixes) {
      if (w.endsWith(suf)) {
        const base = w.slice(0, -suf.length)
        if (vocabList.includes(base)) return base
      }
    }

    // y → ies
    if (w.endsWith('ies')) {
      const base = w.slice(0, -3) + 'y'
      if (vocabList.includes(base)) return base
    }

    // man → men
    if (w.endsWith('men')) {
      const base = w.slice(0, -3) + 'man'
      if (vocabList.includes(base)) return base
    }

    return null
  },

  // 把句子拆成 tokens，标记重点词
  _tokenize(en, vocabList) {
    const tokens = []
    // 按单词和标点拆分
    const parts = en.match(/\w+(?:'\w+)?(?:-\w+)*|[^\w\s]+/g) || []
    for (const part of parts) {
      const matched = this._matchVocab(part, vocabList)
      const isKey = matched ? (VOCAB_DATA[matched] && !!VOCAB_DATA[matched].key) : false
      tokens.push({
        text: part,
        isVocab: !!matched,
        wordKey: matched || '',
        isKey: isKey,
      })
    }
    return tokens
  },

  // 重点词点击 → 弹出居中单词卡
  onWordTouch(e) {
    const wordKey = e.currentTarget.dataset.word
    if (!wordKey || !VOCAB_DATA[wordKey]) return
    this.setData({ selectedWord: VOCAB_DATA[wordKey], showWordCard: true })
  },

  onCloseWordCard() {
    this.setData({ showWordCard: false })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '单词魔卡 · ' + (this.data.title || '初中英语学习'),
      path: '/pages/text/text?unit=' + this._unitId,
    }
  },

  // === 生命周期 ===

  onUnload() {
    if (this._audioCtx) {
      this._audioCtx.stop()
      this._audioCtx.destroy()
      this._audioCtx = null
    }
  },

  onBack() { wx.navigateBack() },
})
