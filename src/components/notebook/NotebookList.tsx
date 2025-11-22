import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Grid3x3, List, MoreVertical, Trash2, Edit, Calendar, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useNotebooks, useDeleteNotebook } from '../../hooks/useNotebooks';
import { NotebookDeleteDialog } from './NotebookDeleteDialog.js';
import type { NotebookData } from '../../types/database';
import { cn } from '../../lib/utils';

type ViewMode = 'grid' | 'list';

interface NotebookListProps {
  onSelectNotebook?: (notebookId: string) => void;
  showHeaderOnly?: boolean;
}

// Shared state for view mode across instances
let sharedViewMode: ViewMode = 'grid';
const viewModeListeners: Set<(mode: ViewMode) => void> = new Set();

export function NotebookList({ onSelectNotebook, showHeaderOnly }: NotebookListProps) {
  const navigate = useNavigate();
  const [viewMode, setViewModeState] = useState<ViewMode>(sharedViewMode);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<NotebookData | null>(null);

  const setViewMode = (mode: ViewMode) => {
    sharedViewMode = mode;
    setViewModeState(mode);
    viewModeListeners.forEach(listener => listener(mode));
  };

  // Subscribe to view mode changes
  useState(() => {
    const listener = (mode: ViewMode) => setViewModeState(mode);
    viewModeListeners.add(listener);
    return () => {
      viewModeListeners.delete(listener);
    };
  });

  // If showing header only, just render the controls (no data fetching needed)
  if (showHeaderOnly) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button onClick={() => navigate('/notebooks/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Notebook
        </Button>
      </div>
    );
  }
  
  const { data: notebooks, isLoading, error } = useNotebooks() as {
    data: NotebookData[] | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  const deleteNotebook = useDeleteNotebook();

  const handleNotebookClick = (notebookId: string) => {
    if (onSelectNotebook) {
      onSelectNotebook(notebookId);
    } else {
      navigate(`/notebooks/${notebookId}`);
    }
  };

  const handleDeleteClick = (notebook: NotebookData, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotebookToDelete(notebook);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (notebookToDelete) {
      await deleteNotebook.mutateAsync(notebookToDelete.id);
      setDeleteDialogOpen(false);
      setNotebookToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading notebooks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Notebooks</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!notebooks || notebooks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Notebooks Yet</CardTitle>
            <CardDescription>
              Create your first notebook to start organizing your notes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Notebooks Display */}
      <div
        className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        )}
      >
        {notebooks.map((notebook) => (
          <Card
            key={notebook.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              viewMode === 'list' && 'flex flex-row items-center'
            )}
            onClick={() => handleNotebookClick(notebook.id)}
          >
            {viewMode === 'grid' ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{notebook.title}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/notebooks/${notebook.id}/edit`);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(notebook, e)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {notebook.description && (
                    <CardDescription className="line-clamp-2">
                      {notebook.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Updated {formatDate(notebook.updated_at)}</span>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-between w-full p-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{notebook.title}</h3>
                    {notebook.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {notebook.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated {formatDate(notebook.updated_at)}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/notebooks/${notebook.id}/edit`);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDeleteClick(notebook, e)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <NotebookDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        notebook={notebookToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteNotebook.isPending}
      />
    </div>
  );
}
