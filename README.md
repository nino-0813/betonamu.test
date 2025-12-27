<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1b4kNnlPYf4C3agl9Y-qNOMROxj7l6nHX

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Set the `OPENAI_API_KEY` in [.env.local](.env.local) to your OpenAI API key  
   - Get your API key from: https://platform.openai.com/api-keys
   - If it's not set, the app still runs and you can create a purchase request by copying the chat summary.
   - Note: The app now uses OpenAI API (ChatGPT) instead of Gemini API.

3. (Optional) Set up Supabase for data persistence:
   - Create a project at https://supabase.com
   - Get your project URL and anon key from Settings > API
   - Add to `.env.local`:
     ```
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```
   - If not set, the app uses localStorage (data is lost when browser cache is cleared)
   - See [Supabase Setup](#supabase-setup) below for table schemas

4. Run the app:
   `npm run dev`
   - Default port is `3001` (and it will auto-fallback if that port is already in use).

## Supabase Setup

If you want to use Supabase for data persistence, create the following tables:

### `products` table
```sql
create table products (
  id text primary key,
  name text not null,
  price integer not null,
  short_story text,
  full_story text,
  maker_name text,
  maker_story text,
  region text,
  region_info text,
  material_info text,
  usage_tips text,
  video_url text,
  thumbnail_url text,
  images text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### `chat_logs` table
```sql
create table chat_logs (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamp with time zone not null,
  product_name text,
  messages jsonb not null,
  lead_name text,
  lead_contact text,
  created_at timestamp with time zone default now()
);

create index idx_chat_logs_timestamp on chat_logs(timestamp desc);
```

Enable Row Level Security (RLS) and set policies as needed for your use case.
