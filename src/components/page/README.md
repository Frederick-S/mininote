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

### PageTree
A hierarchical tree component for displaying and managing pages with drag-and-drop support.

**Features:**
- Nested tree structure with unlimited depth
- Expand/collapse functionality for parent pages
- Drag-and-drop page reorganization
- Page selection and navigation
- Visual feedback for selected pages
- Prevents circular references during drag-and-drop
- Responsive and accessible

**Usage:**
```tsx
import { PageTree } from '@/components/page';
import { usePagesHierarchy, useMovePage } from '@/hooks/usePages';

function MyComponent({ notebookId }) {
  const { data: pages } = usePagesHierarchy(notebookId);
  const movePage = useMovePage();
  const [selectedPageId, setSelectedPageId] = useState<string>();

  const handlePageMove = async (pageId: string, newParentId: string | null) => {
    await movePage.mutateAsync({
      id: pageId,
      parent_page_id: newParentId,
    });
  };

  return (
    <PageTree
      pages={pages || []}
      selectedPageId={selectedPageId}
      onPageSelect={setSelectedPageId}
      onPageMove={handlePageMove}
      className="h-[600px]"
    />
  );
}
```

**Props:**
- `pages`: Array of `PageWithChildren` objects (hierarchical structure)
- `selectedPageId`: ID of currently selected page (optional)
- `onPageSelect`: Callback when a page is clicked
- `onPageMove`: Callback when a page is dragged and dropped
- `className`: Additional CSS classes

## Requirements Covered

These components implement the following requirements:

- **Requirement 3.1**: Page creation with parent page selection
- **Requirement 3.2**: Hierarchical page structure support (PageTree)
- **Requirement 3.3**: Nested tree structure display (PageTree)
- **Requirement 3.4**: Page reorganization with drag-and-drop (PageTree, PageMoveDialog)
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
