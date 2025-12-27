
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { Product } from '../../types';
import { PRODUCTS } from '../../constants';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/productService';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const saved = await getProducts();
      setProducts(saved.length > 0 ? saved : PRODUCTS);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts(PRODUCTS);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      alert('商品名と価格は必須です');
      return;
    }

    try {
      if (editingProduct) {
        // 編集
        const updatedProduct = { ...editingProduct, ...formData } as Product;
        await updateProduct(updatedProduct);
        await loadProducts();
        setEditingProduct(null);
      } else {
        // 新規追加
        const newProduct: Product = {
          id: Date.now().toString(),
          name: formData.name || '',
          price: formData.price || 0,
          shortStory: formData.shortStory || '',
          fullStory: formData.fullStory || '',
          makerName: formData.makerName || '',
          makerStory: formData.makerStory || '',
          region: formData.region || '',
          regionInfo: formData.regionInfo || '',
          materialInfo: formData.materialInfo || '',
          usageTips: formData.usageTips || '',
          videoUrl: formData.videoUrl || '',
          thumbnailUrl: formData.thumbnailUrl || '',
          images: formData.images || [],
        };
        await addProduct(newProduct);
        await loadProducts();
        setIsAdding(false);
      }
      setFormData({});
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('商品の保存に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この商品を削除しますか？')) return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('商品の削除に失敗しました');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAdding(false);
    setFormData({});
  };

  const currentProduct = editingProduct || (isAdding ? {} : null);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">商品管理</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingProduct(null);
            setFormData({});
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2A2623] text-white rounded-lg hover:bg-black transition-colors"
        >
          <Plus size={18} />
          商品を追加
        </button>
      </div>

      {/* フォーム */}
      {(isAdding || editingProduct) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {editingProduct ? '商品を編集' : '新規商品を追加'}
            </h3>
            <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">商品名 *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="例：バッチャン焼きの小花瓶"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">価格 (円) *</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="例：3200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">短いストーリー</label>
              <textarea
                value={formData.shortStory || ''}
                onChange={(e) => setFormData({ ...formData, shortStory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
                placeholder="例：ハノイ郊外、伝統の村で1つずつ筆を走らせた。"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">詳細ストーリー</label>
              <textarea
                value={formData.fullStory || ''}
                onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">作り手名</label>
              <input
                type="text"
                value={formData.makerName || ''}
                onChange={(e) => setFormData({ ...formData, makerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">地域</label>
              <input
                type="text"
                value={formData.region || ''}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">作り手のストーリー</label>
              <textarea
                value={formData.makerStory || ''}
                onChange={(e) => setFormData({ ...formData, makerStory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">地域情報</label>
              <textarea
                value={formData.regionInfo || ''}
                onChange={(e) => setFormData({ ...formData, regionInfo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">素材情報</label>
              <input
                type="text"
                value={formData.materialInfo || ''}
                onChange={(e) => setFormData({ ...formData, materialInfo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">お手入れ方法</label>
              <textarea
                value={formData.usageTips || ''}
                onChange={(e) => setFormData({ ...formData, usageTips: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">動画URL</label>
              <input
                type="text"
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">サムネイルURL</label>
              <input
                type="text"
                value={formData.thumbnailUrl || ''}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="/images/products/..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">画像URL（カンマ区切り）</label>
              <input
                type="text"
                value={(formData.images || []).join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  images: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="/images/products/img1.jpg, /images/products/img2.jpg"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
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
      )}

      {/* 商品一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="aspect-[4/5] bg-gray-100 rounded-lg mb-3 overflow-hidden">
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x500?text=No+Image';
                }}
              />
            </div>
            <h3 className="font-medium mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">¥{product.price.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.shortStory}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <Edit size={16} />
                編集
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <Trash2 size={16} />
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManager;

