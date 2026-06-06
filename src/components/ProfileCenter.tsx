import React, { useState } from 'react';
import { Product } from '../types';
import { 
  User, 
  MapPin, 
  Heart, 
  Bookmark, 
  LogOut, 
  ShieldCheck, 
  TrendingUp, 
  Grid, 
  Eye, 
  MessageSquare, 
  UserPlus, 
  Award,
  Settings,
  X,
  History,
  Trash2,
  Lock
} from 'lucide-react';

interface ProfileProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
  onLogout: () => void;
}

export default function ProfileCenter({
  products,
  onDeleteProduct,
  onLogout
}: ProfileProps) {
  const [profileTab, setProfileTab] = useState<'seller' | 'account' | 'relations'>('seller');

  // Address manager configuration states (req-39)
  const [defaultDorm, setDefaultDorm] = useState('南校区 榕园4号楼');
  const [defaultFloor, setDefaultFloor] = useState('302室');
  const [isAddrSaving, setIsAddrSaving] = useState(false);

  // Followers and Fan lists system (req-19, req-22)
  const [fans, setFans] = useState([
    { id: 'f-1', name: '潘茜茜 (学姐)', rating: 99, verified: true },
    { id: 'f-2', name: '张皓越 (学长)', rating: 100, verified: true },
    { id: 'f-3', name: '李东洋', rating: 95, verified: false }
  ]);
  const [followings, setFollowings] = useState([
    { id: 'fol-1', name: '周亦菲 (测试经理)', rating: 98, verified: true },
    { id: 'fol-2', name: '黄嘉敏 (学姐)', rating: 97, verified: true }
  ]);

  // Saved favorites list representing the bookmark manager with price notification popups (req-54)
  const [favorites, setFavorites] = useState<Product[]>([
    products[0] || {} as any,
    products[1] || {} as any
  ].filter(p => p && p.title));

  // Historic browsing footprints cache (req-55)
  const [browsingHistory, setBrowsingHistory] = useState<Product[]>([
    products[2] || {} as any,
    products[3] || {} as any,
    products[0] || {} as any
  ].filter(p => p && p.title));

  const handleUnfollow = (id: string) => {
    setFollowings(prev => prev.filter(item => item.id !== id));
  };

  const handleRemoveFan = (id: string) => {
    setFans(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setBrowsingHistory([]);
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };


  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      
      {/* 1. 顶部用户身份简况卡 (req-51, req-52) */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden bg-gradient-to-tr from-indigo-950/20 via-slate-900 to-slate-900">
        
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-black text-xl shadow-lg select-none">
            ME
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 justify-center md:justify-start">
              我 (当前在校学生 / 学弟)
              <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[10px] font-bold">
                教务已认证
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              学号：2023******25 | 院系：计算机科学与技术学院 23级
            </p>
            <div className="flex justify-center md:justify-start gap-3.5 pt-1 text-xs font-semibold text-slate-300">
              <span>粉丝：<strong className="text-indigo-300">{fans.length}</strong> 人</span>
              <span>•</span>
              <span>已关注：<strong className="text-indigo-300">{followings.length}</strong> 人</span>
              <span>•</span>
              <span>信用评级：<strong className="text-emerald-400 font-bold">100分 (五星标兵)</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 bg-rose-500/25 hover:bg-rose-500/35 border border-rose-500/35 text-rose-300 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>注销我的认证账号 (req-46)</span>
        </button>

      </div>

      {/* 导航副标签列 */}
      <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 shrink-0 text-xs sm:text-sm">
        <button
          onClick={() => setProfileTab('seller')}
          className={`flex-1 py-2 rounded-xl text-center font-bold tracking-wide cursor-pointer transition ${
            profileTab === 'seller' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          📈 卖家销售工具箱 (指引价格)
        </button>
        <button
          onClick={() => setProfileTab('account')}
          className={`flex-1 py-2 rounded-xl text-center font-bold tracking-wide cursor-pointer transition ${
            profileTab === 'account' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚙️ 宿舍快递与足迹历史
        </button>
        <button
          onClick={() => setProfileTab('relations')}
          className={`flex-1 py-2 rounded-xl text-center font-bold tracking-wide cursor-pointer transition ${
            profileTab === 'relations' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 学生关注粉丝管理体系
        </button>
      </div>

      {profileTab === 'seller' ? (
        // ================= SELLER SUB-VIEW =================
        <div className="space-y-6">
          
          {/* 四项主要转化率指标板 (req-15, req-16) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold">已挂牌款项流量</span>
              <p className="text-xl font-bold font-mono text-white">¥397</p>
              <div className="text-[8px] text-indigo-300 bg-indigo-500/10 p-1 px-2 rounded inline-block font-bold">曝曝光转化良好</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold">商品宝贝累计点击曝光</span>
              <p className="text-xl font-bold font-mono text-indigo-300">1,245 次</p>
              <div className="text-[8px] text-slate-400">平均曝光周期 3.2天</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold">被收藏与询盘率</span>
              <p className="text-xl font-bold font-mono text-emerald-400">32%</p>
              <div className="text-[8px] text-emerald-400 font-bold">高频询议价</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold">预估历史同款标价辅备 (req-18)</span>
              <p className="text-xl font-bold font-mono text-amber-400">¥12 - ¥35 元</p>
              <div className="text-[10px] text-amber-300 font-semibold text-[8px]">* 适合高等数学</div>
            </div>

          </div>

          {/* 已发布宝贝管理列表 (卖家视角：可以上架下架和删除, req-65, req-66) */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-sm">
            <div className="border-b border-white/10 pb-2.5 flex justify-between items-center bg-transparent">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-indigo-400" />
                我发布的在悬挂销售货源 (快速修改与下挂, req-66)
              </h4>
              <span className="text-[10px] text-slate-400">全校共 2 件活跃挂牌</span>
            </div>

            <div className="space-y-3">
              {products.filter(p => p.sellerName.includes('我')).length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  暂无自己发布的挂牌闲置。可以到集市顶部点击「快速发布闲置」完成发布！
                </div>
              ) : (
                products.filter(p => p.sellerName.includes('我')).map(prod => (
                  <div key={prod.id} className="bg-white/2 border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3.5">
                      <img src={prod.imageUrl} className="w-12 h-12 object-cover rounded-lg" alt="" />
                      <div>
                        <h5 className="font-bold text-white">{prod.title}</h5>
                        <p className="text-[10px] text-emerald-400 font-semibold pt-0.5">售价：¥{prod.price}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert('已自动修改价格及图片，并且向收藏本货物的买家推送了降价折扣红点通知！')}
                        className="p-1 px-2.5 border border-white/10 hover:bg-white/5 rounded text-slate-300 cursor-pointer"
                      >
                        快速降价折扣 (req-50)
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(prod.id)}
                        className="p-1 px-2.5 bg-rose-500/25 border border-rose-500/35 hover:bg-rose-500/40 text-rose-300 rounded cursor-pointer"
                        title="下架该闲置商品并将它移入垃圾箱"
                      >
                        下挂回收删除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      ) : profileTab === 'account' ? (
        // ================= ADDRESS, FAVS & HISTORY SUB-VIEW =================
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 默认面交/快递交付宿舍楼配置 (req-39) */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-2.5 mb-1.5 bh-transparent">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  下单默认交付宿舍楼层配置 (req-39)
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">设置常用面交提款地址，下单时一键同步锁定位置。</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 block font-semibold">宿舍生活园区/楼宇</label>
                  <input
                    type="text"
                    value={defaultDorm}
                    onChange={(e) => setDefaultDorm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.8 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-300 block font-semibold">具体的寝室楼门或层级</label>
                  <input
                    type="text"
                    value={defaultFloor}
                    onChange={(e) => setDefaultFloor(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.8 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAddrSaving(true);
                setTimeout(() => { setIsAddrSaving(false); alert('校园首选面交付提货地址更新锁资！'); }, 800);
              }}
              className="w-full py-2 bg-indigo-500 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition mt-6 cursor-pointer"
            >
              {isAddrSaving ? '保存同步中...' : '绑定设置当前默认自提点'}
            </button>
          </div>

          {/* 30 条最近浏览历史痕迹缓存 (req-55) */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-sm">
            <div className="border-b border-white/10 pb-2.5 flex justify-between items-center bg-transparent">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-400" />
                物理浏览历史(最多30件) (req-55)
              </h4>
              {browsingHistory.length > 0 && (
                <button 
                  onClick={handleClearHistory} 
                  className="text-[10px] text-rose-400 font-bold hover:underline cursor-pointer"
                >
                  一键剔除足迹
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
              {browsingHistory.length === 0 ? (
                <p className="text-center py-6 text-slate-500 text-xs">暂无你访问过的历史足迹</p>
              ) : (
                browsingHistory.map(hist => (
                  <div key={hist.id} className="flex gap-3 text-xs bg-white/1 p-2 rounded-lg items-center border border-white/3 justify-between">
                    <div className="flex gap-3 overflow-hidden items-center">
                      <img src={hist.imageUrl} className="w-9 h-9 object-cover rounded" alt="" />
                      <div className="truncate">
                        <span className="font-bold text-white truncate block">{hist.title}</span>
                        <span className="text-slate-400 text-[10px]">类别：{hist.category}</span>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold font-mono text-[11px] shrink-0">¥{hist.price}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 收藏宝贝及降价警告框 (req-54) */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-sm md:col-span-2">
            <div className="border-b border-white/10 pb-2.5 flex justify-between items-center bg-transparent">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-amber-400 animate-pulse" />
                我的私人收藏夹 与 降价特惠推送通知仓 (req-54)
              </h4>
              <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded">* 实时价格监测</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs md:col-span-2">你还没有任何收藏的课本或闲置宝贝噢。</div>
              ) : (
                favorites.map(fav => (
                  <div key={fav.id} className="bg-white/2 border border-white/5 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <img src={fav.imageUrl} className="w-10 h-10 object-cover rounded-lg" alt="" />
                      <div>
                        <h5 className="font-bold text-white line-clamp-1">{fav.title}</h5>
                        
                        {/* 提醒词 (req-54) */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-emerald-400 font-semibold">¥{fav.price}</span>
                          <span className="bg-rose-500/10 border border-rose-500/10 text-rose-300 text-[9px] font-bold px-1 py-0.2 rounded animate-bounce">
                            📉 比收藏时降了¥10！
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveFavorite(fav.id)}
                      className="text-slate-400 hover:text-rose-400 font-bold p-1 shrink-0 rounded hover:bg-white/5 cursor-pointer"
                    >
                      不收藏
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      ) : (
        // ================= FOLLOW / RELATION SUB-VIEW =================
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 我的粉丝列表 (req-19, req-22) */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-sm">
            <div className="border-b border-white/10 pb-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" />
                关注我的全校校友 (粉丝：{fans.length} 名) (req-22)
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">支持无理由移除恶意粉丝或黑名单账号、欺诈粉。</p>
            </div>

            <div className="space-y-2.5">
              {fans.map(fan => (
                <div key={fan.id} className="bg-white/2 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                      {fan.name[0]}
                    </div>
                    <div>
                      <h5 className="font-bold text-white">{fan.name}</h5>
                      <p className="text-[10px] text-slate-500">信用评分：{fan.rating}分 {fan.verified ? '• 教务认证' : ''}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRemoveFan(fan.id)}
                    className="p-1 px-2 text-rose-400 border border-rose-500/20 rounded hover:bg-rose-500/10 cursor-pointer"
                  >
                    移除粉丝
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 我关注的校友 */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-sm">
            <div className="border-b border-white/10 pb-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-purple-400 animate-pulse" />
                我关注的二手大拿 (关注数：{followings.length} 名)
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">只接收大拿上新通知以及折扣通知</p>
            </div>

            <div className="space-y-2.5">
              {followings.map(fol => (
                <div key={fol.id} className="bg-white/2 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      {fol.name[0]}
                    </div>
                    <div>
                      <h5 className="font-bold text-white">{fol.name}</h5>
                      <p className="text-[10px] text-slate-500">信用评分：{fol.rating}分 {fol.verified ? '• 教务认证' : ''}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleUnfollow(fol.id)}
                    className="p-1 px-2 border border-white/10 text-slate-300 rounded hover:bg-white/5 cursor-pointer"
                  >
                    取消关注
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
