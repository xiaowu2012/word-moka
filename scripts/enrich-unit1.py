"""
为 Unit1 单词补充 词性(pos) 和 拓展例句(extraExample+extraCn)
"""
import json

PATH = '/Users/wang/.openclaw/workspace/projects/word-moka/data/words.json'
words = json.load(open(PATH))

# 词性映射 (n.名词 v.动词 adj.形容词 adv.副词 conj.连词 prep.介词)
POS = {
    'lady': 'n.', 'gentleman': 'n.', 'performer': 'n.', 'finger': 'n.',
    'teenager': 'n.', 'unless': 'conj.', 'performance': 'n.', 'blood': 'n.',
    'perform': 'v.', 'viewer': 'n.', 'creativity': 'n.', 'artist': 'n.',
    'group': 'n.', 'creator': 'n.', 'kill': 'v.', 'youth': 'n.',
    'wealthy': 'adj.', 'hidden': 'adj.', 'wildly': 'adv.', 'scare': 'v.',
    'wing': 'n.', 'eagle': 'n.', 'lie': 'v.', 'old-fashioned': 'adj.',
    'puppet': 'n.', 'puppetry': 'n.', 'edge': 'n.', 'volunteer': 'n.',
    'scarecrow': 'n.', 'educator': 'n.', 'inspire': 'v.', 'intelligent': 'adj.',
    'burst': 'v.', 'scaled': 'adj.', 'claw': 'n.', 'roar': 'v.',
    'valley': 'n.', 'dust': 'n.', 'tender': 'adj.', 'vast': 'adj.',
    'grand': 'adj.',
}

# 拓展例句 (英文, 中文翻译)
EXTRA = {
    'lady': ('The lady in the red dress is my English teacher.',
             '穿红裙子的那位女士是我的英语老师。'),
    'gentleman': ('That old gentleman always walks his dog in the park.',
                  '那位老先生总是在公园遛狗。'),
    'performer': ('The performer amazed the audience with his magic tricks.',
                  '这位表演者用他的魔术技巧让观众惊叹。'),
    'finger': ('She cut her finger while cooking dinner.',
               '她做饭时切到了手指。'),
    'teenager': ('As a teenager, he started to learn programming.',
                 '十几岁时，他开始学习编程。'),
    'unless': ("You won't pass the exam unless you study hard.",
               '除非你努力学习，否则考试不会及格。'),
    'performance': ('The team gave an excellent performance in the match.',
                    '团队在比赛中表现非常出色。'),
    'blood': ('The hospital needs more blood donations.',
              '医院需要更多的献血。'),
    'perform': ('The students will perform a short play on Friday.',
                '学生们将在周五表演一部短剧。'),
    'viewer': ('The TV show has millions of viewers around the world.',
               '这个电视节目在全球有数百万观众。'),
    'creativity': ('The art class helps students develop their creativity.',
                   '美术课帮助学生培养创造力。'),
    'artist': ('The artist spent three years painting this masterpiece.',
               '这位艺术家花了三年时间画这幅杰作。'),
    'group': ('Our study group meets every Wednesday afternoon.',
              '我们学习小组每周三下午碰面。'),
    'creator': ('The creator of the game won several awards.',
                '这款游戏的创作者赢得了多个奖项。'),
    'kill': ("It's against the law to kill endangered animals.",
             '杀害濒危动物是违法的。'),
    'youth': ('The youth of today are full of new ideas.',
              '今天的年轻人充满新想法。'),
    'wealthy': ('The wealthy businessman donated money to build a school.',
                '那位富有的商人捐款建了一所学校。'),
    'hidden': ('The cat was hidden under the bed.',
               '猫藏在床底下。'),
    'wildly': ('The crowd cheered wildly when their team scored.',
               '当他们的球队得分时，人群疯狂欢呼。'),
    'scare': ('The loud thunder scared the little girl.',
              '响亮的雷声吓到了那个小女孩。'),
    'wing': ('The bird spread its wings and flew away.',
             '鸟儿展开翅膀飞走了。'),
    'eagle': ('The eagle can spot a rabbit from far away.',
              '鹰能从很远的地方发现兔子。'),
    'lie': ("It's wrong to tell a lie; always be honest.",
            '说谎是不对的，要始终保持诚实。'),
    'old-fashioned': ('My grandfather still uses an old-fashioned radio.',
                      '我爷爷还在用一台老式收音机。'),
    'puppet': ('The children loved watching the puppet show.',
               '孩子们喜欢看木偶戏。'),
    'puppetry': ('Puppetry is a traditional art form in many cultures.',
                 '木偶表演是许多文化中的传统艺术形式。'),
    'edge': ("Don't stand too close to the edge of the cliff.",
             '不要站得太靠近悬崖边缘。'),
    'volunteer': ('She works as a volunteer at the local hospital.',
                  '她在当地医院做志愿者。'),
    'scarecrow': ('The farmer put a scarecrow in the field to keep birds away.',
                  '农民在田里放了一个稻草人赶鸟。'),
    'educator': ('As an educator, she believes every child can succeed.',
                 '作为一名教育工作者，她相信每个孩子都能成功。'),
    'inspire': ('Great teachers inspire their students to dream big.',
                '好老师激励学生大胆追梦。'),
    'intelligent': ('Dolphins are highly intelligent animals.',
                    '海豚是非常聪明的动物。'),
    'burst': ('The balloon burst with a loud noise.',
              '气球砰的一声爆了。'),
    'scaled': ('The mountaineer scaled the steep cliff with great skill.',
               '登山者凭借高超的技艺攀爬上了陡峭的悬崖。'),
    'claw': ('The cat used its claws to climb the tree.',
             '猫用爪子爬树。'),
    'roar': ('We could hear the lion roar from far away.',
             '我们能从很远的地方听到狮子的吼声。'),
    'valley': ('The village lies in a beautiful green valley.',
               '村庄坐落在一个美丽的绿色山谷中。'),
    'dust': ('There was a thick layer of dust on the old books.',
             '旧书上积了厚厚一层灰尘。'),
    'tender': ('The mother gave her baby a tender kiss.',
               '妈妈温柔地亲了亲她的宝宝。'),
    'vast': ('The vast desert stretches for hundreds of miles.',
             '广阔的沙漠延伸数百英里。'),
    'grand': ('They held a grand celebration for the festival.',
              '他们为节日举行了盛大的庆祝活动。'),
}

count = 0
for key, card in words.items():
    if card.get('module') != 'Unit1':
        continue
    if key in POS:
        card['pos'] = POS[key]
    if key in EXTRA:
        card['extraExample'], card['extraCn'] = EXTRA[key]
    count += 1

json.dump(words, open(PATH, 'w'), ensure_ascii=False, indent=2)

pos_count = sum(1 for k in words if words[k].get('pos') and words[k].get('module') == 'Unit1')
extra_count = sum(1 for k in words if words[k].get('extraExample') and words[k].get('module') == 'Unit1')
print(f'Done: {count} Unit1 words updated')
print(f'  pos: {pos_count}')
print(f'  extraExample+extraCn: {extra_count}')
