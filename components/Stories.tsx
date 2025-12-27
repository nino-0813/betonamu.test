
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { getProducts } from '../services/productService';
import { Heart, Bookmark, MessageCircle, Share2, Volume2, VolumeX, MoreVertical, Play } from 'lucide-react';

interface StoriesProps {
  onSelectProduct: (p: Product) => void;
  onPreviewProduct?: (p: Product) => void;
}

type ReelComment = {
  id: string;
  text: string;
  createdAt: number;
};

type ReelPersisted = {
  liked: boolean;
  saved: boolean;
  likeCount: number;
  comments: ReelComment[];
};

type ReelStore = Record<string, ReelPersisted>;

const STORAGE_KEY = 'xinChaoReelsState:v1';

const safeParse = (raw: string | null): ReelStore => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as ReelStore;
  } catch {
    return {};
  }
};

const seededCount = (id: string) => {
  // simple deterministic seed
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) % 1000;
  return 80 + (n % 320);
};

const Stories: React.FC<StoriesProps> = ({ onSelectProduct, onPreviewProduct }) => {
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS); // デフォルト商品を初期値に
  const [activeId, setActiveId] = useState<string>(PRODUCTS[0]?.id || '');

  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const loaded = await getProducts();
        if (loaded && loaded.length > 0) {
          setProducts(loaded);
          // 現在のactiveIdが存在しない場合、最初の商品を設定
          if (!activeId || !loaded.find(p => p.id === activeId)) {
            setActiveId(loaded[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        // エラー時はデフォルト商品を維持
      }
    };
    
    loadProducts();
    // 商品データの変更を監視（管理ページで更新された場合）
    const interval = setInterval(() => {
      loadProducts();
    }, 3000); // 3秒ごとにチェック
    return () => clearInterval(interval);
  }, []); // 依存配列を空にして、マウント時のみ実行
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsForId, setCommentsForId] = useState<string>('');
  const [commentInput, setCommentInput] = useState('');

  const [store, setStore] = useState<ReelStore>(() => {
    if (typeof window === 'undefined') return {};
    return safeParse(localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore
    }
  }, [store]);

  const getReel = (id: string): ReelPersisted => {
    const current = store[id];
    if (current) return current;
    return { liked: false, saved: false, likeCount: seededCount(id), comments: [] };
  };

  const setReel = (id: string, updater: (prev: ReelPersisted) => ReelPersisted) => {
    setStore(prev => {
      const current = prev[id] ?? { liked: false, saved: false, likeCount: seededCount(id), comments: [] };
      return { ...prev, [id]: updater(current) };
    });
  };

  // Observe which reel is active (so only that one plays)
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const entriesToId = new Map<Element, string>();

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (!visible.length) return;
        const id = entriesToId.get(visible[0].target);
        if (!id) return;
        setActiveId(id);
      },
      { root, threshold: [0.6, 0.75, 0.9] }
    );

    for (const p of PRODUCTS) {
      const el = itemRefs.current[p.id];
      if (!el) continue;
      entriesToId.set(el, p.id);
      obs.observe(el);
    }

    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    for (const p of PRODUCTS) {
      const v = videoRefs.current[p.id];
      if (!v) continue;
      v.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const active = products.find(p => p.id === activeId);
    if (active && onPreviewProduct) onPreviewProduct(active);

    for (const p of products) {
      const v = videoRefs.current[p.id];
      if (!v) continue;
      if (p.id === activeId) {
        const play = async () => {
          try {
            await v.play();
          } catch {
            // autoplay may be blocked; user can tap to play
          }
        };
        void play();
      } else {
        v.pause();
      }
    }
  }, [activeId, onPreviewProduct, products]);

  const openComments = (productId: string) => {
    setCommentsForId(productId);
    setIsCommentsOpen(true);
    setCommentInput('');
  };

  const closeComments = () => {
    setIsCommentsOpen(false);
    setCommentsForId('');
    setCommentInput('');
  };

  const activeProduct = useMemo(() => products.find(p => p.id === activeId) ?? products[0], [activeId, products]);

  const handleShare = async (product: Product) => {
    const text = `Xin Chào\n${product.name}\n${product.shortStory}\n（ベトナム在住オーナーに買い付け相談できます）`;
    try {
      await navigator.clipboard.writeText(text);
      // lightweight feedback via an in-chat-like system message is overkill here; keep silent.
    } catch {
      window.prompt('コピーして共有してください', text);
    }
  };

  return (
    <div className="bg-black min-h-screen pb-20">
      <div
        ref={containerRef}
        className="max-w-md mx-auto h-[100dvh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {products.map((product) => {
          const reel = getReel(product.id);
          const isActive = product.id === activeId;
          const isExpanded = expandedId === product.id;
          const commentCount = reel.comments.length;

          return (
            <div
              key={product.id}
              ref={(el) => { itemRefs.current[product.id] = el; }}
              className="h-[100dvh] w-full relative snap-start"
            >
            <video 
                ref={(el) => { videoRefs.current[product.id] = el; }}
              src={product.videoUrl} 
                poster={product.thumbnailUrl}
                preload="metadata"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              className="absolute inset-0 w-full h-full object-cover"
                onClick={async () => {
                  const v = videoRefs.current[product.id];
                  if (!v) return;
                  if (v.paused) {
                    try { await v.play(); } catch { /* ignore */ }
                  } else {
                    v.pause();
                  }
                }}
                onDoubleClick={() => {
                  setReel(product.id, prev => prev.liked ? prev : ({ ...prev, liked: true, likeCount: prev.likeCount + 1 }));
                }}
              />

              {/* Better cinematic overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/20"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/20"></div>

              {/* Top controls */}
              <div className="absolute top-0 left-0 right-0 px-4 pt-4 z-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-8 h-8 rounded-full border border-white/30 overflow-hidden">
                      <img
                        src={`https://picsum.photos/seed/${product.id}-maker/100`}
                        className="w-full h-full object-cover"
                        alt={product.makerName}
                      />
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs font-bold tracking-widest">{product.makerName}</p>
                      <p className="text-[10px] opacity-70 uppercase">{product.region}</p>
                    </div>
                  </div>

              <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(m => !m)}
                      className="w-9 h-9 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center backdrop-blur-sm"
                      title={isMuted ? 'ミュート解除' : 'ミュート'}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button
                      className="w-9 h-9 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center backdrop-blur-sm"
                      title="メニュー"
                    >
                      <MoreVertical size={16} />
                    </button>
                </div>
                </div>
              </div>
              
              {/* Right action rail */}
              <div className="absolute right-3 bottom-32 z-30 flex flex-col gap-4 items-center text-white">
                <button
                  onClick={() => setReel(product.id, prev => prev.liked ? ({ ...prev, liked: false, likeCount: Math.max(0, prev.likeCount - 1) }) : ({ ...prev, liked: true, likeCount: prev.likeCount + 1 }))}
                  className="flex flex-col items-center gap-1"
                  title="いいね"
                >
                  <div className={`w-12 h-12 rounded-full bg-black/35 border border-white/15 backdrop-blur-sm flex items-center justify-center ${reel.liked ? 'text-red-400' : 'text-white'}`}>
                    <Heart size={22} fill={reel.liked ? 'currentColor' : 'none'} />
                  </div>
                  <span className="text-[11px] font-medium tabular-nums">{reel.likeCount.toLocaleString()}</span>
                </button>

                <button
                  onClick={() => openComments(product.id)}
                  className="flex flex-col items-center gap-1"
                  title="コメント"
                >
                  <div className="w-12 h-12 rounded-full bg-black/35 border border-white/15 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle size={22} />
                  </div>
                  <span className="text-[11px] font-medium tabular-nums">{commentCount}</span>
                </button>

                <button
                  onClick={() => setReel(product.id, prev => ({ ...prev, saved: !prev.saved }))}
                  className="flex flex-col items-center gap-1"
                  title="保存"
                >
                  <div className={`w-12 h-12 rounded-full bg-black/35 border border-white/15 backdrop-blur-sm flex items-center justify-center ${reel.saved ? 'text-[#F5E6B7]' : 'text-white'}`}>
                    <Bookmark size={22} fill={reel.saved ? 'currentColor' : 'none'} />
                  </div>
                  <span className="text-[11px] font-medium">{reel.saved ? '保存済' : '保存'}</span>
                </button>

                <button
                  onClick={() => void handleShare(product)}
                  className="flex flex-col items-center gap-1"
                  title="共有"
                >
                  <div className="w-12 h-12 rounded-full bg-black/35 border border-white/15 backdrop-blur-sm flex items-center justify-center">
                    <Share2 size={22} />
                  </div>
                  <span className="text-[11px] font-medium">共有</span>
                </button>
              </div>

              {/* Bottom caption / CTA */}
              <div className="absolute left-0 right-0 bottom-20 z-20 px-5">
                <div className="flex items-end justify-between gap-4">
                  <div className="text-white max-w-[78%]">
                    <h3 className="text-2xl font-serif font-bold leading-tight">{product.name}</h3>
                    <p className={`mt-2 text-sm font-light leading-relaxed opacity-95 ${isExpanded ? '' : 'line-clamp-2'}`}>
                {product.shortStory}
              </p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : product.id)}
                        className="text-[11px] font-bold tracking-widest uppercase text-white/80 hover:text-white transition"
                      >
                        {isExpanded ? '閉じる' : 'もっと見る'}
                      </button>
                      {isActive && (
                        <span className="inline-flex items-center gap-2 text-[11px] text-white/70">
                          <Play size={12} /> タップで一時停止/再生
                        </span>
                      )}
                    </div>
                  </div>
              
              <button 
                onClick={() => onSelectProduct(product)}
                    className="shrink-0 px-5 py-3 bg-white text-black text-[10px] font-bold tracking-widest uppercase rounded-full hover:bg-gray-200 transition-colors"
                  >
                    詳細
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comments sheet */}
      {isCommentsOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60" onClick={closeComments}></div>
          <div className="absolute left-0 right-0 bottom-0 max-w-md mx-auto bg-white rounded-t-3xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Comments</p>
                <p className="text-sm font-serif font-bold">{products.find(p => p.id === commentsForId)?.name ?? ''}</p>
              </div>
              <button onClick={closeComments} className="text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-gray-700">閉じる</button>
            </div>

            <div className="max-h-[45vh] overflow-y-auto px-5 py-4 space-y-3">
              {(getReel(commentsForId).comments ?? []).length === 0 ? (
                <div className="text-sm text-gray-500 font-light leading-relaxed py-10 text-center">
                  まだコメントがありません。<br />最初のひとことをどうぞ。
                </div>
              ) : (
                getReel(commentsForId).comments
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map(c => (
                    <div key={c.id} className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-sm text-gray-800 leading-relaxed">{c.text}</p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2 items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                <input
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    const text = commentInput.trim();
                    if (!text) return;
                    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                    setReel(commentsForId, prev => ({ ...prev, comments: [{ id, text, createdAt: Date.now() }, ...prev.comments] }));
                    setCommentInput('');
                  }}
                  placeholder="コメントする…"
                  className="flex-1 bg-transparent outline-none text-sm py-2"
                />
                <button
                  onClick={() => {
                    const text = commentInput.trim();
                    if (!text) return;
                    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                    setReel(commentsForId, prev => ({ ...prev, comments: [{ id, text, createdAt: Date.now() }, ...prev.comments] }));
                    setCommentInput('');
                  }}
                  className="text-xs font-bold tracking-widest uppercase text-gray-700 px-3"
                >
                  送信
              </button>
              </div>
              <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
                コメント/いいね/保存はこの端末内に保存されます（デモ実装）。
              </p>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default Stories;
