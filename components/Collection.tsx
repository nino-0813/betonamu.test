
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { getProducts } from '../services/productService';

interface CollectionProps {
  onSelectProduct: (p: Product) => void;
}

const Collection: React.FC<CollectionProps> = ({ onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS); // デフォルト商品を初期値に

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loaded = await getProducts();
        if (loaded && loaded.length > 0) {
          setProducts(loaded);
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
  }, []);

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <header className="mb-16 text-center">
          <h2 className="text-3xl font-serif font-light mb-4 text-[#2A2623] tracking-[0.1em]">Collection</h2>
          <div className="w-8 h-[1px] bg-[#8C7B6B] mx-auto"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {products.map((product, idx) => (
            <div 
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group cursor-pointer fade-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-6">
                <img 
                  src={product.thumbnailUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-serif">{product.name}</h3>
                  <p className="text-sm font-light text-[#8C7B6B]">¥{product.price.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-400 font-light tracking-widest uppercase">{product.region}</p>
                <p className="text-sm text-gray-500 leading-relaxed font-light mt-4 line-clamp-2 italic">
                  {product.shortStory}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
