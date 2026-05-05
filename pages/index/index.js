const app = getApp()

Page({
  data: {
    currentScreen: 'intro',
    previewMode: false,
    answers: {},
    shuffledQuestions: [],
    visibleQuestions: [],
    progressPercent: 0,
    doneCount: 0,
    totalCount: 0,
    submitBtnDisabled: true,
    dimensionMeta: {
      'D1': { name: 'D1 听歌依赖度', model: '依赖模型' },
      'D2': { name: 'D2 循环成瘾性', model: '依赖模型' },
      'D3': { name: 'D3 平台忠诚度', model: '依赖模型' },
      'E1': { name: 'E1 情感投射深度', model: '情绪模型' },
      'E2': { name: 'E2 深夜emo指数', model: '情绪模型' },
      'E3': { name: 'E3 前任阴影残留', model: '情绪模型' },
      'O1': { name: 'O1 歌单管理强迫度', model: '秩序模型' },
      'O2': { name: 'O2 切歌冲动阈值', model: '秩序模型' },
      'O3': { name: 'O3 小众审美执念', model: '秩序模型' },
      'I1': { name: 'I1 现实沉浸偏差', model: '幻觉模型' },
      'I2': { name: 'I2 自我表演倾向', model: '幻觉模型' },
      'I3': { name: 'I3 歌词过度解读', model: '幻觉模型' }
    },
    dimensionOrder: ['D1', 'D2', 'D3', 'E1', 'E2', 'E3', 'O1', 'O2', 'O3', 'I1', 'I2', 'I3'],
    resultDiagnosis: {},
    resultImage: '',
    resultRawScores: {},
    resultLevels: {},
    modeKicker: '',
    matchBadge: '',
    resultSub: '',
    funNote: '',
    dimExplanations: {
      'D1': { 'L': '耳机是配件，不是器官。没音乐也能活，甚至偶尔享受安静。', 'M': '习惯了有BGM的生活，但摘了耳机也不会世界末日。依赖度随心情波动。', 'H': '耳机焊在耳朵上，摘下来就像被拔了氧气管。没有音乐的世界不值得待。' },
      'D2': { 'L': '喜新厌旧型听众，一首歌听腻了就换，很少有"循环到死"的时候。', 'M': '会循环喜欢的歌，但有上限。腻了就自然切换，不会死磕一首。', 'H': '单曲循环是信仰。一首歌可以听100遍不腻，室友的投诉是勋章。' },
      'D3': { 'L': '哪个平台有版权用哪个，没有忠诚度可言。实用主义听众。', 'M': '有主力平台，但也会用其他APP补版权。属于"骑墙派"。', 'H': '网易云就是家，户口已经落了，搬家是不可能搬家的。' },
      'E1': { 'L': '听歌就是听歌，不会把歌词往自己身上套。理性型听众。', 'M': '偶尔会有共鸣，但不会每次都"破防"。情感开关看歌曲质量。', 'H': '每首歌都是写给自己的。歌词就是日记，旋律就是人生BGM。' },
      'E2': { 'L': '到点就睡，作息规律。深夜和白天没有区别，不会因为天黑就伤感。', 'M': '偶尔深夜会感性，但不会每次都emo。属于"间歇性深夜哲学家"。', 'H': '23:00准时emo，评论区是深夜食堂，枕头湿了也不关。专业级深夜伤患者。' },
      'E3': { 'L': '过去的就过去了，不会因为一首歌想起某个人。向前看型人格。', 'M': '偶尔会被触发，但能快速恢复。前任相关歌曲会跳过但不会崩溃。', 'H': '日推出现前任的歌就破防。歌单按"前任编年史"排列。情感阴影面积巨大。' },
      'O1': { 'L': '歌单够用就行，不纠结分类。红心随便点，不搞"灵魂审核"。', 'M': '有基本的分类习惯，但不会过于强迫。红心会犹豫一下但不会纠结太久。', 'H': '歌单是艺术，红心是仪式。每首歌都有严格的归位标准，错放一首都不行。' },
      'O2': { 'L': '能耐心听完一整首歌，包括前奏和尾奏。对"不完美"有较高容忍度。', 'M': '会在某些时刻切歌，但不是每首都切。容忍度看心情。', 'H': '3秒没hook就切，高潮结束0.1秒就切。拇指比大脑反应更快。' },
      'O3': { 'L': '不在意一首歌火不火，好听就行。大众小众一视同仁。', 'M': '有点小众偏好，但不会因为歌火了就讨厌它。属于"温和型音乐探险家"。', 'H': '宝藏歌被发现了就像被绿了。评论破999+要写悼文。小众优越感是精神支柱。' },
      'I1': { 'L': '戴上耳机就是加了BGM，世界还是那个世界。', 'M': '会有点沉浸感，走路带风，但不会完全脱离现实。', 'H': '现实世界已经不存在了。楼道是T台，地铁是战场，我是MV主角。' },
      'I2': { 'L': '听歌就是听歌，不会跟着唱跳。属于"安静型听众"。', 'M': '会跟着哼几句，偶尔点头打节拍。表演欲在可控范围内。', 'H': '空气吉他、空气鼓槌、空气麦克风全部就位。浴室就是我的演唱会。' },
      'I3': { 'L': '歌词就是歌词，不会过度联想。听完就过了。', 'M': '偶尔会觉得某句歌词"写得真好"，但不会觉得"在写我"。', 'H': '作词人一定在我房间装了监控。每句话都是我的人生写照。' }
    }
  },

  questions: [
    { id: 'q1', dim: 'D1', text: '你出门忘带耳机了，此时你的心理状态最接近：', options: [{ label: '没事，安静也挺好', value: 1 }, { label: '有点不习惯，但能忍', value: 2 }, { label: '立刻掉头回家拿，没有耳机我无法呼吸', value: 3 }] },
    { id: 'q2', dim: 'D1', text: '你每天戴耳机的时间大约是：', options: [{ label: '1-2小时，偶尔听听', value: 1 }, { label: '3-5小时，通勤+工作时听', value: 2 }, { label: '除了睡觉和洗澡，耳机焊在耳朵上', value: 3 }] },
    { id: 'q3', dim: 'D2', text: '你发现自己喜欢的歌后，通常会：', options: [{ label: '加入歌单，随机听到时再享受', value: 1 }, { label: '连续听几天，腻了就换', value: 2 }, { label: '单曲循环到室友/同事想报警，听到这首歌的每个音符都刻进DNA', value: 3 }] },
    { id: 'q4', dim: 'D2', text: '听一首歌时，副歌结束你的手指会：', options: [{ label: '自然地等下一首', value: 1 }, { label: '有时候会拖回去再听一遍副歌', value: 2 }, { label: '不受控制地拖回副歌开头，循环5遍后才勉强放过这首歌', value: 3 }] },
    { id: 'q5', dim: 'D3', text: '你的手机里装了几个音乐APP？', options: [{ label: '好几个，哪个有版权用哪个', value: 1 }, { label: '两个，一个主力一个备用', value: 2 }, { label: '只有网易云，其他APP下载了也没打开过，我的红心和歌单都在这里', value: 3 }] },
    { id: 'q6', dim: 'D3', text: '如果网易云突然宣布关闭服务器，你的第一反应是：', options: [{ label: '换个APP呗，歌都差不多', value: 1 }, { label: '有点难过，毕竟用了很久', value: 2 }, { label: '天塌了。我那3000首红心、50个精心分类的歌单、500条走心评论……这不是关APP，这是烧我的精神遗产', value: 3 }] },
    { id: 'q7', dim: 'E1', text: '听到一首特别扎心的歌时，你通常会：', options: [{ label: '觉得旋律不错，听完就过了', value: 1 }, { label: '有点感触，可能会单曲循环一会儿', value: 2 }, { label: '眼泪直接掉下来，感觉自己的人生被这首歌完整地唱了一遍', value: 3 }] },
    { id: 'q8', dim: 'E1', text: '你听歌时更关注什么？', options: [{ label: '旋律和编曲，歌词随便听听', value: 1 }, { label: '旋律和歌词各占一半', value: 2 }, { label: '歌词。歌词就是我的日记本，每句话都在写我', value: 3 }] },
    { id: 'q9', dim: 'E2', text: '晚上11点以后，你的歌单会发生什么变化？', options: [{ label: '和白天差不多，该听什么听什么', value: 1 }, { label: '可能会切换到稍微安静一点的歌', value: 2 }, { label: '自动切换到"深夜emo"歌单，陈奕迅、林宥嘉、薛之谦轮番上阵，枕头湿了也不关', value: 3 }] },
    { id: 'q10', dim: 'E2', text: '你在网易云评论区最常做的事是：', options: [{ label: '偶尔看看热评，笑一笑就过了', value: 1 }, { label: '认真看评论，偶尔点赞', value: 2 }, { label: '从第一条刷到最后一条，两千楼的故事看完哭湿枕头，自己也写一段三千字的情感小作文', value: 3 }] },
    { id: 'q11', dim: 'E3', text: '日推里突然出现你和前任一起听过的歌，你会：', options: [{ label: '没感觉，正常听完', value: 1 }, { label: '心里咯噔一下，但不会跳过', value: 2 }, { label: '瞬间破防，立刻切歌，但歌词已经在脑子里循环了，今晚注定失眠', value: 3 }] },
    { id: 'q12', dim: 'E3', text: '你有没有因为一首歌而想起某个人，然后情绪崩溃？', options: [{ label: '没有，歌就是歌', value: 1 }, { label: '偶尔会有点感触', value: 2 }, { label: '何止一首歌？我的整个歌单都是按"前任编年史"排列的', value: 3 }] },
    { id: 'q13', dim: 'O1', text: '你的歌单数量和分类方式是：', options: [{ label: '几个大歌单，够用就行', value: 1 }, { label: '十几个歌单，按心情/场景分了类', value: 2 }, { label: '50+歌单，每个都有严格命名规范，"深夜独处·雨天·第三类情绪·不允许在白天打开"这种级别', value: 3 }] },
    { id: 'q14', dim: 'O1', text: '点红心之前你会犹豫吗？', options: [{ label: '觉得好听就点，不纠结', value: 1 }, { label: '会想一下"这首歌配不配"', value: 2 }, { label: '必须经过三轮审核：初听→二刷→三品，确认这首歌能进我的"灵魂歌单"才郑重点下红心，点错了还会取消', value: 3 }] },
    { id: 'q15', dim: 'O2', text: '一首歌的前奏你通常能忍多久？', options: [{ label: '听完前奏再决定', value: 1 }, { label: '5秒内判断要不要继续', value: 2 }, { label: '前3秒没有hook直接切，前奏超过10秒没人声手指已经不受控制了', value: 3 }] },
    { id: 'q16', dim: 'O2', text: '一首歌的高潮部分结束后，你的大拇指会：', options: [{ label: '等它自然结束', value: 1 }, { label: '看心情，有时候切有时候不切', value: 2 }, { label: '高潮结束0.1秒内完成切歌，绝不给尾奏任何面子', value: 3 }] },
    { id: 'q17', dim: 'O3', text: '你私藏的宝藏歌曲突然在抖音火了，你的反应是：', options: [{ label: '挺好的，更多人能听到', value: 1 }, { label: '有点复杂，高兴又有点失落', value: 2 }, { label: '强烈的"被绿"感。这首歌是我的，你们不配。评论破999+的那天，我在评论区写了一篇"悼文"', value: 3 }] },
    { id: 'q18', dim: 'O3', text: '你会因为什么原因拒绝听一首歌？', options: [{ label: '基本不会拒绝，好听就行', value: 1 }, { label: '实在太难听才会', value: 2 }, { label: '封面太丑、歌手太火、评论太少、风格太主流……理由可以写一本书', value: 3 }] },
    { id: 'q19', dim: 'I1', text: '戴上耳机走在路上，你的世界会发生什么变化？', options: [{ label: '就是加了背景音乐，没什么特别的', value: 1 }, { label: '确实会有点沉浸，走路带风', value: 2 }, { label: '楼道变T台，地铁变末日战场，便利店变日剧片场，我已经不是在走路了，我是在拍MV', value: 3 }] },
    { id: 'q20', dim: 'I1', text: '"本来只想睡前听两首歌"，实际结果是：', options: [{ label: '真的只听两首就睡了', value: 1 }, { label: '可能会多听几首，但一小时内能睡', value: 2 }, { label: '回过神来天亮了，手机没电了，歌单循环了三遍，上班迟到了', value: 3 }] },
    { id: 'q21', dim: 'I2', text: '听到一首节奏感很强的歌时，你的身体会：', options: [{ label: '轻轻点头打节拍', value: 1 }, { label: '身体会跟着晃动', value: 2 }, { label: '空气吉他、空气鼓槌、空气麦克风全部就位，虽然没有观众但我的表演是格莱美级别的', value: 3 }] },
    { id: 'q22', dim: 'I2', text: '洗澡时听歌，你的状态是：', options: [{ label: '正常洗澡，歌当背景', value: 1 }, { label: '会跟着哼几句', value: 2 }, { label: '周杰伦/陈奕迅附体，浴室就是我的演唱会主场，邻居投诉也无所谓，今晚我是王', value: 3 }] },
    { id: 'q23', dim: 'I3', text: '你有没有觉得某首歌的歌词"就是在写我"？', options: [{ label: '没有，歌词就是歌词', value: 1 }, { label: '偶尔有共鸣', value: 2 }, { label: '不是"觉得"，是"确信"。作词人一定在我的房间装了监控，否则怎么解释每句话都在精准描述我的人生', value: 3 }] },
    { id: 'q24', dim: 'I3', text: '你在商场/咖啡厅听到BGM时，你的反应是：', options: [{ label: '没什么反应，当背景音', value: 1 }, { label: '可能会注意一下是什么歌', value: 2 }, { label: '0.5秒内掏出手机打开听歌识曲，识别成功后还要看一眼评论区确认"果然不止我一个人觉得这首歌牛"', value: 3 }] }
  ],

  specialQuestions: [
    { id: 'wy_gate_q1', special: true, kind: 'wy_gate', text: '你使用网易云音乐多少年了？', options: [{ label: '不到3年', value: 1 }, { label: '3-7年', value: 2 }, { label: '8年以上', value: 3 }] },
    { id: 'wy_gate_q2', special: true, kind: 'wy_trigger', text: '以下哪个场景最能描述你的深夜状态？', options: [{ label: '到点就睡，作息规律', value: 1 }, { label: '偶尔熬夜，但不算严重', value: 2 }, { label: '每天23:00准时emo，网易云评论区是我的深夜食堂，哭完才睡', value: 3 }] }
  ],

  typeLibrary: {
    'CHORUS': { code: 'CHORUS', cn: '副歌依赖症晚期', intro: '听一首歌必须拖回副歌再听一遍，否则浑身难受。', desc: '恭喜您，您已被确诊为"副歌依赖症晚期"。您的手指已经形成了一种条件反射——副歌结束的那一瞬间，大拇指会以0.08秒的反应速度精准地拖动进度条回到副歌开头。这不是你在控制手指，是副歌在控制你。\n\n您的音乐消费模式已经完全脱离了"听一首完整的歌"这个概念。对您来说，一首歌只由两部分组成：副歌，和"等待副歌的那段无聊时间"。前奏？跳过。主歌？跳过。桥段？什么桥段？我只知道副歌。\n\n据临床观察，副歌依赖症晚期患者平均每首歌只会完整听完副歌部分，其余段落一律被视为"广告时间"。您不是在听歌，您是在反复品尝一道菜里最好吃的那一口，然后把整盘菜推到一边。\n\n医嘱：建议尝试完整听完一首歌，包括前奏和尾奏。如果感到不适，请深呼吸，并反复默念"主歌也是有感情的"。' },
    'LIVE': { code: 'LIVE', cn: '颅内混响重度成瘾', intro: '只听Live版和演唱会版，听见掌声和尖叫颅内才会高潮。', desc: '您已被确诊为"颅内混响重度成瘾"。在您的音乐世界里，录音室版本就是"被阉割的平替"，只有Live版才是真正的音乐。您对掌声、尖叫声、观众大合唱有着近乎病态的渴求——那些混响、回声、即兴改编，才是让您的颅内多巴胺疯狂分泌的真正配方。\n\n当一首歌的Live版前奏响起，观众席传来第一声欢呼时，您的瞳孔会放大，心率会加速，后背会起鸡皮疙瘩。这种感觉，录音室版本永远给不了您。\n\n您收藏夹里的歌，十个有八个标注着"(Live)"。如果一首歌只有录音室版本，您会觉得它"没有灵魂"。\n\n医嘱：偶尔听听录音室版本，体会一下"干净的声音"也是一种美。' },
    'UMBILICAL': { code: 'UMBILICAL', cn: '耳机线脐带综合症', intro: '耳机一摘，感觉失去了与母星的最后连接。', desc: '您已被确诊为"耳机线脐带综合症"。耳机对您而言，早已不是一件电子配件，而是一条连接您与精神母体的脐带。摘下耳机的那一刻，您会感到一种类似于"新生儿被剪断脐带"的恐慌——周围的声音突然变得刺耳、嘈杂、毫无美感，世界从4D降级成了2D。\n\n临床数据显示，耳机脐带综合症患者出门忘带耳机的焦虑程度，与普通人忘带手机相当。\n\n医嘱：建议每天尝试摘下耳机30分钟，感受一下真实世界的声音。' },
    'LOOP': { code: 'LOOP', cn: '单曲循环强迫性重复障碍', intro: '一首emo神曲听到手机没电，听到耳朵起茧也不切。', desc: '您已被确诊为"单曲循环强迫性重复障碍"。当您锁定了一首"命中注定的歌"之后，您的播放列表就只剩下一首歌了。不是您不想切，是您切不了——就像被困在一个音乐的时间循环里，每天醒来，这首歌还在播放。\n\n您的单曲循环记录可以轻松突破100遍。室友已经从"这首歌挺好听的"进化到"你再放这首歌我就报警"。\n\n医嘱：强制设置"每日单曲循环上限"为50遍。超过后系统自动切换到下一首。' },
    'SHOWER': { code: 'SHOWER', cn: '洗澡间世界巡回演唱会妄想症', intro: '洗澡时觉得自己是周杰伦/陈奕迅附体，邻居投诉也无所谓。', desc: '您已被确诊为"洗澡间世界巡回演唱会妄想症"。当花洒打开、水雾升腾的那一刻，您的浴室就不是浴室了——那是Madison Square Garden，那是您的世界巡演第108站。\n\n您在浴室里的表演是全方位的：高音部分会扯着嗓子嘶吼，深情部分会闭上眼睛仰头。\n\n医嘱：建议购买防水蓝牙音箱以提升音质体验。' },
    'INTRO': { code: 'INTRO', cn: '前奏过长引起的急性焦虑症', intro: '前奏超过10秒没人声，手指会不受控制地点"下一首"。', desc: '您已被确诊为"前奏过长引起的急性焦虑症"。在您的音乐世界里，前奏就是"等待的折磨"。10秒，是您的心理承受极限。超过这个时间还没有人声出现，您的手指就会不受控制地滑向"下一首"按钮。\n\n您的切歌记录中，有超过70%的切歌发生在前奏阶段。\n\n医嘱：建议尝试"前奏冥想训练"，从20秒开始，逐步延长到能完整听完一首带前奏的歌。' },
    'SHUFFLE': { code: 'SHUFFLE', cn: '随机播放信任危机', intro: '点了随机，但总觉得推荐的歌一点都不随机，甚至有点冒犯。', desc: '您已被确诊为"随机播放信任危机"。您和随机播放功能之间的关系，已经从"信任"恶化成了"互相猜忌"。您点了随机播放，但总觉得算法在针对您。\n\n您开始怀疑"随机"这个概念本身。您觉得算法一定有某种不可告人的偏好。\n\n医嘱：接受随机播放的不完美本质。或者干脆放弃随机，手动选歌。' },
    'COMMENT': { code: 'COMMENT', cn: '评论区PTSD重度患者', intro: '歌没听进去，评论区两千楼的故事看完哭湿了枕头。', desc: '您已被确诊为"评论区PTSD重度患者"。对您来说，一首歌只是入场券，真正的重头戏在评论区。您打开一首歌，第一件事不是听，而是划到评论区。两千楼的评论，您能从头刷到尾，每一条都不放过。\n\n医嘱：建议先听歌再看评论，或设置"评论阅读时限"为10分钟。' },
    'COPYPASTE': { code: 'COPYPASTE', cn: '文案搬运工职业损伤', intro: '听歌不是为了听，是为了找一句能发朋友圈的扎心句子。', desc: '您已被确诊为"文案搬运工职业损伤"。您的听歌行为已经发生了一次根本性的范式转移——您不再是为了"听"而听歌，而是为了"找"而听歌。找一句能发朋友圈的扎心文案。\n\n您的朋友圈/微博已经成为了一个"网易云歌词摘抄本"。\n\n医嘱：建议尝试"纯粹听歌模式"——不截图、不复制、不发朋友圈，只听。' },
    'EXRADAR': { code: 'EXRADAR', cn: '前任雷达异常灵敏症', intro: '日推里出现陶喆/蔡依林，就知道今天不宜出门。', desc: '您已被确诊为"前任雷达异常灵敏症"。您的音乐系统已经与您的情感记忆形成了一种高度敏感的联动机制——当随机播放或日推中出现与前任相关的歌曲时，您的"前任雷达"会在0.01秒内发出红色警报。\n\n医嘱：建议进行"脱敏训练"——在安全环境下主动播放前任相关歌曲，逐步降低敏感度。' },
    'COPYRIGHT': { code: 'COPYRIGHT', cn: '因版权下架导致的心律不齐', intro: '看着列表里灰色的歌名，感觉就像失去了亲人。', desc: '您已被确诊为"因版权下架导致的心律不齐"。每次打开歌单，看到那些灰色的歌名，您的心都会揪一下。那不是灰色的字体，那是墓碑。\n\n医嘱：接受音乐版权流动的现实。建议定期导出歌单备份。' },
    'THRESHOLD': { code: 'THRESHOLD', cn: '快乐阈值升高综合征', intro: '只有后摇、核嗓、黑金属才能安慰我，听《好运来》面不改色。', desc: '您已被确诊为"快乐阈值升高综合征"。您的音乐审美已经进化到了一个常人难以企及的高度——普通流行歌？太浅。民谣？太矫情。说唱？太吵。只有后摇那15分钟的层层推进、核嗓那撕裂灵魂的嘶吼，才能在您已经千疮百孔的心上留下一点痕迹。\n\n医嘱：偶尔尝试回归"简单快乐"的音乐。' },
    'VIRGIN': { code: 'VIRGIN', cn: '伤感情歌情感代偿障碍', intro: '明明没谈过恋爱，听歌却觉得已经离了八次婚。', desc: '您已被确诊为"伤感情歌情感代偿障碍"。这是本次鉴定中最具戏剧性的工伤——您的恋爱经验可能为零，但您的情感阅历已经通过音乐"代偿"到了一个离异八次的中年人都自叹不如的水平。\n\n医嘱：建议适度接触现实社交。如果条件允许，尝试真正的恋爱体验。' },
    'EMO23': { code: 'EMO23', cn: '深夜emo准点报时体质', intro: '每晚23:00自动切换歌单，人间清醒与半夜发疯无缝衔接。', desc: '您已被确诊为"深夜emo准点报时体质"。您的身体里装了一个精准到秒的生物钟——每天晚上23:00，您的歌单会自动从"白天的快乐打工人BGM"切换到"深夜emo专属歌单"。\n\n医嘱：23:00前强制放下手机。' },
    'HEART': { code: 'HEART', cn: '红心外科手术式精准收纳癖', intro: '每点一次红心都要确认这首歌配不配进我的"灵魂歌单"。', desc: '您已被确诊为"红心外科手术式精准收纳癖"。在您的音乐世界里，点红心不是一件随手的事，而是一场庄严的仪式。\n\n医嘱：红心是自由的，不是每首歌都需要配得上格莱美。建议尝试"冲动红心法"。' },
    'SKIP': { code: 'SKIP', cn: '切歌腱鞘炎高危人群', intro: '一首歌的高潮刚结束0.1秒，大拇指已经完成了切歌动作。', desc: '您已被确诊为"切歌腱鞘炎高危人群"。您的大拇指已经形成了一种近乎本能的切歌反射弧——一首歌的高潮结束、尾奏开始的那一瞬间，您的拇指会在0.1秒内完成"识别高潮结束→判断尾奏无价值→滑动切歌"的全套流程。\n\n医嘱：强制设置"切歌冷却时间"为30秒。' },
    'NICHE': { code: 'NICHE', cn: '小众优越感维持困难症', intro: '发现私藏的宝藏歌曲评论破了999+，会有强烈的"被绿"感。', desc: '您已被确诊为"小众优越感维持困难症"。您是那种在音乐世界里扮演"探险家"的人——您不屑于听排行榜上的热门歌曲，您热衷于挖掘那些藏在角落里的宝藏音乐。\n\n医嘱：接受"好音乐不应该被藏起来"这个事实。' },
    'COVER': { code: 'COVER', cn: '专辑封面审美偏执狂', intro: '会因为封面太丑而拒绝听一首据说很好听的歌。', desc: '您已被确诊为"专辑封面审美偏执狂"。在您的音乐审美体系中，视觉和听觉是深度绑定的——一首歌好不好听，首先要看封面好不好看。\n\n医嘱：尝试"闭眼听歌法"——不看封面，只听音乐。' },
    'SLEEP': { code: 'SLEEP', cn: '睡眠障碍性听歌列表依赖', intro: '没有那个特定的雨声/海浪/ASMR歌单，睁眼到天亮。', desc: '您已被确诊为"睡眠障碍性听歌列表依赖"。您的睡眠已经与一个特定的歌单形成了深度绑定——没有它，您的身体会拒绝进入睡眠模式。\n\n医嘱：建议提前下载离线缓存，防止版权变动导致的失眠危机。' },
    'DAILY': { code: 'DAILY', cn: '日推冷漠厌倦型人格', intro: '点了七遍"不感兴趣"，日推依然顽强地推荐同一首抖音神曲。', desc: '您已被确诊为"日推冷漠厌倦型人格"。您和网易云日推之间的关系已经从"期待每天的新发现"恶化成了"每天一次的互相伤害"。\n\n医嘱：日推算法需要时间学习。建议坚持使用"不感兴趣"功能。' },
    'SHAZAM': { code: 'SHAZAM', cn: '听歌识曲应激反应', intro: '听到商场广播里的BGM，0.5秒之内必须掏出手机打开识别功能。', desc: '您已被确诊为"听歌识曲应激反应"。您的耳朵已经进化成了一种"全天候音乐扫描仪"——无论您在哪里，只要听到一段陌生的旋律，您的身体就会自动启动"识别程序"。\n\n医嘱：不是所有的BGM都需要被识别。让它们保持神秘也是一种美。' },
    'MV': { code: 'MV', cn: '颅内MV导演妄想症', intro: '戴上耳机，楼道就是T台，地铁就是末日战场片场。', desc: '您已被确诊为"颅内MV导演妄想症"。当您戴上耳机的那一刻，现实世界就不再是现实世界了——它变成了您私人MV的拍摄现场。楼道是T台，您是超模，每一步都踩在节拍上。\n\n医嘱：颅内MV是正常现象，但请注意控制外在表现。' },
    'TIMEWARP': { code: 'TIMEWARP', cn: '时间感知障碍（因听歌导致）', intro: '本来只想睡前听两首，回过神来天亮了，该起床上班了。', desc: '您已被确诊为"时间感知障碍（因听歌导致）"。在您的世界里，时间的流速和音乐是深度绑定的——戴上耳机的那一刻，时间就开始加速。您以为只过了5分钟，实际上已经过了2小时。\n\n医嘱：设置"睡前听歌定时关闭"功能，建议设定为30分钟。' },
    'AIRBAND': { code: 'AIRBAND', cn: '空气乐器无实物表演艺术家', intro: '鼓点响起，手里没有吉他/鼓槌，只有空气和尴尬的气氛。', desc: '您已被确诊为"空气乐器无实物表演艺术家"。当音乐响起的那一刻，您的双手就会自动变成空气吉他、空气鼓槌、空气麦克风——虽然手里什么都没有，但您的表演是认真的。\n\n医嘱：空气乐器表演是一种健康的音乐表达方式，但请注意场合。' },
    'OVERREAD': { code: 'OVERREAD', cn: '歌词文本过度解读综合征', intro: '觉得作词人写的每一句话，都是在偷窥我的生活。', desc: '您已被确诊为"歌词文本过度解读综合征"。在您的认知体系中，歌词不是"写出来的"，而是"偷窥您的生活后记录下来的"。每一句歌词都精准地描述了您的人生经历。\n\n医嘱：歌词的共鸣是美好的，但请记住：好的歌词写的是人类共通的情感，而不是某一个人的故事。' },
    'SPEAKER': { code: 'SPEAKER', cn: '外放开会恐惧症', intro: '手机突然断开蓝牙/耳机没插严，会在公共场合引发猝死性尴尬。', desc: '您已被确诊为"外放开会恐惧症"。这是当代音乐爱好者最常见的创伤性应激障碍之一。当您的手机突然断开蓝牙连接，您的emo歌单突然从手机外放中传出时，那种尴尬足以让您原地消失。\n\n医嘱：建议购买降噪耳机并启用"有线+蓝牙"双保险模式。' },
    'RESIDENT': { code: 'RESIDENT', cn: '网易云村民户口迁出困难症', intro: '手机里装了其他APP，但每晚打开的还是那个红色图标。', desc: '您已被确诊为"网易云村民户口迁出困难症"。您的手机里装满了各种音乐APP，但每晚打开的，永远是那个红色图标。\n\n医嘱：户口迁出不是必须的。如果网易云能满足您的需求，继续使用它就好。' },
    'BATTERY': { code: 'BATTERY', cn: '电量恐慌型听歌依赖', intro: '手机电量低于20%时，第一反应是还能听几遍《七里香》。', desc: '您已被确诊为"电量恐慌型听歌依赖"。当您的手机电量低于20%时，普通人的第一反应是"找充电器"，而您的第一反应是"还能听几首歌"。\n\n医嘱：建议随身携带充电宝。' },
    'LIFETIME': { code: 'LIFETIME', cn: '网抑云终身荣誉工伤', intro: '使用网易云8年以上，每晚23:00准时emo，评论区累计留言一万字。', desc: '恭喜您（或者说不幸的是），您已被授予"网抑云终身荣誉工伤"称号。这不是一种普通的工伤诊断，而是一种至高无上的"荣誉"——它意味着您已经在这个红色APP里浸泡了超过8年。\n\n医嘱：无。终身荣誉工伤不可治愈，也不需要治愈。请继续在评论区写下您的故事。' },
    'ALLERGY': { code: 'ALLERGY', cn: '音乐过敏体质', intro: '标准工伤库对您的听歌习惯集体罢工，您可能是这个世界上唯一一个对"音乐工伤免疫"的人。', desc: '恭喜您，您测出了一个极其罕见的诊断结果——"音乐过敏体质"。这意味着您的听歌习惯过于"正常"或过于"矛盾"，以至于28种标准工伤诊断都无法准确匹配您的画像。\n\n医嘱：请继续保持您的"音乐免疫体质"，这可能是最健康的听歌方式。' }
  },

  typeImages: {
    'CHORUS': '/images/01-CHORUS-副歌依赖症晚期.jpg',
    'LIVE': '/images/02-LIVE-颅内混响重度成瘾.jpg',
    'UMBILICAL': '/images/03-UMBILICAL-耳机线脐带综合症.jpg',
    'LOOP': '/images/04-LOOP-单曲循环强迫性重复障碍.jpg',
    'SHOWER': '/images/05-SHOWER-洗澡间世界巡回演唱会妄想症.jpg',
    'INTRO': '/images/06-INTRO-前奏过长引起的急性焦虑症.jpg',
    'SHUFFLE': '/images/07-SHUFFLE-随机播放信任危机.jpg',
    'COMMENT': '/images/08-COMMENT-评论区PTSD重度患者.jpg',
    'COPYPASTE': '/images/09-COPYPASTE-文案搬运工职业损伤.jpg',
    'EXRADAR': '/images/10-EXRADAR-前任雷达异常灵敏症.jpg',
    'COPYRIGHT': '/images/11-COPYRIGHT-因版权下架导致的心律不齐.jpg',
    'THRESHOLD': '/images/12-THRESHOLD-快乐阈值升高综合征.jpg',
    'VIRGIN': '/images/13-VIRGIN-伤感情歌情感代偿障碍.jpg',
    'EMO23': '/images/14-EMO23-深夜emo准点报时体质.jpg',
    'HEART': '/images/15-HEART-红心外科手术式精准收纳癖.jpg',
    'SKIP': '/images/16-SKIP-切歌腱鞘炎高危人群.jpg',
    'NICHE': '/images/17-NICHE-小众优越感维持困难症.jpg',
    'COVER': '/images/18-COVER-专辑封面审美偏执狂.jpg',
    'SLEEP': '/images/19-SLEEP-睡眠障碍性听歌列表依赖.jpg',
    'DAILY': '/images/20-DAILY-日推冷漠厌倦型人格.jpg',
    'SHAZAM': '/images/21-SHAZAM-听歌识曲应激反应.jpg',
    'MV': '/images/22-MV-颅内MV导演妄想症.jpg',
    'TIMEWARP': '/images/23-TIMEWARP-时间感知障碍.jpg',
    'AIRBAND': '/images/24-AIRBAND-空气乐器无实物表演艺术家.jpg',
    'OVERREAD': '/images/25-OVERREAD-歌词文本过度解读综合征.jpg',
    'SPEAKER': '/images/26-SPEAKER-外放开会恐惧症.jpg',
    'RESIDENT': '/images/27-RESIDENT-网易云村民户口迁出困难症.jpg',
    'BATTERY': '/images/28-BATTERY-电量恐慌型听歌依赖.jpg',
    'LIFETIME': '/images/29-LIFETIME-网抑云终身荣誉工伤.jpg',
    'ALLERGY': '/images/30-ALLERGY-音乐过敏体质.jpg'
  },

  normalTypes: [
    { code: 'CHORUS', pattern: 'HHM-HMM-MMM-MML' },
    { code: 'LIVE', pattern: 'HHM-HMM-MHM-MHH' },
    { code: 'UMBILICAL', pattern: 'HHH-HMM-MML-MML' },
    { code: 'LOOP', pattern: 'HMH-HMM-MML-MML' },
    { code: 'SHOWER', pattern: 'HMH-MMM-MML-HHH' },
    { code: 'INTRO', pattern: 'HMH-MMM-MHH-MML' },
    { code: 'SHUFFLE', pattern: 'HMH-HMM-MHH-MML' },
    { code: 'COMMENT', pattern: 'MMH-HHH-MML-MML' },
    { code: 'COPYPASTE', pattern: 'MMH-HHM-MML-MHM' },
    { code: 'EXRADAR', pattern: 'MMH-HHH-MML-MML' },
    { code: 'COPYRIGHT', pattern: 'HMH-HHM-MML-MML' },
    { code: 'THRESHOLD', pattern: 'MMH-HHH-MML-MHH' },
    { code: 'VIRGIN', pattern: 'MMH-HHH-MML-MHH' },
    { code: 'EMO23', pattern: 'MMH-HHH-MML-MML' },
    { code: 'HEART', pattern: 'MMH-MMM-HHH-MML' },
    { code: 'SKIP', pattern: 'MMH-MMM-MHH-MML' },
    { code: 'NICHE', pattern: 'MMH-MMM-HMH-MHM' },
    { code: 'COVER', pattern: 'MMH-MMM-HHH-MML' },
    { code: 'SLEEP', pattern: 'HMH-MMM-MML-MML' },
    { code: 'DAILY', pattern: 'MMH-MMM-MHH-MML' },
    { code: 'SHAZAM', pattern: 'MMH-MMM-MHH-MHH' },
    { code: 'MV', pattern: 'MMH-MMM-MML-HHH' },
    { code: 'TIMEWARP', pattern: 'HMH-MMM-MML-HHH' },
    { code: 'AIRBAND', pattern: 'MMH-MMM-MML-HHH' },
    { code: 'OVERREAD', pattern: 'MMH-MMM-MML-HHH' },
    { code: 'SPEAKER', pattern: 'HMH-MMM-MML-HHM' },
    { code: 'RESIDENT', pattern: 'HHH-MMM-MML-MML' },
    { code: 'BATTERY', pattern: 'HHH-MMM-MML-MML' }
  ],

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  getVisibleQuestions() {
    const visible = [...this.data.shuffledQuestions];
    const gateIndex = visible.findIndex(q => q.id === 'wy_gate_q1');
    if (gateIndex !== -1 && this.data.answers['wy_gate_q1'] === 3) {
      visible.splice(gateIndex + 1, 0, this.specialQuestions[1]);
    }
    return visible;
  },

  updateProgress() {
    const visibleQuestions = this.getVisibleQuestions();
    const total = visibleQuestions.length;
    const done = visibleQuestions.filter(q => this.data.answers[q.id] !== undefined).length;
    const percent = total ? (done / total) * 100 : 0;
    const complete = done === total && total > 0;
    
    this.setData({
      progressPercent: percent,
      doneCount: done,
      totalCount: total,
      submitBtnDisabled: !complete
    });
  },

  renderQuestions() {
    const visibleQuestions = this.getVisibleQuestions();
    this.setData({ visibleQuestions });
    this.updateProgress();
  },

  selectOption(e) {
    const { qid, value } = e.currentTarget.dataset;
    const answers = { ...this.data.answers };
    answers[qid] = value;

    if (qid === 'wy_gate_q1') {
      if (value !== 3) {
        delete answers['wy_gate_q2'];
      }
    }

    this.setData({ answers }, () => {
      if (qid === 'wy_gate_q1') {
        this.renderQuestions();
      } else {
        this.updateProgress();
      }
    });
  },

  sumToLevel(score) {
    if (score <= 3) return 'L';
    if (score === 4) return 'M';
    return 'H';
  },

  levelNum(level) {
    return { L: 1, M: 2, H: 3 }[level];
  },

  parsePattern(pattern) {
    return pattern.replace(/-/g, '').split('');
  },

  getLifetimeTriggered(levels) {
    return this.data.answers['wy_gate_q1'] === 3
      && this.data.answers['wy_gate_q2'] === 3
      && levels['E2'] === 'H';
  },

  computeResult() {
    const rawScores = {};
    const levels = {};
    const dims = Object.keys(this.data.dimensionMeta);
    dims.forEach(dim => { rawScores[dim] = 0; });

    this.questions.forEach(q => {
      rawScores[q.dim] += Number(this.data.answers[q.id] || 0);
    });

    Object.entries(rawScores).forEach(([dim, score]) => {
      levels[dim] = this.sumToLevel(score);
    });

    const dimensionOrder = this.data.dimensionOrder;
    const userVector = dimensionOrder.map(dim => this.levelNum(levels[dim]));
    
    const ranked = this.normalTypes.map(type => {
      const vector = this.parsePattern(type.pattern).map(l => this.levelNum(l));
      let distance = 0;
      let exact = 0;
      for (let i = 0; i < vector.length; i++) {
        const diff = Math.abs(userVector[i] - vector[i]);
        distance += diff;
        if (diff === 0) exact += 1;
      }
      const similarity = Math.max(0, Math.round((1 - distance / 24) * 100));
      return { ...type, ...this.typeLibrary[type.code], distance, exact, similarity };
    }).sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (b.exact !== a.exact) return b.exact - a.exact;
      return b.similarity - a.similarity;
    });

    const bestNormal = ranked[0];
    const lifetimeTriggered = this.getLifetimeTriggered(levels);

    let finalDiagnosis;
    let modeKicker = '您的工伤诊断';
    let badge = `匹配度 ${bestNormal.similarity}% · 精准命中 ${bestNormal.exact}/12 维`;
    let sub = '维度命中度较高，当前诊断结果可视为您的主要工伤类型。';
    let special = false;

    if (lifetimeTriggered) {
      finalDiagnosis = this.typeLibrary['LIFETIME'];
      modeKicker = '终身荣誉工伤已触发';
      badge = '匹配度 100% · 8年网易云老村民认证';
      sub = '您已在网抑云村生活太久，系统直接授予您终身荣誉工伤称号。';
      special = true;
    } else if (bestNormal.similarity < 60) {
      finalDiagnosis = this.typeLibrary['ALLERGY'];
      modeKicker = '系统强制兜底';
      badge = `标准工伤库最高匹配仅 ${bestNormal.similarity}%`;
      sub = '28种标准工伤都无法准确描述您的听歌习惯，系统判定您为"音乐过敏体质"。';
      special = true;
    } else {
      finalDiagnosis = bestNormal;
    }

    return {
      rawScores,
      levels,
      ranked,
      bestNormal,
      finalDiagnosis,
      modeKicker,
      badge,
      sub,
      special
    };
  },

  submitTest() {
    const result = this.computeResult();
    const diagnosis = result.finalDiagnosis;
    const imageSrc = this.typeImages[diagnosis.code];

    let funNote = '本测试仅供娱乐。工伤诊断只是玩笑，请不要当真。祝大家听歌愉快！';
    if (result.special) {
      funNote = '本测试仅供娱乐。终身荣誉工伤和音乐过敏体质都是作者故意埋的彩蛋，请不要当真。';
    }

    this.setData({
      resultDiagnosis: diagnosis,
      resultImage: imageSrc || '',
      resultRawScores: result.rawScores,
      resultLevels: result.levels,
      modeKicker: result.modeKicker,
      matchBadge: result.badge,
      resultSub: result.sub,
      funNote: funNote,
      currentScreen: 'result'
    });

    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  startTest(e) {
    const preview = e && e.detail && e.detail.value ? true : false;
    
    const shuffledRegular = this.shuffle(this.questions);
    const insertIndex = Math.floor(Math.random() * shuffledRegular.length) + 1;
    const shuffledQuestions = [
      ...shuffledRegular.slice(0, insertIndex),
      this.specialQuestions[0],
      ...shuffledRegular.slice(insertIndex)
    ];

    this.setData({
      previewMode: preview,
      answers: {},
      shuffledQuestions: shuffledQuestions,
      currentScreen: 'test'
    }, () => {
      this.renderQuestions();
      wx.pageScrollTo({ scrollTop: 0, duration: 300 });
    });
  },

  backToIntro() {
    this.setData({ currentScreen: 'intro' });
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  restartTest() {
    this.startTest();
  }
})
