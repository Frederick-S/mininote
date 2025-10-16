import { useState } from 'react';
import { PageTree } from './PageTree';
import { useMovePage, usePagesHierarchy } from '@/hooks/usePages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface PageTreeExampleProps {
  notebookId: string;
}

/**
 * Example component demonstrating PageTree usage
 * 
 * Features demonstrated:
 * - Hierarchical page display with nested structure
 * - Expand/collapse functionality for parent pages
 * - Drag-and-drop page reorganization
 * - Page selection and navigation
 * - Integration with useMovePage hook
 */
export function PageTreeExample({ notebookId }: PageTreeExampleProps) {
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>();
  const { data: pages, isLoading, error } = usePagesHierarchy(notebookId);
  const movePage = useMovePage();

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
    console.log('Selected page:', pageId);
    // Navigate to page or load page content here
  };

  const handlePageMove = async (pageId: string, newParentId: string | null) => {
    try {
      await movePage.mutateAsync({
        id: pageId,
        parent_page_id: newParentId,
      });
      console.log(`Moved page ${pageId} to parent ${newParentId}`);
    } catch (error) {
      console.error('Failed to move page:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Pages</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Page Tree */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Page Hierarchy</CardTitle>
          <CardDescription>
            Click to select, drag to reorganize pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PageTree
            pages={pages || []}
            selectedPageId={selectedPageId}
            onPageSelect={handlePageSelect}
            onPageMove={handlePageMove}
            className="h-[600px]"
          />
        </CardContent>
      </Card>

      {/* Selected Page Info */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Page</CardTitle>
          <CardDescription>
            Page details and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedPageId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">Page ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {selectedPageId}
                </code>
              </div>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Edit Page
                </Button>
                <Button className="w-full" variant="outline">
                  View Details
                </Button>
                <Button className="w-full" variant="outline">
                  Move Page
                </Button>
                <Button className="w-full" variant="destructive">
                  Delete Page
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a page to view details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
