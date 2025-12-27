
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { supabase, TABLES, isSupabaseConfigured, productToRow, rowToProduct } from './supabaseClient';

const STORAGE_KEY = 'xinChao_products';

// Supabaseから商品を取得
export const getProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        return getProductsFromLocalStorage();
      }
      
      if (data && data.length > 0) {
        return data.map(rowToProduct);
      }
    } catch (error) {
      console.error('Failed to fetch from Supabase:', error);
      return getProductsFromLocalStorage();
    }
  }
  
  return getProductsFromLocalStorage();
};

// localStorageから商品を取得（フォールバック）
const getProductsFromLocalStorage = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return PRODUCTS;
};

// 商品を保存（Supabase優先、フォールバックはlocalStorage）
export const saveProducts = async (products: Product[]): Promise<void> => {
  if (isSupabaseConfigured()) {
    try {
      // 既存の商品を削除してから新しいデータを挿入
      const { error: deleteError } = await supabase
        .from(TABLES.PRODUCTS)
        .delete()
        .neq('id', ''); // 全削除
      
      if (deleteError) {
        console.error('Failed to delete existing products:', deleteError);
      }
      
      // 新しい商品を一括挿入
      const rows = products.map(productToRow);
      const { error: insertError } = await supabase
        .from(TABLES.PRODUCTS)
        .insert(rows);
      
      if (insertError) {
        console.error('Failed to insert products:', insertError);
        // エラー時はlocalStorageにフォールバック
        saveProductsToLocalStorage(products);
      }
      return;
    } catch (error) {
      console.error('Failed to save to Supabase:', error);
    }
  }
  
  saveProductsToLocalStorage(products);
};

const saveProductsToLocalStorage = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
};

// 商品を追加
export const addProduct = async (product: Product): Promise<void> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .insert(productToRow(product));
      
      if (error) {
        console.error('Failed to add product:', error);
        throw error;
      }
      return;
    } catch (error) {
      console.error('Failed to add product to Supabase:', error);
      throw error;
    }
  }
  
  // localStorageにフォールバック
  const products = getProductsFromLocalStorage();
  products.push(product);
  saveProductsToLocalStorage(products);
};

// 商品を更新
export const updateProduct = async (product: Product): Promise<void> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .update(productToRow(product))
        .eq('id', product.id);
      
      if (error) {
        console.error('Failed to update product:', error);
        throw error;
      }
      return;
    } catch (error) {
      console.error('Failed to update product in Supabase:', error);
      throw error;
    }
  }
  
  // localStorageにフォールバック
  const products = getProductsFromLocalStorage();
  const index = products.findIndex(p => p.id === product.id);
  if (index !== -1) {
    products[index] = product;
    saveProductsToLocalStorage(products);
  }
};

// 商品を削除
export const deleteProduct = async (id: string): Promise<void> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Failed to delete product:', error);
        throw error;
      }
      return;
    } catch (error) {
      console.error('Failed to delete product from Supabase:', error);
      throw error;
    }
  }
  
  // localStorageにフォールバック
  const products = getProductsFromLocalStorage();
  const updated = products.filter(p => p.id !== id);
  saveProductsToLocalStorage(updated);
};

