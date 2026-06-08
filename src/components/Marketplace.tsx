import React, { useState, useEffect } from 'react';
import { Product, UserAccount, Announcement } from '../types';
import { 
  Search, 
  MapPin, 
  BookOpen, 
  CheckCircle, 
  Tag, 
  Eye, 
  Heart, 
  Plus, 
  Clock, 
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  X,
  MessageSquare,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

interface MarketplaceProps {
  currentUser?: UserAccount | null;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onSelectProductForChat: (product: Product) => void;
  onBuyProduct: (product: Product, memo: string, address: string, couponId?: string) => void;
  activeSearchQuery: string;
  setActiveSearchQuery: (q: string) => void;
  favorites?: string[];
  onToggleFavorite?: (prodId: string) => void;
  onAddBrowsingHistory?: (prodId: string) => void;
  announcements?: Announcement[];
  onDeleteAnnouncement?: (id: string) => void;
  coupons?: any[];
}

// Subcomponent for precise, high-performance visual countdown to prevent parent-level re-renders
export function FlashSaleTimer({ endTime }: { endTime: string }) {
  const [secLeft, setSecLeft] = useState<number>(0);

  useEffect(() => {
    const calculateSeconds = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      return diff > 0 ? Math.floor(diff / 1000) : 0;
    };

    setSecLeft(calculateSeconds());
    const interval = setInterval(() => {
      const left = calculateSeconds();
      setSecLeft(left);
      if (left <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (secLeft <= 0) {
    return <span className="text-slate-500 font-bold dark:text-slate-400">⚡ 特惠已结单</span>;
  }

  const h = Math.floor(secLeft / 3600);
  const m = Math.floor((secLeft % 3600) / 60);
  const s = secLeft % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="font-mono text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-0.5 animate-pulse bg-rose-500/10 px-1.5 py-0.5 rounded">
      ⏳ {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

export default function Marketplace({
  currentUser,
  products,
  onAddProduct,
  onSelectProductForChat,
  onBuyProduct,
  activeSearchQuery,
  setActiveSearchQuery,
  favorites = [],
  onToggleFavorite,
  onAddBrowsingHistory,
  announcements = [],
  onDeleteAnnouncement,
  coupons = []
}: MarketplaceProps) {
  // Category tab state
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  // Filters popup
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedCampus, setSelectedCampus] = useState<string>('全部');
  // Hot Keyword History (req-32)
  const [searchHistory, setSearchHistory] = useState<string[]>(['期末教材', '自行车', '吹风机', 'Master 3S']);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Selected product detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Buy lock confirmation state
  const [isBuying, setIsBuying] = useState(false);
  const [buyerMemo, setBuyerMemo] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('中苑5号楼-302室');
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');

  // Real-time Countdown timer for flash sales (req-50)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Form states for adding new product (req-64, req-67)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOrigPrice, setNewOrigPrice] = useState('');
  const [newCategory, setNewCategory] = useState<'图书教材' | '数码配件' | '省心生活' | '运动休闲' | '其它闲置'>('图书教材');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDorm, setNewDorm] = useState('中苑5号楼');
  const [newTagsString, setNewTagsString] = useState('九成新, 接受自提, 可小刀');
  const [isTextbook, setIsTextbook] = useState(true);
  const [tbSubject, setTbSubject] = useState('');
  const [tbSyllabus, setTbSyllabus] = useState('');
  const [tbNature, setTbNature] = useState('专业必修课');

  // Flash Sale configuration state for uploading products (seller perspective)
  const [isPublishFlashSale, setIsPublishFlashSale] = useState(false);
  const [publishFlashSalePrice, setPublishFlashSalePrice] = useState('');
  const [publishFlashSaleDuration, setPublishFlashSaleDuration] = useState('2');

  const addSearchFootprint = (q: string) => {
    if (!q.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== q);
      return [q, ...filtered].slice(0, 5); // Keep top 5 (req-32)
    });
    setActiveSearchQuery(q);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) {
      alert('请输入商品标题和价格！');
      return;
    }

    const priceNum = parseFloat(newPrice);
    const origPriceNum = parseFloat(newOrigPrice) || priceNum * 2;

    const imgPlaceholders: Record<string, string> = {
      '图书教材': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      '数码配件': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
      '省心生活': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
      '运动休闲': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
      '其它闲置': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80'
    };

    const isFlashSale = isPublishFlashSale;
    const flashSalePrice = isPublishFlashSale ? parseFloat(publishFlashSalePrice) || (priceNum * 0.9) : undefined;
    const flashSaleEndTime = isPublishFlashSale ? new Date(Date.now() + parseFloat(publishFlashSaleDuration) * 60 * 60 * 1000).toISOString() : undefined;

    const added: Product = {
      id: `prod-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      price: priceNum,
      originalPrice: origPriceNum,
      category: newCategory,
      imageUrl: newImageUrl || imgPlaceholders[newCategory] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      sellerName: currentUser ? currentUser.username : '潘茜茜',
      sellerAvatar: currentUser ? currentUser.username[0] : 'P',
      sellerRating: 100,
      campus: currentUser ? currentUser.campus : '南校区(主校区)',
      dormitory: newDorm || (currentUser ? currentUser.dorm : '中苑5号楼302'),
      isVerifiedSeller: true,
      tags: newTagsString.split(',').map(t => t.trim()).filter(Boolean),
      postDate: new Date().toISOString().split('T')[0],
      views: 1,
      countFav: 0,
      textbookInfo: (newCategory === '图书教材' && isTextbook) ? {
        schoolSubject: tbSubject || '未指定科目',
        syllabusVersion: tbSyllabus || '通用编写版',
        courseNature: tbNature
      } : undefined,
      isFlashSale,
      flashSalePrice,
      flashSaleEndTime
    };

    onAddProduct(added);
    setIsPublishing(false);

    // Reset Flash Sale states
    setIsPublishFlashSale(false);
    setPublishFlashSalePrice('');
    setPublishFlashSaleDuration('2');
    
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewPrice('');
    setNewOrigPrice('');
    setTbSubject('');
    setTbSyllabus('');
  };

  // Filter products based on categories, price, search query and tags (req-33, req-34, req-35, req-56)
  const filteredProducts = products.filter(p => {
    const categoryMatches = activeCategory === '全部' || p.category === activeCategory;
    const searchMatches = activeSearchQuery.trim() === '' || 
      p.title.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      (p.textbookInfo && p.textbookInfo.schoolSubject.toLowerCase().includes(activeSearchQuery.toLowerCase()));
    
    // Price filters
    const priceMatches = p.price >= minPrice && p.price <= maxPrice;
    
    // Campus filter
    const campusMatches = selectedCampus === '全部' || p.campus.includes(selectedCampus);

    return categoryMatches && searchMatches && priceMatches && campusMatches;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* ==================== 平台公告栏公告栏 ==================== */}
      {announcements.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl bg-slate-50 dark:bg-white/2 bg-gradient-to-r from-slate-200/20 via-slate-100/5 to-slate-200/20 dark:from-indigo-950/20 dark:via-slate-900/10 dark:to-indigo-950/20 border border-slate-300 dark:border-indigo-500/10 shadow-md space-y-3 relative overflow-hidden text-left">
          {/* Subtle abstract background glow */}
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-slate-300 dark:border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <h3 className="text-xs font-black tracking-widest text-indigo-600 dark:text-[#818cf8] uppercase flex items-center gap-1.5">
                📢 CAMPUSTRADE 校园官方通知公告栏
              </h3>
            </div>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-1.8 py-0.5 rounded font-mono font-bold border border-indigo-500/10">
              共 {announcements.length} 条置顶挂牌
            </span>
          </div>

          <div className="space-y-2.5">
            {announcements.map((ann) => (
              <div 
                key={ann.id} 
                className={`p-3 rounded-xl border transition-all text-xs font-medium ${
                  ann.isUrgent 
                    ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-300 dark:border-rose-500/20 hover:border-rose-400' 
                    : 'bg-white dark:bg-white/1 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                      ann.type === '系统重要防骗安全警示'
                        ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-300/30'
                        : ann.type === '平台功能优化通知'
                        ? 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-300/30'
                        : ann.type === '毕业季甩货专场活动'
                        ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-300/30'
                        : 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-300/30'
                    }`}>
                      {ann.type}
                    </span>
                    <strong className="text-slate-800 dark:text-white font-extrabold text-[12px]">
                      {ann.title}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold shrink-0">
                      ✍️ {ann.publisher} · {ann.publishTime ? ann.publishTime.substring(0, 16) : ''}
                    </span>
                    {currentUser?.role === 'admin' && onDeleteAnnouncement && (
                      <button 
                        onClick={() => {
                          if (confirm('确认要在全校看板撤下/删除此官方公告吗？')) {
                            onDeleteAnnouncement(ann.id);
                          }
                        }}
                        className="text-[9px] bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white dark:text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/20 transition cursor-pointer"
                        title="超级管理员撤销此项公告"
                      >
                        撤销
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 select-text whitespace-pre-wrap pl-1 text-left">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 1. 顶部搜索大总汇 + 热搜关键词 (req-31, req-32) */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <ShoppingBag className="w-48 h-48 text-indigo-400" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-slate-400" />
            </span>
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => setActiveSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addSearchFootprint(activeSearchQuery);
              }}
              placeholder="搜索全校闲置、期末必修课本、高分真题、数码、小电器..."
              className="pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl w-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-400 transition"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition w-full md:w-auto ${
                showFilters 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40' 
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>智能分类筛选</span>
            </button>
            
            <button
              onClick={() => setIsPublishing(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition cursor-pointer w-full md:w-auto whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>快速发布闲置</span>
            </button>
          </div>
        </div>

        {/* 1.5 过滤选择框抽屉 (req-56) */}
        {showFilters && (
          <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-4 motion-preset-expand">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 价格区间 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">自定义价格预算区间 (元)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                    placeholder="最低价格"
                  />
                  <span className="text-slate-400 text-xs">至</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                    placeholder="最高价格"
                  />
                </div>
              </div>

              {/* 物理校区筛选 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">限定物理校区</label>
                <div className="flex flex-wrap gap-1.5">
                  {['全部', '南校区', '北校区', '本部'].map(item => (
                    <button
                      key={item}
                      onClick={() => setSelectedCampus(item)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                        selectedCampus === item 
                          ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200' 
                          : 'bg-white/3 border-white/5 text-slate-400'
                      }`}
                    >
                      {item === '全部' ? '全校通兑' : item}
                    </button>
                  ))}
                </div>
              </div>

              {/* 重置 */}
              <div className="flex items-end justify-end">
                <button
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(1000);
                    setSelectedCampus('全部');
                  }}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-slate-400 text-[11px] font-bold hover:bg-white/5 cursor-pointer transition"
                >
                  重置筛选条件
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 历史记录和热词聚合 (req-31, req-32) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-slate-400 font-semibold shrink-0">🕒 搜索近照：</span>
            {searchHistory.length === 0 ? (
              <span className="text-slate-500 text-[11px]">暂无足迹记录</span>
            ) : (
              searchHistory.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSearchQuery(h)}
                  className="bg-white/4 text-indigo-200 border border-white/5 px-2 py-1 rounded-md text-[11px] hover:text-white cursor-pointer hover:bg-indigo-500/20"
                >
                  {h}
                </button>
              ))
            )}
            {searchHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-rose-400 hover:text-rose-300 text-[10px] font-bold underline shrink-0 ml-1.5 cursor-pointer"
              >
                清空足迹
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-semibold text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              校园热搜：
            </span>
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
              1. 考研高数题
            </span>
            <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
              2. 捷安特山地车
            </span>
            <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold hidden sm:inline">
              3. 美的电饭煲
            </span>
          </div>
        </div>
      </div>

      {/* 2. 优惠倒计时和促销 (req-50) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 限时降价降本看板 (巨幅醒目) */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 text-indigo-500/10 select-none pointer-events-none">
            <Clock className="w-32 h-32" />
          </div>
          <div>
            <span className="bg-amber-500 text-indigo-950 text-[10px] font-extrabold px-2 py-0.8 rounded-full uppercase tracking-wider">
              搬家大促销 COOLDOWN
            </span>
            <h3 className="text-xl font-extrabold text-white mt-2.5 leading-tight">
              限时亏本降价角徽
            </h3>
            <p className="text-slate-300 text-xs mt-1.5">
              毕业甩卖，对收藏玩家实时通告并触发降价红点通知！
            </p>
          </div>

          <div className="my-5 bg-white/5 border border-white/5 backdrop-blur-md rounded-xl p-3 flex items-center justify-around text-center">
            <div>
              <span className="text-xl font-bold font-mono text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">小时</span>
            </div>
            <span className="text-lg font-bold text-slate-500">:</span>
            <div>
              <span className="text-xl font-bold font-mono text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">分钟</span>
            </div>
            <span className="text-lg font-bold text-slate-500">:</span>
            <div>
              <span className="text-xl font-bold font-mono text-rose-400 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">秒</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 border border-white/5 p-2 rounded-xl bg-white/2">
              <img 
                src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=150&q=80" 
                className="w-10 h-10 object-cover rounded-lg" 
                alt="Giant bike" 
              />
              <div className="text-left flex-1 min-w-0">
                <h5 className="text-xs font-bold text-white truncate">捷安特 ATX 660</h5>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-bold text-emerald-400">¥360</span>
                  <span className="text-[10px] line-through text-slate-400">¥420</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 分类切换卡和商品Feed流 */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* 大类快速切换 (req-35) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['全部', '图书教材', '数码配件', '省心生活', '运动休闲', '其它闲置'].map(item => (
              <button
                key={item}
                onClick={() => {
                  setActiveCategory(item);
                  setActiveSearchQuery('');
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 border ${
                  activeCategory === item
                    ? 'bg-indigo-500 border-indigo-400 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {item === '图书教材' ? '📚 图书教材' :
                 item === '数码配件' ? '🔌 数码配件' :
                 item === '省心生活' ? '🍳 省心生活' :
                 item === '运动休闲' ? '🚲 运动休闲' :
                 item === '其它闲置' ? '📦 其它闲置' : '🛍️ 全部宝贝'}
              </button>
            ))}
          </div>

          {/* 商品流卡网络 */}
          {filteredProducts.length === 0 ? (
            <div className="glass-panel text-center py-20 rounded-2xl border border-white/5">
              <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 text-lg">
                ❌
              </div>
              <h4 className="text-base font-bold text-white mt-4">未找到匹配的校内闲置宝贝</h4>
              <p className="text-slate-400 text-xs mt-1.5">
                可以更换搜索词、清除特定价格限制，或者点击发布你自己的闲置！
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedProduct(prod);
                    if (onAddBrowsingHistory) {
                      onAddBrowsingHistory(prod.id);
                    }
                  }}
                  className="glass-panel border-white/8 rounded-2xl p-3.5 hover:border-indigo-500/35 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-md relative"
                >
                  <div className="space-y-2.5">
                    
                    {/* 图片加限时秒秒杀小徽标签 */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-white/5 border border-white/5">
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        referrerPolicy="no-referrer"
                      />

                      {/* Heart bookmark favorite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (onToggleFavorite) onToggleFavorite(prod.id);
                        }}
                        className={`absolute top-2 left-2 p-1.8 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer z-20 ${
                          favorites.includes(prod.id)
                            ? 'bg-rose-500 text-white scale-110'
                            : 'bg-black/55 hover:bg-black/75 text-slate-200'
                        }`}
                        title={favorites.includes(prod.id) ? '选定取消收藏' : '一键加入专属收藏夹'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites.includes(prod.id) ? 'fill-current' : ''}`} />
                      </button>

                      {((prod.limitDiscount) || (prod.isFlashSale)) && (
                        <span className="absolute top-2 right-2 bg-rose-550 border border-rose-500/30 text-white text-[9px] font-extrabold px-1.8 py-0.8 rounded-md flex items-center gap-1 shadow-sm animate-pulse">
                          <Clock className="w-2.5 h-2.5" />
                          限时突降特惠
                        </span>
                      )}
                      
                      {/* 实名教实授认证徽标 (req-51) */}
                      {prod.isVerifiedSeller && (
                        <div className="absolute bottom-2 left-2 bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>实名教务认证</span>
                        </div>
                      )}
                    </div>

                    <div className="px-1.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-semibold text-slate-400">
                        <span className="flex items-center gap-0.8 text-[11px] text-indigo-300">
                          <MapPin className="w-3 h-3" />
                          {prod.campus} · {prod.dormitory}
                        </span>
                        <span>{prod.postDate}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-200">
                        {prod.title}
                      </h4>

                      <p className="text-xs text-slate-300 line-clamp-2 md:h-8 leading-relaxed">
                        {prod.description}
                      </p>

                      {/* 教材类特定信息标注 (req-67) */}
                      {prod.textbookInfo && (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-1.5 text-[10px] text-indigo-200 space-y-0.5">
                          <div className="flex justify-between font-medium">
                            <span className="truncate">📖 科目: {prod.textbookInfo.schoolSubject}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>大纲: {prod.textbookInfo.syllabusVersion}</span>
                            <span>{prod.textbookInfo.courseNature}</span>
                          </div>
                        </div>
                      )}

                      {/* 丰富商品标签 (req-38) */}
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {prod.tags.slice(0, 3).map((tg, idx) => (
                          <span 
                            key={idx} 
                            className="bg-white/4 text-slate-200 text-[10px] px-1.5 py-0.5 rounded-md border border-white/5 font-semibold"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* 价格底栏和信誉评分(req-52) */}
                  <div className="pt-3.5 mt-3 border-t border-white/5 flex items-center justify-between px-1.5">
                    <div className="flex flex-col text-left">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-emerald-400 font-extrabold text-base">
                          ¥{prod.isFlashSale && prod.flashSalePrice ? prod.flashSalePrice : prod.price}
                        </span>
                        <span className="text-slate-400 text-xs line-through font-medium">
                          ¥{prod.isFlashSale ? prod.price : prod.originalPrice}
                        </span>
                      </div>
                      {prod.isFlashSale && prod.flashSaleEndTime && (
                        <div className="text-[9px] mt-1 self-start flex items-center gap-1 scale-95 origin-left">
                          <FlashSaleTimer endTime={prod.flashSaleEndTime} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-200 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.8 rounded-lg select-none">
                      👤 {prod.sellerName} · 信用 {prod.sellerRating}分
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 4. 点击闲置弹出高保真详情弹窗 Drawer Drawer (req-43, req-51, req-52) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-2xl w-full rounded-3xl p-5 md:p-6 border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto space-y-4 motion-preset-fade">
            
            <button 
              onClick={() => { setSelectedProduct(null); setIsBuying(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 顶部标题 */}
            <div className="flex items-start gap-4 pr-8">
              <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 font-bold text-xs px-2.5 py-1 rounded-xl">
                {selectedProduct.category}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
                {selectedProduct.title}
              </h2>
            </div>

            {/* 主要内容区 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-2">
              
              {/* 大图片 */}
              <div className="space-y-2.5">
                <div className="rounded-2xl overflow-hidden aspect-video border border-white/10">
                  <img src={selectedProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                
                {/* 各种小指示 */}
                <div className="flex items-center justify-around bg-white/3 border border-white/5 rounded-xl p-2.5 text-center text-xs text-slate-300">
                  <div className="flex flex-col items-center">
                    <span className="font-bold flex items-center gap-0.5 text-slate-200">
                      <Eye className="w-3.5 h-3.5" />
                      {selectedProduct.views}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">次浏览</span>
                  </div>
                  <div className="w-px h-6 bg-white/5"></div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold flex items-center gap-0.5 text-slate-200">
                      <Heart className="w-3.5 h-3.5" />
                      {selectedProduct.countFav}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">人收藏</span>
                  </div>
                  <div className="w-px h-6 bg-white/5"></div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-emerald-400">98%</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">面交守时率</span>
                  </div>
                </div>
              </div>

              {/* 卖家及货品说明 */}
              <div className="space-y-3 flex flex-col justify-between">
                
                {/* 卖家授信卡 (req-51, req-52) */}
                <div className="bg-white/3 border border-white/5 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                        {selectedProduct.sellerAvatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{selectedProduct.sellerName}</h4>
                        <p className="text-[9px] text-indigo-300">卖家校园身份</p>
                      </div>
                    </div>
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      信用：{selectedProduct.sellerRating}分
                    </span>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold py-1.5 px-2.5 rounded-xl flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>该卖家已联通校内统一教务核验，安全放心</span>
                  </div>
                </div>

                {/* 物理宿舍自提定位 */}
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200">
                    <span className="font-semibold text-slate-400 shrink-0">物理宿舍点：</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-indigo-300 border border-white/5">
                      📍 {selectedProduct.campus} · {selectedProduct.dormitory}
                    </span>
                  </div>
                  
                  {selectedProduct.textbookInfo && (
                    <div className="pt-2 border-t border-white/5 mt-2 space-y-1">
                      <h5 className="font-bold text-indigo-200 text-[11px]">本套教材细化属性：</h5>
                      <p className="text-[10px]">考点科目：{selectedProduct.textbookInfo.schoolSubject}</p>
                      <p className="text-[10px]">版本参考：{selectedProduct.textbookInfo.syllabusVersion}</p>
                    </div>
                  )}
                </div>

                {/* 价格及购买按钮 */}
                <div className="bg-indigo-950/20 border border-indigo-500/15 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-emerald-400">
                        ¥{selectedProduct.isFlashSale && selectedProduct.flashSalePrice ? selectedProduct.flashSalePrice : selectedProduct.price}
                      </span>
                      <span className="text-xs line-through text-slate-400">
                        ¥{selectedProduct.isFlashSale ? selectedProduct.price : selectedProduct.originalPrice}
                      </span>
                    </div>
                    {selectedProduct.isFlashSale && selectedProduct.flashSaleEndTime && (
                      <div className="text-[10px] mt-1.5 flex items-center gap-1 bg-rose-500/10 p-1 rounded-md border border-rose-500/15 text-rose-300">
                        <span className="font-bold">⚡ 秒杀倒计时:</span>
                        <FlashSaleTimer endTime={selectedProduct.flashSaleEndTime} />
                      </div>
                    )}
                  </div>
                  
                  <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded shrink-0 self-center">
                    推荐线下扫码
                  </span>
                </div>

              </div>

            </div>

            {/* 详情描述文本 */}
            <div className="bg-white/2 border border-white/5 p-3 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[140px] overflow-y-auto">
              {selectedProduct.description}
            </div>

            {/* 一键下单托管担保 (req-68, req-43) */}
            {isBuying ? (
              <div className="bg-indigo-500/15 border border-indigo-400/30 p-4 rounded-2xl space-y-3.5 motion-preset-expand">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                  开启平台担保支付 (资金锁定平台，线下当面确认后再划款)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">默认宿舍交付地址 (可选修改)</label>
                    <input 
                      type="text" 
                      value={buyerAddress} 
                      onChange={(e) => setBuyerAddress(e.target.value)} 
                      className="bg-white/5 border border-white/10 rounded-lg p-1.5 w-full text-slate-200" 
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">给卖家的见面预约备注</label>
                    <input 
                      type="text" 
                      value={buyerMemo} 
                      onChange={(e) => setBuyerMemo(e.target.value)} 
                      placeholder="e.g. 晚上七点中苑饭堂门口见" 
                      className="bg-white/5 border border-white/10 rounded-lg p-1.5 w-full text-slate-200" 
                    />
                  </div>
                </div>

                {/* 🎫 Add coupon selection list if any exist */}
                {(() => {
                  const currentPrice = selectedProduct.isFlashSale && selectedProduct.flashSalePrice 
                    ? selectedProduct.flashSalePrice 
                    : selectedProduct.price;

                  const eligibleCoupons = coupons.filter(c => {
                    if (!currentUser) return false;
                    if (c.isUsed) return false;
                    if (c.targetUser !== '所有人' && c.targetUser !== currentUser.username) return false;
                    return currentPrice >= c.minSpend;
                  });

                  if (eligibleCoupons.length === 0) return null;

                  return (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl text-xs space-y-1 text-left">
                      <label className="text-amber-400 font-bold block mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">🎫 选择适用的校园特设优惠券:</span>
                        <span className="bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded-full text-[9px] uppercase">
                          特权加码 (省 ¥)
                        </span>
                      </label>
                      <select
                        value={selectedCouponId}
                        onChange={(e) => setSelectedCouponId(e.target.value)}
                        className="w-full bg-slate-900 border border-amber-500/20 rounded-lg p-2 text-amber-300 font-extrabold cursor-pointer border-dashed outline-none"
                      >
                        <option value="">🚫 不叠加并扣减代金券 (全款支付)</option>
                        {eligibleCoupons.map(c => (
                          <option key={c.id} value={c.id}>
                            🏷️ [{c.code}] - {c.title} (立减 ¥{c.discountAmount}，门槛满 ¥{c.minSpend} 可用)
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}

                <div className="flex gap-2 justify-end items-center">
                  {/* Cancel button */}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsBuying(false);
                      setSelectedCouponId('');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    取消
                  </button>

                  {/* Payment button */}
                  {(() => {
                    const currentPrice = selectedProduct.isFlashSale && selectedProduct.flashSalePrice 
                      ? selectedProduct.flashSalePrice 
                      : selectedProduct.price;

                    const activeCoupon = coupons.find(c => c.id === selectedCouponId);
                    const discount = activeCoupon ? activeCoupon.discountAmount : 0;
                    const finalDisplayPrice = Math.max(0, currentPrice - discount);

                    return (
                      <button 
                        type="button"
                        onClick={() => {
                          onBuyProduct(selectedProduct, buyerMemo, buyerAddress, selectedCouponId || undefined);
                          setSelectedProduct(null);
                          setIsBuying(false);
                          setSelectedCouponId('');
                        }}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 cursor-pointer flex items-center gap-1.5"
                      >
                        {discount > 0 && (
                          <span className="text-[10px] line-through text-emerald-200/60 mr-0.5">
                            ¥{currentPrice}
                          </span>
                        )}
                        <span>立即付 ¥{finalDisplayPrice} 托管</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  onClick={() => onToggleFavorite ? onToggleFavorite(selectedProduct.id) : null}
                  className={`px-3 py-3 border rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${
                    favorites.includes(selectedProduct.id)
                      ? 'bg-rose-500/30 border-rose-500/50 text-rose-300 hover:bg-rose-500/40'
                      : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                  }`}
                  title={favorites.includes(selectedProduct.id) ? '取消从收藏夹中移出' : '加入至我的收藏夹中'}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedProduct.id) ? 'fill-current text-rose-500' : ''}`} />
                  <span>{favorites.includes(selectedProduct.id) ? '已收藏' : '收藏'}</span>
                </button>

                <button
                  onClick={() => onSelectProductForChat(selectedProduct)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-indigo-300 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  联系卖家私聊
                </button>
                
                <button
                  onClick={() => setIsBuying(true)}
                  className="flex-1 px-4 py-3 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  平台担保购买 (面交首推)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. 快速发布宝贝模态框 (req-64, req-67) */}
      {isPublishing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-xl w-full rounded-3xl p-5 border border-white/10 max-h-[90vh] overflow-y-auto space-y-4 motion-preset-fade">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Plus className="p-1 bg-indigo-500 rounded-lg text-white" />
                登记发布您自用的校园闲置 (支持教材特定分类)
              </h3>
              <button 
                onClick={() => setIsPublishing(false)}
                className="text-slate-400 hover:text-white bg-white/5 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 标题 */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">宝贝标题</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g. 九成新吹风机 / 考研英语黄皮书"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                {/* 大类分类 */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">宝贝主要大类</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="图书教材">📚 图书教材</option>
                    <option value="数码配件">🔌 数码配件</option>
                    <option value="省心生活">🍳 省心生活</option>
                    <option value="运动休闲">🚲 运动休闲</option>
                    <option value="其它闲置">📦 其它闲置</option>
                  </select>
                </div>

              </div>

              {/* 价格及原价格 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">出让价格 (¥)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="售价"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">原购入价格 (¥)</label>
                  <input
                    type="number"
                    value={newOrigPrice}
                    onChange={(e) => setNewOrigPrice(e.target.value)}
                    placeholder="可选，对比吸引力"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* 是否图书及专属参数 (req-67) */}
              {newCategory === '图书教材' && (
                <div className="bg-indigo-500/5 border border-indigo-500/15 p-3 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">是否开启高校特定科目教材属性发布？</span>
                    <input
                      type="checkbox"
                      checked={isTextbook}
                      onChange={(e) => setIsTextbook(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-500"
                    />
                  </div>

                  {isTextbook && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">科目名称</label>
                        <input
                          type="text"
                          value={tbSubject}
                          onChange={(e) => setTbSubject(e.target.value)}
                          placeholder="e.g. 高等数学 / 计算机网络"
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">编写教材版本</label>
                        <input
                          type="text"
                          value={tbSyllabus}
                          onChange={(e) => setTbSyllabus(e.target.value)}
                          placeholder="e.g. 谢希仁第七版"
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">课程性质</label>
                        <select
                          value={tbNature}
                          onChange={(e) => setTbNature(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-white"
                        >
                          <option value="专业必修课">专业必修课</option>
                          <option value="核心公共必修">核心公共必修</option>
                          <option value="自由选修通识">自由选修通识</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 限时秒杀特惠降价选项 (req-50) */}
              <div className="bg-rose-950/15 border border-rose-500/25 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    开启本件商品「限时价格大跌降价」引流秒杀
                  </span>
                  <input
                    type="checkbox"
                    checked={isPublishFlashSale}
                    onChange={(e) => setIsPublishFlashSale(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 cursor-pointer"
                  />
                </div>

                {isPublishFlashSale && (
                  <div className="grid grid-cols-2 gap-4 text-xs animate-preset-slide-down">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">降价后极限神仙低价 (¥)</label>
                      <input
                        type="number"
                        required
                        value={publishFlashSalePrice}
                        onChange={(e) => setPublishFlashSalePrice(e.target.value)}
                        placeholder="需低于普通售价"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">促销特价持续生效时长(小时)</label>
                      <select
                        value={publishFlashSaleDuration}
                        onChange={(e) => setPublishFlashSaleDuration(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white font-bold cursor-pointer"
                      >
                        <option value="0.5">0.5 小时 (半小时极速促)</option>
                        <option value="1">1 小时 (精选爆单倒计时)</option>
                        <option value="2">2 小时 (推荐引流速推)</option>
                        <option value="6">6 小时 (黄金回血半夜档)</option>
                        <option value="12">12 小时 (半日秒杀生效)</option>
                        <option value="24">24 小时 (整日降价出清)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 图片上传选择 */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 dark:bg-[#0f172a]/20 border border-slate-200 dark:border-white/5 text-left">
                <label className="text-slate-600 dark:text-slate-300 font-bold block text-xs">
                  📸 上传宝贝实物图片 (支持本地文件或一键精选配图)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* File Upload drag-and-drop / selector zone */}
                  <div className="border border-dashed border-slate-300 dark:border-white/20 rounded-xl p-3 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-400/50 hover:bg-slate-500/5 transition relative flex flex-col items-center justify-center min-h-[90px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    {newImageUrl ? (
                      <div className="relative w-full h-16">
                        <img
                          src={newImageUrl}
                          alt="Uploaded product img"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setNewImageUrl('');
                          }}
                          className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 text-[9px] w-4 h-4 flex items-center justify-center font-bold z-20"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-300 font-bold">📂 点击或拖动本地实物图</div>
                        <div className="text-[9px] text-slate-400">支持 PNG/JPG 大四自提图</div>
                      </div>
                    )}
                  </div>

                  {/* Preloaded quick assets for rapid testing */}
                  <div className="p-2 py-0.5 flex flex-col justify-center space-y-1 select-none">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold text-left">✨ 快捷测试宝贝配图：</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { name: '📚 课本真题', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80' },
                        { name: '🚲 折叠单车', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80' },
                        { name: '💻 科技单品', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
                        { name: '👔 日常穿搭', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewImageUrl(preset.url)}
                          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-400/20 px-1.5 py-0.8 rounded text-[9px] font-bold cursor-pointer transition shrink-0"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* 货源物理位置和图片选填 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-slate-600 dark:text-slate-300 font-bold block text-xs">物理交货楼宇</label>
                  <input
                    type="text"
                    value={newDorm}
                    onChange={(e) => setNewDorm(e.target.value)}
                    placeholder="比如 榕园4号楼 / 中苑2门"
                    className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white text-xs"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-slate-600 dark:text-slate-300 font-bold block text-xs">标签列表 (逗号分隔)</label>
                  <input
                    type="text"
                    value={newTagsString}
                    onChange={(e) => setNewTagsString(e.target.value)}
                    placeholder="e.g. 接受自提, 可小刀, 大四甩卖"
                    className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* 详细描述 */}
              <div className="space-y-1 text-left">
                <label className="text-slate-600 dark:text-slate-300 font-bold block text-xs">货品成色与交易细节描述</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="请输入描述，比如新旧程度，配件是否齐全，具体在宿舍什么地方交易..."
                  rows={3}
                  className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white text-xs"
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishing(false)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold cursor-pointer text-slate-300 hover:bg-white/5"
                >
                  取消发布
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 transition"
                >
                  确认上架并在全校展示
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
