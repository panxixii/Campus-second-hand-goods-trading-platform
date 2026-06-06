import React, { useState } from 'react';
import { ModerationTicket } from '../types';
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
  Lock
} from 'lucide-react';

interface AdminProps {
  tickets: ModerationTicket[];
  onTickDismiss: (id: string, action: 'block' | 'dismiss') => void;
  onAddTicket: (ticket: ModerationTicket) => void;
}

export default function AdminPanel({
  tickets,
  onTickDismiss,
  onAddTicket
}: AdminProps) {
  // Simulator text input
  const [testContent, setTestContent] = useState('');
  const [filterResult, setFilterResult] = useState<{ isClean: boolean; censoredText: string; triggeredWord?: string } | null>(null);

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

    </div>
  );
}
