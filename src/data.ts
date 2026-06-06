import { Product, Order, ChatMessage, CommunityPost, SeekingDemand, ModerationTicket } from './types';

// 1. 初始化高保真校园二手商品列表
export const initialProducts: Product[] = [
  {
    id: 'prod-01',
    title: '【考研神书】高数十八讲与1000题（含潘茜茜手写复习高分路线）',
    description: '学长纯手写批注，包含考试重点难点标记。去年复习考了138分，希望能把好运传给下一位学弟学妹。书页干净，没有任何撕毁，有少量铅笔做题痕迹不影响做题。附送草稿本和真题规划卡片。',
    price: 35,
    originalPrice: 98,
    category: '图书教材',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    sellerName: '潘茜茜',
    sellerAvatar: 'P',
    sellerRating: 99,
    campus: '南校区',
    dormitory: '中苑5号楼',
    isVerifiedSeller: true,
    tags: ['考研神书', '可小刀', '接受自提'],
    postDate: '2026-06-05',
    views: 142,
    countFav: 18,
    textbookInfo: {
      schoolSubject: '高等数学 / 试卷真题',
      syllabusVersion: '张宇2026最新第十版',
      courseNature: '公共必修/专业必修'
    }
  },
  {
    id: 'prod-02',
    title: '女生自用捷安特 Giant ATX 660 山地车 · 顺滑好骑',
    description: '毕业清仓大甩卖！大一买的上下课滑板车换了这个自行车。车子保养非常好，链条定期上油，避震和变速器灵敏，配防盗数字锁和后座架（可以带人）。需要自行到榕园自提核销付款，可小刀。',
    price: 360,
    originalPrice: 1200,
    category: '运动休闲',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    sellerName: '周亦菲',
    sellerAvatar: 'Z',
    sellerRating: 98,
    campus: '本部东校区',
    dormitory: '榕园4号楼',
    isVerifiedSeller: true,
    tags: ['接受自提', '搬家甩卖', '可议价'],
    postDate: '2026-06-04',
    views: 312,
    countFav: 42,
    limitDiscount: {
      endTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // 24h后倒计时
      originalPriceBeforeDiscount: 420
    }
  },
  {
    id: 'prod-03',
    title: '罗技 MX Master 3S 无线蓝牙鼠标（手感极佳）',
    description: '出给需要代码和设计的同学。全新没用几个月，由于换了 Mac 触控板大部分闲置，原装包装盒和充电机一并奉送。支持连接3台设备一键切换，静音点击。',
    price: 280,
    originalPrice: 899,
    category: '数码配件',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    sellerName: '张皓越',
    sellerAvatar: 'H',
    sellerRating: 100,
    campus: '南校区',
    dormitory: '中苑3号楼',
    isVerifiedSeller: true,
    tags: ['九五新', '面交自取', '即时发货'],
    postDate: '2026-06-06',
    views: 89,
    countFav: 9
  },
  {
    id: 'prod-04',
    title: '【宿舍神器】九阳全多功能小电锅 · 煮面蒸饺全能',
    description: '由于宿舍限电不能用电磁炉，这个小电锅才500W完美避开限电。上层可以蒸速冻饺子馒头，下层可以煮螺蛳粉加蛋。洗起来非常方便，内胆是不粘锅。由于准备搬离出坑了，低价甩。',
    price: 25,
    originalPrice: 89,
    category: '省心生活',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    sellerName: '黄嘉敏',
    sellerAvatar: 'J',
    sellerRating: 97,
    campus: '北校区',
    dormitory: '荔园12号楼',
    isVerifiedSeller: true,
    tags: ['搬家清仓', '辅导员首推'],
    postDate: '2026-06-03',
    views: 450,
    countFav: 60
  },
  {
    id: 'prod-05',
    title: '《计算机组成原理与课程实践说明》大唐版',
    description: '期末复习神器，书中划好了考前高阶提纲（重点考存储器、CPU流水线寻址）。考试考过就可以丢啦，买去绝对保过。不折页、无污损。',
    price: 12,
    originalPrice: 48,
    category: '图书教材',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
    sellerName: '黄嘉敏',
    sellerAvatar: 'J',
    sellerRating: 97,
    campus: '南校区',
    dormitory: '中苑1号楼',
    isVerifiedSeller: true,
    tags: ['不可刀', '自提'],
    postDate: '2026-06-02',
    views: 74,
    countFav: 3,
    textbookInfo: {
      schoolSubject: '计算机科学与技术',
      syllabusVersion: '大唐软工版(第三版)',
      courseNature: '专业必修课'
    }
  }
];

// 2. 初始化模拟实名担保订单（覆盖已代付、催发货、交易核销、退款及各种取消方式）
export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    productId: 'prod-01',
    productTitle: '【考研神书】高数十八讲与1000题（含潘茜茜手写复习高分路线）',
    productPrice: 35,
    productCategory: '图书教材',
    productImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    sellerName: '潘茜茜',
    buyerName: '黄嘉敏',
    status: '已代付托管',
    timeline: {
      billedAt: '2026-06-06 09:12:00'
    },
    dormitoryAddress: '南校区 荔园12号楼302',
    buyerMemo: '师姐，我超级想要里面的复习大纲，今天下午四点在榕园便利店见面可以吗？',
    verificationCode: '8294'
  },
  {
    id: 'ord-102',
    productId: 'prod-03',
    productTitle: '罗技 MX Master 3S 无线蓝牙鼠标（手感极佳）',
    productPrice: 280,
    productCategory: '数码配件',
    productImageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    sellerName: '张皓越',
    buyerName: '周亦菲',
    status: '预约交付中',
    timeline: {
      billedAt: '2026-06-05 14:00:00',
      agreedMeetingAt: '2026-06-06 18:30:00'
    },
    dormitoryAddress: '南校区 中苑3号楼 门口自提',
    buyerMemo: '试用一下无线接收，麻烦带上原装盒子哈~',
    verificationCode: '4452'
  },
  {
    id: 'ord-103',
    productId: 'prod-04',
    productTitle: '【宿舍神器】九阳全多功能小电锅 · 煮面蒸饺全能',
    productPrice: 25,
    productCategory: '省心生活',
    productImageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    sellerName: '黄嘉敏',
    buyerName: '潘茜茜',
    status: '已完成',
    timeline: {
      billedAt: '2026-06-03 12:00:00',
      agreedMeetingAt: '2026-06-04 10:00:00',
      inspectedAt: '2026-06-04 10:15:00'
    },
    dormitoryAddress: '北校区 榕园自提',
    buyerMemo: '多谢师妹，还多送了我一个洗碗刷！'
  },
  {
    id: 'ord-104',
    productId: 'prod-05',
    productTitle: '《计算机组成原理与课程实践说明》大唐版',
    productPrice: 12,
    productCategory: '图书教材',
    productImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
    sellerName: '黄嘉敏',
    buyerName: '张皓越',
    status: '已关闭',
    timeline: {
      billedAt: '2026-06-02 09:00:00',
      closedAt: '2026-06-02 11:30:00'
    },
    dormitoryAddress: '南校区 中苑1号楼',
    cancellationReason: '不接受自提 / 买家误选不匹配的教材版本',
    cancellationRequestBy: 'buyer'
  }
];

// 3. 初始即时私聊内容（内置平台敏感词监控提示，满足 req-37 风控机制）
export const initialChats: ChatMessage[] = [
  {
    id: 'msg-01',
    chatWith: '潘茜茜',
    sender: '潘茜茜',
    text: '同学你好，对这个考研高数题感兴趣吗？这是我去年亲手划重点的复习资料。',
    timestamp: '2026-06-06 09:00:00'
  },
  {
    id: 'msg-02',
    chatWith: '潘茜茜',
    sender: '黄嘉敏',
    text: '是的！潘师姐，请问里面的1000题全写完了吗？还有高分路线图包含几项核心要点？',
    timestamp: '2026-06-06 09:02:00'
  },
  {
    id: 'msg-03',
    chatWith: '潘茜茜',
    sender: '系统风控',
    text: '❗平台安全监测警示：线下当面付存在欺诈漏洞！请使用平台内置的“担保支付”冻结暂存资金，见面提货后扫码核销。任何诱导直接加微信转账的行为均涉嫌欺诈，请小心。',
    timestamp: '2026-06-06 09:02:05',
    isSystem: true
  },
  {
    id: 'msg-04',
    chatWith: '潘茜茜',
    sender: '潘茜茜',
    text: '1000题只有前三章有铅笔做的痕迹，其余全新。高分路线图是我手绘画在答题本末页的，总结了高等数学和线性代数的重点。',
    timestamp: '2026-06-06 09:04:00'
  },
  {
    id: 'msg-05',
    chatWith: '潘茜茜',
    sender: '黄嘉敏',
    text: '太好了，我已经下单并进行了平台担保支付（资金已在平台托管），我们在中苑便利店门口面交可以直接核销！',
    timestamp: '2026-06-06 09:12:50'
  }
];

// 4. 初始化闲置社区动态（带话题 # 聚合、点赞、可见范围设置等，满足 req-25）
export const initialPosts: CommunityPost[] = [
  {
    id: 'post-01',
    username: '周亦菲',
    avatar: 'Z',
    content: '大四搬家大扫除，真的收拾出好多没拆封的宝贝。下周就要回老家了，大亏本清仓啦。求学弟学妹们来看看，在中苑榕园都有货！不求挣钱只求带走。#毕业清仓 #榕园甩卖 #吹风机',
    imageUrls: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'
    ],
    tags: ['毕业清仓', '搬家大甩卖'],
    likes: 24,
    comments: [
      { id: 'c-01', username: '潘茜茜', text: '师姐有大容量收纳箱或者行李箱出吗？求一到两个！' },
      { id: 'c-02', username: '周亦菲', text: '@潘茜茜 有两个30L的大收纳箱！晚上可以来榕园4号提~' }
    ],
    timestamp: '2026-06-05 18:00:00'
  }
];

// 5. 初始化买家求购大喇叭列表（让无货买家发布，满足 req-23）
export const initialSeeking: SeekingDemand[] = [
  {
    id: 'seek-01',
    title: '【加急求购】急需一把寝室面交的折叠骑行雨伞或防晒太阳伞',
    budget: 15,
    description: '下周军训求购防爆晒晴雨两用黑胶伞，寝室面交均可。不能高频漏雨。顺路可以请喝蜜雪冰城！',
    username: '黄嘉敏',
    avatar: 'J',
    dormLocation: '南校区荔园12号楼',
    conditionPreference: '能用就行，伞骨无折断',
    category: '省心生活',
    timestamp: '2026-06-06'
  },
  {
    id: 'seek-02',
    title: '【求购教材】中外文学名著导读课本、计算机网络最新版（谢希仁）',
    budget: 20,
    description: '谢网络版本不限（最好附带期末划重点画过的PPT打印册。只要是大三软工、计科用书都可以联系面交。',
    username: '张皓越',
    avatar: 'H',
    dormLocation: '南校区中苑3号楼',
    conditionPreference: '八成新以上，不要有严重缺页撕页',
    category: '图书教材',
    timestamp: '2026-06-04'
  }
];

// 6. 敏感词数据库与用户违规单 (满足运营后台 req-48, req-59 等)
export const SENSITIVE_WORDS = ['假币', '高利贷', '盗版药', '代写毕业论文', '加微信直付', '空包套现', '刷机辅助'];

export const initialTickets: ModerationTicket[] = [
  {
    id: 't-01',
    type: '交易履约纠纷',
    reportedItem: '罗技鼠标 MX Master 3S',
    detail: '买家周亦菲投诉卖家张皓越放鸽子，推迟三次约定见面时间，行为恶劣。',
    reporter: '周亦菲',
    status: '待处理',
    timestamp: '2026-06-06 08:30:00',
    evidenceText: '聊天记录证实卖家连续两次以“洗澡忘记时间”、“在打王者”为由迟到2小时以上。'
  },
  {
    id: 't-02',
    type: '敏感词屏蔽',
    reportedItem: '【高级优惠券】全站秒通过代写毕业论文',
    detail: '发布内容触发“代写毕业论文”平台防火墙预审拦截。商品已被自动下架隐藏，用户锁定待超管审批。',
    reporter: 'AI巡检预警',
    status: '已核实处置',
    timestamp: '2026-06-05 12:45:00',
    evidenceText: '标题与详情直接显露“毕业设计查重100%全包、老手在线接高校软著代写”等极度违规、影响学术端正的敏感词！'
  }
];
