-- ============================================
-- AI 学术翻译协作平台 - PostgreSQL Schema
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 启用 uuid-ossp 扩展（用于 gen_random_uuid）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================
-- 书籍表（替代 meta.json + books.json 索引）
-- ====================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_original TEXT,
  author TEXT NOT NULL,
  description TEXT DEFAULT '',
  format TEXT NOT NULL DEFAULT 'txt',
  language TEXT NOT NULL DEFAULT 'en',
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  chapter_count INT DEFAULT 0,
  uploader_id TEXT NOT NULL,
  fork_count INT DEFAULT 0,
  pr_count INT DEFAULT 0,
  merged_pr_count INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  classification_status TEXT DEFAULT 'pending',
  ai_classification JSONB,
  cover_url TEXT,
  content_markdown TEXT DEFAULT '',
  storage_path TEXT DEFAULT '',
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_categories ON books USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);

-- ====================
-- 幂等迁移：补齐新增列（兼容已存在的旧 books 表）
-- ====================
ALTER TABLE books ADD COLUMN IF NOT EXISTS storage_path TEXT DEFAULT '';
ALTER TABLE books ADD COLUMN IF NOT EXISTS size_bytes BIGINT;

-- ====================
-- AI 优化元数据（异步任务写入）
-- ====================
ALTER TABLE books ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'idle';
--   idle / pending / done / failed
ALTER TABLE books ADD COLUMN IF NOT EXISTS ai_metadata JSONB;
ALTER TABLE books ADD COLUMN IF NOT EXISTS ai_error TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS ai_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_books_ai_status ON books(ai_status);

-- ====================
-- 用户档案（Supabase Auth 配套）
-- id 与 auth.users.id 一致；显示名 / 头像 / 简介
-- ====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access for demo" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- ====================
-- 触发器：新 auth.users 注册时自动创建 profile
-- ====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================
-- 章节表（章节元数据）
-- ====================
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  index INT NOT NULL,
  title TEXT,
  word_count INT DEFAULT 0,
  UNIQUE(book_id, index)
);

CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);

-- ====================
-- 学科分类表
-- ====================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT,
  parent_id TEXT,
  sort_order INT DEFAULT 99,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(featured) WHERE featured = true;

-- ====================
-- 翻译项目表（Fork）
-- ====================
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  forked_by TEXT NOT NULL,
  target_language TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  progress INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_translations_book_id ON translations(book_id);
CREATE INDEX IF NOT EXISTS idx_translations_status ON translations(status);

-- ====================
-- Pull Request 表
-- ====================
CREATE TABLE IF NOT EXISTS pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  translation_id UUID REFERENCES translations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  author_id TEXT NOT NULL,
  reviewer_id TEXT,
  chapter_ids TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  diff_snapshot JSONB DEFAULT '[]',
  review_comments JSONB DEFAULT '[]',
  merged_at TIMESTAMPTZ,
  merged_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prs_book_id ON pull_requests(book_id);
CREATE INDEX IF NOT EXISTS idx_prs_translation_id ON pull_requests(translation_id);
CREATE INDEX IF NOT EXISTS idx_prs_status ON pull_requests(status);
CREATE INDEX IF NOT EXISTS idx_prs_created_at ON pull_requests(created_at DESC);

-- ====================
-- Row Level Security (RLS) 策略
-- 演示阶段：允许所有匿名读写（后续可细化）
-- ====================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（演示阶段）
CREATE POLICY "Allow all access for demo" ON books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for demo" ON chapters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for demo" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for demo" ON translations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for demo" ON pull_requests FOR ALL USING (true) WITH CHECK (true);
