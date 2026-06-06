import React, { useState, useEffect } from 'react';
import { initialProducts, initialOrders, initialChats, initialPosts, initialSeeking, initialTickets } from './data';
import { Product, Order, ChatMessage, CommunityPost, SeekingDemand, ModerationTicket } from './types';
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
  BookOpen
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [seekingList, setSeekingList] = useState<SeekingDemand[]>([]);
  const [tickets, setTickets] = useState<ModerationTicket[]>([]);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'marketplace' | 'community' | 'chat' | 'orders' | 'admin' | 'profile'>('marketplace');
  // Global search input
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  // Linked product in chat session (req-44)
  const [selectedProductToLink, setSelectedProductToLink] = useState<Product | null>(null);
  
  // Custom alert bubble notifications for user interactions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load and read standard local storage persistent items
  useEffect(() => {
    const savedProducts = localStorage.getItem('campustrade_products_v2');
    const savedOrders = localStorage.getItem('campustrade_orders_v2');
    const savedMessages = localStorage.getItem('campustrade_messages_v2');
    const savedPosts = localStorage.getItem('campustrade_posts_v2');
    const savedSeeking = localStorage.getItem('campustrade_seeking_v2');
    const savedTickets = localStorage.getItem('campustrade_tickets_v2');

    if (savedProducts) setProducts(JSON.parse(savedProducts)); else setProducts(initialProducts);
    if (savedOrders) setOrders(JSON.parse(savedOrders)); else setOrders(initialOrders);
    if (savedMessages) setMessages(JSON.parse(savedMessages)); else setMessages(initialChats);
    if (savedPosts) setPosts(JSON.parse(savedPosts)); else setPosts(initialPosts);
    if (savedSeeking) setSeekingList(JSON.parse(savedSeeking)); else setSeekingList(initialSeeking);
    if (savedTickets) setTickets(JSON.parse(savedTickets)); else setTickets(initialTickets);
  }, []);

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

  // 🛍️ 1. 新增/发布商品回调 (req-64, req-67)
  const handleAddNewProduct = (p: Product) => {
    const updated = [p, ...products];
    saveAllToStorage(updated, orders, messages, posts, seekingList, tickets);
    triggerToast(`🎉 成功上架：【${p.title}】，已完成自动扫描并接入全校集市推广！`);
  };

  // 🛍️ 2. 删除或下线自己发布的闲置 (req-66)
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('您确定要下架并永久删除该自用闲置货物吗？该操作不可逆。')) {
      const updated = products.filter(p => p.id !== id);
      saveAllToStorage(updated, orders, messages, posts, seekingList, tickets);
      triggerToast('🗑️ 商品已下架归档。');
    }
  };

  // 🛍️ 3. 从特定货源卡点击「联系卖家」跳转 (req-44)
  const handleSelectProductForChat = (p: Product) => {
    setSelectedProductToLink(p);
    setActiveTab('chat');
    triggerToast(`💬 已为您关联商品 【${p.title}】，输入消息一键推发到聊天会话。`);
  };

  // 🛍️ 4. 平台担保支付锁定订购 (req-68, req-43)
  const handleBuyProduct = (p: Product, memo: string, address: string) => {
    const isAlreadyBought = orders.some(o => o.productId === p.id && o.status === '已代付托管');
    if (isAlreadyBought) {
      alert('本宝贝处于其他人出价锁定、担保支付阶段，无法二次代付托管。');
      return;
    }

    // Generate random 4-char security verification code
    const vCode = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder: Order = {
      id: `ord-${Date.now().toString().substring(8)}`,
      productId: p.id,
      productTitle: p.title,
      productPrice: p.price,
      productCategory: p.category,
      productImageUrl: p.imageUrl,
      sellerName: p.sellerName,
      buyerName: '我 (当前学生)',
      status: '已代付托管',
      timeline: {
        billedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      dormitoryAddress: address || '默认宿舍提货区',
      buyerMemo: memo,
      verificationCode: vCode
    };

    const updatedOrders = [newOrder, ...orders];
    // Keep products, but can flag it
    saveAllToStorage(products, updatedOrders, messages, posts, seekingList, tickets);
    setActiveTab('orders'); // Jump to orders timeline center
    triggerToast(`💰 担保支付已收到托管 ¥${p.price}！请在右侧查账，并约定地方见面面交扫码核销。`);
  };

  // 📦 5. 见面提货，放款扫码核销完成 (req-43, req-68)
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

  // 📦 6. 买卖或退货阻挠一键退订 (req-71, req-76, req-80)
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

  // 📦 7. 催促发货/更改备注 (req-42)
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

  // 🔊 8. 发布求购帖子 (req-23)
  const handleAddSeeking = (seek: SeekingDemand) => {
    const updated = [seek, ...seekingList];
    saveAllToStorage(products, orders, messages, posts, updated, tickets);
    triggerToast('📢 大喇叭已挂在主板。全校寻货校友将实时呼唤！');
  };

  // 📢 9. 分享日常圈话题 (req-25)
  const handleAddPost = (p: CommunityPost) => {
    const updated = [p, ...posts];
    saveAllToStorage(products, orders, messages, posts, seekingList, tickets);
    triggerToast('🌸 校园闲置安利已发布至圈子！');
  };

  // 💬 10. IM即时发送消息 (req-44, req-37)
  const handleSendMessage = (receiver: string, text: string, linkedProd?: Product) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatWith: receiver,
      sender: '我 (当前学生)',
      text: text,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      linkedProduct: linkedProd
    };

    const updated = [...messages, newMsg];
    saveAllToStorage(products, orders, updated, posts, seekingList, tickets);
  };

  // 📊 11. 敏感词违规工单追加/封停 (req-59)
  const handleAddTicket = (tick: ModerationTicket) => {
    const updated = [tick, ...tickets];
    saveAllToStorage(products, orders, messages, posts, seekingList, updated);
  };

  // 📊 12. 后台解封、驳回申诉或强制执封违规人 (req-59)
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

  // 一键还原截图初始经典数据 (快速排雷重置)
  const handleResetRestoreData = () => {
    if (window.confirm('您确定要还原所有初始高保真校园交易数据吗？所有自主新增的商品和帖子将会格式化返回出厂设置。')) {
      saveAllToStorage(initialProducts, initialOrders, initialChats, initialPosts, initialSeeking, initialTickets);
      localStorage.clear();
      triggerToast('♻️ 校园二手数据库已整盘还原！');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none antialiased text-slate-100 relative bg-[#0a0f1d] pb-10">
      
      {/* 视觉环境流动灯效背景 (轻灵高规格) */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/10 via-purple-500/3 to-transparent pointer-events-none select-none z-0"></div>
      
      {/* 1. 顶部全局导航头架 */}
      <header className="border-b border-white/5 sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* 标徽 LOGO */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-lg shadow-indigo-500/10 animate-pulse">
              <ShoppingBag className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="font-sans font-black text-white text-base leading-none tracking-tight">
                  校淘淘 · 校园闲置低价担保交易系统
                </h1>
                <span className="text-[10px] font-extrabold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full leading-none">
                  教务联动版
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded-full leading-none shrink-0 m-0.5">
                  资金双向托管防刷
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                校区面交专属平台：中苑 · 榕园自提核销中心 · 严格防止欺作定金
              </p>
            </div>
          </div>

          {/* 右侧重置和简易大盘统计 */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* 重置数据库 */}
            <button
              onClick={handleResetRestoreData}
              className="px-3 py-1.8 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-300"
              title="一键将整盘二手交易商品重置归零"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>数据整盘还原</span>
            </button>

            {/* 信用评分展示 */}
            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1.8 rounded-xl text-xs font-bold text-indigo-200">
              <Award className="w-4 h-4 text-amber-400" />
              <span>教务授信：100分</span>
            </div>

          </div>

        </div>
      </header>

      {/* 2. 交互式快捷通知Toast泡 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#0e1628]/95 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-lg flex items-start gap-3.5 text-xs text-indigo-200 motion-preset-slide-up">
          <Bell className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <strong className="font-bold text-white block">全校即时通知联播：</strong>
            <p className="leading-relaxed">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* 2.5 视图分类切换大标签区 */}
      <nav className="border-b border-white/5 bg-[#080d19]/60 backdrop-blur-md sticky top-[69px] sm:top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex gap-1.5 -mb-px w-full sm:w-auto overflow-x-auto py-1.5 justify-around sm:justify-start">
            
            {/* 闲置集市 */}
            <button
              onClick={() => { setActiveTab('marketplace'); setActiveSearchQuery(''); }}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'border-indigo-400 text-indigo-300 bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/3'
              }`}
            >
              🛍️ 闲置集市
            </button>

            {/* 避坑社区与大喇叭 */}
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer ${
                activeTab === 'community'
                  ? 'border-indigo-400 text-indigo-300 bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/3'
              }`}
            >
              📢 求购生活区
            </button>

            {/* 即时担保沟通 */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer relative ${
                activeTab === 'chat'
                  ? 'border-indigo-400 text-indigo-300 bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/3'
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
                  ? 'border-indigo-400 text-indigo-300 bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/3'
              }`}
            >
              📦 账本订单录 ({orders.filter(o => o.status === '已代付托管' || o.status === '预约交付中').length} 条保驾)
            </button>

            {/* 数据统计与AI巡航屏蔽 */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer ${
                activeTab === 'admin'
                  ? 'border-indigo-400 text-indigo-300 bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/3'
              }`}
            >
              📊 风控判定与大盘 (后管)
            </button>

            {/* 学生认证 */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-indigo-400 text-indigo-300 bg-white/5 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/3'
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
            products={products}
            onAddProduct={handleAddNewProduct}
            onSelectProductForChat={handleSelectProductForChat}
            onBuyProduct={handleBuyProduct}
            activeSearchQuery={activeSearchQuery}
            setActiveSearchQuery={setActiveSearchQuery}
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

        {activeTab === 'admin' && (
          <AdminPanel
            tickets={tickets}
            onTickDismiss={handleTickDismiss}
            onAddTicket={handleAddTicket}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileCenter
            products={products}
            onDeleteProduct={handleDeleteProduct}
            onLogout={() => {
              alert('您已发起认证注销！教务资产清算审查后将自动删除所有缓存和挂账宝贝。');
            }}
          />
        )}
      </main>

    </div>
  );
}
