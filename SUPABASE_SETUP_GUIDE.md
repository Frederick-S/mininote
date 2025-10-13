# Supabase Backend Setup Guide

This guide walks you through setting up the complete Supabase backend for the Web Note App.

## Prerequisites

- A Supabase account (sign up at https://supabase.com if you don't have one)
- The `supabase-setup.sql` file in this repository

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `web-note-app` (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project"
5. Wait for the project to be provisioned (this takes 1-2 minutes)

## Step 2: Execute Database Setup Script

1. In your Supabase project dashboard, navigate to **SQL Editor** (left sidebar)
2. Click "New query"
3. Open the `supabase-setup.sql` file from this repository
4. Copy the entire contents and paste it into the SQL Editor
5. Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
6. Verify that the script executed successfully (you should see "Success. No rows returned")

### What This Script Does

The script sets up:
- ✅ PostgreSQL extensions (uuid-ossp, pg_trgm)
- ✅ Database tables (notebooks, pages, page_versions, attachments)
- ✅ Indexes for performance optimization
- ✅ Full-text search index for pages
- ✅ Triggers for automatic timestamp updates
- ✅ Triggers for searchable content generation
- ✅ Row Level Security (RLS) policies for all tables
- ✅ User data isolation and security

## Step 3: Set Up Storage Bucket

1. In your Supabase dashboard, navigate to **Storage** (left sidebar)
2. Click "Create a new bucket"
3. Configure the bucket:
   - **Name**: `user-files`
   - **Public bucket**: Toggle OFF (keep it private)
   - **File size limit**: 50 MB (or adjust as needed)
   - **Allowed MIME types**: Leave empty to allow all types
4. Click "Create bucket"

### Configure Storage Policies

1. Click on the `user-files` bucket you just created
2. Go to the "Policies" tab
3. Click "New policy"

#### Policy 1: Users can upload their own files

- **Policy name**: `Users can upload their own files`
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **USING expression**: Leave empty
- **WITH CHECK expression**:
  ```sql
  bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]
  ```
- Click "Review" then "Save policy"

#### Policy 2: Users can view their own files

- **Policy name**: `Users can view their own files`
- **Allowed operation**: SELECT
- **Target roles**: authenticated
- **USING expression**:
  ```sql
  bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]
  ```
- **WITH CHECK expression**: Leave empty
- Click "Review" then "Save policy"

#### Policy 3: Users can delete their own files

- **Policy name**: `Users can delete their own files`
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **USING expression**:
  ```sql
  bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]
  ```
- **WITH CHECK expression**: Leave empty
- Click "Review" then "Save policy"

## Step 4: Configure Authentication

1. Navigate to **Authentication** > **Providers** in your Supabase dashboard
2. Ensure **Email** provider is enabled (it should be by default)
3. Configure email settings:
   - Go to **Authentication** > **Email Templates**
   - Customize the confirmation email template if desired
4. (Optional) Configure additional providers (Google, GitHub, etc.) if needed

### Email Confirmation Settings

1. Go to **Authentication** > **Settings**
2. Under "Email Auth", configure:
   - **Enable email confirmations**: Toggle ON (recommended for production)
   - **Enable email change confirmations**: Toggle ON
   - **Secure email change**: Toggle ON

For development, you can temporarily disable email confirmations:
- Toggle OFF "Enable email confirmations"
- This allows testing without email verification

## Step 5: Get Your Credentials

1. Navigate to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon public key**: This is your `VITE_SUPABASE_ANON_KEY`

## Step 6: Configure Environment Variables

1. In your project root, create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Save the file

⚠️ **Important**: Never commit your `.env` file to version control. It's already in `.gitignore`.

## Step 7: Verify Setup

You can verify your setup by running these queries in the SQL Editor:

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables: `attachments`, `notebooks`, `page_versions`, `pages`

### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`

### Check Policies
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

You should see 4 policies per table (SELECT, INSERT, UPDATE, DELETE)

### Check Triggers
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

Expected triggers:
- `notebooks_updated_at` on `notebooks`
- `pages_updated_at` on `pages`
- `pages_searchable_content_update` on `pages`

### Check Storage Bucket
```sql
SELECT * FROM storage.buckets WHERE name = 'user-files';
```

Should return one row with `public = false`

## Troubleshooting

### Issue: Script execution fails

**Solution**: Make sure you're running the script in a fresh project or that you've dropped existing tables first.

### Issue: Storage policies not working

**Solution**: 
- Verify the bucket name is exactly `user-files`
- Check that the policy expressions are copied correctly
- Ensure the bucket is set to private (not public)

### Issue: Authentication not working

**Solution**:
- Verify your environment variables are correct
- Check that the Supabase URL doesn't have a trailing slash
- Ensure the anon key is the public anon key, not the service role key

### Issue: RLS blocking queries

**Solution**:
- Ensure users are authenticated before making queries
- Check that the `user_id` field matches `auth.uid()`
- Verify RLS policies are created correctly

## Next Steps

Once your Supabase backend is configured:

1. ✅ Test the connection by running your React app
2. ✅ Implement authentication components (Task 3)
3. ✅ Create database access layer (Task 4)
4. ✅ Build the UI components

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [Full-Text Search Guide](https://supabase.com/docs/guides/database/full-text-search)

## Database Schema Reference

### Tables Structure

```
notebooks
├── id (UUID, PK)
├── title (TEXT)
├── description (TEXT, nullable)
├── user_id (UUID, FK -> auth.users)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

pages
├── id (UUID, PK)
├── title (TEXT)
├── content (TEXT)
├── version (INTEGER)
├── parent_page_id (UUID, FK -> pages, nullable)
├── notebook_id (UUID, FK -> notebooks)
├── user_id (UUID, FK -> auth.users)
├── searchable_content (TSVECTOR)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

page_versions
├── id (UUID, PK)
├── page_id (UUID, FK -> pages)
├── title (TEXT)
├── content (TEXT)
├── version (INTEGER)
├── user_id (UUID, FK -> auth.users)
└── created_at (TIMESTAMPTZ)

attachments
├── id (UUID, PK)
├── filename (TEXT)
├── file_type (TEXT)
├── file_size (INTEGER)
├── storage_path (TEXT)
├── page_id (UUID, FK -> pages)
├── user_id (UUID, FK -> auth.users)
└── created_at (TIMESTAMPTZ)
```

### Storage Structure

```
user-files/
└── {user_id}/
    └── {page_id}/
        ├── {filename}
        └── ...
```

---

**Setup Complete!** 🎉

Your Supabase backend is now fully configured and ready for development.
