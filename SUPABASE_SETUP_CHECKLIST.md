# Supabase Setup Checklist

Use this checklist to track your progress setting up the Supabase backend.

## Pre-Setup

- [ ] Have a Supabase account (sign up at https://supabase.com)
- [ ] Have the `supabase-setup.sql` file ready
- [ ] Have Node.js 18+ installed

## Step 1: Create Supabase Project

- [ ] Created new Supabase project
- [ ] Saved database password securely
- [ ] Project is fully provisioned (green status)

## Step 2: Database Setup

- [ ] Opened SQL Editor in Supabase dashboard
- [ ] Copied and pasted `supabase-setup.sql` script
- [ ] Executed script successfully
- [ ] Verified tables were created (run verification query)

### Verification Query
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
Expected: `attachments`, `notebooks`, `page_versions`, `pages`

## Step 3: Storage Bucket Setup

- [ ] Navigated to Storage section
- [ ] Created bucket named `user-files`
- [ ] Set bucket to Private (not public)
- [ ] Configured file size limit (50 MB recommended)

### Storage Policies

- [ ] Created policy: "Users can upload their own files" (INSERT)
- [ ] Created policy: "Users can view their own files" (SELECT)
- [ ] Created policy: "Users can delete their own files" (DELETE)

## Step 4: Authentication Configuration

- [ ] Verified Email provider is enabled
- [ ] Configured email confirmation settings
- [ ] (Optional) Disabled email confirmations for development
- [ ] (Optional) Set up additional auth providers

## Step 5: Get Credentials

- [ ] Copied Project URL from Settings > API
- [ ] Copied anon public key from Settings > API
- [ ] Saved credentials securely

## Step 6: Environment Variables

- [ ] Created `.env` file from `.env.example`
- [ ] Added `VITE_SUPABASE_URL` to `.env`
- [ ] Added `VITE_SUPABASE_ANON_KEY` to `.env`
- [ ] Verified `.env` is in `.gitignore`

## Step 7: Install Dependencies

- [ ] Ran `npm install` to install tsx and other dependencies
- [ ] No installation errors

## Step 8: Verify Setup

- [ ] Ran `npm run verify-supabase` script
- [ ] All checks passed ✅
- [ ] Connection successful
- [ ] All tables exist
- [ ] Storage bucket exists
- [ ] RLS configured

## Troubleshooting

If any checks fail, refer to the [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) troubleshooting section.

### Common Issues

**Connection fails:**
- Check that URL and anon key are correct
- Ensure no trailing slash in URL
- Verify project is fully provisioned

**Tables not found:**
- Re-run the SQL setup script
- Check for SQL errors in the editor

**Storage bucket not found:**
- Create bucket manually in dashboard
- Ensure name is exactly `user-files`

**RLS errors:**
- Verify policies were created
- Check policy expressions match the guide

## Next Steps

Once all items are checked:

- [ ] Proceed to Task 3: Implement authentication system
- [ ] Start building the application!

---

**Setup Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete
