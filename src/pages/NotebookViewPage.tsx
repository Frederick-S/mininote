import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useNotebook } from '../hooks/useNotebooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Edit, ArrowLeft } from 'lucide-react';
import type { NotebookData } from '../types/database';

export function NotebookViewPage() {
  const { notebookId } = useParams<{ notebookId: string }>();
  const navigate = useNavigate();
  
  const { data: notebook, isLoading, error } = useNotebook(notebookId) as {
    data: NotebookData | null | undefined;
    isLoading: boolean;
    error: Error | null;
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/notebooks')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl">{notebook.title}</CardTitle>
                  {notebook.description && (
                    <CardDescription className="mt-2 text-base">
                      {notebook.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/notebooks/${notebookId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Created: {new Date(notebook.created_at).toLocaleDateString()}</p>
                <p>Last updated: {new Date(notebook.updated_at).toLocaleDateString()}</p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Pages</h3>
                <p className="text-sm text-muted-foreground">
                  Page management will be implemented in the next task.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
