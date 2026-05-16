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
    { "index": 0, "en": "Good evening, ladies and gentlemen. I'm Zhan Haojing, a high school student.", "cn": "\u665a\u4e0a\u597d\uff0c\u5973\u58eb\u4eec\u5148\u751f\u4eec\u3002\u6211\u662f\u8a79\u660a\u6676\uff0c\u4e00\u540d\u9ad8\u4e2d\u751f\u3002", "start": 0, "end": 4.11, "vocab": ["gentleman", "lady"] },
    { "index": 1, "en": "I'm also a puppet performer.", "cn": "\u6211\u8fd8\u662f\u4e00\u540d\u6728\u5076\u8868\u6f14\u8005\u3002", "start": 4.354, "end": 5.933, "vocab": ["performer", "puppet"] },
    { "index": 2, "en": "Look at this puppet. If I move my fingers, it will come to life!", "cn": "\u770b\u770b\u8fd9\u4e2a\u6728\u5076\u3002\u5982\u679c\u6211\u52a8\u52a8\u624b\u6307\uff0c\u5b83\u5c31\u4f1a\u6d3b\u8fc7\u6765\uff01", "start": 6.211, "end": 10.101, "vocab": ["finger", "puppet"] },
    { "index": 3, "en": "I was born into a family of Minnan puppet performers.", "cn": "\u6211\u51fa\u751f\u5728\u95fd\u5357\u7684\u4e00\u4e2a\u6728\u5076\u620f\u8868\u6f14\u4e16\u5bb6\u3002", "start": 10.542, "end": 13.653, "vocab": ["performer", "puppet"] },
    { "index": 4, "en": "My grandpa and my mum are both among the best.", "cn": "\u6211\u7684\u5916\u516c\u548c\u6211\u7684\u6bcd\u4eb2\u90fd\u662f\u8fd9\u884c\u4e2d\u7684\u4f7c\u4f7c\u8005\u3002", "start": 14.036, "end": 17.02, "vocab": [] },
    { "index": 5, "en": "When I was little, I loved the amazing stories they told with their hands.", "cn": "\u5c0f\u7684\u65f6\u5019\uff0c\u6211\u559c\u6b22\u4ed6\u4eec\u7528\u624b\u8bb2\u8ff0\u7684\u7cbe\u5f69\u6545\u4e8b\u3002", "start": 17.972, "end": 22.953, "vocab": [] },
    { "index": 6, "en": "However, things changed when I became a teenager.", "cn": "\u7136\u800c\uff0c\u5f53\u6211\u6210\u4e3a\u4e00\u540d\u9752\u5c11\u5e74\u65f6\uff0c\u60c5\u51b5\u53d1\u751f\u4e86\u53d8\u5316\u3002", "start": 23.649, "end": 26.68, "vocab": ["teenager"] },
    { "index": 7, "en": "I felt less close to the art because people thought puppets were too old-fashioned.", "cn": "\u6211\u89c9\u5f97\u4e0e\u8fd9\u95e8\u827a\u672f\u4e0d\u90a3\u4e48\u4eb2\u8fd1\u4e86\uff0c\u56e0\u4e3a\u4eba\u4eec\u8ba4\u4e3a\u6728\u5076\u592a\u8001\u5f0f\u4e86\u3002", "start": 27.121, "end": 31.556, "vocab": ["old-fashioned", "puppet"] },
    { "index": 8, "en": "I didn't want to be part of puppetry unless I was asked to.", "cn": "\u9664\u975e\u6709\u4eba\u8981\u6c42\uff0c\u5426\u5219\u6211\u4e0d\u60f3\u53c2\u4e0e\u6728\u5076\u8868\u6f14\u3002", "start": 31.881, "end": 34.876, "vocab": ["puppetry", "unless"] },
    { "index": 9, "en": "One day my mum showed me a performance by my grandpa's teacher.", "cn": "\u4e00\u5929\uff0c\u5988\u5988\u7ed9\u6211\u770b\u4e86\u5916\u516c\u8001\u5e08\u7684\u4e00\u573a\u8868\u6f14\u3002", "start": 35.318, "end": 38.754, "vocab": ["performance"] },
    { "index": 10, "en": "The finely made puppets and their exciting movements brought back childhood memories.", "cn": "\u7cbe\u81f4\u7684\u6728\u5076\u548c\u5b83\u4eec\u6fc0\u52a8\u4eba\u5fc3\u7684\u52a8\u4f5c\u5e26\u56de\u4e86\u7ae5\u5e74\u7684\u8bb0\u5fc6\u3002", "start": 39.079, "end": 43.596, "vocab": ["puppet"] },
    { "index": 11, "en": "Then and there, my love for puppetry started to grow again.", "cn": "\u5c31\u5728\u90a3\u65f6\uff0c\u6211\u5bf9\u6728\u5076\u8868\u6f14\u7684\u70ed\u7231\u91cd\u65b0\u71c3\u8d77\u3002", "start": 43.921, "end": 47.799, "vocab": ["puppetry"] },
    { "index": 12, "en": "I posted my doubts about the future of puppetry online.", "cn": "\u6211\u5728\u7f51\u4e0a\u53d1\u5e03\u4e86\u5173\u4e8e\u6728\u5076\u8868\u6f14\u672a\u6765\u7684\u56f0\u60d1\u3002", "start": 48.31, "end": 51.549, "vocab": ["puppetry"] },
    { "index": 13, "en": "To my surprise, the post was flooded with comments expressing warm feelings.", "cn": "\u4ee4\u6211\u60ca\u8bb6\u7684\u662f\uff0c\u5e16\u5b50\u88ab\u8868\u8fbe\u6e29\u6696\u60c5\u611f\u7684\u8bc4\u8bba\u6df9\u6ca1\u4e86\u3002", "start": 51.874, "end": 56.309, "vocab": [] },
    { "index": 14, "en": "Many people showed their love for the art of puppetry and encouraged me to hold on.", "cn": "\u8bb8\u591a\u4eba\u8868\u8fbe\u4e86\u5bf9\u6728\u5076\u8868\u6f14\u827a\u672f\u7684\u70ed\u7231\uff0c\u5e76\u9f13\u52b1\u6211\u575a\u6301\u3002", "start": 56.75, "end": 61.406, "vocab": ["puppetry"] },
    { "index": 15, "en": "A truth hit me - it was my duty to keep the art alive because puppetry was in my blood.", "cn": "\u4e00\u4e2a\u771f\u76f8\u51fb\u4e2d\u4e86\u6211\u2014\u2014\u8ba9\u8fd9\u95e8\u827a\u672f\u4fdd\u6301\u6d3b\u529b\u662f\u6211\u7684\u8d23\u4efb\uff0c\u56e0\u4e3a\u6728\u5076\u8868\u6f14\u5728\u6211\u7684\u8840\u6db2\u91cc\u3002", "start": 62.01, "end": 67.652, "vocab": ["blood", "puppetry"] },
    { "index": 16, "en": "The art will be popular again if young people are interested in it.", "cn": "\u5982\u679c\u5e74\u8f7b\u4eba\u5bf9\u5b83\u611f\u5174\u8da3\uff0c\u8fd9\u95e8\u827a\u672f\u5c31\u4f1a\u518d\u6b21\u6d41\u884c\u8d77\u6765\u3002", "start": 68.093, "end": 71.483, "vocab": [] },
    { "index": 17, "en": "So I held a puppet show at school.", "cn": "\u4e8e\u662f\u6211\u5728\u5b66\u6821\u4e3e\u529e\u4e86\u4e00\u573a\u6728\u5076\u8868\u6f14\u3002", "start": 72.087, "end": 74.073, "vocab": ["puppet"] },
    { "index": 18, "en": "When I finished performing, I looked up and saw a surprising picture: the students were on the edge of their seats.", "cn": "\u5f53\u6211\u8868\u6f14\u5b8c\uff0c\u62ac\u5934\u770b\u5230\u4e00\u5e45\u4ee4\u4eba\u60ca\u8bb6\u7684\u753b\u9762\uff1a\u5b66\u751f\u4eec\u90fd\u805a\u7cbe\u4f1a\u795e\u5730\u770b\u7740\u3002", "start": 74.456, "end": 82.142, "vocab": ["edge", "perform"] },
    { "index": 19, "en": "Their eyes were glued to the puppets.", "cn": "\u4ed6\u4eec\u7684\u773c\u775b\u7d27\u76ef\u7740\u6728\u5076\u3002", "start": 82.351, "end": 84.603, "vocab": ["puppet"] },
    { "index": 20, "en": "After a warm cheer, they came to ask where they could see a full performance.", "cn": "\u5728\u70ed\u70c8\u7684\u6b22\u547c\u4e4b\u540e\uff0c\u4ed6\u4eec\u6765\u8be2\u95ee\u5728\u54ea\u91cc\u80fd\u770b\u5230\u5b8c\u6574\u7684\u8868\u6f14\u3002", "start": 84.986, "end": 89.873, "vocab": ["performance"] },
    { "index": 21, "en": "The positive reply from the young viewers gave me more courage.", "cn": "\u5e74\u8f7b\u89c2\u4f17\u4eec\u7684\u79ef\u6781\u56de\u5e94\u7ed9\u4e86\u6211\u66f4\u591a\u52c7\u6c14\u3002", "start": 90.57, "end": 94.041, "vocab": ["viewer"] },
    { "index": 22, "en": "Since then, my puppet shows have drawn more attention both from home and abroad.", "cn": "\u4ece\u6b64\uff0c\u6211\u7684\u6728\u5076\u8868\u6f14\u5728\u56fd\u5185\u5916\u90fd\u5f15\u8d77\u4e86\u66f4\u591a\u7684\u5173\u6ce8\u3002", "start": 94.645, "end": 99.672, "vocab": ["puppet"] },
    { "index": 23, "en": "The old art is getting more interest and new stories.", "cn": "\u8fd9\u95e8\u53e4\u8001\u7684\u827a\u672f\u6b63\u5728\u83b7\u5f97\u66f4\u591a\u7684\u5174\u8da3\u548c\u65b0\u6545\u4e8b\u3002", "start": 99.997, "end": 102.935, "vocab": [] },
    { "index": 24, "en": "With more and more people joining in, I believe the special magic of this traditional art will last forever!", "cn": "\u968f\u7740\u8d8a\u6765\u8d8a\u591a\u7684\u4eba\u52a0\u5165\uff0c\u6211\u76f8\u4fe1\u8fd9\u95e8\u4f20\u7edf\u827a\u672f\u7684\u7279\u6b8a\u9b54\u529b\u5c06\u6c38\u8fdc\u6301\u7eed\u4e0b\u53bb\uff01", "start": 103.318, "end": 109.042, "vocab": [] }
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
    "artist": { "word": "artist", "cn": "艺术家", "ph": "/\'a:tust/", "key": true, "importance": 4, "example": "The young artist painted a beautiful picture of the sunset.", "exampleCn": "那位年轻艺术家画了一幅美丽的日落画。", "tip": "artist（艺术家）来自 art（艺术）+ ist（从事...的人）", "etymology": "来自拉丁语 ars（艺术），后缀 -ist 表示从事某种艺术的人", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_11.mp3" },
    "blood": { "word": "blood", "cn": "血，血液", "ph": "/bld/", "key": true, "importance": 4, "example": "The doctor tested his blood and said he was healthy.", "exampleCn": "医生检测了他的血液，说他很健康。", "tip": "blood（血）- 过去常考短语：in cold blood（冷酷地）", "etymology": "来自古英语 blod（血），与德语 Blut 同源", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_7.mp3" },
    "burst": { "word": "burst", "cn": "冲，闯；（使）爆裂", "ph": "/b3:st/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_32.mp3" },
    "claw": { "word": "claw", "cn": "爪", "ph": "/klo:/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_34.mp3" },
    "creativity": { "word": "creativity", "cn": "独创性", "ph": "/，kri:er\'tvsti/", "key": true, "importance": 3, "example": "Teachers should encourage students\' creativity in class.", "exampleCn": "老师应该在课堂上鼓励学生的创造力。", "tip": "create（创造）→ creative（有创造力的）→ creativity（创造力）", "etymology": "来自拉丁语 creare（创造），后缀 -ity 表示性质", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_10.mp3" },
    "creator": { "word": "creator", "cn": "创作者；创造者", "ph": "/kri\'eite/", "key": true, "importance": 3, "example": "He is the creator of this popular mobile game.", "exampleCn": "他是这款热门手游的创作者。", "tip": "create（创造）+ or（...的人）= creator（创造者）。注意：-er 和 -or 都表示做某事的人", "etymology": "来自拉丁语 creator（创造者），creare（创造）+ or（人）", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_13.mp3" },
    "dust": { "word": "dust", "cn": "灰尘，尘埃", "ph": "/dast/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_37.mp3" },
    "eagle": { "word": "eagle", "cn": "鹰", "ph": "", "key": true, "importance": 3, "example": "An eagle flew high above the mountains.", "exampleCn": "一只鹰在高山上空飞翔。", "tip": "eagle（鹰）- 常考短语：eagle eye（锐利的目光/鹰眼）", "etymology": "来自古法语 aigle，源自拉丁语 aquila（鹰）", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_21.mp3" },
    "edge": { "word": "edge", "cn": "边缘", "ph": "/eds/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_26.mp3" },
    "educator": { "word": "educator", "cn": "教育家", "ph": "/\'edjukerta/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_29.mp3" },
    "finger": { "word": "finger", "cn": "手指", "ph": "/\'fuga/", "key": true, "importance": 4, "example": "Be careful! Don\'t cut your finger with that knife.", "exampleCn": "小心！别用那把刀割到手指。", "tip": "finger 手指。拇指 thumb 食指 index finger 中指 middle finger 无名指 ring finger 小指 little finger", "etymology": "来自古英语 finger，与德语 Finger 同源", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_3.mp3" },
    "gentleman": { "word": "gentleman", "cn": "先生", "ph": "/\'dsentlman/", "key": true, "importance": 4, "example": "A true gentleman always holds the door for others.", "exampleCn": "一个真正的绅士总会为别人扶门。", "tip": "gentleman（先生/绅士）的复数是 gentlemen（不规则变化：man → men）", "etymology": "由 gentle（有教养的）+ man（人）组成", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_1.mp3" },
    "grand": { "word": "grand", "cn": "宏伟的，壮丽的", "ph": "/graend/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_40.mp3" },
    "group": { "word": "group", "cn": "组，群；团体", "ph": "/grup/", "key": true, "importance": 5, "example": "Our study group meets every Friday after school.", "exampleCn": "我们学习小组每周五放学后碰面。", "tip": "group（组/群体）- a group of... 一群...（后面名词用复数）", "etymology": "来自意大利语 gruppo（一群），原意是圆形", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_12.mp3" },
    "hidden": { "word": "hidden", "cn": "隐藏的，隐秘的", "ph": "/\'hrcdn/", "key": true, "importance": 3, "example": "The hidden treasure was finally found by the children.", "exampleCn": "被隐藏的宝藏最终被孩子们找到了。", "tip": "hide（隐藏）→ hid（过去式）→ hidden（过去分词/形容词）", "etymology": "来自古英语 hydan（隐藏）", "past": "hid", "pastParticiple": "hidden", "pronounceFile": "audio/word_pronounce/unit1_word_17.mp3" },
    "inspire": { "word": "inspire", "cn": "鼓舞，激励", "ph": "/m\'spars/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_30.mp3" },
    "intelligent": { "word": "intelligent", "cn": "有智", "ph": "/m \'teladgont/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_31.mp3" },
    "kill": { "word": "kill", "cn": "弄死，杀死", "ph": "/kal/", "key": true, "importance": 4, "example": "It is cruel to kill wild animals for fun.", "exampleCn": "以杀戮野生动物为乐是残忍的。", "tip": "kill（杀/弄死）是完全规则动词：kill → killed → killed", "etymology": "来自古英语 cwellan（杀死）", "past": "killed", "pastParticiple": "killed", "pronounceFile": "audio/word_pronounce/unit1_word_14.mp3" },
    "lady": { "word": "lady", "cn": "女士，女子", "ph": "/\'lerdi/", "key": true, "importance": 4, "example": "The old lady feeds the cats in her neighborhood every day.", "exampleCn": "那位老太太每天都喂小区里的猫。", "tip": "lady（女士）复数是 ladies。y 变 i 加 es：lady → ladies", "etymology": "来自古英语 hlafdig（揉面包的人），hlaf（面包）+ dig（揉）", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_0.mp3" },
    "lie": { "word": "lie", "cn": "躺；说谎", "ph": "", "key": true, "importance": 4, "example": "Never tell a lie; always be honest with others.", "exampleCn": "永远不要说谎；要始终对他人诚实。", "tip": "lie（说谎）→ lied/lied（规则）；lie（躺）→ lay/lain（不规则），区别：tell a lie（说谎）是名词用法", "etymology": "来自古英语 lyge（谎言），与德语 Luge 同源", "past": "lied", "pastParticiple": "lied", "pronounceFile": "audio/word_pronounce/unit1_word_22.mp3" },
    "old-fashioned": { "word": "old-fashioned", "cn": "老式的，过时的", "ph": "", "key": true, "importance": 3, "example": "My grandpa still wears old-fashioned clothes.", "exampleCn": "我爷爷还穿老式的衣服。", "tip": "复合形容词：old（老的）+ fashioned（样式的）= old-fashioned（老式的）", "etymology": "由 old（老）+ fashioned（...样式的）组成", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_23.mp3" },
    "perform": { "word": "perform", "cn": "表演，演出", "ph": "/pe \'fo:m/", "key": true, "importance": 5, "example": "The magician will perform a wonderful show tonight.", "exampleCn": "魔术师今晚将表演一场精彩的秀。", "tip": "perform（表演/演出）→ performer（表演者）→ performance（表演/表现）。中考常考：perform well/badly 表现好/差", "etymology": "来自古法语 parfournir（完成），per-（完全）+ fournir（提供）", "past": "performed", "pastParticiple": "performed", "pronounceFile": "audio/word_pronounce/unit1_word_8.mp3" },
    "performance": { "word": "performance", "cn": "表演", "ph": "/pa \'fo:mans/", "key": true, "importance": 4, "example": "Her performance in the singing competition was amazing.", "exampleCn": "她在歌唱比赛中的表现令人惊叹。", "tip": "perform（表演）+ ance（名词后缀）= performance（表演/表现）", "etymology": "来自 perform（表演）+ ance（行为名词后缀）", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_6.mp3" },
    "performer": { "word": "performer", "cn": "表演者", "ph": "/pe \'fo:ma/", "key": true, "importance": 4, "example": "He is a famous performer who travels around the world.", "exampleCn": "他是一位周游世界的著名表演者。", "tip": "perform（表演）+ er（...的人）= performer（表演者）", "etymology": "来自 perform（表演）+ er（行为者后缀）", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_2.mp3" },
    "puppet": { "word": "puppet", "cn": "（牵线）木偶", "ph": "/\'pAprt/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_24.mp3" },
    "puppetry": { "word": "puppetry", "cn": "木偶表演艺术", "ph": "/\'pApatri/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_25.mp3" },
    "roar": { "word": "roar", "cn": "吼叫，呼啸", "ph": "/ro:/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_35.mp3" },
    "scaled": { "word": "scaled", "cn": "有鳞的", "ph": "/skerld/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_33.mp3" },
    "scare": { "word": "scare", "cn": "使惊恐，吓唬", "ph": "/skea/", "key": true, "importance": 3, "example": "Don\'t scare the cat with loud noises.", "exampleCn": "不要用大声响吓到猫。", "tip": "scare（吓唬）→ scared（害怕的）→ scary（吓人的）。区别：scared 形容人的感受，scary 形容事物", "etymology": "来自古英语 scearn（惊吓）", "past": "scared", "pastParticiple": "scared", "pronounceFile": "audio/word_pronounce/unit1_word_19.mp3" },
    "scarecrow": { "word": "scarecrow", "cn": "稻草人", "ph": "/\'skeokru/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_28.mp3" },
    "teenager": { "word": "teenager", "cn": "青少年", "ph": "/\'tinerdga/", "key": true, "importance": 4, "example": "Many teenagers spend too much time on their phones.", "exampleCn": "很多青少年花太多时间在手机上。", "tip": "teenager（青少年）= thirteen（13）到 nineteen（19）都以 teen 结尾 + age（年龄）+ r", "etymology": "由 teenage（青少年的）+ er（人）组成", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_4.mp3" },
    "tender": { "word": "tender", "cn": "娇嫩的，幼嫩", "ph": "/\'tenda/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_38.mp3" },
    "unless": { "word": "unless", "cn": "除非•.", "ph": "/an\'les/", "key": true, "importance": 5, "example": "You will fail the exam unless you study harder.", "exampleCn": "除非你更努力学习，否则会考试不及格。", "tip": "unless = if...not（如果不）。中考高频考点：unless 引导条件状语从句，主将从现（主句将来时，从句一般现在时）", "etymology": "来自 on less than（在...更少的前提下），缩写为 unless", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_5.mp3" },
    "valley": { "word": "valley", "cn": "谷；山谷", "ph": "/\'vaeli/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_36.mp3" },
    "vast": { "word": "vast", "cn": "广大无边的，极大的13", "ph": "/vast/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_39.mp3" },
    "viewer": { "word": "viewer", "cn": "观看者", "ph": "/\'vjua/", "key": true, "importance": 3, "example": "The TV show attracted millions of viewers.", "exampleCn": "这档电视节目吸引了数百万观众。", "tip": "view（观看）+ er（...的人）= viewer（观看者）。注意复数 viewers", "etymology": "来自 view（看）+ er（行为者后缀）", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_9.mp3" },
    "volunteer": { "word": "volunteer", "cn": "志愿者", "ph": "/，volon\'tra/", "key": false, "importance": 0, "example": "", "exampleCn": "", "tip": "", "etymology": "", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_27.mp3" },
    "wealthy": { "word": "wealthy", "cn": "富有的；富", "ph": "/\'welfi/", "key": true, "importance": 3, "example": "He dreams of becoming a wealthy businessman one day.", "exampleCn": "他梦想有一天成为一名富有的商人。", "tip": "wealth（财富）+ y（形容词后缀）= wealthy（富有的）。比较级 wealthier，最高级 wealthiest", "etymology": "来自 wealth（财富）+ y（...的）", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_16.mp3" },
    "wildly": { "word": "wildly", "cn": "激动地", "ph": "/\'warldli/", "key": true, "importance": 3, "example": "The fans cheered wildly when their team won.", "exampleCn": "当他们的队伍获胜时，球迷们激动地欢呼。", "tip": "wild（狂野的）+ ly（副词后缀）= wildly（激动地/疯狂地）。形容词加 ly 变副词是高频考点", "etymology": "来自 wild（狂野的）+ ly（副词后缀）", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_18.mp3" },
    "wing": { "word": "wing", "cn": "翅膀，翼", "ph": "/wu/", "key": true, "importance": 3, "example": "The bird spread its wings and flew away.", "exampleCn": "那只鸟展开翅膀飞走了。", "tip": "wing（翅膀）- 常考搭配：on a wing and a prayer（在极其艰难的情况下）", "etymology": "来自古英语 wenge（翅膀），与德语 Schwinge 同源", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_20.mp3" },
    "youth": { "word": "youth", "cn": "青年，年轻人", "ph": "/ju:6/", "key": true, "importance": 4, "example": "In his youth, he traveled to many different countries.", "exampleCn": "他年轻时去过很多不同的国家。", "tip": "young（年轻的）→ youth（青年/年轻）。注意拼写变化：young → youth", "etymology": "来自古英语 geoguth（年轻），与德语 Jugend 同源", "past": "", "pastParticiple": "", "pronounceFile": "audio/word_pronounce/unit1_word_15.mp3" }
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
    wordCards: [],
    playingSentenceIdx: -1,
    showCn: true,
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

    // 每句的单词卡片数据
    const wordCards = ts.sentences.map(s => {
      return (s.vocab || [])
        .map(key => VOCAB_DATA[key])
        .filter(Boolean)
    })

    this.setData({
      unitId: ts.unit || this._unitId,
      title: ts.title,
      totalSentences: ts.totalSentences,
      audioDuration: ts.audioDuration,
      paragraphs: ts.paragraphs,
      sentences: ts.sentences,
      sentenceTokens,
      wordCards,
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
  // 点击单词卡片的播放按钮
  onPlayWord(e) {
    const wordKey = e.currentTarget.dataset.word
    if (!wordKey || !VOCAB_DATA[wordKey]) return

    const file = VOCAB_DATA[wordKey].pronounceFile
    if (!file) return

    // 创建临时音频播放
    const audio = wx.createInnerAudioContext()
    audio.src = `/${file}`
    audio.play()

    // 播完后销毁
    audio.onEnded(() => audio.destroy())
    audio.onError(() => audio.destroy())
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
