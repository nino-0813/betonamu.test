
import React from 'react';

interface TopProps {
  onStartConsult: () => void;
  onStartBrowse: () => void;
}

const Top: React.FC<TopProps> = ({ onStartConsult, onStartBrowse }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <img 
        src="/images/common/ChatGPT Image 2025年12月22日 00_28_00.png" 
        alt="ベトナムの手仕事"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        onError={(e) => {
          // 画像が存在しない場合はフォールバック（黒背景のまま）
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* 背景のオーバーレイ（テキストを読みやすくするため） */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6 z-10">
        <h1 
          className="text-6xl md:text-8xl font-serif mb-8 fade-up font-light tracking-[0.2em] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)' }}
        >
          Xin Chào
        </h1>
        
        <div className="mb-10 fade-up max-w-2xl" style={{animationDelay: '0.2s'}}>
          <p className="text-base md:text-lg font-light tracking-wide leading-relaxed mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            ベトナム在住オーナーが、<br className="md:hidden" />会話しながらあなたの雑貨を買い付けます。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center fade-up mb-8" style={{animationDelay: '0.4s'}}>
          <button 
            onClick={onStartConsult}
            className="px-10 py-4 bg-white text-black transition-all duration-500 rounded-full text-sm tracking-wider font-medium uppercase hover:bg-white/95 hover:scale-105 shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          >
            相談して探す
          </button>
          <button 
            onClick={onStartBrowse}
            className="px-10 py-4 border-2 border-white/80 hover:border-white transition-all duration-500 rounded-full text-sm tracking-wider font-medium uppercase backdrop-blur-md bg-white/10 hover:bg-white/20 hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          >
            作品を見る
          </button>
        </div>
        
        <div className="mt-4 fade-up max-w-xl" style={{animationDelay: '0.6s'}}>
          <p className="text-xs md:text-sm text-white/90 font-light leading-relaxed px-4 py-3 rounded-2xl backdrop-blur-sm bg-black/30 border border-white/20">
            「日本の部屋に合うラタンが欲しい」「友達の誕生日に、かぶらないギフトを」など、<br className="hidden md:block" />ふわっとした相談から大丈夫です。
          </p>
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 text-center">
        <div className="animate-bounce inline-block text-white/30">
          <div className="w-[1px] h-12 bg-white/30 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Top;
