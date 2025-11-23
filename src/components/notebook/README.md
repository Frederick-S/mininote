# Notebook Management Components

This directory contains components for managing notebooks in Mini Note.

## Components

### NotebookList
Displays a list of all user notebooks with grid/list view toggle.

**Features:**
- Grid and list view modes
- Notebook cards with title, description, and last updated date
- Dropdown menu for edit and delete actions
- Empty state with call-to-action
- Loading and error states
- Responsive design

**Props:**
- `onSelectNotebook?: (notebookId: string) => void` - Optional callback when a notebook is selected

### NotebookCreator
Form component for creating new notebooks.

**Features:**
- Title input with validation (required, max 100 characters)
- Description textarea (optional, max 500 characters)
- Form validation using React Hook Form + Zod
- Optimistic updates with React Query
- Error handling and display
- Loading states during submission
- Cancel button to navigate back

**Props:**
- `onSuccess?: (notebookId: string) => void` - Optional callback on successful creation
- `onCancel?: () => void` - Optional callback when cancel is clicked

### NotebookEditor
Form component for editing existing notebooks.

**Features:**
- Pre-populated form with existing notebook data
- Same validation as NotebookCreator
- Loading state while fetching notebook data
- Error handling for missing notebooks
- Optimistic updates
- Cancel button to navigate back

**Props:**
- `notebookId: string` - ID of the notebook to edit
- `onSuccess?: () => void` - Optional callback on successful update
- `onCancel?: () => void` - Optional callback when cancel is clicked

### NotebookDeleteDialog
Confirmation dialog for deleting notebooks.

**Features:**
- Alert dialog with warning message
- Shows notebook title in confirmation message
- Disabled state during deletion
- Cancel and confirm actions

**Props:**
- `open: boolean` - Controls dialog visibility
- `onOpenChange: (open: boolean) => void` - Callback for dialog state changes
- `notebook: NotebookData | null` - Notebook to delete
- `onConfirm: () => void` - Callback when delete is confirmed
- `isDeleting: boolean` - Loading state during deletion

## Pages

### NotebooksPage
Main page displaying all notebooks with a header and create button.

### NotebookCreatePage
Page wrapper for the NotebookCreator component.

### NotebookEditPage
Page wrapper for the NotebookEditor component with route parameter handling.

### NotebookViewPage
Page for viewing a single notebook with edit button and metadata display.

## Usage

```tsx
import { NotebookList, NotebookCreator, NotebookEditor } from '@/components/notebook';

// Display all notebooks
<NotebookList />

// Create a new notebook
<NotebookCreator 
  onSuccess={(id) => navigate(`/notebooks/${id}`)}
  onCancel={() => navigate('/notebooks')}
/>

// Edit an existing notebook
<NotebookEditor 
  notebookId="123"
  onSuccess={() => navigate('/notebooks')}
/>
```

## Routes

The following routes are configured in App.tsx:

- `/notebooks` - List all notebooks
- `/notebooks/new` - Create a new notebook
- `/notebooks/:notebookId` - View a specific notebook
- `/notebooks/:notebookId/edit` - Edit a specific notebook

## Dependencies

- React Hook Form - Form state management
- Zod - Schema validation
- React Router - Navigation
- React Query - Data fetching and caching
- shadcn/ui - UI components (Card, Button, Form, Input, Textarea, Dialog, AlertDialog)
- Lucide React - Icons

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 2.1**: Display list of notebooks when user is authenticated
- **Requirement 2.2**: Provide form to create notebooks with name and description
- **Requirement 2.3**: Create notebook and add to user's collection
- **Requirement 2.5**: Delete notebook with confirmation dialog

## Notes

- All forms use Zod validation for type-safe input validation
- Optimistic updates provide instant feedback to users
- Error states are handled gracefully with user-friendly messages
- Components are fully responsive and work on mobile devices
- Grid/list view preference could be persisted to localStorage in future enhancement
