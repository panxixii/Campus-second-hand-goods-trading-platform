import React, { useState } from 'react';
import { Order } from '../types';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  AlertCircle, 
  QrCode, 
  X, 
  ShoppingBag, 
  ChevronRight,
  RefreshCw,
  Bell,
  Trash2,
  Info
} from 'lucide-react';

interface OrderProps {
  orders: Order[];
  onCompleteOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string, reason: string, requestBy: 'buyer' | 'seller') => void;
  onUrgeOrder: (orderId: string, alertText: string) => void; 
}

export default function OrderCenter({
  orders,
  onCompleteOrder,
  onCancelOrder,
  onUrgeOrder
}: OrderProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'finished' | 'closed'>('all');
  
  // Cancelling workflow state (req-75, req-78)
  const [cancelTargetOrder, setCancelTargetOrder] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState('协商一致退款');
  const [cancelComment, setCancelComment] = useState('');
  const [showConfirmQuit, setShowConfirmQuit] = useState(false);  // 二次确认 (req-75)

  // QR Code zoom simulator
  const [zoomQR, setZoomQR] = useState<string | null>(null);

  // Form custom cancel reasons (req-80)
  const cancelReasons = [
    '协商一致退订',
    '不接受自提，沟通无果',
    '买家误选不匹配的教材版本',
    '宝贝信息描述不符或瑕疵较多',
    '卖家长时间不发货不理人',
    '闲置已经遗失/损坏，货源不全'
  ];

  const handleApplyCancelOrder = () => {
    if (!cancelTargetOrder) return;
    onCancelOrder(cancelTargetOrder.id, `${selectedReason}: ${cancelComment}`, 'buyer');
    setCancelTargetOrder(null);
    setCancelComment('');
    setShowConfirmQuit(false);
  };

  const handleUrgeClick = (ord: Order) => {
    onUrgeOrder(ord.id, `叮咚！订单【${ord.productTitle}】买家已发起短信/IM即时催单。请尽快与对方商定在中苑或榕园便利店见面核销提货！`);
  };

  const filteredOrders = orders.filter(ord => {
    if (activeTab === 'all') return true;
    if (activeTab === 'ongoing') return ord.status === '已代付托管' || ord.status === '预约交付中';
    if (activeTab === 'finished') return ord.status === '已完成';
    if (activeTab === 'closed') return ord.status === '已关闭';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      
      {/* 顶部指示牌 */}
      <div className="glass-panel p-5 rounded-2xl bg-gradient-to-r from-teal-950/20 via-slate-900 to-slate-900 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl text-white">
            <ShoppingBag className="w-5.5 h-5.5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              全校教务对接 · 担保订购大厅
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              本系统严格采用「资金锁定在平台」流程。见面无误后再凭核销码扫一键当面放款，杜绝定金欺诈！
            </p>
          </div>
        </div>

        <div className="flex bg-white/5 rounded-xl p-1 border border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeTab === 'all' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            整盘订单
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeTab === 'ongoing' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            履约推进中
          </button>
          <button
            onClick={() => setActiveTab('finished')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeTab === 'finished' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            已收货完成
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeTab === 'closed' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            退款关闭
          </button>
        </div>
      </div>

      {/* 订单卡片流 */}
      {filteredOrders.length === 0 ? (
        <div className="glass-panel text-center py-20 rounded-2xl border border-white/5">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 text-base font-mono">
            📭
          </div>
          <h4 className="text-sm font-bold text-slate-300 mt-4">暂无本类担保交易档案</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            可以到闲置集市中选用任一货源，点击「平台担保购买」生成属于你的订单。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(ord => {
            const hasQR = ord.status === '已代付托管' || ord.status === '预约交付中';
            
            return (
              <div 
                key={ord.id} 
                className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between gap-6 shadow-sm hover:border-white/10 transition duration-300"
              >
                
                {/* 1. 左侧：核心订单数据与商品图卡 */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 border-b border-white/5 pb-2.5 flex-wrap">
                    <span className="font-semibold text-slate-300">编号: {ord.id}</span>
                    <span>|</span>
                    <span>买家: {ord.buyerName}</span>
                    <span>|</span>
                    <span>卖家: <strong className="text-indigo-300">{ord.sellerName}</strong></span>
                    <span>|</span>
                    <span className="bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 px-1.5 py-0.2 rounded text-[10px]">
                      {ord.productCategory}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <img 
                      src={ord.productImageUrl} 
                      className="w-16 h-16 object-cover rounded-xl border border-white/5 shrink-0" 
                      alt="" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1 my-auto">
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {ord.productTitle}
                      </h4>
                      <p className="text-xs text-slate-400">
                        购买成交价：<strong className="text-emerald-400 text-sm">¥{ord.productPrice}</strong> 元
                      </p>
                      {ord.buyerMemo && (
                        <p className="text-[10px] text-indigo-300 italic">
                          备忘: {ord.buyerMemo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. 核心功能: 履约彩色时间轴 (req-43) */}
                  <div className="pt-4 space-y-2.5">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      三色担保面交履约时间链 (req-43)
                    </h5>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      
                      {/* 下单锁资期 */}
                      <div className="p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                        <span>已付平台资金隔离</span>
                        <span className="block text-[8px] text-slate-400 font-normal mt-0.5">{ord.timeline.billedAt.split(' ')[1]}</span>
                      </div>

                      {/* 约定提货期 */}
                      <div className={`p-2.5 rounded-xl border transition duration-300 ${
                        ord.status === '已完成'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                          : ord.status === '预约交付中' || ord.status === '已代付托管'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-200 animate-pulse'
                          : 'bg-white/2 border-white/5 text-slate-500'
                      }`}>
                        <Clock className={`w-3.5 h-3.5 mx-auto mb-1 ${
                          ord.status === '预约交付中' || ord.status === '已代付托管' ? 'text-amber-400 animate-spin' : ''
                        }`} />
                        <span>校区线下定点面交</span>
                        <span className="block text-[8px] text-slate-400 font-normal mt-0.5">
                          {ord.timeline.agreedMeetingAt ? ord.timeline.agreedMeetingAt.split(' ')[1] : '等待约定'}
                        </span>
                      </div>

                      {/* 扫码确认完成 */}
                      <div className={`p-2.5 rounded-xl border ${
                        ord.status === '已完成'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                          : 'bg-white/2 border-white/5 text-slate-500'
                      }`}>
                        <QrCode className="w-3.5 h-3.5 mx-auto mb-1" />
                        <span>当面核销一页放款</span>
                        <span className="block text-[8px] text-slate-400 font-normal mt-0.5">
                          {ord.timeline.inspectedAt ? ord.timeline.inspectedAt.split(' ')[1] : '待扫码'}
                        </span>
                      </div>

                      {/* 关闭情况 */}
                      <div className={`p-2.5 rounded-xl border ${
                        ord.status === '已关闭'
                          ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                          : 'bg-white/2 border-white/5 text-slate-500'
                      }`}>
                        <X className="w-3.5 h-3.5 mx-auto mb-1" />
                        <span>全额本金原路解冻</span>
                        <span className="block text-[8px] text-slate-400 font-normal mt-0.5">
                          {ord.timeline.closedAt ? ord.timeline.closedAt.split(' ')[1] : '保障中'}
                        </span>
                      </div>

                    </div>
                  </div>

                </div>

                {/* 3. 右侧：当面交付核销与一键退款控制柜 */}
                <div className="md:w-64 flex flex-col justify-between items-stretch border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-5 space-y-3">
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">目前阶段状态</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === '已完成'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                          : ord.status === '已关闭'
                          ? 'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/25'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="bg-white/2 border border-white/5 rounded-xl p-2 text-[10px] text-slate-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">约见：{ord.dormitoryAddress}</span>
                    </div>
                  </div>

                  {/* 4. 当面提货验码模块 (若订单仍在保障中) */}
                  {hasQR && (
                    <div className="bg-indigo-500/5 border border-indigo-400/20 p-3 rounded-xl text-center space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-200">
                        <QrCode className="w-4 h-4 text-indigo-300" />
                        <span>面交双向核销密匙 (req-43)</span>
                      </div>

                      <div className="flex items-center justify-center">
                        {/* 简易示意核销二维码 */}
                        <div 
                          onClick={() => setZoomQR(ord.verificationCode || '9826')}
                          className="bg-white p-2 rounded-lg cursor-pointer hover:opacity-90 active:scale-95 transition"
                          title="点击放大出示给卖家扫码"
                        >
                          <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white text-xs font-bold font-mono">
                            QR CODE
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        核销付款码: <strong className="text-amber-400 text-sm font-mono">{ord.verificationCode}</strong>
                      </div>

                      <button
                        onClick={() => onCompleteOrder(ord.id)}
                        className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-extrabold shadow-sm transition cursor-pointer"
                        title="当面确认货品匹配并自提成功，放款给卖家"
                      >
                        当面验货无误 放款划账
                      </button>
                    </div>
                  )}

                  {/* 取消订单或退款申述反馈 */}
                  {ord.status === '已关闭' && ord.cancellationReason && (
                    <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl text-[10px] text-rose-300 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        退款关单原因：
                      </p>
                      <p className="italic leading-normal">
                        「{ord.cancellationReason}」
                      </p>
                      <p className="text-slate-500">
                        由{ord.cancellationRequestBy === 'buyer' ? '买家申请退款' : ord.cancellationRequestBy === 'seller' ? '卖家取消出单' : '系统超时拦截'}
                      </p>
                    </div>
                  )}

                  {/* 针对进行中订单进行退款和催促留言 */}
                  {hasQR && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUrgeClick(ord)}
                        className="flex-1 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-[11px] font-bold text-slate-300 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-400" />
                        <span>催促提货 (req-42)</span>
                      </button>
                      
                      <button
                        onClick={() => setCancelTargetOrder(ord)}
                        className="flex-1 py-2 bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/35 rounded-xl text-[11px] font-bold text-rose-300 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>争议退单 (req-76)</span>
                      </button>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. 放大核销扫码 Modal */}
      {zoomQR && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-sm w-full rounded-3xl p-6 border border-white/10 text-center space-y-4">
            <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400 animate-pulse" />
              出示面交放款二维码
            </h4>
            <p className="text-xs text-slate-300">
              请让卖家使用平台内置相机扫码核销。或者直接口述当前面交密盘核销口令：
            </p>
            
            <div className="my-6 p-4 bg-white rounded-2xl mx-auto w-40 h-40 flex items-center justify-center shadow-lg">
              <div className="bg-slate-950 w-full h-full flex flex-col justify-center items-center rounded-xl p-2">
                <span className="text-[10px] text-indigo-300 uppercase">CAMPUS SECURITY</span>
                <span className="text-white text-3xl font-black font-mono tracking-widest mt-2">{zoomQR}</span>
                <span className="text-[9px] text-slate-400 mt-2">点击对话框可随时口述</span>
              </div>
            </div>

            <button 
              onClick={() => setZoomQR(null)}
              className="px-5 py-2 w-full rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white cursor-pointer"
            >
              已核销/关闭展示
            </button>
          </div>
        </div>
      )}

      {/* 6. 回退取消/关单详情页面（满足 req-75, req-78, req-80） */}
      {cancelTargetOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-5 md:p-6 border border-white/10 space-y-4 motion-preset-fade">
            
            {/* 警告气泡 */}
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-xs text-rose-300">
                <strong>退订警告二次确认 (req-75)：</strong>
                该操作将直接原路撤回在平台托管的 ¥{cancelTargetOrder.productPrice} 元资金。多次无故和违背契约的退订将扣减你的校园信用分（目前98）！
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                关闭担保订单多层理由申请 (req-80)
              </h3>
              <button 
                onClick={() => setCancelTargetOrder(null)}
                className="text-slate-400 hover:text-white bg-white/5 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">退订主分类原因：</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white"
                >
                  {cancelReasons.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">具体主观退订说明 (req-78)：</label>
                <textarea 
                  value={cancelComment}
                  onChange={(e) => setCancelComment(e.target.value)}
                  placeholder="详情告知卖家退订原因或者见面细节纠纷，附件质量图可到IM发送..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                />
              </div>

              {showConfirmQuit ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-2.5 text-xs text-amber-200">
                  <p className="font-bold flex items-center gap-1">
                    <Info className="w-4.5 h-4.5" />
                    确定要退订托管并直接取消这笔交易吗？
                  </p>
                  <div className="flex justify-end gap-2 text-[10px]">
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmQuit(false)} 
                      className="px-2.5 py-1.5 border border-white/10 rounded-lg text-slate-300 font-bold cursor-pointer"
                    >
                      不取消
                    </button>
                    <button 
                      type="button" 
                      onClick={handleApplyCancelOrder} 
                      className="px-3 py-1.5 bg-rose-500 rounded-lg text-white font-black cursor-pointer shadow"
                    >
                      确定，全额退款
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setCancelTargetOrder(null)} 
                    className="px-3.5 py-2 border border-white/10 rounded-xl text-slate-300 font-semibold cursor-pointer"
                  >
                    保留订单
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmQuit(true)} 
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-500 border border-rose-500 text-white rounded-xl font-bold cursor-pointer"
                  >
                    提交退款退订
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
