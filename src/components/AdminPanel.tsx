import React, { useState } from 'react';
import { ModerationTicket, Announcement } from '../types';
import { SENSITIVE_WORDS } from '../data';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Check, 
  Slash, 
  Eye, 
  FileCheck,
  AlertTriangle,
  X,
  Search,
  CheckCircle2,
  Trash2,
  Lock,
  PlusCircle,
  Megaphone,
  Award
} from 'lucide-react';

interface AdminProps {
  tickets: ModerationTicket[];
  onTickDismiss: (id: string, action: 'block' | 'dismiss') => void;
  onAddTicket: (ticket: ModerationTicket) => void;
  announcements?: Announcement[];
  onAddAnnouncement?: (ann: Announcement) => void;
  onDeleteAnnouncement?: (id: string) => void;
  coupons?: any[];
  onAddCoupon?: (coup: any) => void;
  onDeleteCoupon?: (id: string) => void;
  users?: any[];
}

export default function AdminPanel({
  tickets,
  onTickDismiss,
  onAddTicket,
  announcements = [],
  onAddAnnouncement,
  onDeleteAnnouncement,
  coupons = [],
  onAddCoupon,
  onDeleteCoupon,
  users = []
}: AdminProps) {
  // Simulator text input
  const [testContent, setTestContent] = useState('');
  const [filterResult, setFilterResult] = useState<{ isClean: boolean; censoredText: string; triggeredWord?: string } | null>(null);

  // Form states for creating new official announcements
  const [pubTitle, setPubTitle] = useState('');
  const [pubContent, setPubContent] = useState('');
  const [pubType, setPubType] = useState<'系统重要防骗安全警示' | '平台功能优化通知' | '毕业季甩货专场活动' | '校友互助互惠福利'>('系统重要防骗安全警示');
  const [pubPublisher, setPubPublisher] = useState('校园官方安防中心');
  const [pubIsUrgent, setPubIsUrgent] = useState(false);

  const handlePublishAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim() || !pubContent.trim()) {
      alert('请输入公告的标题与详细内容！');
      return;
    }

    if (onAddAnnouncement) {
      onAddAnnouncement({
        id: `ann-${Date.now()}`,
        title: pubTitle.trim(),
        content: pubContent.trim(),
        publisher: pubPublisher.trim() || '超级管理员群落办公室',
        publishTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: pubType,
        isUrgent: pubIsUrgent
      });

      // Reset form states
      setPubTitle('');
      setPubContent('');
      setPubPublisher('校园官方安防中心');
      setPubIsUrgent(false);
    }
  };

  // Coupon form states
  const [coupCode, setCoupCode] = useState('');
  const [coupTitle, setCoupTitle] = useState('');
  const [coupDiscount, setCoupDiscount] = useState<number>(10);
  const [coupMinSpend, setCoupMinSpend] = useState<number>(30);
  const [coupTargetUser, setCoupTargetUser] = useState('所有人');
  const [coupExpiryTime, setCoupExpiryTime] = useState('2026-06-30');

  const handlePublishCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode.trim() || !coupTitle.trim()) {
      alert('请输入优惠代金券的代码与标题！');
      return;
    }
    if (coupDiscount <= 0 || coupMinSpend < 0) {
      alert('满减减免金额必须大于 0，且消费门槛不得为负！');
      return;
    }

    if (onAddCoupon) {
      onAddCoupon({
        id: `coup-${Date.now()}`,
        code: coupCode.trim().toUpperCase(),
        title: coupTitle.trim(),
        discountAmount: Number(coupDiscount),
        minSpend: Number(coupMinSpend),
        targetUser: coupTargetUser,
        isUsed: false,
        expiryTime: coupExpiryTime || '2026-06-30',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      // Reset
      setCoupCode('');
      setCoupTitle('');
      setCoupDiscount(10);
      setCoupMinSpend(30);
      setCoupTargetUser('所有人');
    }
  };

  // High fidelity chart mock data (GMV trends, category count, campus distribution) (req-06, req-08)
  const gmvData = [
    { day: '6/1', GMV: 3500, 件数: 120 },
    { day: '6/2', GMV: 4200, 件数: 145 },
    { day: '6/3', GMV: 3100, 件数: 110 },
    { day: '6/4', GMV: 4800, 件数: 168 },
    { day: '6/5', GMV: 5900, 件数: 215 },
    { day: '6/6', GMV: 6400, 件数: 240 }
  ];

  const categoryData = [
    { name: '图书教材', value: 45, color: '#6366f1' },
    { name: '数码配件', value: 25, color: '#10b981' },
    { name: '省心生活', value: 18, color: '#f59e0b' },
    { name: '运动休闲', value: 12, color: '#ec4899' }
  ];

  const campusHeatData = [
    { zone: '榕园宿舍区', 订单: 182, 热度: '极高' },
    { zone: '荔园宿舍区', 订单: 142, 热度: '高' },
    { zone: '中苑宿舍区', 订单: 218, 热度: '极高' },
    { zone: '北苑宿舍区', 订单: 84, 热度: '中等' }
  ];

  // AI Censor intercept simulation test (req-48, req-57)
  const handleTestFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testContent.trim()) return;

    let foundWord = SENSITIVE_WORDS.find(word => testContent.includes(word));

    if (foundWord) {
      // Simulate replace stars
      const censored = testContent.replace(new RegExp(foundWord, 'g'), '*'.repeat(foundWord.length));
      setFilterResult({
        isClean: false,
        censoredText: censored,
        triggeredWord: foundWord
      });

      // Automatically push this violation to tickets for demonstration (req-57)
      onAddTicket({
        id: `t-${Date.now()}`,
        type: '敏感词屏蔽',
        reportedItem: `测试过滤: ${testContent.substring(0, 15)}...`,
        detail: `用户试图在上架宝贝中写入包含违规敏感字词的详情内容：「${testContent}」。已被前置自动巡航切除。`,
        reporter: 'AI Censor 自动拦截审评柜',
        status: '待处理',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        evidenceText: `触发屏蔽词：【${foundWord}】`
      });

    } else {
      setFilterResult({
        isClean: true,
        censoredText: testContent
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* 核心指标看板 (req-06) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">成交总额 (GMV)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white">¥27,900</span>
            <span className="text-[10px] text-emerald-400 font-bold">↑ 18.5%</span>
          </div>
          <p className="text-[9px] text-slate-500">累计本周全校二手成单</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">总成单件数</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-indigo-300">998 件</span>
            <span className="text-[10px] text-indigo-400 font-bold">↑ 12%</span>
          </div>
          <p className="text-[9px] text-slate-500">以榕园、中苑面交结算为主</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">教务绑定活跃率</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">96.5%</span>
            <span className="text-[10px] text-emerald-400 font-bold">极好</span>
          </div>
          <p className="text-[9px] text-slate-500">大四学生自发认证度高</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">违禁词防御拦截</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-rose-400">142 次</span>
            <span className="text-[10px] text-rose-500 font-semibold">100% 捕获</span>
          </div>
          <p className="text-[9px] text-slate-500">防火墙 AI 静默前置拦截</p>
        </div>

      </div>

      {/* 2. 可视化高级报表专区 (req-06, req-08) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GMV 成交趋势走势图 */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              成交总额 (GMV) 及成单件数六日增长趋势 (req-06)
            </h4>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 p-1 px-2 rounded-lg font-bold">实时秒级更新</span>
          </div>

          <div className="h-64 text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gmvData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f42" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Legend />
                <Line type="monotone" dataKey="GMV" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="件数" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 物理宿舍热度与品类扇形图 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 品类交易重组比率 (饼图) */}
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <h5 className="text-xs font-bold text-slate-300">各闲置大品类交易分布占比(req-08)</h5>
            <div className="h-40 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-white">45%</span>
                <span className="text-[8px] text-slate-400">教材最大</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[9px] font-semibold text-slate-400">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* 物理校区宿舍网点核销热力图汇总 */}
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col justify-between space-y-3">
            <h5 className="text-xs font-bold text-slate-300">宿舍自提枢纽面交成单排行</h5>
            
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              {campusHeatData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-1.8 bg-white/2 border border-white/3 rounded-lg">
                  <span className="font-semibold text-white truncate text-[11px]">📍 {item.zone}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[10px]">{item.订单}单</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold shrink-0 border ${
                      item.热度 === '极高' 
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}>
                      {item.热度}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 italic text-center">
              * 中苑及榕园为全校教材最集中的自提区
            </p>
          </div>

        </div>

      </div>

      {/* 3. 前置防御 AI 预审敏感词拦截测试仓 (req-48, req-57) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 精准测试器一页 */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="border-b border-white/10 pb-2.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-400 animate-spin" />
              前置敏感词 AI 过滤预审模块 (req-48)
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">
              测试输入包含违法、学术造假引流词审查拦截逻辑（如输入“代写毕业论文”、“加微信付”）。
            </p>
          </div>

          <form onSubmit={handleTestFilter} className="space-y-3 text-xs">
            <textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder='尝试输入：包含 "加微信付定金" 或者 "提供代写毕业论文，低价" 进行检测演示...'
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
            />
            
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-1">
                {['加微信', '代写毕业论文', '盗版药'].map(w => (
                  <button 
                    type="button" 
                    key={w} 
                    onClick={() => setTestContent(`急需闲置课本，方便直接${w}沟通吗？`)}
                    className="bg-white/5 border border-white/10 p-1 px-2 rounded-lg text-[10px] text-slate-400 cursor-pointer"
                  >
                    快捷填入 「{w}」
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 rounded-xl text-white font-bold cursor-pointer hover:bg-indigo-600 transition"
              >
                启动 AI 预审
              </button>
            </div>
          </form>

          {filterResult && (
            <div className={`p-3.5 rounded-xl border space-y-1.5 text-xs motion-preset-expand ${
              filterResult.isClean 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {filterResult.isClean ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                <span>{filterResult.isClean ? '✅ 安全，准予全校发布公开' : '❌ 发现违禁引流、学术造假预警敏感词！'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                审结净化结果：<strong className="text-white">"{filterResult.censoredText}"</strong>
              </p>
              {filterResult.triggeredWord && (
                <p className="text-[10px] text-rose-400 font-semibold select-none">
                  触发违规词拦截封防：【{filterResult.triggeredWord}】已经锁定并触发后台工单登记
                </p>
              )}
            </div>
          )}
        </div>

        {/* 4. 投诉举报/二次判定审核大厅 (req-51, req-59 -举报投诉举报) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-amber-500" />
                校园举报判定与二次审评大厅 (req-59)
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                当卖家违约爽约、发布伪禁学术代写或买家无故索赔争议时，超管快速查看申诉并做封号或解除封锁。
              </p>
            </div>
            
            <span className="text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-lg shrink-0">
              {tickets.filter(t => t.status === '待处理').length} 条待判定
            </span>
          </div>

          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                👍 全站环境绿色无污染，暂无任何判定工单纠纷！
              </div>
            ) : (
              tickets.map(tick => (
                <div 
                  key={tick.id} 
                  className="bg-white/2 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/4 transition"
                >
                  <div className="space-y-1.5 flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        tick.status === '待处理' 
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/10' 
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/15'
                      }`}>
                        {tick.status}
                      </span>
                      <span className="text-slate-400 font-semibold">{tick.type} | 触发于：{tick.timestamp}</span>
                    </div>

                    <h5 className="font-bold text-slate-200">
                      涉诉对象：<strong className="text-white">「{tick.reportedItem}」</strong>
                    </h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      工单细说明：{tick.detail}
                    </p>
                    {tick.evidenceText && (
                      <div className="text-[10px] text-indigo-300 bg-white/2 p-1.5 rounded border border-white/3">
                        证据指陈：{tick.evidenceText}
                      </div>
                    )}
                  </div>

                  {/* 快捷判定动作 (req-59) */}
                  {tick.status === '待处理' && (
                    <div className="flex gap-2 shrink-0 w-full md:w-auto text-[10px] font-bold justify-end">
                      <button
                        onClick={() => onTickDismiss(tick.id, 'dismiss')}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 border border-white/5 cursor-pointer"
                      >
                        驳回申诉
                      </button>
                      <button
                        onClick={() => onTickDismiss(tick.id, 'block')}
                        className="px-3 py-1.5 bg-rose-500 rounded-lg text-white hover:bg-rose-600 transition cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Lock className="w-3 h-3" />
                        核实并封禁违规人
                      </button>
                    </div>
                  )}

                  {tick.status !== '待处理' && (
                    <span className="text-emerald-400 font-extrabold text-[10px] flex items-center gap-1 select-none shrink-0 bg-emerald-500/10 border border-emerald-500/20 py-1 px-2 rounded-lg">
                      <Check className="w-3.5 h-3.5" /> 超管惩戒核实办结
                    </span>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* ==================================== 📢 校园公告发布管理专部 ==================================== */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        
        <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400 animate-bounce" />
            <div>
              <h4 className="text-sm font-black text-white">校园公共多级官方公告管理台 (超管专属发布权限)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                此看板公告只由拥有 admin 安全身份的账号可发布及注销撤回。发布后内容将即时广播渲染在全体用户 Marketplace 看板。
              </p>
            </div>
          </div>
          
          <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-550/20 px-2 rounded-md py-0.5 select-none shrink-0 self-start sm:self-auto">
            管理员特权状态：认证生效中 ●
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
          
          {/* 左侧：发布表单 */}
          <form onSubmit={handlePublishAnnouncementSubmit} className="lg:col-span-7 bg-white/1 border border-white/3 p-4 rounded-xl space-y-4">
            <h5 className="text-xs font-extrabold text-indigo-350 flex items-center gap-1.5 pb-1 border-b border-white/5 uppercase text-left dark:text-indigo-300">
              ✍️ 新建官方通知/广播表单
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              
              <div className="space-y-1 text-left">
                <label className="text-slate-300 block font-semibold">公告分类属性 / 广播场景</label>
                <select
                  value={pubType}
                  onChange={(e) => setPubType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-bold cursor-pointer"
                >
                  <option value="系统重要防骗安全警示">系统重要防骗安全警示 (红底预闪)</option>
                  <option value="平台功能优化通知">平台功能优化通知 (蓝底置顶)</option>
                  <option value="毕业季甩货专场活动">毕业季甩货专场活动 (绿底置顶)</option>
                  <option value="校友互助互惠福利">校友互助互惠福利 (黄底置顶)</option>
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-slate-300 block font-semibold">发布挂靠署名机构单位</label>
                <input
                  type="text"
                  required
                  value={pubPublisher}
                  onChange={(e) => setPubPublisher(e.target.value)}
                  placeholder="如：超管开发学长团队 / 校务安委"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-bold"
                />
              </div>

            </div>

            <div className="space-y-1 text-xs text-left">
              <label className="text-slate-300 block font-semibold">公告主要标题 (建议醒目并带有 emoji 前缀)</label>
              <input
                type="text"
                required
                value={pubTitle}
                onChange={(e) => setPubTitle(e.target.value)}
                placeholder="例如：🎓 毕业出清首周！高分政治英语免费送..."
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-bold text-xs"
              />
            </div>

            <div className="space-y-1 text-xs text-left">
              <label className="text-slate-300 block font-semibold">通知主体正文详情 (支持换行，最长 500 字)</label>
              <textarea
                required
                value={pubContent}
                onChange={(e) => setPubContent(e.target.value)}
                placeholder="请详述相关细则、时间地点限制或系统优化条款..."
                rows={4}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white font-medium text-xs leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950/40 p-2.5 rounded-lg border border-white/3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pubIsUrgent"
                  checked={pubIsUrgent}
                  onChange={(e) => setPubIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-indigo-550 rounded cursor-pointer"
                />
                <label htmlFor="pubIsUrgent" className="text-xs text-slate-300 font-bold cursor-pointer select-none">
                  标定为「高能紧急预警」(将高亮红边闪烁突显)
                </label>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>立即挂载广播公告</span>
              </button>
            </div>

          </form>

          {/* 右侧：上架管理看板 */}
          <div className="lg:col-span-5 bg-white/1 border border-white/3 p-4 rounded-xl flex flex-col justify-between text-left">
            <div>
              <h5 className="text-xs font-extrabold text-amber-400 dark:text-amber-300 flex items-center gap-1.5 pb-1 border-b border-white/5 uppercase">
                📜 当前全校已置顶广播 ({announcements.length} 条)
              </h5>
              
              <div className="space-y-2.5 mt-3 max-h-[290px] overflow-y-auto pr-1">
                {announcements.length === 0 ? (
                  <p className="text-center py-12 text-slate-500 text-xs font-medium">暂时没有全校公告。请用左侧表单新发一条！</p>
                ) : (
                  announcements.map((ann) => (
                    <div 
                      key={ann.id} 
                      className={`p-2.5 rounded-lg text-xs text-left border ${
                        ann.isUrgent 
                          ? 'bg-rose-500/10 border-rose-500/20 shadow-md animate-pulse' 
                          : 'bg-white/2 border-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div className="space-y-0.5 truncate">
                          <span className="text-[8px] px-1 py-0.2 rounded bg-white/5 dark:bg-white/10 text-slate-400 font-bold block w-max max-w-full truncate">
                            {ann.type}
                          </span>
                          <h6 className="font-bold text-white text-[11px] truncate block">
                            {ann.title}
                          </h6>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('确定要在全校看板撤下/删除此官方公告吗？')) {
                              if (onDeleteAnnouncement) onDeleteAnnouncement(ann.id);
                            }
                          }}
                          className="px-1.5 py-0.5 text-rose-300 hover:text-white hover:bg-rose-600 bg-rose-500/10 border border-rose-500/20 rounded transition cursor-pointer text-[10px]"
                          title="一键从全校卸除公告"
                        >
                          撤下
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 select-text">
                        {ann.content}
                      </p>

                      <div className="flex justify-between items-center text-[8px] text-slate-500 mt-1.5 font-bold pt-1 border-t border-white/3">
                        <span>✍️署: {ann.publisher}</span>
                        <span>⏱️: {ann.publishTime}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <p className="text-[9px] text-slate-500 italic mt-3 text-center">
              * 提示：高亮标注紧急的公告在 Marketplace 会附送红底闪频闪烁引流提示，请合理使用。
            </p>
          </div>

        </div>

      </div>

      {/* ==================================== 🎫 校园优惠代金券派发大厅 ==================================== */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        
        <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h4 className="text-sm font-black text-white">校园特惠代金券指派中心 (超管专属派券)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                支持指派代金券给“所有人”或“特定买家账号”。买家在购买担保宝贝时，唯有满足使用金额门槛后方可勾选抵账。
              </p>
            </div>
          </div>
          
          <span className="text-[10px] bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 px-2 rounded-md py-0.5 select-none shrink-0 self-start sm:self-auto">
            系统出金状态：授额自由 ●
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
          
          {/* 左侧：发券表单 */}
          <form onSubmit={handlePublishCouponSubmit} className="lg:col-span-7 bg-white/1 border border-white/3 p-4 rounded-xl space-y-4">
            <h5 className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 pb-1 border-b border-white/5 uppercase text-left dark:text-amber-300">
              ✍️ 新建优惠代金券并派发
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              
              <div className="space-y-1 text-left">
                <label className="text-slate-300 block font-semibold">指派对象 (特定买家或所有人)</label>
                <select
                  value={coupTargetUser}
                  onChange={(e) => setCoupTargetUser(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-bold cursor-pointer"
                >
                  <option value="所有人">🔥 所有人通用 (全校可领)</option>
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <option key={u.username} value={u.username}>👤 专属买家: {u.username} ({u.campus || '校区未知'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-slate-300 block font-semibold">优惠券唯一兑换码</label>
                <input
                  type="text"
                  required
                  value={coupCode}
                  onChange={(e) => setCoupCode(e.target.value)}
                  placeholder="如：HELLO10 / GRAD50"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-bold placeholder-slate-500"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
              
              <div className="space-y-1 text-left">
                <label className="text-slate-300 block font-semibold">抵扣金额 (¥ 元)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={coupDiscount}
                  onChange={(e) => setCoupDiscount(Number(e.target.value))}
                  placeholder="如：5, 10, 50"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-slate-300 block font-semibold">使用满减条件 (满 ¥ 元打折)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={coupMinSpend}
                  onChange={(e) => setCoupMinSpend(Number(e.target.value))}
                  placeholder="如：30, 100"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-slate-300 block font-semibold">到期失效截止日</label>
                <input
                  type="date"
                  required
                  value={coupExpiryTime}
                  onChange={(e) => setCoupExpiryTime(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-bold"
                />
              </div>

            </div>

            <div className="space-y-1 text-xs text-left">
              <label className="text-slate-300 block font-semibold">优惠券活动促销标题</label>
              <input
                type="text"
                required
                value={coupTitle}
                onChange={(e) => setCoupTitle(e.target.value)}
                placeholder="例如：🌸 潘茜茜毕业季高额答辩补贴券"
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-bold placeholder-slate-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-650 rounded-xl text-black font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <PlusCircle className="w-4 h-4 text-black" />
                <span>立即审批派扣代金券</span>
              </button>
            </div>

          </form>

          {/* 右侧：发放列表 */}
          <div className="lg:col-span-5 bg-white/1 border border-white/3 p-4 rounded-xl flex flex-col justify-between text-left">
            <div>
              <h5 className="text-xs font-extrabold text-indigo-400 dark:text-indigo-300 flex items-center gap-1.5 pb-1 border-b border-white/5 uppercase">
                📜 已派券账本大表 ({coupons.length} 张)
              </h5>
              
              <div className="space-y-2.5 mt-3 max-h-[300px] overflow-y-auto pr-1">
                {coupons.length === 0 ? (
                  <p className="text-center py-12 text-slate-500 text-xs font-medium">暂时没有发放的优惠券。请用左侧表单新发一张！</p>
                ) : (
                  coupons.map((c) => (
                    <div 
                      key={c.id} 
                      className={`p-2.5 rounded-lg text-xs text-left border relative overflow-hidden ${
                        c.isUsed 
                          ? 'bg-slate-950/20 border-white/5 opacity-50' 
                          : 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-550/20 shadow-sm'
                      }`}
                    >
                      {/* Used watermark */}
                      {c.isUsed && (
                        <div className="absolute top-1 right-12 text-[10px] bg-slate-500/20 text-slate-400 px-1 rounded font-bold uppercase select-none border border-slate-500/10">
                          已核销使用
                        </div>
                      )}

                      <div className="flex justify-between items-start gap-1">
                        <div className="space-y-0.5 truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-amber-400 font-extrabold tracking-wider bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                              {c.code}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">
                              满 ¥{c.minSpend} 减 ¥{c.discountAmount}
                            </span>
                          </div>
                          <h6 className="font-bold text-white text-[11px] truncate block mt-0.5">
                            {c.title}
                          </h6>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`确定要注销并撤回优惠代码【${c.code}】吗？`)) {
                              if (onDeleteCoupon) onDeleteCoupon(c.id);
                            }
                          }}
                          className="px-1.5 py-0.5 text-rose-300 hover:text-white hover:bg-rose-600 bg-rose-500/10 border border-rose-500/20 rounded transition cursor-pointer text-[10px]"
                          title="注销此代金券"
                        >
                          注销
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[9px] mt-2 text-slate-300 font-semibold pt-1 border-t border-white/5">
                        <span className="text-amber-300/80 font-bold">🎯 指派给: {c.targetUser}</span>
                        <span className="text-slate-400 font-mono text-[8px]">⏱️ 止: {c.expiryTime}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <p className="text-[9px] text-slate-500 italic mt-3 text-center">
              * 管理员提示：优惠券在发放后，指定的用户（或全校）可以在下单时直接勾选并抵扣对应的订单款。
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
