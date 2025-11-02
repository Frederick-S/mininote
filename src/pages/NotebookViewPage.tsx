import { useState, useMemo, useRef } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { useNotebook } from '../hooks/useNotebooks';
import { usePagesHierarchy } from '../hooks/usePages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { BookOpen, Edit, ArrowLeft, Plus, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { PageTree } from '../components/page/PageTree';
import { PageCreator } from '../components/page/PageCreator';
import { PageEditor } from '../components/page/PageEditor';
import { PageDeleteDialog } from '../components/page/PageDeleteDialog';
import { VersionHistory } from '../components/page/VersionHistory';
import { useCodeBlockCopyButtons } from '../components/page/CodeBlockCopyButton';
import { renderMathInHtml } from '../utils/mathRenderer';
import type { NotebookData, PageData } from '../types/database';

export function NotebookViewPage() {
  const { notebookId, pageId } = useParams<{ notebookId: string; pageId?: string }>();
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isEditMode = location.endsWith('/edit');

  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Use URL params as the source of truth for selected page and edit mode
  const selectedPageId = pageId;
  const isEditing = isEditMode;

  const { data: notebook, isLoading, error } = useNotebook(notebookId) as {
    data: NotebookData | null | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const { data: pages, isLoading: pagesLoading } = usePagesHierarchy(notebookId);

  const flattenPages = (pageList: any[]): PageData[] => {
    const result: PageData[] = [];
    pageList.forEach((p) => {
      result.push(p);
      if (p.children && p.children.length > 0) {
        result.push(...flattenPages(p.children));
      }
    });
    return result;
  };

  const selectedPage = pages ? flattenPages(pages).find((p: PageData) => p.id === selectedPageId) : undefined;

  // Convert markdown to HTML for display
  const pageContentHtml = useMemo(() => {
    if (!selectedPage?.content) return '';
    const html = marked(selectedPage.content, { async: false }) as string;
    return renderMathInHtml(html);
  }, [selectedPage?.content]);

  // Add copy buttons to code blocks in view mode
  useCodeBlockCopyButtons(contentRef, selectedPage?.id);

  const handlePageSelect = (pageId: string) => {
    navigate(`/notebooks/${notebookId}/pages/${pageId}`);
    setShowVersionHistory(false);
  };

  const handlePageCreated = (pageId: string) => {
    navigate(`/notebooks/${notebookId}/pages/${pageId}/edit`);
  };

  const handlePageDeleted = () => {
    navigate(`/notebooks/${notebookId}`);
    setShowDeleteDialog(false);
  };

  const handleEditClick = () => {
    if (selectedPageId) {
      navigate(`/notebooks/${notebookId}/pages/${selectedPageId}/edit`);
    }
  };

  const handleCancelEdit = () => {
    if (selectedPageId) {
      navigate(`/notebooks/${notebookId}/pages/${selectedPageId}`);
    }
  };

  const handleSaveSuccess = () => {
    if (selectedPageId) {
      navigate(`/notebooks/${notebookId}/pages/${selectedPageId}`);
    }
  };

  if (!notebookId) {
    return <Navigate to="/notebooks" replace />;
  }

  if (isLoading) {
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

  if (error || !notebook) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Notebook</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Notebook not found'}
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
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

          {/* Notebook Metadata */}
          <Card>
            <CardContent className="py-3">
              <div className="text-sm text-muted-foreground flex items-center gap-6">
                <span>Created: {new Date(notebook.created_at).toLocaleDateString()}</span>
                <span>Last updated: {new Date(notebook.updated_at).toLocaleDateString()}</span>
                <span>Total pages: {pages ? flattenPages(pages).length : 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {pagesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : pages && pages.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Page Tree */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Pages</CardTitle>
                  <CardDescription>
                    Click to view, drag to reorganize
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PageTree
                    pages={pages}
                    selectedPageId={selectedPageId}
                    onPageSelect={handlePageSelect}
                    className="max-h-[600px] overflow-y-auto"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Content - Page Editor/Viewer */}
            <div className="lg:col-span-2">
              {selectedPage ? (
                <>
                  <Card>
                    {!isEditing && (
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{selectedPage.title}</CardTitle>
                            <CardDescription>
                              Last updated: {new Date(selectedPage.updated_at).toLocaleString()} • Version {selectedPage.version}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={handleEditClick}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Page
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShowVersionHistory(true)}>
                                <Clock className="mr-2 h-4 w-4" />
                                Version History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Page
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                    )}
                    <CardContent className={isEditing ? 'pt-6' : ''}>
                      {isEditing ? (
                        <PageEditor
                          page={selectedPage}
                          onSuccess={handleSaveSuccess}
                          onCancel={handleCancelEdit}
                        />
                      ) : (
                        <div ref={contentRef} className="prose max-w-none">
                          {selectedPage.content ? (
                            <div dangerouslySetInnerHTML={{ __html: pageContentHtml }} />
                          ) : (
                            <p className="text-muted-foreground">No content yet. Click Edit to add content.</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Version History Dialog */}
                  <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Version History - {selectedPage.title}</DialogTitle>
                        <DialogDescription>
                          View and restore previous versions of this page
                        </DialogDescription>
                      </DialogHeader>
                      <div className="overflow-y-auto">
                        <VersionHistory
                          pageId={selectedPage.id}
                          currentVersion={selectedPage.version}
                          onVersionRestore={() => {
                            setShowVersionHistory(false);
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  {showDeleteDialog && (
                    <PageDeleteDialog
                      pageId={selectedPage.id}
                      pageTitle={selectedPage.title}
                      onSuccess={handlePageDeleted}
                      open={showDeleteDialog}
                      onOpenChange={setShowDeleteDialog}
                    />
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No page selected</p>
                      <p className="text-sm mt-2">
                        Select a page from the list to view or edit
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium mb-2">No pages yet</p>
                <p className="text-sm mb-4">
                  Create your first page to get started
                </p>
                <PageCreator
                  notebookId={notebookId}
                  onSuccess={handlePageCreated}
                  trigger={
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Page
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
