
import React, { useState } from 'react';
import Top from './components/Top';
import Collection from './components/Collection';
import Stories from './components/Stories';
import ProductDetail from './components/ProductDetail';
import Chat from './components/Chat';
import Concierge from './components/Concierge';
import Admin from './components/Admin';
import { View, Product } from './types';
import { Home, Play, MessageCircle, ShoppingBag, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('top');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
  };

  const handlePreviewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const renderView = () => {
    switch (currentView) {
      case 'top':
        return (
          <Top
            onStartConsult={() => setCurrentView('chat')}
            onStartBrowse={() => setCurrentView('collection')}
          />
        );
      case 'collection':
        return <Collection onSelectProduct={handleSelectProduct} />;
      case 'stories':
        return <Stories onSelectProduct={handleSelectProduct} onPreviewProduct={handlePreviewProduct} />;
      case 'chat':
        return <Concierge onBrowse={() => setCurrentView('collection')} />;
      case 'detail':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onBack={() => setCurrentView('collection')} 
          />
        ) : null;
      default:
        return <Collection onSelectProduct={handleSelectProduct} />;
    }
  };

  // URLハッシュで管理ページを開く
  React.useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#/admin') {
        setShowAdmin(true);
      } else {
        setShowAdmin(false);
      }
    };
    
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // 管理ページを開く（Ctrl/Cmd + K または 設定ボタン）
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        window.location.hash = '#/admin';
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (showAdmin) {
    return <Admin onClose={() => {
      window.location.hash = '';
      setShowAdmin(false);
    }} />;
  }

  return (
    <div className="min-h-screen">
      {/* 管理ページへのアクセスボタン */}
      <button
        onClick={() => {
          window.location.hash = '#/admin';
        }}
        className="fixed top-4 right-4 z-50 p-3 bg-[#2A2623] text-white rounded-full shadow-lg hover:bg-black transition-all hover:scale-110"
        title="管理ページ (Ctrl/Cmd + K)"
      >
        <Settings size={20} />
      </button>

      {renderView()}

      {/* Persistent Chat overlay (except in explicit views) */}
      {currentView !== 'top' && currentView !== 'chat' && (
        <Chat currentProduct={selectedProduct} />
      )}

      {/* High-end Bottom Navigation */}
      {currentView !== 'top' && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 nav-blur border-t border-gray-100 flex justify-around items-center px-6 z-50">
          <NavButton 
            active={currentView === 'collection' || currentView === 'detail'} 
            onClick={() => setCurrentView('collection')} 
            icon={<ShoppingBag size={22} />} 
            label="COLLECTION" 
          />
          <NavButton 
            active={currentView === 'stories'} 
            onClick={() => setCurrentView('stories')} 
            icon={<Play size={22} />} 
            label="STORIES" 
          />
          <NavButton 
            active={currentView === 'chat'} 
            onClick={() => setCurrentView('chat')} 
            icon={<MessageCircle size={22} />} 
            label="CONSULT" 
          />
        </nav>
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-[#2A2623] scale-110' : 'text-gray-300'}`}
  >
    {icon}
    <span className={`text-[8px] font-bold tracking-widest ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

export default App;
