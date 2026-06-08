import React, { useState, useEffect } from 'react';
import { initialProducts, initialOrders, initialChats, initialPosts, initialSeeking, initialTickets, initialAnnouncements, initialCoupons } from './data';
import { Product, Order, ChatMessage, CommunityPost, SeekingDemand, ModerationTicket, UserAccount, Announcement, Coupon } from './types';
import Marketplace from './components/Marketplace';
import Community from './components/Community';
import ChatWorkspace from './components/ChatWorkspace';
import OrderCenter from './components/OrderCenter';
import AdminPanel from './components/AdminPanel';
import ProfileCenter from './components/ProfileCenter';

import { 
  ShoppingBag, 
  Sparkles, 
  MessageSquare, 
  CreditCard, 
  Database, 
  ShieldAlert, 
  User, 
  HelpCircle,
  Bell,
  RefreshCw,
  Award,
  BookOpen,
  Sun,
  Moon,
  LogOut,
  Info,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';

// Default four student users and one admin as requested
const defaultPresetUsers: (UserAccount & { password?: string })[] = [
  { username: '潘茜茜', role: 'user', campus: '南校区(主校区)', dorm: '中苑5号楼302', major: '外国语学院', studentId: '2023010411', password: '123456' },
  { username: '周亦菲', role: 'user', campus: '本部东校区', dorm: '榕园4号楼102', major: '艺术设计学院', studentId: '2023010522', password: '123456' },
  { username: '张皓越', role: 'user', campus: '南校区(主校区)', dorm: '中苑3号楼405', major: '计算机科学与技术学院', studentId: '2023010233', password: '123456' },
  { username: '黄嘉敏', role: 'user', campus: '北校区(工学部)', dorm: '荔园12号楼112', major: '电子信息学院', studentId: '2023020644', password: '123456' },
  { username: 'admin', role: 'admin', campus: '全校自提中心', dorm: '后勤总台区', major: '系统网络安全督导', studentId: '000001', password: '123456' }
];

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [seekingList, setSeekingList] = useState<SeekingDemand[]>([]);
  const [tickets, setTickets] = useState<ModerationTicket[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Dynamic user storage
  const [users, setUsers] = useState<(UserAccount & { password?: string })[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Authentication Interface controls
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
  const [loginRole, setLoginRole] = useState<'user' | 'admin'>('user');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Fields
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCampus, setRegCampus] = useState('南校区(主校区)');
  const [regDorm, setRegDorm] = useState('');
  const [regMajor, setRegMajor] = useState('');
  const [regStudentId, setRegStudentId] = useState('');

  // Mode toggler - defaulting to Light (浅色模式，默认浅色)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('campustrade_theme_v3');
    return saved === 'dark';
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'marketplace' | 'community' | 'chat' | 'orders' | 'admin' | 'profile'>('marketplace');
  // Global search input
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  // Linked product in chat session
  const [selectedProductToLink, setSelectedProductToLink] = useState<Product | null>(null);
  
  // Custom alert bubble notifications for user interactions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronized user-specific favorites and browsing histories (favorites contains product IDs, browsingHistory contains product IDs)
  const [favorites, setFavorites] = useState<string[]>([]);
  const [browsingHistory, setBrowsingHistory] = useState<string[]>([]);

  // Apply dark/light layout classes dynamically
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campustrade_theme_v3', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campustrade_theme_v3', 'light');
    }
  }, [isDarkMode]);

  // Load and read standard local storage persistent items
  useEffect(() => {
    // 1. Initialise theme
    const savedTheme = localStorage.getItem('campustrade_theme_v3');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(false); // Default to light
    }

    // 2. Load users & session
    const savedUsers = localStorage.getItem('campustrade_users_list_v2');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(defaultPresetUsers);
      localStorage.setItem('campustrade_users_list_v2', JSON.stringify(defaultPresetUsers));
    }

    const savedSession = localStorage.getItem('campustrade_session_v3');
    if (savedSession) {
      setCurrentUser(JSON.parse(savedSession));
    }

    // 3. Load marketplace content
    const savedProducts = localStorage.getItem('campustrade_products_v2');
    const savedOrders = localStorage.getItem('campustrade_orders_v2');
    const savedMessages = localStorage.getItem('campustrade_messages_v2');
    const savedPosts = localStorage.getItem('campustrade_posts_v2');
    const savedSeeking = localStorage.getItem('campustrade_seeking_v2');
    const savedTickets = localStorage.getItem('campustrade_tickets_v2');
    const savedAnnouncements = localStorage.getItem('campustrade_announcements_v2');
    const savedCoupons = localStorage.getItem('campustrade_coupons_v2');

    if (savedProducts) setProducts(JSON.parse(savedProducts)); else setProducts(initialProducts);
    if (savedOrders) setOrders(JSON.parse(savedOrders)); else setOrders(initialOrders);
    if (savedMessages) setMessages(JSON.parse(savedMessages)); else setMessages(initialChats);
    if (savedPosts) setPosts(JSON.parse(savedPosts)); else setPosts(initialPosts);
    if (savedSeeking) setSeekingList(JSON.parse(savedSeeking)); else setSeekingList(initialSeeking);
    if (savedTickets) setTickets(JSON.parse(savedTickets)); else setTickets(initialTickets);
    if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements)); else setAnnouncements(initialAnnouncements);
    if (savedCoupons) setCoupons(JSON.parse(savedCoupons)); else setCoupons(initialCoupons);
  }, []);

  // Sync favorites & history when user logs in or out
  useEffect(() => {
    if (currentUser && products.length > 0) {
      const favKey = `campustrade_favs_v3_${currentUser.username}`;
      const histKey = `campustrade_history_v3_${currentUser.username}`;
      const savedFavs = localStorage.getItem(favKey);
      const savedHist = localStorage.getItem(histKey);
      
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      } else {
        // Default bookmarks from products
        const defaultFavs = products.slice(0, 2).map(p => p.id);
        setFavorites(defaultFavs);
        localStorage.setItem(favKey, JSON.stringify(defaultFavs));
      }
      
      if (savedHist) {
        setBrowsingHistory(JSON.parse(savedHist));
      } else {
        // Default history from products
        const defaultHist = products.slice(0, Math.min(3, products.length)).map(p => p.id);
        setBrowsingHistory(defaultHist);
        localStorage.setItem(histKey, JSON.stringify(defaultHist));
      }
    } else {
      setFavorites([]);
      setBrowsingHistory([]);
    }
  }, [currentUser, products.length]);

  const handleToggleFavorite = (prodId: string) => {
    if (!currentUser) {
      alert('请先登录你的教务账号进行操作！');
      return;
    }
    const favKey = `campustrade_favs_v3_${currentUser.username}`;
    let updated: string[];
    const beforeFav = favorites.includes(prodId);
    if (beforeFav) {
      updated = favorites.filter(id => id !== prodId);
      triggerToast('💔 已将该宝贝从我的收藏夹移除。');
    } else {
      updated = [prodId, ...favorites];
      triggerToast('⭐ 收藏成功！此降价好物已加入您的足迹通知区。');
    }
    setFavorites(updated);
    localStorage.setItem(favKey, JSON.stringify(updated));

    // Dynamic state update for total fav counts in master products table
    const updatedProducts = products.map(p => {
      if (p.id === prodId) {
        return {
          ...p,
          countFav: beforeFav ? Math.max(0, p.countFav - 1) : p.countFav + 1
        };
      }
      return p;
    });
    saveAllToStorage(updatedProducts, orders, messages, posts, seekingList, tickets);
  };

  const handleAddBrowsingHistory = (prodId: string) => {
    if (!currentUser) return;
    const histKey = `campustrade_history_v3_${currentUser.username}`;
    
    const cleaned = browsingHistory.filter(id => id !== prodId);
    const updated = [prodId, ...cleaned].slice(0, 30); // Max 30 limit
    
    setBrowsingHistory(updated);
    localStorage.setItem(histKey, JSON.stringify(updated));

    // Increment click counts of this item Real-time
    const updatedProducts = products.map(p => {
      if (p.id === prodId) {
        return { ...p, views: p.views + 1 };
      }
      return p;
    });
    saveAllToStorage(updatedProducts, orders, messages, posts, seekingList, tickets);
  };

  const handleClearBrowsingHistory = () => {
    if (!currentUser) return;
    const histKey = `campustrade_history_v3_${currentUser.username}`;
    setBrowsingHistory([]);
    localStorage.setItem(histKey, JSON.stringify([]));
    triggerToast('🗑️ 足迹历史已被全部清空。');
  };

  const handleAddAnnouncement = (newAnn: Announcement) => {
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('campustrade_announcements_v2', JSON.stringify(updated));
    triggerToast('📢 新平台公告成功发布！全校可见。');
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem('campustrade_announcements_v2', JSON.stringify(updated));
    triggerToast('🗑️ 平台公告已被撤下。');
  };

  const handleAddCoupon = (newCoup: Coupon) => {
    const updated = [newCoup, ...coupons];
    setCoupons(updated);
    localStorage.setItem('campustrade_coupons_v2', JSON.stringify(updated));
    triggerToast(`🎫 成功给 ${newCoup.targetUser} 派发优惠券：【${newCoup.title}】！`);
  };

  const handleDeleteCoupon = (id: string) => {
    const updated = coupons.filter(c => c.id !== id);
    setCoupons(updated);
    localStorage.setItem('campustrade_coupons_v2', JSON.stringify(updated));
    triggerToast('🗑️ 优惠券已被注销。');
  };

  const saveAllToStorage = (
    uProds: Product[], 
    uOrds: Order[], 
    uMsgs: ChatMessage[], 
    uPosts: CommunityPost[], 
    uSeeks: SeekingDemand[], 
    uTicks: ModerationTicket[]
  ) => {
    setProducts(uProds);
    setOrders(uOrds);
    setMessages(uMsgs);
    setPosts(uPosts);
    setSeekingList(uSeeks);
    setTickets(uTicks);

    localStorage.setItem('campustrade_products_v2', JSON.stringify(uProds));
    localStorage.setItem('campustrade_orders_v2', JSON.stringify(uOrds));
    localStorage.setItem('campustrade_messages_v2', JSON.stringify(uMsgs));
    localStorage.setItem('campustrade_posts_v2', JSON.stringify(uPosts));
    localStorage.setItem('campustrade_seeking_v2', JSON.stringify(uSeeks));
    localStorage.setItem('campustrade_tickets_v2', JSON.stringify(uTicks));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Login handler
  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      alert('请先输入认证名称！');
      return;
    }

    const matched = users.find(u => u.username === loginUsername.trim());
    if (!matched) {
      alert(`⚠️ 校验未通过：未在校本系统查询到此认证学生。建议点击下方「切换注册」开启一个免预检学生。`);
      return;
    }

    if (matched.password !== loginPassword) {
      alert('⚠️ 密码错误。默认密码为 123456');
      return;
    }

    if (loginRole === 'admin' && matched.role !== 'admin') {
      alert('⚠️ 该身份注册为普通学生校友，无法以系统管理员安全身份登录。');
      return;
    }

    const sessionAccount: UserAccount = {
      username: matched.username,
      role: matched.role,
      campus: matched.campus,
      dorm: matched.dorm,
      major: matched.major,
      studentId: matched.studentId
    };

    setCurrentUser(sessionAccount);
    localStorage.setItem('campustrade_session_v3', JSON.stringify(sessionAccount));
    setLoginPassword('');
    
    // Autoroute based on identity
    if (matched.role === 'admin') {
      setActiveTab('admin');
      triggerToast(`🔑 欢迎管理员 ${matched.username}！系统已开启风控及大盘巡逻管理权限。`);
    } else {
      setActiveTab('marketplace');
      triggerToast(`🎓 成功挂载教务：${matched.username} 同学，欢迎进入中苑自提中心！`);
    }
  };

  // Register handler
  const handleUserRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim()) {
      alert('请输入学生姓名或花名！');
      return;
    }

    const alreadyExists = users.some(u => u.username === regUsername.trim());
    if (alreadyExists) {
      alert('该身份已登记了教务号。请直接回到登录页登录！');
      return;
    }

    const newAcct: UserAccount & { password?: string } = {
      username: regUsername.trim(),
      password: regPassword || '123456',
      role: 'user',
      campus: regCampus,
      dorm: regDorm || '中苑2号楼204',
      major: regMajor || '软件工程学院',
      studentId: regStudentId || `202309${Math.floor(1000 + Math.random() * 9000)}`
    };

    const updatedUsers = [...users, newAcct];
    setUsers(updatedUsers);
    localStorage.setItem('campustrade_users_list_v2', JSON.stringify(updatedUsers));

    // Sign in immediately on register
    setCurrentUser(newAcct);
    localStorage.setItem('campustrade_session_v3', JSON.stringify(newAcct));

    // Reset register states
    setRegUsername('');
    setRegPassword('');
    setRegDorm('');
    setRegMajor('');
    setRegStudentId('');
    setActiveTab('marketplace');
    triggerToast(`✨ 注册并登录完成！教务授权已经分配给 ${newAcct.username}，默认自订默认物理寝室：${newAcct.dorm}。`);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('campustrade_session_v3');
    triggerToast('🚪 离开结算中心：您已彻底登出该会话，所有订单资金保证仍处于平台隔离中。');
  };

  // Delete / Unregister Account handler
  const handleDeleteAccount = () => {
    if (!currentUser) return;
    if (window.confirm(`⚠️ 确定要注销并删除当前账号【${currentUser.username}】及名下交易数据吗？\n注销后，您登记的教务卡、名下挂牌的商品、求购通告将被永久抹去。`)) {
      
      // Filter out of register database
      const updatedUsers = users.filter(u => u.username !== currentUser.username);
      setUsers(updatedUsers);
      localStorage.setItem('campustrade_users_list_v2', JSON.stringify(updatedUsers));

      // Filter out of listed products
      const updatedProducts = products.filter(p => p.sellerName !== currentUser.username);
      setProducts(updatedProducts);
      saveAllToStorage(updatedProducts, orders, messages, posts, seekingList, tickets);

      setCurrentUser(null);
      localStorage.removeItem('campustrade_session_v3');
      triggerToast(`🗑️ 账号【${currentUser.username}】教务授权已被彻底注销销毁。`);
    }
  };

  // 🛍️ 1. 新增/发布商品回调
  const handleAddNewProduct = (p: Product) => {
    const updated = [p, ...products];
    saveAllToStorage(updated, orders, messages, posts, seekingList, tickets);
    triggerToast(`🎉 成功上架：【${p.title}】，已完成自动扫描并接入全校集市推广！`);
  };

  // 🛍️ 2. 删除或下线自己发布的闲置
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('您确定要下架并永久删除该自用闲置货物吗？该操作不可逆。')) {
      const updated = products.filter(p => p.id !== id);
      saveAllToStorage(updated, orders, messages, posts, seekingList, tickets);
      triggerToast('🗑️ 商品已下架归档。');
    }
  };

  // 🛍️ 3. 从特定货源卡点击「联系卖家」跳转
  const handleSelectProductForChat = (p: Product) => {
    setSelectedProductToLink(p);
    setActiveTab('chat');
    triggerToast(`💬 已为您关联商品 【${p.title}】，输入消息一键推发到聊天会话。`);
  };

  // 🛍️ 4. 平台担保支付锁定订购
  const handleBuyProduct = (p: Product, memo: string, address: string, couponId?: string) => {
    if (!currentUser) return;
    
    const isAlreadyBought = orders.some(o => o.productId === p.id && o.status === '已代付托管');
    if (isAlreadyBought) {
      alert('本宝贝处于其他人出价锁定、担保支付阶段，无法二次代付托管。');
      return;
    }

    // Process coupon if applied
    let discount = 0;
    let couponCode = '';
    if (couponId) {
      const updatedCoupons = coupons.map(c => {
        if (c.id === couponId) {
          discount = c.discountAmount;
          couponCode = c.code;
          return { ...c, isUsed: true };
        }
        return c;
      });
      setCoupons(updatedCoupons);
      localStorage.setItem('campustrade_coupons_v2', JSON.stringify(updatedCoupons));
    }

    const currentPrice = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price;
    const finalPrice = Math.max(0, currentPrice - discount);

    // Generate random 4-char security verification code
    const vCode = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder: Order = {
      id: `ord-${Date.now().toString().substring(8)}`,
      productId: p.id,
      productTitle: p.title,
      productPrice: finalPrice,
      productCategory: p.category,
      productImageUrl: p.imageUrl,
      sellerName: p.sellerName,
      buyerName: currentUser.username, // Synchronize logged-in user
      status: '已代付托管',
      timeline: {
        billedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      dormitoryAddress: address || currentUser.dorm || '默认宿舍自提楼层',
      buyerMemo: memo,
      verificationCode: vCode,
      couponDiscount: discount > 0 ? discount : undefined,
      couponCode: couponCode || undefined
    };

    const updatedOrders = [newOrder, ...orders];
    // Keep products, but can flag it
    saveAllToStorage(products, updatedOrders, messages, posts, seekingList, tickets);
    setActiveTab('orders'); // Jump to orders timeline center
    triggerToast(
      discount > 0 
        ? `💰 担保已付托管 ¥${finalPrice}（已享受优惠代金券¥${discount}减除）！请查账并面交核销。`
        : `💰 担保支付已收到托管 ¥${finalPrice}！请在右侧查账，并约定地方见面面交扫码核销。`
    );
  };

  // 📦 5. 见面提货，放款扫码核销完成
  const handleCompleteOrder = (orderId: string) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: '已完成' as const,
          timeline: {
            ...ord.timeline,
            inspectedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
        };
      }
      return ord;
    });
    saveAllToStorage(products, updated, messages, posts, seekingList, tickets);
    triggerToast('🤝 交易圆满核销放款成功！资金已划入卖家钱包。');
  };

  // 📦 6. 买卖或退货阻挠一键退订
  const handleCancelOrder = (orderId: string, reason: string, requestBy: 'buyer' | 'seller') => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: '已关闭' as const,
          cancellationReason: reason,
          cancellationRequestBy: requestBy,
          timeline: {
            ...ord.timeline,
            closedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
        };
      }
      return ord;
    });
    saveAllToStorage(products, updated, messages, posts, seekingList, tickets);
    triggerToast('💸 订单已退款并原路退回本金解冻账户！');
  };

  // 📦 7. 催促发货/更改备注
  const handleUrgeOrder = (orderId: string, alertText: string) => {
    // Add warning/im record for this
    const newIm: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatWith: '潘茜茜', // Default active session
      sender: '系统风控通知',
      text: alertText,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    const updatedMsgs = [...messages, newIm];
    saveAllToStorage(products, orders, updatedMsgs, posts, seekingList, tickets);
    triggerToast('🔔 催单并锁定提货密令已下发极速短信和对端 IM 提醒！');
  };

  // 🔊 8. 发布求购帖子
  const handleAddSeeking = (seek: SeekingDemand) => {
    const updated = [seek, ...seekingList];
    saveAllToStorage(products, orders, messages, posts, updated, tickets);
    triggerToast('📢 大喇叭已挂在主板。全校寻货校友将实时呼唤！');
  };

  // 📢 9. 分享日常圈话题
  const handleAddPost = (p: CommunityPost) => {
    const updated = [p, ...posts];
    saveAllToStorage(products, orders, messages, posts, seekingList, tickets);
    triggerToast('🌸 校园闲置安利已发布至圈子！');
  };

  // 💬 10. IM即时发送消息
  const handleSendMessage = (receiver: string, text: string, linkedProd?: Product) => {
    const senderName = currentUser ? currentUser.username : '我 (当前学生)';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatWith: receiver,
      sender: senderName,
      text: text,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      linkedProduct: linkedProd
    };

    const updated = [...messages, newMsg];
    saveAllToStorage(products, orders, updated, posts, seekingList, tickets);
  };

  // 📊 11. 敏感词违规工单追加/封停
  const handleAddTicket = (tick: ModerationTicket) => {
    const updated = [tick, ...tickets];
    saveAllToStorage(products, orders, messages, posts, seekingList, updated);
  };

  // 📊 12. 后台解封、驳回申诉或强制执封违规人
  const handleTickDismiss = (id: string, action: 'block' | 'dismiss') => {
    const updated = tickets.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: (action === 'block' ? '已核实处置' : '已关闭驳回') as any
        };
      }
      return t;
    });
    saveAllToStorage(products, orders, messages, posts, seekingList, updated);
    triggerToast(action === 'block' ? '🚫 处置完成：已封禁违规人及相关账期权限！' : '✅ 已关闭并记录本次工单。');
  };

  // 一键还原大盘数据
  const handleResetRestoreData = () => {
    if (window.confirm('您确定要还原所有初始数据吗？自主注册的用户、挂牌商品及账単将被格式化。')) {
      saveAllToStorage(initialProducts, initialOrders, initialChats, initialPosts, initialSeeking, initialTickets);
      setUsers(defaultPresetUsers);
      localStorage.setItem('campustrade_users_list_v2', JSON.stringify(defaultPresetUsers));
      setCurrentUser(null);
      localStorage.removeItem('campustrade_session_v3');
      triggerToast('♻️ 校园二手数据库及系统注册用户已整盘还原！');
    }
  };

  // Render Login page if not signed in
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex flex-col font-sans select-none antialiased relative bg-[#f1f5f9] dark:bg-[#0a0f1d] pb-20`}>
        <div className="ambient-bg"></div>

        {/* Floating Top Header on Login Page */}
        <div className="w-full max-w-7xl mx-auto px-4 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500 rounded-lg text-white font-bold text-xs">🎓</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">校淘淘 · 校园内网端</span>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 text-[11px] font-bold cursor-pointer hover:bg-white/90 shadow transition flex items-center gap-1.5"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{isDarkMode ? '深色：开启浅色' : '浅色：开启深色'}</span>
          </button>
        </div>

        {/* Main form center */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-xl w-full glass-panel rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Ambient indicator */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl text-white shadow-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">
                校淘淘 · 校园二手担保交易结算中心
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ⭐ 资金在先锁定托管 • 当面真机测绘防骗 • 见面无误扫码放款
              </p>
            </div>

            {/* Selector: Member vs Admin */}
            {loginTab === 'login' && (
              <div className="flex bg-slate-200/50 dark:bg-black/20 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLoginRole('user')}
                  className={`flex-1 py-1.5 text-center text-xs font-extrabold rounded-lg transition cursor-pointer ${
                    loginRole === 'user' 
                      ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white' 
                      : 'text-slate-400'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 inline mr-1" />
                  普通在校学生登录
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole('admin')}
                  className={`flex-1 py-1.5 text-center text-xs font-extrabold rounded-lg transition cursor-pointer ${
                    loginRole === 'admin' 
                      ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white' 
                      : 'text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                  系统监管员 (后管)
                </button>
              </div>
            )}

            {loginTab === 'login' ? (
              // 1. ===== LOGIN FORM =====
              <form onSubmit={handleUserLoginSubmit} className="space-y-4">
                
                <div className="space-y-1.5 text-xs text-left">
                  <label className="text-slate-600 dark:text-slate-300 font-bold">学生姓名 / 账号名</label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="请输入你的姓名 (如: 潘茜茜)"
                    className="w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 text-xs text-left">
                  <label className="text-slate-600 dark:text-slate-300 font-bold">教务预设密匙 (Password)</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="默认配置密码 123456"
                    className="w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Preset Speed Quick Login shortcuts */}
                <div className="bg-slate-200/30 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 p-3 rounded-2xl space-y-2 text-xs">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block text-left">
                    🔑 快捷通道：一键免密预填在校学生及管理卡
                  </span>
                  
                  <div className="flex flex-wrap gap-1.5 justify-start">
                    {defaultPresetUsers
                      .filter(u => loginRole === 'admin' ? u.role === 'admin' : u.role === 'user')
                      .map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setLoginUsername(preset.username);
                            setLoginPassword(preset.password || '123456');
                          }}
                          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-400/20 px-2.5 py-1.2 rounded-lg cursor-pointer text-[10px] font-bold"
                        >
                          👤 {preset.username}
                        </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-tr from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  签署教务协议并进入中苑面交区
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setLoginTab('register')}
                    className="text-indigo-500 dark:text-indigo-400 text-xs font-bold hover:underline cursor-pointer"
                  >
                    🌱 还没有入库？切换到学生免费登记注册账号 &rarr;
                  </button>
                </div>

              </form>
            ) : (
              // 2. ===== REGISTER FORM =====
              <form onSubmit={handleUserRegisterSubmit} className="space-y-4 text-xs text-left">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-bold">新登记学生真实姓名</label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="如: 陈志超"
                      className="w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-bold">自设登录密码 (留空则123456)</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="初始 123456"
                      className="w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-bold">常驻校区</label>
                    <select
                      value={regCampus}
                      onChange={(e) => setRegCampus(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2"
                    >
                      <option value="南校区(主校区)">南校区(主校区)</option>
                      <option value="北校区(工学部)">北校区(工学部)</option>
                      <option value="本部东校区">本部东校区</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-bold">常驻物理自提宿舍楼</label>
                    <input
                      type="text"
                      required
                      value={regDorm}
                      onChange={(e) => setRegDorm(e.target.value)}
                      placeholder="例如: 榕园4号楼302室"
                      className="w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-bold">院系专业</label>
                    <input
                      type="text"
                      value={regMajor}
                      onChange={(e) => setRegMajor(e.target.value)}
                      placeholder="如: 文学院 / 软件工程"
                      className="w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-bold">教务校内卡ID号 (选填)</label>
                    <input
                      type="text"
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      placeholder="随机教务卡匹配"
                      className="w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-tr from-indigo-500 to-pink-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                >
                  登记教务系统并同步自动登录
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setLoginTab('login')}
                    className="text-slate-500 dark:text-slate-400 font-semibold hover:underline cursor-pointer"
                  >
                    &larr; 已有登记卡？返回姓名登录
                  </button>
                </div>

              </form>
            )}

            {/* Alert info banner */}
            <div className="bg-slate-200/40 dark:bg-white/2 p-3 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed text-left">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong>系统安全性守则：</strong> 本测试站默认支持普通密码 123456 预检，在非正式教务生产环境无需使用校园一卡通，注册并登录后所进行的订单交易都将自动缓存于你当前浏览器的 LocalStorage 中。
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- LOGGED IN COMPONENT LAYOUT ---
  return (
    <div className={`min-h-screen flex flex-col font-sans select-none antialiased relative pb-10 ${isDarkMode ? 'dark text-[#e2e8f0]' : 'text-[#1e293b]'}`}>
      <div className="ambient-bg"></div>

      {/* Global alert notifications */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/8 via-purple-500/2 to-transparent pointer-events-none select-none z-0"></div>
      
      {/* 1. 顶部全局导航头架 */}
      <header className="border-b border-slate-200 dark:border-white/5 sticky top-0 bg-white/80 dark:bg-[#0a0f1d]/90 backdrop-blur-md relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* 标徽 LOGO */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-lg shadow-indigo-500/10">
              <ShoppingBag className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="font-sans font-black text-slate-900 dark:text-white text-base leading-none tracking-tight">
                  校淘淘 · 校园闲置低价担保交易系统
                </h1>
                <span className="text-[10px] font-extrabold bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-full leading-none">
                  教务联动端
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-200 px-1.5 py-0.5 rounded-full leading-none shrink-0 m-0.5">
                  资金双向托管
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                自提自提面交：中苑自提点 • 榕园自提中心 • 验货付款核销
              </p>
            </div>
          </div>

          {/* Right Header Panel (User Session Info, Theme Toggler, Clear db) */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5 shrink-0 text-xs">
            
            {/* Student session profile card */}
            <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-white/5 border border-slate-300/40 dark:border-white/5 px-3 py-1.5 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-[10px] uppercase select-none">
                {currentUser.username[0]}
              </div>
              <div className="text-left">
                <span className="font-black text-slate-800 dark:text-slate-200">{currentUser.username}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-400 block -mt-0.5">
                  {currentUser.role === 'admin' ? '🛡️ 系统安全主管' : `🎓 ${currentUser.campus}`}
                </span>
              </div>
            </div>

            {/* Light / Dark Mode system toggle button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-slate-200/50 dark:bg-white/5 border border-slate-300/40 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-300/50 hover:dark:bg-white/10 transition"
              title="切换浅色模式 / 深色模式"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.8 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
              title="退出登录"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">退出登录</span>
            </button>

            {/* Reset dynamic db */}
            <button
              onClick={handleResetRestoreData}
              className="px-2.5 py-1.8 bg-slate-200/50 dark:bg-white/5 border border-slate-300/40 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
              title="一键将整盘二手交易商品重置归零"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </header>

      {/* 2. 交互式快捷通知Toast泡 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white/95 dark:bg-[#0e1628]/95 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-lg flex items-start gap-3.5 text-xs text-indigo-700 dark:text-indigo-200 motion-preset-slide-up">
          <Bell className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1 text-left">
            <strong className="font-bold text-slate-900 dark:text-white block">全校即时通知联播：</strong>
            <p className="leading-relaxed text-[11px]">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* 2.5 视图分类切换大标签区 */}
      <nav className="border-b border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-[#080d19]/60 backdrop-blur-md sticky top-[69px] sm:top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex gap-1.5 -mb-px w-full sm:w-auto overflow-x-auto py-1.5 justify-around sm:justify-start">
            
            {/* 闲置集市 */}
            <button
              onClick={() => { setActiveTab('marketplace'); setActiveSearchQuery(''); }}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300 bg-white/5 dark:bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-100 hover:bg-white/3'
              }`}
            >
              🛍️ 闲置集市
            </button>

            {/* 避坑社区与大喇叭 */}
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer ${
                activeTab === 'community'
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300 bg-white/5 dark:bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-100 hover:bg-white/3'
              }`}
            >
              📢 求购生活区
            </button>

            {/* 即时担保沟通 */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer relative ${
                activeTab === 'chat'
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300 bg-white/5 dark:bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-100 hover:bg-white/3'
              }`}
            >
              💬 担保私聊
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
            </button>

            {/* 担保结算与时间轴 */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300 bg-white/5 dark:bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-100 hover:bg-white/3'
              }`}
            >
              📦 账本订单录 ({orders.filter(o => o.status === '已代付托管' || o.status === '预约交付中').length} 条保驾)
            </button>

            {/* 数据统计与AI巡航安全网 (Only system admins get to see this) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer ${
                  activeTab === 'admin'
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300 bg-white/5 dark:bg-white/5 font-extrabold shadow-sm'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-850 hover:dark:text-slate-100 hover:bg-white/3'
                }`}
              >
                📊 风控后台与系统大盘
              </button>
            )}

            {/* 学生认证 */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300 bg-white/5 dark:bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-100 hover:bg-white/3'
              }`}
            >
              👤 认证工具箱
            </button>

          </div>

        </div>
      </nav>

      {/* 3. 动态视图面板路由 */}
      <main className="relative z-10 flex-1">
        {activeTab === 'marketplace' && (
          <Marketplace
            currentUser={currentUser}
            products={products}
            onAddProduct={handleAddNewProduct}
            onSelectProductForChat={handleSelectProductForChat}
            onBuyProduct={handleBuyProduct}
            activeSearchQuery={activeSearchQuery}
            setActiveSearchQuery={setActiveSearchQuery}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddBrowsingHistory={handleAddBrowsingHistory}
            announcements={announcements}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            coupons={coupons}
          />
        )}

        {activeTab === 'community' && (
          <Community
            posts={posts}
            seekingList={seekingList}
            onAddPost={handleAddPost}
            onAddSeeking={handleAddSeeking}
          />
        )}

        {activeTab === 'chat' && (
          <ChatWorkspace
            messages={messages}
            products={products}
            onSendMessage={handleSendMessage}
            selectedProductToLink={selectedProductToLink}
            onClearLinkedProduct={() => setSelectedProductToLink(null)}
          />
        )}

        {activeTab === 'orders' && (
          <OrderCenter
            orders={orders}
            onCompleteOrder={handleCompleteOrder}
            onCancelOrder={handleCancelOrder}
            onUrgeOrder={handleUrgeOrder}
          />
        )}

        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <AdminPanel
            tickets={tickets}
            onTickDismiss={handleTickDismiss}
            onAddTicket={handleAddTicket}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            coupons={coupons}
            onAddCoupon={handleAddCoupon}
            onDeleteCoupon={handleDeleteCoupon}
            users={users}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileCenter
            products={products}
            onDeleteProduct={handleDeleteProduct}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
            currentUser={currentUser}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            browsingHistory={browsingHistory}
            onClearBrowsingHistory={handleClearBrowsingHistory}
            coupons={coupons}
          />
        )}
      </main>

    </div>
  );
}
