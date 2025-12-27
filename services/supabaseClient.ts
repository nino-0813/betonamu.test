
import { createClient } from '@supabase/supabase-js';
import { Product } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabaseクライアントの初期化（URLとキーが空の場合はダミー値を使用）
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// テーブル名
export const TABLES = {
  PRODUCTS: 'products',
  CHAT_LOGS: 'chat_logs',
} as const;

// 商品データの型（Supabase用）
export interface ProductRow {
  id: string;
  name: string;
  price: number;
  short_story: string;
  full_story: string;
  maker_name: string;
  maker_story: string;
  region: string;
  region_info: string;
  material_info: string;
  usage_tips: string;
  video_url: string;
  thumbnail_url: string;
  images: string[];
  created_at?: string;
  updated_at?: string;
}

// Product型をProductRow型に変換
export const productToRow = (product: Product): ProductRow => ({
  id: product.id,
  name: product.name,
  price: product.price,
  short_story: product.shortStory,
  full_story: product.fullStory,
  maker_name: product.makerName,
  maker_story: product.makerStory,
  region: product.region,
  region_info: product.regionInfo,
  material_info: product.materialInfo,
  usage_tips: product.usageTips,
  video_url: product.videoUrl,
  thumbnail_url: product.thumbnailUrl,
  images: product.images,
});

// ProductRow型をProduct型に変換
export const rowToProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  price: row.price,
  shortStory: row.short_story,
  fullStory: row.full_story,
  makerName: row.maker_name,
  makerStory: row.maker_story,
  region: row.region,
  regionInfo: row.region_info,
  materialInfo: row.material_info,
  usageTips: row.usage_tips,
  videoUrl: row.video_url,
  thumbnailUrl: row.thumbnail_url,
  images: row.images,
});

// Supabaseが利用可能かチェック
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

