
import React, { useState, useEffect } from 'react';
import { Settings, Package, Video, MessageSquare, X } from 'lucide-react';
import { Product } from '../types';
import ProductManager from './admin/ProductManager';
import VideoManager from './admin/VideoManager';
import ChatLogViewer from './admin/ChatLogViewer';

interface AdminProps {
  onClose: () => void;
}

type AdminTab = 'products' | 'videos' | 'chats';

const Admin: React.FC<AdminProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-[#2A2623] text-white px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Settings size={24} />
          <h1 className="text-xl font-serif tracking-wider">管理ページ</h1>
        </div>
        <button
          onClick={() => {
            window.location.hash = '';
            onClose();
          }}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <TabButton
          active={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
          icon={<Package size={20} />}
          label="商品管理"
        />
        <TabButton
          active={activeTab === 'videos'}
          onClick={() => setActiveTab('videos')}
          icon={<Video size={20} />}
          label="動画管理"
        />
        <TabButton
          active={activeTab === 'chats'}
          onClick={() => setActiveTab('chats')}
          icon={<MessageSquare size={20} />}
          label="チャットログ"
        />
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'videos' && <VideoManager />}
        {activeTab === 'chats' && <ChatLogViewer />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
      active
        ? 'bg-white text-[#2A2623] border-b-2 border-[#2A2623] font-medium'
        : 'text-gray-600 hover:text-[#2A2623] hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default Admin;

