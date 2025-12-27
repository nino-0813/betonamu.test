
import React, { useState, useEffect } from 'react';
import { Save, Play, X } from 'lucide-react';
import { Product } from '../../types';
import { getProducts } from '../../services/productService';

const VideoManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setVideoUrl(product.videoUrl);
  };

  const handleSave = () => {
    if (!editingProduct) return;

    const updated = products.map(p =>
      p.id === editingProduct.id ? { ...p, videoUrl } : p
    );
    setProducts(updated);
    
    try {
      localStorage.setItem('xinChao_products', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setEditingProduct(null);
    setVideoUrl('');
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setVideoUrl('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-serif mb-6">動画管理</h2>

      {editingProduct ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">動画を更新: {editingProduct.name}</h3>
            <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">動画URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="https://assets.mixkit.co/videos/..."
            />
            <p className="text-xs text-gray-500 mt-1">
              MP4形式の動画URL、または /images/stories/ 配下のファイルパス
            </p>
          </div>

          {videoUrl && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">プレビュー</label>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#2A2623] text-white rounded-lg hover:bg-black flex items-center gap-2"
            >
              <Save size={18} />
              保存
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="aspect-video bg-black rounded-lg mb-3 overflow-hidden">
                <video
                  src={product.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h3 className="font-medium mb-2">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2 break-all">{product.videoUrl}</p>
              <button
                onClick={() => handleEdit(product)}
                className="w-full px-3 py-2 bg-[#2A2623] text-white rounded-lg hover:bg-black flex items-center justify-center gap-2 text-sm"
              >
                <Play size={16} />
                動画を更新
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoManager;

