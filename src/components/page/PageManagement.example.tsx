/**
 * Example usage of Page Management Components
 * 
 * This file demonstrates how to use the page CRUD components together
 * in a typical notebook page management interface.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePage } from '@/hooks/usePages';
import { PageCreator } from './PageCreator';
import { PageEditor } from './PageEditor';
import { PageDeleteDialog } from './PageDeleteDialog';
import { PageMoveDialog } from './PageMoveDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Trash2, Move } from 'lucide-react';

/**
 * Example 1: Page Management Toolbar
 * Shows all CRUD operations in a toolbar
 */
export function PageManagementToolbar({ pageId, notebookId }: { pageId: string; notebookId: string }) {
  const { data: page } = usePage(pageId) as { data: any };
  const navigate = useNavigate();

  if (!page) return null;

  return (
    <div className="flex items-center gap-2 p-4 border-b">
      <h2 className="text-lg font-semibold flex-1">{page.title}</h2>
      
      {/* Create child page */}
      <PageCreator
        notebookId={notebookId}
        defaultParentId={pageId}
        onSuccess={(newPageId) => navigate(`/page/${newPageId}`)}
        trigger={
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Child Page
          </Button>
        }
      />

      {/* Move page */}
      <PageMoveDialog
        page={page}
        onSuccess={() => console.log('Page moved')}
        trigger={
          <Button variant="outline" size="sm">
            <Move className="mr-2 h-4 w-4" />
            Move
          </Button>
        }
      />

      {/* Delete page */}
      <PageDeleteDialog
        pageId={page.id}
        pageTitle={page.title}
        onSuccess={() => navigate(`/notebook/${notebookId}`)}
        trigger={
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        }
      />
    </div>
  );
}

/**
 * Example 2: Full Page Editor View
 * Complete page editing interface with all CRUD operations
 */
export function PageEditorView() {
  const { pageId } = useParams<{ pageId: string }>();
  const { data: page, isLoading } = usePage(pageId) as { data: any; isLoading: boolean };
  const _navigate = useNavigate();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!page) {
    return <div className="p-8">Page not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <PageManagementToolbar pageId={page.id} notebookId={page.notebook_id} />

      {/* Editor */}
      <div className="flex-1 overflow-auto p-8">
        <PageEditor
          page={page}
          onSuccess={() => console.log('Page saved')}
        />
      </div>
    </div>
  );
}

/**
 * Example 3: Notebook Page List with Quick Actions
 * Shows a list of pages with inline CRUD actions
 */
export function NotebookPageList({ notebookId, pages }: { notebookId: string; pages: any[] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Create new root page */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pages</h2>
        <PageCreator
          notebookId={notebookId}
          onSuccess={(pageId) => navigate(`/page/${pageId}`)}
        />
      </div>

      {/* Page list */}
      <div className="space-y-2">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {page.title}
              </CardTitle>
              <div className="flex gap-1">
                <PageCreator
                  notebookId={notebookId}
                  defaultParentId={page.id}
                  onSuccess={(newPageId) => navigate(`/page/${newPageId}`)}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                />
                <PageMoveDialog
                  page={page}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Move className="h-4 w-4" />
                    </Button>
                  }
                />
                <PageDeleteDialog
                  pageId={page.id}
                  pageTitle={page.title}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {page.content || 'No content'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 4: Simple Page Creation Flow
 * Minimal example for creating a page
 */
export function SimplePageCreation({ notebookId }: { notebookId: string }) {
  const [createdPageId, setCreatedPageId] = useState<string | null>(null);

  return (
    <div className="p-8">
      <PageCreator
        notebookId={notebookId}
        onSuccess={(pageId) => {
          setCreatedPageId(pageId);
          console.log('Created page:', pageId);
        }}
      />

      {createdPageId && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          Page created successfully! ID: {createdPageId}
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Hierarchical Page Creation
 * Create pages with parent-child relationships
 */
export function HierarchicalPageCreation({ notebookId, parentPageId }: { notebookId: string; parentPageId?: string }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {parentPageId ? 'Create Child Page' : 'Create Root Page'}
      </h3>
      
      <PageCreator
        notebookId={notebookId}
        defaultParentId={parentPageId}
        onSuccess={(pageId) => {
          console.log('Created page:', pageId);
          if (parentPageId) {
            console.log('Parent page:', parentPageId);
          }
        }}
      />
    </div>
  );
}
