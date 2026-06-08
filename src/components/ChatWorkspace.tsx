import React, { useState, useEffect } from 'react';
import { ChatMessage, Product } from '../types';
import { 
  Send, 
  ShieldAlert, 
  Package, 
  Slash, 
  HelpCircle, 
  Check, 
  Info,
  X,
  AlertTriangle
} from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  products: Product[];
  onSendMessage: (receiver: string, text: string, linkedProd?: Product) => void;
  onMarkAsRead?: (sender: string) => void;
  selectedProductToLink?: Product | null;
  onClearLinkedProduct: () => void;
}

export default function ChatWorkspace({
  messages,
  products,
  onSendMessage,
  onMarkAsRead,
  selectedProductToLink,
  onClearLinkedProduct
}: ChatProps) {
  // Active chat session
  const [activeSession, setActiveSession] = useState<string>('潘茜茜');
  const [inputText, setInputText] = useState('');
  
  // Local Blacklist state (req-36)
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [showBlacklistNotification, setShowBlacklistNotification] = useState(false);

  // Trigger synchronization of unread messages to read
  useEffect(() => {
    if (onMarkAsRead) {
      onMarkAsRead(activeSession);
    }
  }, [activeSession, messages, onMarkAsRead]);

  // Auto scroll logic helper
  const chatRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, activeSession]);

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedProductToLink) return;

    // Check if blacklisted
    if (blacklist.includes(activeSession)) {
      alert(`您已将 ${activeSession} 拖入黑名单，无法向对方发起对话！`);
      return;
    }

    // Trigger sensitive word validation (req-48)
    let processedText = inputText;
    if (inputText.toLowerCase().includes('加微信') || inputText.toLowerCase().includes('加我微')) {
      // Simulate automatic censorship warning pre-filter (req-37, req-48)
      onSendMessage(activeSession, processedText, selectedProductToLink || undefined);
      
      // Delay system warning
      setTimeout(() => {
        onSendMessage('系统风控监测', '⚠️ 安全提示：检测到敏感财务、引流词汇。非担保直付具有极高金钱纠纷，请务必在中苑等实名教务验证物理区域面交，不要进行任何形式的预先微信付定金！', undefined);
      }, 800);
      
      setInputText('');
      onClearLinkedProduct();
      return;
    }

    onSendMessage(activeSession, processedText, selectedProductToLink || undefined);
    setInputText('');
    onClearLinkedProduct();

    // Micro auto-reply simulation
    setTimeout(() => {
      const replies: Record<string, string> = {
        '潘茜茜': '好的同学，那我们今天下午四点在榕园便利店门口面交可以吗？到时候直接查看扫码核销。',
        '张皓越': '鼠标手感没得说，等下开机给你看看，你可以带电脑来试。',
        '周亦菲': '自行车这几天挺多人问的，如果你能提的话我可以便宜10块钱。'
      };
      
      const replyText = replies[activeSession] || '收到您的询价，我这边在上专业必修课，下课后在宿舍楼下碰面详聊！';
      onSendMessage(activeSession, replyText, undefined);
    }, 1500);
  };

  const handleToggleBlock = (username: string) => {
    setBlacklist(prev => {
      if (prev.includes(username)) {
        return prev.filter(u => u !== username);
      } else {
        return [...prev, username];
      }
    });
    setShowBlacklistNotification(true);
    setTimeout(() => setShowBlacklistNotification(false), 3000);
  };

  const activeMessages = messages.filter(m => m.chatWith === activeSession || m.sender === '系统风控监测');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 py-6 h-[80vh] min-h-[500px]">
      
      {/* 1. 侧边栏活动会话 (req-36) */}
      <div className="lg:col-span-1 glass-panel rounded-2xl p-4 flex flex-col justify-between border border-white/5 overflow-y-auto">
        <div className="space-y-4">
          <div className="border-b border-white/10 pb-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              即时私聊会话列表
            </h3>
          </div>

          <div className="space-y-1.5">
            {['潘茜茜', '张皓越', '周亦菲'].map(user => {
              const lastMsg = messages.filter(m => m.chatWith === user).pop();
              const isBlocked = blacklist.includes(user);
              const unreadCount = messages.filter(m => m.chatWith === user && m.sender === user && m.isRead === false).length;

              return (
                <button
                  key={user}
                  onClick={() => setActiveSession(user)}
                  className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between border cursor-pointer ${
                    activeSession === user
                      ? 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30'
                      : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      {user[0]}
                    </div>
                    <div className="truncate text-left">
                      <span className="font-bold block text-white">{user}</span>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {isBlocked ? '🚫 已屏蔽此人在黑名单' : lastMsg ? lastMsg.text : '暂无最新会话资料'}
                      </span>
                    </div>
                  </div>

                  {isBlocked ? (
                    <span className="bg-rose-500/20 text-rose-300 px-1 py-0.5 rounded text-[9px] font-extrabold shrink-0 border border-rose-500/20">
                      BLOCK
                    </span>
                  ) : unreadCount > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center shrink-0 animate-pulse">
                      {unreadCount}
                    </span>
                  ) : lastMsg ? (
                    <span className="text-[9px] text-slate-500 shrink-0">
                      {lastMsg.timestamp.split(' ')[1].substring(0, 5)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* 屏蔽说明 */}
        <div className="bg-white/2 border border-white/5 rounded-xl p-3 text-[10px] text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-300 flex items-center gap-1">
            <Slash className="w-3.5 h-3.5 text-rose-400" />
            黑名单免打扰策略 (req-36)
          </p>
          <p>
            如果遭遇恶意刀价、中介推销或者脏话骚扰，可在个人会话详情中一键屏蔽。
          </p>
        </div>

      </div>

      {/* 2. 主体聊天面板 (req-37, req-44) */}
      <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col justify-between border border-white/5 overflow-hidden shadow-xl">
        
        {/* 顶部联系人信息 bar */}
        <div className="bg-white/2 border-b border-white/10 p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-black text-sm text-white select-none">
              {activeSession[0]}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                与 {activeSession} 对话中
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                  ● 实名制在校
                </span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">平均 5分钟内回复本大类商品交易</p>
            </div>
          </div>

          <button
            onClick={() => handleToggleBlock(activeSession)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
              blacklist.includes(activeSession)
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            🚫 {blacklist.includes(activeSession) ? '解除黑名单' : '拉黑屏蔽此人'}
          </button>
        </div>

        {/* 3000 端口警示通告 (根据 req-37 交易风险预警) */}
        <div className="bg-indigo-950/25 border-b border-indigo-500/15 p-3 px-5 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-[10px] sm:text-xs text-indigo-200">
            <strong>校园面交防骗公告：</strong>
            请勿使用微信或支付宝私下代付！部分卖家诱导直接直款后放鸽子逃跑。建议先使用下方的
            <strong className="text-emerald-300">「平台担保支付/托管购买」</strong>
            功能，线下验货无误后出示核销二维码（可在订单中心找到）给卖家扫码即可。
          </div>
        </div>

        {/* 消息历史渲染面板 */}
        <div 
          ref={chatRef}
          className="flex-1 p-5 overflow-y-auto space-y-4 bg-transparent max-h-[420px]"
        >
          {activeMessages.map(msg => {
            const isMe = msg.sender === '我 (当前学生)' || msg.sender === '黄嘉敏'; // 顺应 mock 用户
            const isSys = msg.isSystem || msg.sender === '系统风控监测';

            if (isSys) {
              return (
                <div key={msg.id} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1.5 text-xs text-rose-300 max-w-xl mx-auto flex items-start gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-extrabold block">平台安全审查预审预警：</strong>
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={msg.id}
                className={`flex gap-3.5 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                  isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-100'
                }`}>
                  {msg.sender[0]}
                </div>
                
                <div className="space-y-1.5 text-left">
                  <div className={`text-[10px] text-slate-400 flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                    <span>{msg.sender}</span>
                    <span>{msg.timestamp.split(' ')[1]}</span>
                  </div>

                  <div className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-indigo-500 text-white rounded-tr-none' 
                      : 'bg-white/5 text-slate-100 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}

                    {/* 消息附带关联特定宝贝 (req-44) */}
                    {msg.linkedProduct && (
                      <div className="mt-2.5 bg-black/20 border border-white/5 rounded-xl p-2 max-w-[200px] text-left space-y-1.5">
                        <img 
                          src={msg.linkedProduct.imageUrl} 
                          className="w-full h-20 object-cover rounded-lg" 
                          alt="" 
                        />
                        <div>
                          <h5 className="text-[11px] font-bold text-white truncate">{msg.linkedProduct.title}</h5>
                          <div className="flex justify-between items-baseline pt-1">
                            <span className="text-emerald-400 font-extrabold text-[11px]">¥{msg.linkedProduct.price}</span>
                            <span className="text-[9px] text-slate-400">已关联自提</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {isMe && (
                    <div className="text-[10px] text-right text-slate-400 font-medium select-none flex items-center justify-end gap-0.5 mt-0.5">
                      {msg.isRead ? (
                        <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                          <Check className="w-3 h-3 text-emerald-400 inline" />已读
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-0.5">
                          未读
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 关联商品一键推送悬浮卡 (req-44) */}
        {selectedProductToLink && (
          <div className="mx-5 mb-2 bg-indigo-505/15 border border-indigo-400/30 p-2 rounded-xl flex items-center justify-between text-xs text-indigo-200">
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>已绑定闲置商品：<strong>{selectedProductToLink.title}</strong></span>
            </span>
            <button 
              onClick={onClearLinkedProduct}
              className="text-slate-400 hover:text-rose-400 cursor-pointer p-1 rounded-full hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 底部富输入框 */}
        <form onSubmit={handleSendSubmit} className="p-4 bg-white/2 border-t border-white/10 flex items-center gap-2.5">
          
          {/* 一键快捷关联商品卡片 */}
          <div className="relative shrink-0 group">
            <button
              type="button"
              onClick={() => {
                // Link the first book as demo
                const targetBook = products.find(p => p.category === '图书教材');
                if (targetBook) {
                  onSendMessage(activeSession, '我想问问这个宝贝还有吗？是否支持面交核对？', targetBook);
                } else {
                  alert('暂无可关联的校园闲置书本');
                }
              }}
              title="一键关联特定手头宝贝并发发到对话框 (req-44)"
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition cursor-pointer text-slate-300"
            >
              <Package className="w-4 h-4 text-indigo-400" />
            </button>
            <div className="absolute bottom-12 left-0 scale-0 group-hover:scale-100 transition whitespace-nowrap bg-indigo-950/95 border border-indigo-500/20 text-[10px] text-indigo-200 p-2 rounded shadow-md pointer-events-none">
              一键引用绑定闲置商品 (req-44)
            </div>
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='输入消息 (尝试输入 "加微信" 会触发人工智能风控提示词拦截)...'
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="p-3 bg-indigo-500 rounded-xl text-white hover:bg-indigo-600 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
