# Data Access Hooks

This directory contains React hooks for data access operations using TanStack Query (React Query) with Supabase.

## Overview

All hooks implement:
- **Optimistic updates**: UI updates immediately before server confirmation
- **Automatic caching**: Data is cached and reused across components
- **Error handling**: Errors are thrown and can be caught by error boundaries
- **Loading states**: Built-in loading and error states
- **Automatic refetching**: Data is refetched when it becomes stale

## Notebook Hooks

### `useNotebooks(filters?)`
Fetches all notebooks for the current user with optional filtering and sorting.

```typescript
const { data: notebooks, isLoading, error } = useNotebooks({
  search: 'project',
  sortBy: 'updated_at',
  sortOrder: 'desc'
});
```

### `useNotebook(notebookId)`
Fetches a single notebook by ID.

```typescript
const { data: notebook, isLoading } = useNotebook('notebook-id');
```

### `useCreateNotebook()`
Creates a new notebook with optimistic updates.

```typescript
const createNotebook = useCreateNotebook();

createNotebook.mutate({
  title: 'My Notebook',
  description: 'Optional description'
});
```

### `useUpdateNotebook()`
Updates an existing notebook.

```typescript
const updateNotebook = useUpdateNotebook();

updateNotebook.mutate({
  id: 'notebook-id',
  title: 'Updated Title'
});
```

### `useDeleteNotebook()`
Deletes a notebook and all its pages.

```typescript
const deleteNotebook = useDeleteNotebook();

deleteNotebook.mutate('notebook-id');
```

## Page Hooks

### `usePages(notebookId, filters?)`
Fetches all pages for a notebook with optional filtering.

```typescript
const { data: pages, isLoading } = usePages('notebook-id', {
  parentPageId: null, // Only root pages
  search: 'query',
  sortBy: 'title'
});
```

### `usePage(pageId)`
Fetches a single page by ID.

```typescript
const { data: page, isLoading } = usePage('page-id');
```

### `usePagesHierarchy(notebookId)`
Fetches pages in a hierarchical tree structure.

```typescript
const { data: hierarchy, flatPages } = usePagesHierarchy('notebook-id');
// hierarchy: PageWithChildren[] (nested structure)
// flatPages: PageData[] (flat list)
```

### `useChildPages(parentPageId)`
Fetches direct children of a parent page.

```typescript
const { data: children } = useChildPages('parent-page-id');
```

### `useCreatePage()`
Creates a new page with optimistic updates.

```typescript
const createPage = useCreatePage();

createPage.mutate({
  title: 'New Page',
  content: '# Hello',
  notebook_id: 'notebook-id',
  parent_page_id: 'parent-id' // Optional
});
```

### `useUpdatePage()`
Updates a page and increments its version.

```typescript
const updatePage = useUpdatePage();

updatePage.mutate({
  id: 'page-id',
  title: 'Updated Title',
  content: 'Updated content'
});
```

### `useMovePage()`
Moves a page to a different parent or notebook.

```typescript
const movePage = useMovePage();

movePage.mutate({
  id: 'page-id',
  parent_page_id: 'new-parent-id',
  notebook_id: 'new-notebook-id'
});
```

### `useDeletePage()`
Deletes a page and all its children.

```typescript
const deletePage = useDeletePage();

deletePage.mutate('page-id');
```

## Page Version Hooks

### `usePageVersions(pageId)`
Fetches all versions of a page, sorted by version number (descending).

```typescript
const { data: versions } = usePageVersions('page-id');
```

### `usePageVersion(versionId)`
Fetches a specific version by ID.

```typescript
const { data: version } = usePageVersion('version-id');
```

### `useCreatePageVersion()`
Creates a new version snapshot of a page.

```typescript
const createVersion = useCreatePageVersion();

createVersion.mutate({
  page_id: 'page-id',
  title: 'Page Title',
  content: 'Page content',
  version: 2
});
```

### `useRestorePageVersion()`
Restores a page to a previous version.

```typescript
const restoreVersion = useRestorePageVersion();

restoreVersion.mutate({
  page_id: 'page-id',
  version_id: 'version-id'
});
```

### `useComparePageVersions(versionId1, versionId2)`
Fetches two versions for comparison.

```typescript
const { data } = useComparePageVersions('version-1-id', 'version-2-id');
// data: { version1: PageVersionData, version2: PageVersionData }
```

### `useDeletePageVersions()`
Deletes old versions, keeping only the latest N versions.

```typescript
const deleteVersions = useDeletePageVersions();

deleteVersions.mutate({
  page_id: 'page-id',
  keep_latest: 10 // Keep 10 most recent versions
});
```

## Attachment Hooks

### `useAttachments(pageId)`
Fetches all attachments for a page.

```typescript
const { data: attachments } = useAttachments('page-id');
```

### `useAttachment(attachmentId)`
Fetches a single attachment by ID.

```typescript
const { data: attachment } = useAttachment('attachment-id');
```

### `useUploadAttachment()`
Uploads a file and creates an attachment record.

```typescript
const uploadAttachment = useUploadAttachment();

uploadAttachment.mutate({
  file: fileObject,
  page_id: 'page-id'
});
```

### `useAttachmentUrl(storagePath)`
Gets a public URL for an attachment.

```typescript
const { data: url } = useAttachmentUrl('storage/path/to/file.jpg');
```

### `useDownloadAttachment()`
Downloads an attachment file.

```typescript
const downloadAttachment = useDownloadAttachment();

const blob = await downloadAttachment.mutateAsync('storage/path');
```

### `useDeleteAttachment()`
Deletes an attachment and its file from storage.

```typescript
const deleteAttachment = useDeleteAttachment();

deleteAttachment.mutate('attachment-id');
```

### `useDeletePageAttachments()`
Deletes all attachments for a page.

```typescript
const deletePageAttachments = useDeletePageAttachments();

deletePageAttachments.mutate('page-id');
```

### `useBatchUploadAttachments()`
Uploads multiple files at once.

```typescript
const batchUpload = useBatchUploadAttachments();

batchUpload.mutate({
  files: [file1, file2, file3],
  page_id: 'page-id'
});
```

## Usage Example

```typescript
import { useNotebooks, useCreateNotebook } from '@/hooks';

function NotebookList() {
  const { data: notebooks, isLoading, error } = useNotebooks();
  const createNotebook = useCreateNotebook();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleCreate = () => {
    createNotebook.mutate({
      title: 'New Notebook',
      description: 'My new notebook'
    }, {
      onSuccess: (notebook) => {
        console.log('Created:', notebook);
      },
      onError: (error) => {
        console.error('Failed:', error);
      }
    });
  };

  return (
    <div>
      <button onClick={handleCreate}>Create Notebook</button>
      {notebooks?.map(notebook => (
        <div key={notebook.id}>{notebook.title}</div>
      ))}
    </div>
  );
}
```

## Setup

Wrap your app with the QueryProvider:

```typescript
import { QueryProvider } from '@/lib/queryClient';

function App() {
  return (
    <QueryProvider>
      <YourApp />
    </QueryProvider>
  );
}
```

## Error Handling

All hooks throw errors that can be caught by React error boundaries or handled in the component:

```typescript
const { data, error } = useNotebooks();

if (error) {
  // Handle error
  console.error(error);
}
```

For mutations, use the `onError` callback:

```typescript
createNotebook.mutate(data, {
  onError: (error) => {
    // Handle error
    toast.error(error.message);
  }
});
```
