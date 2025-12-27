import React, { useMemo, useState } from 'react';
import Chat from './Chat';
import { Sparkles, ShoppingBag, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

type Purpose = '自分用' | 'ギフト' | '新生活/模様替え';
type Category = '食器' | 'かご/ラタン' | '布/刺繍' | 'インテリア小物' | 'おまかせ';

interface ConciergeProps {
  onBrowse: () => void;
}

const Concierge: React.FC<ConciergeProps> = ({ onBrowse }) => {
  const [purpose, setPurpose] = useState<Purpose>('自分用');
  const [category, setCategory] = useState<Category>('おまかせ');
  const [budget, setBudget] = useState<'〜5,000円' | '5,000〜10,000円' | '10,000円〜' | '未定'>('未定');
  const [deadline, setDeadline] = useState<'急ぎ' | 'できれば今月' | 'いつでも'>('いつでも');
  const [notes, setNotes] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const seedMessage = useMemo(() => {
    const lines = [
      `買い付け相談をお願いします。`,
      `用途: ${purpose}`,
      `探したいもの: ${category}`,
      `予算感: ${budget}`,
      `希望のタイミング: ${deadline}`,
    ];
    if (notes.trim()) lines.push(`補足: ${notes.trim()}`);
    lines.push(`まずは、確認したいことがあれば質問してください。`);
    return lines.join('\n');
  }, [purpose, category, budget, deadline, notes]);

  return (
    <div className="bg-[#F9F6F1] min-h-screen pt-16 pb-32 px-4">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[420px_1fr] gap-8 items-start">
        <aside className="space-y-5">
          <div className="rounded-3xl bg-white border border-white shadow-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2A2623] text-white flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h1 className="text-xl font-serif">会話で探す、ベトナム買い付け</h1>
                <p className="text-xs text-gray-500 font-light">ベトナム在住オーナーが、現地で見つけて提案します</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-[11px] text-[#4A3F35]">
              <div className="rounded-2xl bg-[#F9F6F1] border border-[#E9E1D5] p-3">
                <div className="flex items-center gap-2 text-[#2A2623] font-medium">
                  <ShoppingBag size={14} /> 相談→提案
                </div>
                <p className="mt-1 text-[10px] text-gray-600 leading-relaxed">好みを一緒に言語化</p>
              </div>
              <div className="rounded-2xl bg-[#F9F6F1] border border-[#E9E1D5] p-3">
                <div className="flex items-center gap-2 text-[#2A2623] font-medium">
                  <Clock size={14} /> 現地で確認
                </div>
                <p className="mt-1 text-[10px] text-gray-600 leading-relaxed">価格/状態を確認</p>
              </div>
              <div className="rounded-2xl bg-[#F9F6F1] border border-[#E9E1D5] p-3">
                <div className="flex items-center gap-2 text-[#2A2623] font-medium">
                  <ShieldCheck size={14} /> 納得して購入
                </div>
                <p className="mt-1 text-[10px] text-gray-600 leading-relaxed">押し売りなし</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">用途</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['自分用', 'ギフト', '新生活/模様替え'] as Purpose[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setPurpose(v)}
                      className={`px-4 py-2 rounded-full text-xs border transition ${
                        purpose === v ? 'bg-[#2A2623] text-white border-[#2A2623]' : 'bg-white border-[#E9E1D5] text-[#4A3F35] hover:bg-[#F9F6F1]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">カテゴリ</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['食器', 'かご/ラタン', '布/刺繍', 'インテリア小物', 'おまかせ'] as Category[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setCategory(v)}
                      className={`px-4 py-2 rounded-full text-xs border transition ${
                        category === v ? 'bg-[#2A2623] text-white border-[#2A2623]' : 'bg-white border-[#E9E1D5] text-[#4A3F35] hover:bg-[#F9F6F1]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">予算感</p>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value as any)}
                    className="mt-2 w-full rounded-2xl border border-[#E9E1D5] bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option>未定</option>
                    <option>〜5,000円</option>
                    <option>5,000〜10,000円</option>
                    <option>10,000円〜</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">希望のタイミング</p>
                  <select
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value as any)}
                    className="mt-2 w-full rounded-2xl border border-[#E9E1D5] bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option>いつでも</option>
                    <option>できれば今月</option>
                    <option>急ぎ</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">補足（色/素材/サイズ/NGなど）</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例：ナチュラル、かさばらない、猫がいるのでガラスは避けたい…"
                  className="mt-2 w-full h-24 rounded-3xl border border-[#E9E1D5] bg-white px-4 py-3 text-sm outline-none resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => setHasStarted(true)}
                className="w-full bg-[#2A2623] text-white py-4 rounded-full font-bold tracking-widest text-xs uppercase hover:bg-black transition"
              >
                相談をはじめる
              </button>
              <button
                onClick={onBrowse}
                className="w-full py-3 rounded-full border border-[#E9E1D5] text-[#4A3F35] text-xs tracking-widest uppercase hover:bg-white transition flex items-center justify-center gap-2"
              >
                まずは作品を見る <ChevronRight size={16} />
              </button>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-1">
                相談は無料でOK。まずは「どんな暮らしに置きたいか」から一緒に考えます。
              </p>
            </div>
          </div>
        </aside>

        <main className="min-h-[680px]">
          <div className="max-w-2xl mx-auto">
            {!hasStarted ? (
              <div className="rounded-3xl bg-white border border-white shadow-xl p-10 text-center">
                <h2 className="text-2xl font-serif mb-3">まずは、ひとこと</h2>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  左で選んだ条件をもとに、リンが質問しながら好みを整理します。<br />
                  途中で「やっぱりやめたい」も大丈夫です。
                </p>
              </div>
            ) : (
              <div className="h-[700px] rounded-3xl overflow-hidden shadow-2xl border border-white">
                <Chat currentProduct={null} isFullScreen={true} initialUserMessage={seedMessage} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Concierge;


