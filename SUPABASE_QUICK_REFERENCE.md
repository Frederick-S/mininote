# Supabase Quick Reference

Quick reference for common Supabase operations and configurations.

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `notebooks` | User's notebook collections | id, title, description, user_id |
| `pages` | Individual pages within notebooks | id, title, content, notebook_id, parent_page_id |
| `page_versions` | Version history for pages | id, page_id, content, version |
| `attachments` | File metadata for uploads | id, filename, storage_path, page_id |

## Storage Structure

```
user-files/
└── {user_id}/
    └── {page_id}/
        └── {filename}
```

## Common SQL Queries

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Check Policies
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Triggers
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

### Check Indexes
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Test Full-Text Search
```sql
SELECT title, content, ts_rank(searchable_content, query) as rank
FROM pages, to_tsquery('english', 'your search term') query
WHERE searchable_content @@ query
ORDER BY rank DESC;
```

## Storage Bucket Configuration

**Bucket Name:** `user-files`  
**Public:** No (Private)  
**File Size Limit:** 50 MB (recommended)

### Storage Policy Template

```sql
-- For INSERT operations
bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]

-- For SELECT operations
bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]

-- For DELETE operations
bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]
```

## Authentication Settings

### Email Auth (Development)
- Enable email confirmations: OFF (for testing)
- Auto-confirm users: ON (for testing)

### Email Auth (Production)
- Enable email confirmations: ON
- Enable email change confirmations: ON
- Secure email change: ON

## RLS Policy Pattern

All tables follow this pattern:

```sql
-- SELECT: Users can view their own data
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can create their own data
CREATE POLICY "policy_name" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own data
CREATE POLICY "policy_name" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Users can delete their own data
CREATE POLICY "policy_name" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
```

## Useful Dashboard Links

When in your Supabase project:

- **SQL Editor:** `/project/{project-id}/sql`
- **Table Editor:** `/project/{project-id}/editor`
- **Authentication:** `/project/{project-id}/auth/users`
- **Storage:** `/project/{project-id}/storage/buckets`
- **API Settings:** `/project/{project-id}/settings/api`
- **Database Settings:** `/project/{project-id}/settings/database`

## Verification Commands

### Test Connection (Node.js)
```bash
npm run verify-supabase
```

### Test in Browser Console
```javascript
// After app loads
const { data, error } = await supabase.from('notebooks').select('count');
console.log('Connection test:', error ? 'Failed' : 'Success');
```

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `PGRST116` | No rows returned | Normal - table is empty |
| `PGRST301` | JWT expired | Re-authenticate user |
| `42P01` | Table doesn't exist | Run setup SQL script |
| `42501` | Insufficient privilege | Check RLS policies |
| `23503` | Foreign key violation | Check referenced records exist |

## TypeScript Types

```typescript
import { Database } from './src/lib/supabase';

type Notebook = Database['public']['Tables']['notebooks']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];
type PageVersion = Database['public']['Tables']['page_versions']['Row'];
type Attachment = Database['public']['Tables']['attachments']['Row'];
```

## Helpful Resources

- [Supabase Docs](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Full-Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## Support

If you encounter issues:
1. Check [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) troubleshooting section
2. Review Supabase project logs in dashboard
3. Check browser console for client-side errors
4. Verify environment variables are loaded correctly

---

**Quick Start:** Run `npm run verify-supabase` to check your setup status.
