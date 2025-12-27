
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, ClipboardCopy, Sparkles } from 'lucide-react';
import { hasOpenAIApiKey, startChat } from '../services/openaiService';
import { saveChatLog as saveChatLogToService } from '../services/chatLogService';
import { ChatMessage, Product } from '../types';

interface ChatProps {
  currentProduct: Product | null;
  isFullScreen?: boolean;
  initialUserMessage?: string;
}

const Chat: React.FC<ChatProps> = ({ currentProduct, isFullScreen = false, initialUserMessage }) => {
  const [isOpen, setIsOpen] = useState(isFullScreen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadContact, setLeadContact] = useState('');
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);

  const offlineReply = (text: string) => {
    return [
      'ありがとう。いまチャットAIの接続が未設定のため、まずは私の方で買い付け相談の要点だけ一緒に整理します。',
      '',
      '次の5つを教えてください：',
      '1) 用途（自分用/ギフト）',
      '2) 探したいカテゴリ（食器/ラタン/刺繍/インテリアなど）',
      '3) 予算感（だいたいでOK）',
      '4) 期限（いつ頃までに欲しいか）',
      '5) 好み（色/素材/雰囲気）＆NG',
      '',
      '最後に、連絡先（Instagram/LINE/メール等）も教えてください。内容をまとめて買い付け候補を探します。',
    ].join('\n');
  };

  const buildTranscript = () => {
    const header = [
      '【Xin Chào 買い付け相談】',
      `名前: ${leadName || '（未入力）'}`,
      `連絡先: ${leadContact || '（未入力）'}`,
      '',
      currentProduct ? `【閲覧中の商品】${currentProduct.name}（¥${currentProduct.price.toLocaleString()}）` : '【閲覧中の商品】なし（総合相談）',
      '',
      '【会話ログ】',
    ];
    const body = messages.map(m => `${m.role === 'user' ? 'あなた' : 'リン'}: ${m.content}`).join('\n');
    return `${header.join('\n')}\n${body}`.trim();
  };

  useEffect(() => {
    const context = currentProduct 
      ? `商品名: ${currentProduct.name}\nストーリー: ${currentProduct.fullStory}\n作り手: ${currentProduct.makerName}`
      : "総合案内。ベトナムの文化や雑貨全般についての相談。";

    chatRef.current = hasOpenAIApiKey() ? startChat(context) : null;
    
    if (messages.length === 0) {
      setMessages([
        { role: 'model', content: 'Xin chào。リンです。ベトナム在住オーナーの買い付け相談を、会話しながら一緒に進めましょう。まず「用途・予算・好み」を軽く教えてくださいね。' }
      ]);
    }
  }, [currentProduct]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!initialUserMessage) return;
    if (initialSentRef.current) return;
    if (messages.length === 0) return;
    initialSentRef.current = true;
    void sendMessage(initialUserMessage);
  }, [initialUserMessage, messages.length]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('xinChaoLead');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.name === 'string') setLeadName(parsed.name);
      if (typeof parsed?.contact === 'string') setLeadContact(parsed.contact);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('xinChaoLead', JSON.stringify({ name: leadName, contact: leadContact }));
    } catch {
      // ignore
    }
  }, [leadName, leadContact]);

  const saveChatLog = async (messages: ChatMessage[]) => {
    if (messages.length <= 1) return; // 初期メッセージだけの場合は保存しない
    
    try {
      await saveChatLogToService({
        timestamp: Date.now(),
        product_name: currentProduct?.name || null,
        messages: messages,
        lead_name: leadName || undefined,
        lead_contact: leadContact || undefined,
      });
    } catch (error) {
      console.error('Failed to save chat log:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage = text;
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);
    try {
      if (!hasOpenAIApiKey() || !chatRef.current) {
        const reply = offlineReply(userMessage);
        const finalMessages = [...updatedMessages, { role: 'model' as const, content: reply }];
        setMessages(finalMessages);
        await saveChatLog(finalMessages);
        return;
      }
      {
        const stream = chatRef.current.sendMessageStream(userMessage);
        let fullResponse = '';
        setMessages([...updatedMessages, { role: 'model' as const, content: '' }]);
        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, content: fullResponse }];
          });
        }
        // ストリーミング完了後にログを保存
        const finalMessages = [...updatedMessages, { role: 'model' as const, content: fullResponse }];
        await saveChatLog(finalMessages);
      }
    } catch (error) {
      const errorMessages = [...updatedMessages, { role: 'model' as const, content: 'すみません、少し考え込んでしまいました。もう一度お伝えいただけますか？' }];
      setMessages(errorMessages);
      await saveChatLog(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    await sendMessage(inputValue);
  };

  const suggested = [
    'ギフトで、かさばらないものを探したい',
    'ラタンで、日本の部屋に合うものが欲しい',
    'バッチャン焼き、日常使いできる器が気になる',
    '予算1万円くらいで、暮らしが良くなるものを提案して',
  ];

  const handleCopyRequest = async () => {
    const text = buildTranscript();
    try {
      await navigator.clipboard.writeText(text);
      setIsRequestOpen(false);
      setMessages(prev => [...prev, { role: 'model', content: '相談内容をまとめてコピーしました。Instagram/LINE/メールなど、普段の連絡先に貼り付けて送ってくださいね。' }]);
    } catch {
      window.prompt('コピーできない場合は、ここから手動でコピーしてください。', text);
    }
  };

  const ChatContent = (
    <div className={`relative flex flex-col bg-[#FDFBF7] ${isFullScreen ? 'h-full w-full' : 'mb-4 w-[90vw] md:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-[#E9E1D5] overflow-hidden'}`}>
      <div className="bg-[#2A2623] p-5 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden">
            <img src="https://picsum.photos/seed/linh/100" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-serif text-sm tracking-widest uppercase">Linh</p>
            <p className="text-[10px] opacity-60">Concierge for Vietnam Finds</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRequestOpen(true)}
            className="hover:bg-white/10 px-3 py-2 rounded-full text-[10px] tracking-widest uppercase flex items-center gap-2"
            title="相談内容をまとめて連絡先に送る"
          >
            <ClipboardCopy size={16} /> 依頼を作る
          </button>
          {!isFullScreen && (
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full"><X size={20} /></button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!hasOpenAIApiKey() && (
          <div className="rounded-2xl border border-[#E9E1D5] bg-[#F9F6F1] p-4 text-xs text-[#4A3F35] leading-relaxed">
            <div className="flex items-center gap-2 font-medium text-[#2A2623]">
              <Sparkles size={14} /> チャットAIは未設定です（OPENAI_API_KEY）
            </div>
            <p className="mt-1">
              いまは“ヒアリング→要点整理→コピー”で依頼作成できます。AIを使う場合は環境変数 <span className="font-mono">OPENAI_API_KEY</span> を設定してください。
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-loose ${
              msg.role === 'user' 
              ? 'bg-[#E9E1D5] text-[#3A322C]' 
              : 'bg-white border border-[#F1E9DE] text-[#4A3F35]'
            }`}>
              {msg.content || <Loader2 className="animate-spin text-gray-400" size={16} />}
            </div>
          </div>
        ))}

        {messages.length <= 1 && (
          <div className="pt-2">
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-3">おすすめの聞き方</p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((s) => (
                <button
                  key={s}
                  onClick={() => void sendMessage(s)}
                  className="text-xs px-4 py-2 rounded-full border border-[#E9E1D5] bg-white hover:bg-[#F9F6F1] transition text-[#4A3F35]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-[#F1E9DE]">
        <div className="flex gap-2 items-center bg-[#F9F6F1] rounded-full px-6 py-2 border border-[#E9E1D5]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="用途・予算・好みをひとこと…"
            className="flex-1 bg-transparent border-none outline-none text-sm py-2"
          />
          <button onClick={handleSend} disabled={isLoading} className="text-[#8C7B6B]"><Send size={20} /></button>
        </div>
      </div>

      {isRequestOpen && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-[#E9E1D5] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#F1E9DE] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Request</p>
                <h3 className="text-lg font-serif">相談内容を依頼としてまとめる</h3>
              </div>
              <button onClick={() => setIsRequestOpen(false)} className="p-2 rounded-full hover:bg-gray-50"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400">お名前（任意）</label>
                <input
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E9E1D5] bg-white px-4 py-3 text-sm outline-none"
                  placeholder="例：山田"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400">連絡先（必須推奨）</label>
                <input
                  value={leadContact}
                  onChange={(e) => setLeadContact(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E9E1D5] bg-white px-4 py-3 text-sm outline-none"
                  placeholder="例：Instagram @xxxx / LINE / メール"
                />
                <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
                  ここで入力した連絡先はブラウザ内（ローカル）に保存され、外部送信はしません。
                </p>
              </div>
              <button
                onClick={handleCopyRequest}
                className="w-full bg-[#2A2623] text-white py-4 rounded-full font-bold tracking-widest text-xs uppercase hover:bg-black transition flex items-center justify-center gap-2"
              >
                <ClipboardCopy size={16} /> 依頼文をコピー
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullScreen) return ChatContent;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      {isOpen && ChatContent}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#2A2623] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default Chat;
