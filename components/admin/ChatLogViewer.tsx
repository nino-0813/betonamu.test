
import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, MessageSquare, Download } from 'lucide-react';
import { getChatLogs, ChatLog } from '../../services/chatLogService';

const ChatLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);

  useEffect(() => {
    loadLogs();
    // 定期的にログを更新
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const loaded = await getChatLogs();
      setLogs(loaded);
    } catch (error) {
      console.error('Failed to load chat logs:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.product_name?.toLowerCase().includes(term) ||
      log.lead_name?.toLowerCase().includes(term) ||
      log.lead_contact?.toLowerCase().includes(term) ||
      log.messages.some(m => m.content.toLowerCase().includes(term))
    );
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportLog = (log: ChatLog) => {
    const text = [
      `【Xin Chào チャットログ】`,
      `日時: ${formatDate(log.timestamp)}`,
      `商品: ${log.product_name || 'なし（総合相談）'}`,
      log.lead_name && `名前: ${log.lead_name}`,
      log.lead_contact && `連絡先: ${log.lead_contact}`,
      '',
      '【会話ログ】',
      ...log.messages.map(m => `${m.role === 'user' ? 'ユーザー' : 'リン'}: ${m.content}`),
    ].filter(Boolean).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-log-${log.timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">チャットログ</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="商品名、名前、連絡先で検索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {selectedLog ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium mb-2">チャット詳細</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><Calendar size={16} className="inline mr-2" />{formatDate(selectedLog.timestamp)}</p>
                <p>商品: {selectedLog.product_name || 'なし（総合相談）'}</p>
                {selectedLog.lead_name && <p>名前: {selectedLog.lead_name}</p>}
                {selectedLog.lead_contact && <p>連絡先: {selectedLog.lead_contact}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportLog(selectedLog)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2"
              >
                <Download size={16} />
                エクスポート
              </button>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                戻る
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedLog.messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-[#2A2623] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'user' ? <User size={14} /> : <MessageSquare size={14} />}
                    <span className="text-xs font-medium">
                      {msg.role === 'user' ? 'ユーザー' : 'リン'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>チャットログがありません</p>
              <p className="text-sm mt-2">ユーザーがチャットを開始すると、ここに表示されます</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(log.timestamp)}</span>
                    </div>
                    <h3 className="font-medium mb-1">
                      {log.product_name || '総合相談'}
                    </h3>
                    {log.lead_name && (
                      <p className="text-sm text-gray-600 mb-1">
                        <User size={14} className="inline mr-1" />
                        {log.lead_name}
                        {log.lead_contact && ` (${log.lead_contact})`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {log.messages.length}件のメッセージ
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportLog(log);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ChatLogViewer;

