
import React from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { Play } from 'lucide-react';

interface HomeProps {
  onSelectProduct: (p: Product) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectProduct }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-widest text-[#4A3F35]">Xin Chào</h1>
        <p className="text-sm text-[#8C7B6B] tracking-widest">ベトナムの手仕事、物語のある暮らし</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PRODUCTS.map((product) => (
          <div 
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-transparent hover:border-[#E9E1D5] hover:shadow-xl transition-all duration-500"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img 
                src={product.thumbnailUrl} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 video-overlay opacity-60"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Play size={14} fill="white" />
                </div>
                <span className="text-xs tracking-wider">物語をみる</span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-[#3A322C]">{product.name}</h3>
                <span className="text-sm font-medium text-[#8C7B6B]">¥{product.price.toLocaleString()}</span>
              </div>
              <p className="text-sm text-[#4A3F35] leading-relaxed line-clamp-2 italic">
                「{product.shortStory}」
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[10px] px-2 py-1 bg-[#F1E9DE] rounded uppercase tracking-tighter text-[#8C7B6B]">
                  {product.region}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 py-16 border-y border-[#F1E9DE] text-center space-y-6">
        <h2 className="text-2xl font-serif">暮らしの中のベトナム</h2>
        <p className="text-sm text-[#4A3F35] max-w-lg mx-auto leading-loose px-4">
          私たちは、ただ「物」を売るのではなく、そこに流れる時間や人々の想いをお届けしたいと考えています。<br/>
          慌ただしい日常の中で、遠いベトナムの風を感じる瞬間を。
        </p>
      </div>
    </div>
  );
};

export default Home;
