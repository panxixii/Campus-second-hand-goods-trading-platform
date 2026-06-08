/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: '图书教材' | '数码配件' | '省心生活' | '运动休闲' | '其它闲置';
  imageUrl: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number; // 信用评级 (如 98 分)
  campus: string; // 哪个校区，比如 "南校区", "本部", "北校区"
  dormitory: string; // 具体的宿舍宿舍区比如 "榕园4号", "荔园10号"
  isVerifiedSeller: boolean; // 是否完成教教务系统身份核验
  tags: string[]; // 比如 "可小刀", "即时发货", "仅接受自提", "考研神书"
  postDate: string;
  views: number;
  countFav: number;
  textbookInfo?: {
    schoolSubject: string; // 科目
    syllabusVersion: string; // 大纲编写版本
    courseNature: string; // 课程性质 (如 "必修", "选修")
  };
  limitDiscount?: {
    endTime: string; // 秒杀结束时间
    originalPriceBeforeDiscount: number;
  };
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEndTime?: string; // 降价结束时间
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productCategory: string;
  productImageUrl: string;
  sellerName: string;
  buyerName: string;
  status: '已代付托管' | '预约交付中' | '已完成' | '退款纠纷中' | '已关闭';
  timeline: {
    billedAt: string;         // 已支付
    agreedMeetingAt?: string;  // 预约见面交付
    inspectedAt?: string;      // 线下当面扫码核销
    refundAppliedAt?: string;  // 买家申请退款
    closedAt?: string;         // 退单关闭
  };
  dormitoryAddress: string; // 下手时的宿舍收货交付地址
  buyerMemo?: string; // 订单备注或留言
  cancellationReason?: string; // 取消原因
  cancellationRequestBy?: 'buyer' | 'seller' | 'timeout';
  verificationCode?: string; // 四位核销码 e.g., "9826"
  couponDiscount?: number; // 优惠券扣减金额
  couponCode?: string; // 优惠代码
}

export interface ChatMessage {
  id: string;
  chatWith: string; // 和谁聊
  sender: string; // 发送人
  text: string;
  timestamp: string;
  linkedProduct?: Product; // 关联商品卡片一键引用
  isSystem?: boolean; // 系统风控预警提示
  isRead?: boolean; // 是否已读
}

export interface CommunityPost {
  id: string;
  username: string;
  avatar: string;
  content: string;
  imageUrls: string[];
  tags: string[]; // 比如 ["搬家清仓", "毕业避坑"]
  likes: number;
  comments: {
    id: string;
    username: string;
    text: string;
  }[];
  timestamp: string;
  hasLiked?: boolean;
}

export interface SeekingDemand {
  id: string;
  title: string;
  budget: number;
  description: string;
  username: string;
  avatar: string;
  dormLocation: string;
  conditionPreference: string; // 新旧要求
  category: string;
  timestamp: string;
}

export interface ModerationTicket {
  id: string;
  type: '敏感词屏蔽' | '欺诈违规举报' | '交易履约纠纷';
  reportedItem: string; // 举报对象标题
  detail: string; // 详细信息
  reporter: string; // 举报人
  status: '待处理' | '已核实处置' | '已关闭驳回';
  timestamp: string;
  evidenceText?: string;
}

export interface UserAccount {
  username: string;
  role: 'user' | 'admin';
  campus: string;
  dorm: string;
  major?: string;
  studentId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publisher: string;
  publishTime: string;
  type: '系统重要防骗安全警示' | '平台功能优化通知' | '毕业季甩货专场活动' | '校友互助互惠福利';
  isUrgent?: boolean;
}

export interface Coupon {
  id: string;
  code: string;         // e.g. "GRAD50", "DORM20"
  title: string;        // e.g. "大四学长友情搬家券", "新生教务注册迎新礼"
  discountAmount: number; // 减少金额 (¥)
  minSpend: number;     // 满多少起用 (¥)
  targetUser: string;   // 领取限定所有人，或者是具体买家用户名 "所有人" 或 "张同学"
  isUsed: boolean;      // 买家是否已经核销过
  expiryTime: string;   // 格式 yyyy-MM-dd
  createdAt: string;    // 发券时间
}


