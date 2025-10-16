# Page Components

This directory contains components for managing pages within notebooks.

## Components

### PageCreator
A dialog component for creating new pages with optional parent page selection.

**Features:**
- Form validation with Zod schema
- Parent page selection with hierarchical display
- Optional initial content
- Optimistic updates

**Usage:**
```tsx
import { PageCreator } from '@/components/page';

<PageCreator
  notebookId={notebookId}
  defaultParentId={parentId}
  onSuccess={(pageId) => console.log('Created:', pageId)}
/>
```

### PageEditor
A form component for editing page title and content.

**Features:**
- Real-time form validation
- Unsaved changes indicator
- Auto-save capability
- Version increment on save

**Usage:**
```tsx
import { PageEditor } from '@/components/page';

<PageEditor
  page={pageData}
  onSuccess={() => console.log('Saved')}
/>
```

### PageDeleteDialog
An alert dialog for deleting pages with child page handling.

**Features:**
- Confirmation dialog with warnings
- Child page detection and listing
- Cascade delete warning
- Loading states

**Usage:**
```tsx
import { PageDeleteDialog } from '@/components/page';

<PageDeleteDialog
  pageId={page.id}
  pageTitle={page.title}
  onSuccess={() => navigate('/notebook')}
/>
```

### PageMoveDialog
A dialog for moving pages to different parent pages or notebooks.

**Features:**
- Parent page selection
- Prevents circular references
- Hierarchical page display
- Validation to prevent moving under descendants

**Usage:**
```tsx
import { PageMoveDialog } from '@/components/page';

<PageMoveDialog
  page={pageData}
  onSuccess={() => console.log('Moved')}
/>
```

## Requirements Covered

These components implement the following requirements:

- **Requirement 3.1**: Page creation with parent page selection
- **Requirement 3.2**: Hierarchical page structure support
- **Requirement 3.4**: Page reorganization (move functionality)
- **Requirement 3.5**: Page deletion with child page handling

## Data Flow

All components use React Query hooks from `@/hooks/usePages`:
- `useCreatePage` - Create new pages
- `useUpdatePage` - Update page content
- `useDeletePage` - Delete pages (cascade)
- `useMovePage` - Move pages to new parents
- `usePagesHierarchy` - Get hierarchical page structure
- `useChildPages` - Get child pages for deletion warnings

## Form Validation

All forms use:
- React Hook Form for form state management
- Zod for schema validation
- shadcn/ui Form components for consistent UI
