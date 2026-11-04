import type { ShizangPuzzle } from '../../types/game';

export const SHIZANG_013: ShizangPuzzle[] = [
  {
    id: 'sz-318',
    title: '乡村四月',
    dynasty: '宋',
    author: '翁卷',
    fullPoem: ['绿遍山原白满川', '子规声里雨如烟', '乡村四月闲人少', '才了蚕桑又插田'],
    targetLine: '子规声里雨如烟',
    targetIndex: 6,
    targetChar: '烟',
    tier: 'green',
    clues: {
      tone: '平声 (先韵 · 迷蒙)',
      radical: '火 (火部 · 烟气)',
      imagery: '“烟”字写细雨如烟弥漫，一“烟”而雨失去形迹，唯余朦胧'
    },
    appreciation: '“子规声里雨如烟”，一“烟”字最妙。雨若直写，只是水；比作烟，则轻、细、迷蒙之态俱出。子规催耕，烟雨润田，四月的江南遂在一片湿意里。',
    authorBio: '翁卷，字续古，一字灵舒，温州乐清人。南宋“永嘉四灵”之一。'
  },
  {
    id: 'sz-319',
    title: '山行',
    dynasty: '宋',
    author: '叶茵',
    fullPoem: ['青山不识我姓字', '我亦不识青山名', '飞来白鸟似相识', '对我对山三两声'],
    targetLine: '青山不识我姓字',
    targetIndex: 3,
    targetChar: '识',
    tier: 'purple',
    clues: {
      tone: '仄声 (入声 · 认识)',
      radical: '言 (言部 · 识知)',
      imagery: '“不识”二字写人与山互不相识，一开篇即设下一种陌生的亲近'
    },
    appreciation: '“青山不识我姓字，我亦不识青山名”，两个“不识”对举，看似疏远，实则亲密——正因为互不相识，才无客套、无名分，只有纯粹的照面。下句白鸟“似相识”更补此意。',
    authorBio: '叶茵（1199—？），字景文，苏州人。南宋诗人，江湖派。'
  },
  {
    id: 'sz-320',
    title: '淮村兵后',
    dynasty: '宋',
    author: '戴复古',
    fullPoem: ['小桃无主自开花', '烟草茫茫带晚鸦', '几处败垣围故井', '向来一一是人家'],
    targetLine: '小桃无主自开花',
    targetIndex: 4,
    targetChar: '自',
    tier: 'purple',
    clues: {
      tone: '仄声 (去声 · 自顾)',
      radical: '自 (自部 · 自己)',
      imagery: '“自”字写桃花无主而照旧开放，一“自”而人事凋零与草木无知对撞'
    },
    appreciation: '“小桃无主自开花”，一“自”字最冷。桃花不管主人存否，到时便开。正因它“自”开，才显出无人来看的荒凉。戴复古写兵后村落，前两句不说破，末句“向来一一是人家”一出，惨状全现。',
    authorBio: '戴复古（1167—？），字式之，号石屏，黄岩人。南宋江湖派诗人。'
  },
  {
    id: 'sz-321',
    title: '约客',
    dynasty: '宋',
    author: '赵师秀',
    fullPoem: ['黄梅时节家家雨', '青草池塘处处蛙', '有约不来过夜半', '闲敲棋子落灯花'],
    targetLine: '青草池塘处处蛙',
    targetIndex: 4,
    targetChar: '处',
    tier: 'green',
    clues: {
      tone: '仄声 (去声 · 处处)',
      radical: '夂 (夂部 · 居处)',
      imagery: '“处处”叠用写蛙声遍满，一“处”而江南梅雨的喧闹与幽静并生'
    },
    appreciation: '“黄梅时节家家雨，青草池塘处处蛙”，“家家”与“处处”对举。雨落千家，蛙鸣四方，看似热闹，实则正为后两句“有约不来”的独坐作反衬——愈喧而愈孤。',
    authorBio: '赵师秀（1170—1219），字紫芝，号灵秀，永嘉人。“永嘉四灵”之一。'
  },
  {
    id: 'sz-322',
    title: '新凉',
    dynasty: '宋',
    author: '徐玑',
    fullPoem: ['水满田畴稻叶齐', '日光穿树晓烟低', '黄莺也爱新凉好', '飞过青山影里啼'],
    targetLine: '日光穿树晓烟低',
    targetIndex: 2,
    targetChar: '穿',
    tier: 'green',
    clues: {
      tone: '平声 (仙韵 · 穿透)',
      radical: '穴 (穴部 · 穿透)',
      imagery: '“穿”字写日光透过树隙，一“穿”而晨光有了路径与力量'
    },
    appreciation: '“日光穿树晓烟低”，一“穿”字最见早晨。昼午日高，光自天降；清晨则日低，光从树间斜穿而过。一个“穿”字，把时间也定了下来。徐玑诗学贾岛、姚合，炼字正是其本色。',
    authorBio: '徐玑（1162—1214），字致中，号灵渊，永嘉人。“永嘉四灵”之一。'
  },
  {
    id: 'sz-323',
    title: '题临安邸',
    dynasty: '宋',
    author: '林升',
    fullPoem: ['山外青山楼外楼', '西湖歌舞几时休', '暖风熏得游人醉', '直把杭州作汴州'],
    targetLine: '山外青山楼外楼',
    targetIndex: 4,
    targetChar: '楼',
    tier: 'green',
    clues: {
      tone: '平声 (尤韵 · 楼阁)',
      radical: '木 (木部 · 楼台)',
      imagery: '“楼外楼”叠用写楼台无尽，一“楼”而临安的奢靡铺满湖山'
    },
    appreciation: '“山外青山楼外楼”，一“楼”字叠用，遂有层层不尽之势。山本自然，楼属人造，两“外”字把二者交叠，临安的繁华与偏安的苟且一并写出。林升只此一诗，遂传千古。',
    authorBio: '林升，字梦屏，温州人。南宋诗人，存诗极少，《题临安邸》最著名。'
  },
  {
    id: 'sz-324',
    title: '过零丁洋',
    dynasty: '宋',
    author: '文天祥',
    fullPoem: ['辛苦遭逢起一经', '干戈寥落四周星', '山河破碎风飘絮', '身世浮沉雨打萍'],
    targetLine: '山河破碎风飘絮',
    targetIndex: 2,
    targetChar: '破',
    tier: 'blue',
    clues: {
      tone: '仄声 (去声 · 破裂)',
      radical: '石 (石部 · 破碎)',
      imagery: '“破”字写山河如絮被风撕碎，一“破”而国勢之不可收拾立见'
    },
    appreciation: '“山河破碎风飘絮”，一“破”字最痛。山河本完整，而曰“破碎”；更以“风飘絮”作比，则破碎之后还要飘零无定。文天祥写亡国，不说“亡”而说“破碎”，愈见其零落之状。',
    authorBio: '文天祥（1236—1283），字宋瑞，号文山，吉州庐陵人。南宋末年抗元名臣。'
  },
  {
    id: 'sz-325',
    title: '金陵驿',
    dynasty: '宋',
    author: '文天祥',
    fullPoem: ['草合离宫转夕晖', '孤云飘泊复何依', '山河风景元无异', '城郭人民半已非'],
    targetLine: '草合离宫转夕晖',
    targetIndex: 1,
    targetChar: '合',
    tier: 'purple',
    clues: {
      tone: '仄声 (入声 · 围合)',
      radical: '口 (口部 · 会合)',
      imagery: '“合”字写野草合围离宫，一“合”而宫殿被草木吞没'
    },
    appreciation: '“草合离宫转夕晖”，一“合”字最冷。草不是“生”在宫中，而是“合”围起来——宫墙已被草木合拢吞没。文天祥被押北上途经金陵，眼见故国宫室如此，故有下句“城郭人民半已非”。',
    authorBio: '文天祥（1236—1283），字宋瑞，号文山。南宋末年抗元名臣。'
  },
  {
    id: 'sz-326',
    title: '雪梅 · 其二',
    dynasty: '宋',
    author: '卢梅坡',
    fullPoem: ['有梅无雪不精神', '有雪无诗俗了人', '日暮诗成天又雪', '与梅并作十分春'],
    targetLine: '有梅无雪不精神',
    targetIndex: 6,
    targetChar: '神',
    tier: 'green',
    clues: {
      tone: '平声 (真韵 · 神采)',
      radical: '礻 (示部 · 神灵)',
      imagery: '“精神”二字写梅须雪衬方有神采，一“神”而物之相依之理出'
    },
    appreciation: '“有梅无雪不精神，有雪无诗俗了人”，两个“不”字递进。梅得雪而有神，雪得诗而不俗，诗成而天又雪——三者相济，遂成“十分春”。卢梅坡以说理入诗而不觉枯燥。',
    authorBio: '卢梅坡，南宋诗人，生平不详，以《雪梅》二首著称。'
  },
  {
    id: 'sz-327',
    title: '游园不值',
    dynasty: '宋',
    author: '叶绍翁',
    fullPoem: ['应怜屐齿印苍苔', '小扣柴扉久不开', '春色满园关不住', '一枝红杏出墙来'],
    targetLine: '小扣柴扉久不开',
    targetIndex: 1,
    targetChar: '扣',
    tier: 'green',
    clues: {
      tone: '仄声 (去声 · 叩击)',
      radical: '扌 (提手旁 · 叩击)',
      imagery: '“扣”字写轻敲柴门，一“小扣”而访者之恭与久候之诚俱见'
    },
    appreciation: '“应怜屐齿印苍苔，小扣柴扉久不开”，“小扣”是轻敲，不是重击。既惜主人园中苍苔，故不敢重叩；久不开而仍轻扣，则访者之雅与耐心可知。叶绍翁炼字之细，正在此等处。',
    authorBio: '叶绍翁（1194—1269），字嗣宗，号靖逸，处州龙泉人。南宋江湖派诗人。'
  },
  {
    id: 'sz-328',
    title: '夜书所见',
    dynasty: '宋',
    author: '叶绍翁',
    fullPoem: ['萧萧梧叶送寒声', '江上秋风动客情', '知有儿童挑促织', '夜深篱落一灯明'],
    targetLine: '萧萧梧叶送寒声',
    targetIndex: 5,
    targetChar: '寒',
    tier: 'green',
    clues: {
      tone: '平声 (寒韵 · 凄冷)',
      radical: '宀 (宀部 · 寒冷)',
      imagery: '“寒”字写声音带出寒意，一“寒”而使秋风有了可感的温度'
    },
    appreciation: '“萧萧梧叶送寒声”，一“寒”字最见通感。寒本触觉，而曰“寒声”，是叶声入耳而生冷意。叶绍翁客居在外，一叶落而知秋，一声寒而动客情。',
    authorBio: '叶绍翁（1194—1269），字嗣宗，号靖逸。南宋江湖派诗人。'
  },
  {
    id: 'sz-329',
    title: '村晚',
    dynasty: '宋',
    author: '雷震',
    fullPoem: ['草满池塘水满陂', '山衔落日浸寒漪', '牧童归去横牛背', '短笛无腔信口吹'],
    targetLine: '草满池塘水满陂',
    targetIndex: 1,
    targetChar: '满',
    tier: 'green',
    clues: {
      tone: '仄声 (上声 · 充盈)',
      radical: '氵 (三点水 · 盈满)',
      imagery: '“满”字连用两次，写草与水都涨到极限，一“满”而夏末村景丰盈欲溢'
    },
    appreciation: '“草满池塘水满陂”，两个“满”字叠用而不觉重复。草满则池小，水满则陂平，两个“满”把夏末雨后的丰盈写足。下句“山衔落日”更以一字写活晚照。',
    authorBio: '雷震，南宋诗人，生平事迹不详，以《村晚》一首传世。'
  },
  {
    id: 'sz-330',
    title: '蚕妇',
    dynasty: '宋',
    author: '张俞',
    fullPoem: ['昨日入城市', '归来泪满巾', '遍身罗绮者', '不是养蚕人'],
    targetLine: '遍身罗绮者',
    targetIndex: 2,
    targetChar: '罗',
    tier: 'blue',
    clues: {
      tone: '平声 (歌韵 · 轻软)',
      radical: '网 (网部 · 罗织)',
      imagery: '“罗绮”二字写华服之轻贵，一“罗”与下句“养蚕人”形成尖锐对照'
    },
    appreciation: '“遍身罗绮者，不是养蚕人”，一“罗”字最刺眼。罗绮本出自蚕丝，而着之者非养蚕之人。张俞不着一句议论，只把两种人并置，控诉自明。二十字而重逾千钧。',
    authorBio: '张俞（？—？），字少愚，益州郫人。北宋诗人，屡举不第。'
  },
  {
    id: 'sz-331',
    title: '陶者',
    dynasty: '宋',
    author: '梅尧臣',
    fullPoem: ['陶尽门前土', '屋上无片瓦', '十指不沾泥', '鳞鳞居大厦'],
    targetLine: '鳞鳞居大厦',
    targetIndex: 0,
    targetChar: '鳞',
    tier: 'blue',
    clues: {
      tone: '平声 (真韵 · 密列)',
      radical: '鱼 (鱼部 · 鳞次)',
      imagery: '“鳞鳞”写瓦片密比如鱼鳞，一“鳞”而大厦之盛与陶者之贫对照'
    },
    appreciation: '“十指不沾泥，鳞鳞居大厦”，“鳞鳞”二字写瓦片密集如鱼鳞。造瓦者屋上无片瓦，不沾泥者却居大厦。梅尧臣以最平静的叙述写最尖锐的不平，是宋诗“平淡”中的锋芒。',
    authorBio: '梅尧臣（1002—1060），字圣俞，宣州宣城人。北宋诗人，倡“平淡”诗风。'
  },
  {
    id: 'sz-332',
    title: '戏答元珍',
    dynasty: '宋',
    author: '欧阳修',
    fullPoem: ['春风疑不到天涯', '二月山城未见花', '残雪压枝犹有橘', '冻雷惊笋欲抽芽'],
    targetLine: '残雪压枝犹有橘',
    targetIndex: 2,
    targetChar: '压',
    tier: 'purple',
    clues: {
      tone: '仄声 (入声 · 覆压)',
      radical: '厂 (厂部 · 压覆)',
      imagery: '“压”字写残雪覆压枝条，一“压”而冬之余威与橘之坚韧并见'
    },
    appreciation: '“残雪压枝犹有橘，冻雷惊笋欲抽芽”，一“压”一“惊”皆使静物受力。雪压枝而橘犹在，是严寒不能尽夺；雷惊笋而芽欲出，是春意已不可遏。欧阳修贬夷陵时作，正是自道。',
    authorBio: '欧阳修（1007—1072），字永叔，号醉翁。北宋文学家、史学家，唐宋八大家之一。'
  },
  {
    id: 'sz-333',
    title: '画眉鸟',
    dynasty: '宋',
    author: '欧阳修',
    fullPoem: ['百啭千声随意移', '山花红紫树高低', '始知锁向金笼听', '不及林间自在啼'],
    targetLine: '不及林间自在啼',
    targetIndex: 4,
    targetChar: '自',
    tier: 'blue',
    clues: {
      tone: '仄声 (去声 · 自在)',
      radical: '自 (自部 · 自己)',
      imagery: '“自在”二字是全诗归趣，一“自”而自由之可贵压倒一切华美'
    },
    appreciation: '“始知锁向金笼听，不及林间自在啼”，一“自”字最重。金笼华贵，然鸟失其“自在”，则啼声亦非真啼。欧阳修屡遭贬谪，此诗借鸟自况：宁可林间，不愿金笼。',
    authorBio: '欧阳修（1007—1072），字永叔，号醉翁。北宋文学家，唐宋八大家之一。'
  },
  {
    id: 'sz-334',
    title: '采桑子 · 轻舟短棹西湖好',
    dynasty: '宋',
    author: '欧阳修',
    fullPoem: ['轻舟短棹西湖好', '绿水逶迤', '芳草长堤', '隐隐笙歌处处随'],
    targetLine: '绿水逶迤',
    targetIndex: 2,
    targetChar: '逶',
    tier: 'purple',
    clues: {
      tone: '平声 (支韵 · 曲折)',
      radical: '辶 (辵部 · 逶迤)',
      imagery: '“逶迤”写水岸曲折绵长，一“逶”而湖面有了随物赋形的柔态'
    },
    appreciation: '“绿水逶迤”，一“逶”字写水之曲折。水本随岸而行，直则失趣，唯其逶迤，才见湖岸之参差。欧阳修晚年退居颍州，作《采桑子》十首咏西湖，此为其一。',
    authorBio: '欧阳修（1007—1072），字永叔，号醉翁。北宋文学家。'
  },
  {
    id: 'sz-335',
    title: '泊船瓜洲',
    dynasty: '宋',
    author: '王安石',
    fullPoem: ['京口瓜洲一水间', '钟山只隔数重山', '春风又绿江南岸', '明月何时照我还'],
    targetLine: '钟山只隔数重山',
    targetIndex: 3,
    targetChar: '隔',
    tier: 'green',
    clues: {
      tone: '仄声 (入声 · 阻隔)',
      radical: '阝 (阜部 · 阻隔)',
      imagery: '“隔”字写钟山虽只数重山之遥，此一“隔”却是归期难期'
    },
    appreciation: '“钟山只隔数重山”，一“隔”字最见欲归不能。距离本不远，只“数重山”而已；然而一“隔”，便成天涯。下句“明月何时照我还”正由此字逼出。',
    authorBio: '王安石（1021—1086），字介甫，号半山。北宋政治家、文学家，唐宋八大家之一。'
  },
  {
    id: 'sz-336',
    title: '北陂杏花',
    dynasty: '宋',
    author: '王安石',
    fullPoem: ['一陂春水绕花身', '花影妖娆各占春', '纵被春风吹作雪', '绝胜南陌碾成尘'],
    targetLine: '一陂春水绕花身',
    targetIndex: 4,
    targetChar: '绕',
    tier: 'purple',
    clues: {
      tone: '仄声 (上声 · 环缠)',
      radical: '糸 (糸部 · 缠绕)',
      imagery: '“绕”字写春水环抱花树，一“绕”而花有了被珍护之意'
    },
    appreciation: '“一陂春水绕花身”，一“绕”字最亲。水本无意，而曰“绕”，则如环护。王安石晚年罢相退居，此诗以杏花自喻：宁随风作雪，不愿被碾成尘——孤高之志全在末句。',
    authorBio: '王安石（1021—1086），字介甫，号半山。北宋政治家、文学家。'
  },
  {
    id: 'sz-337',
    title: '登飞来峰',
    dynasty: '宋',
    author: '王安石',
    fullPoem: ['飞来山上千寻塔', '闻说鸡鸣见日升', '不畏浮云遮望眼', '自缘身在最高层'],
    targetLine: '自缘身在最高层',
    targetIndex: 1,
    targetChar: '缘',
    tier: 'green',
    clues: {
      tone: '平声 (先韵 · 因为)',
      radical: '糸 (糸部 · 缘由)',
      imagery: '“缘”字作“因为”解，一“缘”而前句“不畏”有了根据'
    },
    appreciation: '“不畏浮云遮望眼，自缘身在最高层”，一“缘”字点破因果。不畏不是勇敢，而是位置使然——身在最高，浮云自不足遮。王安石三十岁作此诗，其政治抱负已隐然可见。',
    authorBio: '王安石（1021—1086），字介甫，号半山。北宋政治家、文学家。'
  },
  {
    id: 'sz-338',
    title: '春日',
    dynasty: '宋',
    author: '汪藻',
    fullPoem: ['一春略无十日晴', '处处浮云将雨行', '野田春水碧于镜', '人影渡傍鸥不惊'],
    targetLine: '野田春水碧于镜',
    targetIndex: 6,
    targetChar: '镜',
    tier: 'blue',
    clues: {
      tone: '仄声 (去声 · 明澈)',
      radical: '钅 (金部 · 镜鉴)',
      imagery: '“镜”字以明镜比春水，一“于”作比，水之澄澈胜于镜'
    },
    appreciation: '“野田春水碧于镜”，一“镜”字作比。镜本喻水之明，而曰“碧于镜”，是水比镜更添一层颜色。“碧”言色，“于镜”言明，二者兼得，则春水之澄碧尽出。',
    authorBio: '汪藻（1079—1154），字彦章，饶州德兴人。北宋末南宋初文学家。'
  },
  {
    id: 'sz-339',
    title: '春游湖',
    dynasty: '宋',
    author: '徐俯',
    fullPoem: ['双飞燕子几时回', '夹岸桃花蘸水开', '春雨断桥人不度', '小舟撑出柳阴来'],
    targetLine: '夹岸桃花蘸水开',
    targetIndex: 4,
    targetChar: '蘸',
    tier: 'purple',
    clues: {
      tone: '仄声 (去声 · 沾浸)',
      radical: '艹 (草部 · 沾蘸)',
      imagery: '“蘸”字写桃花低垂沾水，一“蘸”而花与水的距离消失'
    },
    appreciation: '“夹岸桃花蘸水开”，一“蘸”字最妙。蘸者，以物入水而即提。桃花临水低垂，花瓣轻触水面，如蘸墨之笔。若作“映水”“照水”，只是光学；作“蘸”，则有触感与动作。',
    authorBio: '徐俯（1075—1141），字师川，洪州分宁人。宋代诗人，江西诗派。'
  },
  {
    id: 'sz-340',
    title: '夏日绝句',
    dynasty: '宋',
    author: '李清照',
    fullPoem: ['生当作人杰', '死亦为鬼雄', '至今思项羽', '不肯过江东'],
    targetLine: '生当作人杰',
    targetIndex: 2,
    targetChar: '作',
    tier: 'green',
    clues: {
      tone: '仄声 (入声 · 作为)',
      radical: '亻 (人部 · 作为)',
      imagery: '“作”字写主动成为，一“作”而人生取向之决绝立见'
    },
    appreciation: '“生当作人杰，死亦为鬼雄”，“作”与“为”意同而气不同。“作”有主动成就之意，“为”则近于身份。李清照以一女子写此二十字，南渡之耻、丈夫之责尽在其中。',
    authorBio: '李清照（1084—约1155），号易安居士，济南人。宋代婉约词宗。'
  },
  {
    id: 'sz-341',
    title: '伤春',
    dynasty: '宋',
    author: '陈与义',
    fullPoem: ['庙堂无策可平戎', '坐使甘泉照夕烽', '初怪上都闻战马', '岂知穷海看飞龙'],
    targetLine: '坐使甘泉照夕烽',
    targetIndex: 6,
    targetChar: '烽',
    tier: 'purple',
    clues: {
      tone: '平声 (冬韵 · 烽火)',
      radical: '火 (火部 · 烽燧)',
      imagery: '“烽”字写夕照与烽火同燃，一“烽”而宫阙已临战火'
    },
    appreciation: '“庙堂无策可平戎，坐使甘泉照夕烽”，一“烽”字最刺。甘泉本汉帝离宫，此借指宋廷；夕烽者，报警之火。宫阙之下燃起烽火，则国势之危无可掩饰。陈与义亲历靖康之变，故语极沉痛。',
    authorBio: '陈与义（1090—1138），字去非，号简斋，洛阳人。南宋初诗人，江西诗派后劲。'
  },
  {
    id: 'sz-342',
    title: '临安春雨初霁',
    dynasty: '宋',
    author: '陆游',
    fullPoem: ['世味年来薄似纱', '谁令骑马客京华', '小楼一夜听春雨', '深巷明朝卖杏花'],
    targetLine: '小楼一夜听春雨',
    targetIndex: 4,
    targetChar: '听',
    tier: 'purple',
    clues: {
      tone: '仄声 (去声 · 聆听)',
      radical: '口 (口部 · 听闻)',
      imagery: '“听”字写一夜未眠唯听雨声，一“听”而客居之闲与郁俱出'
    },
    appreciation: '“小楼一夜听春雨，深巷明朝卖杏花”，一“听”字写长夜。雨声本无可听之事，而听“一夜”，则彻夜未眠可知。陆游此时待命临安，闲居无事，一腔报国之志压在“听雨”二字之下。',
    authorBio: '陆游（1125—1210），字务观，号放翁。南宋爱国诗人。'
  },
  {
    id: 'sz-343',
    title: '书愤',
    dynasty: '宋',
    author: '陆游',
    fullPoem: ['早岁那知世事艰', '中原北望气如山', '楼船夜雪瓜洲渡', '铁马秋风大散关'],
    targetLine: '中原北望气如山',
    targetIndex: 4,
    targetChar: '气',
    tier: 'purple',
    clues: {
      tone: '仄声 (去声 · 气概)',
      radical: '气 (气部 · 气象)',
      imagery: '“气”字写北望中原时胸中豪气如山，一“气”而少年之志有了体积'
    },
    appreciation: '“早岁那知世事艰，中原北望气如山”，一“气”字最壮。气本无形，而曰“如山”，则其高其重可触。陆游晚年追忆少年，愈见今日之衰与志之未酬。',
    authorBio: '陆游（1125—1210），字务观，号放翁。南宋爱国诗人。'
  }
];
