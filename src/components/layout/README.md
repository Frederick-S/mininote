# Layout Components

This directory contains the core navigation and layout components for Mini Note.

## Components

### AppLayout

The main layout wrapper that provides consistent structure across the application.

**Props:**
- `children: ReactNode` - The main content to display
- `notebookId?: string` - Current notebook ID for breadcrumb navigation
- `pageId?: string` - Current page ID for breadcrumb navigation
- `className?: string` - Additional CSS classes for the main content area
- `showBreadcrumb?: boolean` - Whether to show breadcrumb navigation (default: true)

**Usage:**
```tsx
import { AppLayout } from '@/components/layout';

function NotebookPage() {
  return (
    <AppLayout notebookId="123" showBreadcrumb>
      <div>Your content here</div>
    </AppLayout>
  );
}
```

### Sidebar

A responsive sidebar that displays the notebook tree and user information.

**Features:**
- Desktop: Fixed sidebar on the left (hidden on mobile)
- Mobile: Hamburger menu that opens a drawer
- Displays all user notebooks in a tree structure
- "New Notebook" button
- User email and sign-out button at the bottom

**Props:**
- `className?: string` - Additional CSS classes
- `selectedNotebookId?: string` - Currently selected notebook ID
- `selectedPageId?: string` - Currently selected page ID

**Usage:**
```tsx
import { Sidebar } from '@/components/layout';

<Sidebar 
  selectedNotebookId="notebook-123"
  selectedPageId="page-456"
/>
```

### NotebookTree

Displays a single notebook with its hierarchical page structure.

**Features:**
- Collapsible notebook with expand/collapse icon
- Nested page hierarchy with unlimited depth
- Visual indicators for selected notebook/page
- Automatic loading of pages when notebook is expanded

**Props:**
- `notebook: NotebookData` - The notebook to display
- `selectedNotebookId?: string` - Currently selected notebook ID
- `selectedPageId?: string` - Currently selected page ID

**Usage:**
```tsx
import { NotebookTree } from '@/components/layout';

<NotebookTree
  notebook={notebookData}
  selectedNotebookId="notebook-123"
  selectedPageId="page-456"
/>
```

### BreadcrumbNav

Displays breadcrumb navigation showing the current location in the hierarchy.

**Features:**
- Home link
- Notebook name (if viewing a notebook)
- Page name (if viewing a page)
- Automatic data fetching based on IDs

**Props:**
- `notebookId?: string` - Current notebook ID
- `pageId?: string` - Current page ID

**Usage:**
```tsx
import { BreadcrumbNav } from '@/components/layout';

<BreadcrumbNav notebookId="notebook-123" pageId="page-456" />
```

## Dependencies

These components use the following shadcn/ui components:
- `Button` - For interactive elements
- `ScrollArea` - For scrollable content
- `Separator` - For visual dividers
- `Sheet` - For mobile drawer
- `Collapsible` - For expandable tree items
- `Breadcrumb` - For navigation breadcrumbs

## Responsive Design

The layout is fully responsive:
- **Desktop (md and up)**: Fixed sidebar on the left, main content on the right
- **Mobile**: Hamburger menu button that opens a drawer with the sidebar content

## Integration with Routing

These components are designed to work with React Router:
- Use `Link` components for navigation
- Accept `notebookId` and `pageId` props to highlight current location
- Breadcrumbs automatically fetch data based on route parameters

## State Management

The components integrate with:
- `useNotebooks` hook - Fetches user's notebooks
- `usePagesHierarchy` hook - Fetches pages in hierarchical structure
- `useAuthStore` - Accesses user information and sign-out functionality

## Styling

All components use Tailwind CSS for styling and follow the design system:
- Consistent spacing and typography
- Hover states and transitions
- Accessible color contrast
- Dark mode support (via Tailwind)
