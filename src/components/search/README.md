# Search Components

This directory contains the search UI components for Mini Note.

## Components

### SearchBar

A search input component with scope selection (all notebooks vs current notebook).

**Features:**
- Text input with search icon
- Clear button when text is entered
- Scope selector (All Notebooks / Current Notebook)
- Enter key support for quick search
- Disabled state when query is empty

**Props:**
- `onSearch`: Callback function called when search is triggered
- `currentNotebookId`: Optional ID of the current notebook
- `currentNotebookTitle`: Optional title of the current notebook
- `placeholder`: Optional placeholder text
- `className`: Optional CSS class name

**Usage:**
```tsx
<SearchBar
  onSearch={(query, scope, notebookId) => {
    // Handle search
  }}
  currentNotebookId="notebook-123"
  currentNotebookTitle="My Notebook"
/>
```

### SearchResults

Displays search results with highlighting and pagination support.

**Features:**
- Loading state with spinner
- Empty state message
- Result cards with highlighting
- Snippet preview
- Highlight badges
- Load more button for pagination
- Scrollable results area

**Props:**
- `results`: Array of search results
- `query`: The search query string
- `isLoading`: Loading state flag
- `hasMore`: Whether more results are available
- `onLoadMore`: Callback for loading more results
- `onResultClick`: Callback when a result is clicked
- `className`: Optional CSS class name

**Usage:**
```tsx
<SearchResults
  results={searchResults}
  query="test query"
  isLoading={false}
  hasMore={true}
  onLoadMore={() => {
    // Load more results
  }}
  onResultClick={(result) => {
    // Navigate to result
  }}
/>
```

### SearchDialog

A complete search dialog that combines SearchBar and SearchResults with navigation.

**Features:**
- Modal dialog with search interface
- Keyboard shortcut (Cmd/Ctrl + K)
- Automatic navigation to selected results
- State management for search
- Pagination support
- Resets state when closed

**Props:**
- `currentNotebookId`: Optional ID of the current notebook
- `currentNotebookTitle`: Optional title of the current notebook
- `trigger`: Optional custom trigger element

**Usage:**
```tsx
// With default trigger
<SearchDialog
  currentNotebookId="notebook-123"
  currentNotebookTitle="My Notebook"
/>

// With custom trigger
<SearchDialog
  trigger={<Button>Custom Search Button</Button>}
/>
```

## Search Service Integration

The components use the `searchService` from `src/lib/searchService.ts` which provides:

- Full-text search across pages
- Scope filtering (all notebooks or specific notebook)
- Result highlighting
- Snippet generation
- Pagination support

## Keyboard Shortcuts

- **Cmd/Ctrl + K**: Open search dialog
- **Enter**: Trigger search from input
- **Escape**: Close search dialog

## Styling

All components use shadcn/ui components and Tailwind CSS for styling, ensuring consistency with the rest of the application.

## Testing

Unit tests are available in the `__tests__` directory:
- `SearchBar.test.tsx`: Tests for SearchBar component
- `SearchResults.test.tsx`: Tests for SearchResults component

Run tests with:
```bash
npm test -- src/components/search/__tests__
```
