import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    let env: Record<string, string> = {};
    try {
      env = loadEnv(mode, '.', '');
    } catch {
      // In some restricted environments, reading `.env.local` may fail.
      // We fall back to an empty env object and rely on runtime env vars instead.
      env = {};
    }
    const port = Number(env.PORT || 3001);
    return {
      server: {
        port,
        strictPort: false,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Viteでは import.meta.env を使用するため、VITE_ プレフィックス付きの環境変数が自動的に読み込まれます
      // .env.local に VITE_OPENAI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY を設定してください
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
