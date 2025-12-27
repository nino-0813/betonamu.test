
import React, { useEffect } from 'react';
import { ArrowLeft, MapPin, User, Info, Heart, Share2, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product]);

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-700 pb-32">
      {/* Premium Header */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-50">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase block text-gray-400">Story</span>
          <span className="text-sm font-serif font-bold">{product.name}</span>
        </div>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Heart size={20} strokeWidth={1.5} /></button>
        </div>
      </nav>

      {/* Cinematic Video */}
      <div className="pt-16 relative aspect-video md:aspect-[21/9] bg-black overflow-hidden">
        <video 
          src={product.videoUrl} 
          autoPlay loop muted playsInline 
          className="w-full h-full object-cover scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 space-y-24">
        {/* Story Section */}
        <section className="space-y-12 text-center max-w-2xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl font-serif font-light text-[#2A2623] leading-tight">{product.name}</h1>
            <p className="text-[#8C7B6B] tracking-[0.2em] font-light">¥{product.price.toLocaleString()}</p>
          </div>
          <p className="text-[#4A3F35] leading-[2.2] text-lg font-serif italic text-left">
            {product.fullStory}
          </p>
        </section>

        {/* Maker Grid */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
            <img src={`https://picsum.photos/seed/${product.id}-maker/600`} alt={product.makerName} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-[#8C7B6B]">
              <div className="w-8 h-[1px] bg-[#8C7B6B]"></div>
              <span className="text-[10px] font-bold tracking-widest uppercase">The Artisan</span>
            </div>
            <h3 className="text-2xl font-serif">{product.makerName}</h3>
            <p className="text-sm text-[#4A3F35] leading-loose italic">
              「{product.makerStory}」
            </p>
          </div>
        </div>

        {/* Detail Info */}
        <div className="pt-24 border-t border-gray-100 grid md:grid-cols-3 gap-12 text-sm font-light leading-loose">
          <div className="space-y-4">
            <h4 className="font-bold tracking-widest uppercase text-[10px] text-gray-400">Materials</h4>
            <p>{product.materialInfo}</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold tracking-widest uppercase text-[10px] text-gray-400">Care</h4>
            <p>{product.usageTips}</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold tracking-widest uppercase text-[10px] text-gray-400">Region</h4>
            <p>{product.regionInfo}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-8 pt-12">
          <button className="w-full md:w-96 bg-[#2A2623] text-white py-5 rounded-full flex items-center justify-center gap-4 font-bold hover:bg-black transition-all shadow-xl hover:-translate-y-1">
            <ShoppingBag size={20} />
            <span className="tracking-[0.2em] text-xs uppercase">この物語を、暮らしに迎える</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
