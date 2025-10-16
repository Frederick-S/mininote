import { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useNotebook } from '../hooks/useNotebooks';
import { usePagesHierarchy, useMovePage } from '../hooks/usePages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Edit, ArrowLeft, Plus } from 'lucide-react';
import { PageTree } from '../components/page/PageTree';
import { PageCreator } from '../components/page/PageCreator';
import type { NotebookData } from '../types/database';

/**
 * Enhanced Notebook View Page with PageTree integration
 * 
 * This is an example implementation showing how to integrate the PageTree component
 * into a notebook view page. It demonstrates:
 * - Hierarchical page display
 * - Page selection and navigation
 * - Drag-and-drop page reorganization
 * - Page creation
 */
export function NotebookViewPageEnhanced() {
  const { notebookId } = useParams<{ notebookId: string }>();
  const navigate = useNavigate();
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>();
  
  const { data: notebook, isLoading: notebookLoading, error: notebookError } = useNotebook(notebookId) as {
    data: NotebookData | null | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const { data: pages, isLoading: pagesLoading } = usePagesHierarchy(notebookId);
  const movePage = useMovePage();

  if (!notebookId) {
    return <Navigate to="/notebooks" replace />;
  }

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
    // Navigate to page editor or viewer
    navigate(`/notebooks/${notebookId}/pages/${pageId}`);
  };

  const handlePageMove = async (pageId: string, newParentId: string | null) => {
    try {
      await movePage.mutateAsync({
        id: pageId,
        parent_page_id: newParentId,
      });
    } catch (error) {
      console.error('Failed to move page:', error);
    }
  };

  const handlePageCreated = (pageId: string) => {
    setSelectedPageId(pageId);
    navigate(`/notebooks/${notebookId}/pages/${pageId}`);
  };

  if (notebookLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading notebook...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notebookError || !notebook) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Notebook</CardTitle>
            <CardDescription>
              {notebookError instanceof Error ? notebookError.message : 'Notebook not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/notebooks')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Notebooks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notebooks')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{notebook.title}</h1>
                {notebook.description && (
                  <p className="text-sm text-muted-foreground">
                    {notebook.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PageCreator
              notebookId={notebookId}
              onSuccess={handlePageCreated}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Page
                </Button>
              }
            />
            <Button
              variant="outline"
              onClick={() => navigate(`/notebooks/${notebookId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Notebook
            </Button>
          </div>
        </div>

        {/* Page Tree */}
        <Card>
          <CardHeader>
            <CardTitle>Pages</CardTitle>
            <CardDescription>
              Click to view, drag to reorganize
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              <PageTree
                pages={pages || []}
                selectedPageId={selectedPageId}
                onPageSelect={handlePageSelect}
                onPageMove={handlePageMove}
                className="h-[500px]"
              />
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Created: {new Date(notebook.created_at).toLocaleDateString()}</p>
              <p>Last updated: {new Date(notebook.updated_at).toLocaleDateString()}</p>
              <p>Total pages: {pages?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
