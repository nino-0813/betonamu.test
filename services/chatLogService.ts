
import { supabase, TABLES, isSupabaseConfigured } from './supabaseClient';

export interface ChatLog {
  id: string;
  timestamp: number;
  product_name: string | null;
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  lead_name?: string;
  lead_contact?: string;
  created_at?: string;
}

// チャットログを保存
export const saveChatLog = async (log: Omit<ChatLog, 'id' | 'created_at'>): Promise<void> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from(TABLES.CHAT_LOGS)
        .insert({
          timestamp: new Date(log.timestamp).toISOString(),
          product_name: log.product_name,
          messages: log.messages,
          lead_name: log.lead_name,
          lead_contact: log.lead_contact,
        });
      
      if (error) {
        console.error('Failed to save chat log:', error);
        // エラー時はlocalStorageにフォールバック
        saveChatLogToLocalStorage(log);
      }
      return;
    } catch (error) {
      console.error('Failed to save chat log to Supabase:', error);
    }
  }
  
  saveChatLogToLocalStorage(log);
};

const saveChatLogToLocalStorage = (log: Omit<ChatLog, 'id' | 'created_at'>) => {
  try {
    const existing = localStorage.getItem('xinChao_chatLogs');
    const logs = existing ? JSON.parse(existing) : [];
    logs.unshift({
      id: Date.now().toString(),
      ...log,
    });
    // 最新100件だけ保持
    const limited = logs.slice(0, 100);
    localStorage.setItem('xinChao_chatLogs', JSON.stringify(limited));
  } catch {
    // ignore
  }
};

// チャットログを取得
export const getChatLogs = async (): Promise<ChatLog[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHAT_LOGS)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Failed to fetch chat logs:', error);
        return getChatLogsFromLocalStorage();
      }
      
      if (data) {
        return data.map((row: any) => ({
          id: row.id,
          timestamp: new Date(row.timestamp).getTime(),
          product_name: row.product_name,
          messages: row.messages,
          lead_name: row.lead_name,
          lead_contact: row.lead_contact,
          created_at: row.created_at,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch chat logs from Supabase:', error);
      return getChatLogsFromLocalStorage();
    }
  }
  
  return getChatLogsFromLocalStorage();
};

const getChatLogsFromLocalStorage = (): ChatLog[] => {
  try {
    const stored = localStorage.getItem('xinChao_chatLogs');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return [];
};

