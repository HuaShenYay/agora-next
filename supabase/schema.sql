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
-- 按上传者查询（我的上传 / 计数）
CREATE INDEX IF NOT EXISTS idx_books_uploader_id ON books(uploader_id);
-- 搜索加速（精确/前缀匹配；ilike 中缀匹配需 pg_trgm GIN 索引，见下方扩展）
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_title_original ON books(title_original);

-- pg_trgm 扩展：加速 ilike 中缀搜索（title / author / title_original）
-- 若 Supabase 项目未启用该扩展，下方语句会失败；可手动在 Dashboard SQL Editor 执行。
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING GIN(author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_title_original_trgm ON books USING GIN(title_original gin_trgm_ops);

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
-- profiles RLS：公开只读，用户只能改自己的资料
DROP POLICY IF EXISTS "Allow all access for demo" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_modify_owner" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles_modify_owner" ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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
-- 匿名用户：只读（SELECT）
-- Service Role：绕过 RLS（用于服务端写操作：上传、AI 标注）
-- ====================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;

-- 匿名只读策略（anon key 只能 SELECT）
CREATE POLICY "anon_select_books" ON books FOR SELECT USING (true);
CREATE POLICY "anon_select_chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "anon_select_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "anon_select_translations" ON translations FOR SELECT USING (true);
CREATE POLICY "anon_select_pull_requests" ON pull_requests FOR SELECT USING (true);

-- Service Role 自动绕过 RLS（无需额外策略）
-- 所有 INSERT/UPDATE/DELETE 通过 SUPABASE_SERVICE_ROLE_KEY 执行

-- ====================
-- updated_at 自动维护触发器
-- 避免依赖应用层记得手动设 updated_at
-- ====================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_books_updated_at ON books;
CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_translations_updated_at ON translations;
CREATE TRIGGER trg_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_pull_requests_updated_at ON pull_requests;
CREATE TRIGGER trg_pull_requests_updated_at
  BEFORE UPDATE ON pull_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
