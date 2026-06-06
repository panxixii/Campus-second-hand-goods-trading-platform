import React, { useState } from 'react';
import { CommunityPost, SeekingDemand } from '../types';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Plus, 
  CheckCircle,
  Megaphone,
  Sparkles,
  MapPin,
  Tag,
  Send,
  User,
  Users,
  Eye,
  X
} from 'lucide-react';

interface CommunityProps {
  posts: CommunityPost[];
  seekingList: SeekingDemand[];
  onAddPost: (post: CommunityPost) => void;
  onAddSeeking: (seek: SeekingDemand) => void;
}

export default function Community({
  posts,
  seekingList,
  onAddPost,
  onAddSeeking
}: CommunityProps) {
  const [subTab, setSubTab] = useState<'moments' | 'seeking'>('moments');
  
  // States for new Moments (req-25, req-26, req-27, req-28)
  const [isPostingMoment, setIsPostingMoment] = useState(false);
  const [momentContent, setMomentContent] = useState('');
  const [momentTags, setMomentTags] = useState('搬家清仓, 吐槽避坑');
  const [momentVisibility, setMomentVisibility] = useState<'全校可见' | '仅互关粉丝可见' | '私密仅自己可见'>('全校可见');
  
  // States for new Seeking (req-23, req-24)
  const [isPostingSeeking, setIsPostingSeeking] = useState(false);
  const [seekTitle, setSeekTitle] = useState('');
  const [seekBudget, setSeekBudget] = useState('');
  const [seekDesc, setSeekDesc] = useState('');
  const [seekDorm, setSeekDorm] = useState('榕园4号楼');
  const [seekCondition, setSeekCondition] = useState('八五新最好');
  const [seekCat, setSeekCat] = useState('图书教材');

  // Local comments helper (req-30)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>(posts);

  // Sync prop changes to state
  React.useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Handle Likes increments (req-30)
  const handleLike = (id: string) => {
    setLocalPosts(prev => prev.map(p => {
      if (p.id === id) {
        const hasLiked = !p.hasLiked;
        return {
          ...p,
          hasLiked,
          likes: hasLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  // Handle Comment insert (req-30)
  const handleAddCommentSubmit = (postId: string) => {
    if (!newCommentText.trim()) return;
    setLocalPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `c-${Date.now()}`,
              username: '我 (当前学生)',
              text: newCommentText
            }
          ]
        };
      }
      return p;
    }));
    setNewCommentText('');
    setActiveCommentPostId(null);
  };

  // Submit Moment (req-25)
  const handleMomentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      username: '我 (当前学生)',
      avatar: 'ME',
      content: momentContent,
      imageUrls: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'
      ],
      tags: momentTags.split(',').map(t => t.trim()).filter(Boolean),
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    onAddPost(newPost);
    setIsPostingMoment(false);
    setMomentContent('');
  };

  // Submit Seeking (req-23, req-24)
  const handleSeekingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seekTitle.trim() || !seekBudget) return;

    const newSeek: SeekingDemand = {
      id: `seek-${Date.now()}`,
      title: seekTitle,
      budget: parseFloat(seekBudget),
      description: seekDesc,
      username: '我 (当前学生)',
      avatar: 'ME',
      dormLocation: seekDorm,
      conditionPreference: seekCondition,
      category: seekCat,
      timestamp: new Date().toISOString().split('T')[0]
    };

    onAddSeeking(newSeek);
    setIsPostingSeeking(false);
    setSeekTitle('');
    setSeekBudget('');
    setSeekDesc('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      
      {/* 社区副导航标签 */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setSubTab('moments')}
          className={`flex-1 py-3 text-center text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition flex items-center justify-center gap-2 ${
            subTab === 'moments'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>校园生活圈 / 闲置动态流</span>
        </button>
        <button
          onClick={() => setSubTab('seeking')}
          className={`flex-1 py-3 text-center text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition flex items-center justify-center gap-2 ${
            subTab === 'seeking'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4 text-rose-400" />
          <span>大喇叭求购专区 (即时求书)</span>
        </button>
      </div>

      {subTab === 'moments' ? (
        // ================= MOMENTS VIEW =================
        <div className="space-y-5">
          
          {/* 发布卡提示 */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-md">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-gradient-to-tr from-amber-500 to-indigo-500 rounded-xl text-white">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">分享你的搬家动态或吐槽安利吧</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">支持输入话题 # 语法自动聚合进行多图呈现</p>
              </div>
            </div>
            <button
              onClick={() => setIsPostingMoment(true)}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>我有话说</span>
            </button>
          </div>

          {/* 动态卡列表 */}
          <div className="space-y-4">
            {localPosts.map(post => (
              <div 
                key={post.id} 
                className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-sm"
              >
                
                {/* 顶部发布人 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
                      {post.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {post.username}
                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] font-bold px-1 py-0.2 rounded-md">
                          大四毕业
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">⏱️ {post.timestamp}</p>
                    </div>
                  </div>
                  
                  <span className="p-1 px-2 border border-white/5 rounded-lg bg-white/2 text-[10px] text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    校友圈可见
                  </span>
                </div>

                {/* 内容描述 */}
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* 附带多图展现 (req-26) */}
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden max-h-[160px]">
                    {post.imageUrls.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt="" 
                        className="w-full h-full object-cover rounded-lg aspect-video" 
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                )}

                {/* 自定义社区动态标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="bg-indigo-500/15 border border-indigo-500/20 text-indigo-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg shrink-0"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 三大交互按钮: 点赞评论收藏 (req-30) */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-around text-xs text-slate-400">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/5 transition cursor-pointer ${
                      post.hasLiked ? 'text-rose-400 font-bold' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span>点赞 ({post.likes})</span>
                  </button>

                  <button 
                    onClick={() => {
                      setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id);
                    }}
                    className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/5 text-indigo-300 font-semibold transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>发表评论 ({post.comments.length})</span>
                  </button>

                  <button className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/5 transition cursor-pointer">
                    <Share2 className="w-4 h-4 text-slate-300" />
                    <span>微分享</span>
                  </button>
                </div>

                {/* 嵌套评论区展现 (req-30) */}
                {post.comments.length > 0 && (
                  <div className="bg-white/2 rounded-xl border border-white/5 p-3.5 space-y-2.5 text-xs">
                    {post.comments.map(c => (
                      <div key={c.id}>
                        <p className="text-slate-200">
                          <strong className="text-indigo-300 shrink-0 select-none font-bold">{c.username}：</strong>
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 评论输入框弹出 */}
                {activeCommentPostId === post.id && (
                  <div className="flex gap-2.5 items-center bg-white/3 p-2 border border-white/5 rounded-xl motion-preset-expand">
                    <input 
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="写下你针对该闲置的看法或问价疑问..."
                      className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-0"
                    />
                    <button 
                      onClick={() => handleAddCommentSubmit(post.id)}
                      className="p-1 px-2.5 bg-indigo-500 rounded-lg text-white font-semibold flex items-center gap-1 hover:bg-indigo-600 transition cursor-pointer text-xs shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>评论</span>
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* 新增 Moment 面板 (req-25) */}
          {isPostingMoment && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass-panel max-w-lg w-full rounded-3xl p-5 border border-white/10 space-y-4 motion-preset-fade">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>发布一条动态大通告 (可多图 & 设置可见)</span>
                  </h3>
                  <button onClick={() => setIsPostingMoment(false)} className="text-slate-400 hover:text-white bg-white/5 p-1 rounded-full cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleMomentSubmit} className="space-y-4 text-xs sm:text-sm">
                  
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">具体详情/安利内容</label>
                    <textarea 
                      required
                      value={momentContent}
                      onChange={(e) => setMomentContent(e.target.value)}
                      placeholder="输入求物爆料，行李打包状况，宿舍放假降价细节等多文字表述..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">绑定话题标签 (加英文逗号)</label>
                      <input 
                        type="text" 
                        value={momentTags} 
                        onChange={(e) => setMomentTags(e.target.value)}
                        placeholder="E.g. 毕业大甩卖, 宿舍生活" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">谁可以看该动态</label>
                      <select 
                        value={momentVisibility}
                        onChange={(e) => setMomentVisibility(e.target.value as any)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white"
                      >
                        <option value="全校可见">全校可见</option>
                        <option value="仅互关粉丝可见">仅互关粉丝可见</option>
                        <option value="私密仅自己可见">私密仅自己可见</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setIsPostingMoment(false)} className="px-3.5 py-2 border border-white/10 rounded-xl text-slate-300 font-semibold cursor-pointer text-xs">
                      放弃
                    </button>
                    <button type="submit" className="px-5 py-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl text-white font-bold text-xs cursor-pointer">
                      立即全校推送
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      ) : (
        // ================= SEEKING VIEW =================
        <div className="space-y-5">
          
          {/* 大喇叭发布口 */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-md bg-gradient-to-tr from-rose-950/20 via-slate-900 to-slate-900">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-xl text-white">
                <Megaphone className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">发布喇叭，求购你急需的课本与校内货源</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">不用到处发微信QQ无头苍头刷，一键发布定向呼唤</p>
              </div>
            </div>
            <button
              onClick={() => setIsPostingSeeking(true)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>我有需求</span>
            </button>
          </div>

          {/* 求购列表 (req-23, req-24) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seekingList.map(seek => (
              <div 
                key={seek.id} 
                className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-rose-500/25 transition duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">
                      {seek.category}
                    </span>
                    <span className="text-emerald-400 font-extrabold text-base">
                      预估 ¥{seek.budget}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {seek.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {seek.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2 text-[10px]">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center font-bold text-[9px] text-white">
                        {seek.avatar}
                      </div>
                      📍 {seek.dormLocation}
                    </span>
                    <span>要求: <strong className="text-amber-200">{seek.conditionPreference}</strong></span>
                  </div>
                  
                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>发布校友: {seek.username}</span>
                    <span>{seek.timestamp}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* 新增 Seeking 模态框 (req-23, req-24) */}
          {isPostingSeeking && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass-panel max-w-lg w-full rounded-3xl p-5 border border-white/10 space-y-4 motion-preset-fade">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-rose-400" />
                    <span>登记一条大喇叭求购 (设计简洁的要素提报, req-24)</span>
                  </h3>
                  <button onClick={() => setIsPostingSeeking(false)} className="text-slate-400 hover:text-white bg-white/5 p-1 rounded-full cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSeekingSubmit} className="space-y-4 text-xs sm:text-sm">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">想要收购什么物什 (简短)</label>
                      <input 
                        type="text" 
                        required
                        value={seekTitle} 
                        onChange={(e) => setSeekTitle(e.target.value)}
                        placeholder="E.g. 求两本二手考研真题" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">期望期望新旧程度</label>
                      <select 
                        value={seekCondition}
                        onChange={(e) => setSeekCondition(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white"
                      >
                        <option value="全新/没用过">全新/没用过</option>
                        <option value="八新以上无残缺">八新以上无残缺</option>
                        <option value="要求极低：能用即可">要求极低：能用即可</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">预估预付款限制 (¥)</label>
                      <input 
                        type="number" 
                        required
                        value={seekBudget} 
                        onChange={(e) => setSeekBudget(e.target.value)}
                        placeholder="心理价位" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">交货宿舍楼</label>
                      <input 
                        type="text" 
                        value={seekDorm} 
                        onChange={(e) => setSeekDorm(e.target.value)}
                        placeholder="榕园10号楼" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">所属大分类</label>
                      <select 
                        value={seekCat}
                        onChange={(e) => setSeekCat(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white"
                      >
                        <option value="图书教材">图书教材</option>
                        <option value="数码配件">数码配件</option>
                        <option value="省心生活">省心生活</option>
                        <option value="运动休闲">运动休闲</option>
                        <option value="其它闲置">其它闲置</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">具体补充描述说明</label>
                    <textarea 
                      value={seekDesc}
                      onChange={(e) => setSeekDesc(e.target.value)}
                      placeholder="可以说说什么时候需要，具体想换谁编写的高考大纲版本..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setIsPostingSeeking(false)} className="px-3.5 py-2 border border-white/10 rounded-xl text-slate-300 font-semibold cursor-pointer text-xs">
                      放弃发布
                    </button>
                    <button type="submit" className="px-5 py-2 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-xl text-white font-bold text-xs cursor-pointer">
                      开启全校呼叫
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
