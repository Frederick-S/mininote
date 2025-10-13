-- ============================================
-- Supabase Database Setup for Web Note App
-- ============================================
-- This script sets up the complete database schema, RLS policies,
-- triggers, and storage configuration for the note-taking application.
--
-- INSTRUCTIONS:
-- 1. Create a new Supabase project at https://supabase.com
-- 2. Go to SQL Editor in your Supabase dashboard
-- 3. Copy and paste this entire script
-- 4. Execute the script
-- 5. Copy your project URL and anon key to .env file
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- TABLES
-- ============================================

-- Notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  parent_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  searchable_content TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Page versions table
CREATE TABLE IF NOT EXISTS page_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_notebook_id ON pages(notebook_id);
CREATE INDEX IF NOT EXISTS idx_pages_parent_page_id ON pages(parent_page_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_attachments_page_id ON attachments(page_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_pages_searchable_content ON pages USING GIN(searchable_content);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update searchable_content for full-text search
CREATE OR REPLACE FUNCTION update_searchable_content()
RETURNS TRIGGER AS $$
BEGIN
  NEW.searchable_content := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update searchable_content on insert/update
DROP TRIGGER IF EXISTS pages_searchable_content_update ON pages;
CREATE TRIGGER pages_searchable_content_update
  BEFORE INSERT OR UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_searchable_content();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at for notebooks
DROP TRIGGER IF EXISTS notebooks_updated_at ON notebooks;
CREATE TRIGGER notebooks_updated_at
  BEFORE UPDATE ON notebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger to update updated_at for pages
DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can create their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can update their own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can delete their own notebooks" ON notebooks;

DROP POLICY IF EXISTS "Users can view their own pages" ON pages;
DROP POLICY IF EXISTS "Users can create their own pages" ON pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON pages;
DROP POLICY IF EXISTS "Users can delete their own pages" ON pages;

DROP POLICY IF EXISTS "Users can view their own page versions" ON page_versions;
DROP POLICY IF EXISTS "Users can create their own page versions" ON page_versions;

DROP POLICY IF EXISTS "Users can view their own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can create their own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON attachments;

-- Notebooks policies
CREATE POLICY "Users can view their own notebooks"
  ON notebooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notebooks"
  ON notebooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notebooks"
  ON notebooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notebooks"
  ON notebooks FOR DELETE
  USING (auth.uid() = user_id);

-- Pages policies
CREATE POLICY "Users can view their own pages"
  ON pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pages"
  ON pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages"
  ON pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages"
  ON pages FOR DELETE
  USING (auth.uid() = user_id);

-- Page versions policies
CREATE POLICY "Users can view their own page versions"
  ON page_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own page versions"
  ON page_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Attachments policies
CREATE POLICY "Users can view their own attachments"
  ON attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attachments"
  ON attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attachments"
  ON attachments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE SETUP
-- ============================================
-- Note: Storage bucket and policies must be created through Supabase Dashboard
-- or using the Supabase Management API. The SQL below is for reference.
--
-- To set up storage:
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create a new bucket named "user-files"
-- 3. Set it as Private (not public)
-- 4. Add the following policies in the Storage Policies section:
--
-- Policy 1: "Users can upload their own files"
--   Operation: INSERT
--   Policy definition:
--   bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 2: "Users can view their own files"
--   Operation: SELECT
--   Policy definition:
--   bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 3: "Users can delete their own files"
--   Operation: DELETE
--   Policy definition:
--   bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- ============================================

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries to verify the setup:

-- Check tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Check triggers
-- SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Your database is now ready!
-- Next steps:
-- 1. Set up the storage bucket (see STORAGE SETUP section above)
-- 2. Copy your Supabase URL and anon key to your .env file
-- 3. Start building your application!
-- ============================================
