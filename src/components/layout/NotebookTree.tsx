import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, BookOpen, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Button } from '../ui/button';
import { usePagesHierarchy } from '../../hooks/usePages';
import type { NotebookData, PageWithChildren } from '../../types/database';
import { cn } from '../../lib/utils';

interface NotebookTreeProps {
  notebook: NotebookData;
  selectedNotebookId?: string;
  selectedPageId?: string;
}

export function NotebookTree({
  notebook,
  selectedNotebookId,
  selectedPageId,
}: NotebookTreeProps) {
  const [isOpen, setIsOpen] = useState(selectedNotebookId === notebook.id);
  const { data: pages, isLoading } = usePagesHierarchy(isOpen ? notebook.id : undefined);

  const isSelected = selectedNotebookId === notebook.id;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'rounded-md transition-colors',
          isSelected && 'bg-accent'
        )}
      >
        <div className="flex items-center gap-1">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <Link
            to={`/notebooks/${notebook.id}`}
            className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <BookOpen className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{notebook.title}</span>
          </Link>
        </div>
      </div>

      <CollapsibleContent>
        <div className="ml-4 mt-1 space-y-1">
          {isLoading ? (
            <div className="py-2 text-xs text-muted-foreground">Loading pages...</div>
          ) : pages && pages.length > 0 ? (
            pages.map((page) => (
              <PageTreeItem
                key={page.id}
                page={page}
                notebookId={notebook.id}
                selectedPageId={selectedPageId}
                level={0}
              />
            ))
          ) : (
            <div className="py-2 text-xs text-muted-foreground">No pages yet</div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface PageTreeItemProps {
  page: PageWithChildren;
  notebookId: string;
  selectedPageId?: string;
  level: number;
}

function PageTreeItem({ page, notebookId, selectedPageId, level }: PageTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = page.children && page.children.length > 0;
  const isSelected = selectedPageId === page.id;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'rounded-md transition-colors',
          isSelected && 'bg-accent'
        )}
        style={{ marginLeft: `${level * 12}px` }}
      >
        <div className="flex items-center gap-1">
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                {isOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-7" />
          )}
          <Link
            to={`/notebooks/${notebookId}/pages/${page.id}`}
            className="flex-1 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent transition-colors"
          >
            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-sm truncate">{page.title}</span>
          </Link>
        </div>
      </div>

      {hasChildren && (
        <CollapsibleContent>
          <div className="mt-1 space-y-1">
            {page.children!.map((childPage) => (
              <PageTreeItem
                key={childPage.id}
                page={childPage}
                notebookId={notebookId}
                selectedPageId={selectedPageId}
                level={level + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
