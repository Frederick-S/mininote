import { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { PageWithChildren } from '@/types/database';

interface PageTreeProps {
  pages: PageWithChildren[];
  selectedPageId?: string;
  onPageSelect?: (pageId: string) => void;
  onPageMove?: (pageId: string, newParentId: string | null) => void;
  className?: string;
}

interface PageTreeItemProps {
  page: PageWithChildren;
  level: number;
  selectedPageId?: string;
  onPageSelect?: (pageId: string) => void;
  onPageMove?: (pageId: string, newParentId: string | null) => void;
  onDragStart?: (pageId: string) => void;
  onDragOver?: (e: React.DragEvent, pageId: string) => void;
  onDrop?: (e: React.DragEvent, targetPageId: string) => void;
  isDragging?: boolean;
}

function PageTreeItem({
  page,
  level,
  selectedPageId,
  onPageSelect,
  onPageMove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: PageTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = page.children && page.children.length > 0;
  const isSelected = selectedPageId === page.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPageSelect?.(page.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', page.id);
    onDragStart?.(page.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(e, page.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop?.(e, page.id);
  };

  return (
    <div
      className={cn(
        'select-none',
        isDragging && 'opacity-50'
      )}
    >
      <div
        className={cn(
          'group flex items-center gap-1 py-1 px-2 rounded-md hover:bg-accent cursor-pointer transition-colors',
          isSelected && 'bg-accent',
          level > 0 && 'ml-4'
        )}
        onClick={handleClick}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
        </div>

        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        ) : (
          <div className="w-6" />
        )}

        {/* Page Icon */}
        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        {/* Page Title */}
        <span className="flex-1 truncate text-sm">{page.title}</span>
      </div>

      {/* Children */}
      {hasChildren && (
        <Collapsible open={isOpen}>
          <CollapsibleContent>
            <div className="mt-1">
              {page.children!.map((child) => (
                <PageTreeItem
                  key={child.id}
                  page={child}
                  level={level + 1}
                  selectedPageId={selectedPageId}
                  onPageSelect={onPageSelect}
                  onPageMove={onPageMove}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

export function PageTree({
  pages,
  selectedPageId,
  onPageSelect,
  onPageMove,
  className,
}: PageTreeProps) {
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

  const handleDragStart = (pageId: string) => {
    setDraggedPageId(pageId);
  };

  const handleDragOver = (_e: React.DragEvent, _pageId: string) => {
    // Drag over handling for visual feedback can be added here
  };

  const handleDrop = (e: React.DragEvent, targetPageId: string) => {
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (draggedId && draggedId !== targetPageId) {
      // Check if target is a descendant of dragged page
      const isDescendant = (pages: PageWithChildren[], targetId: string, draggedId: string): boolean => {
        for (const page of pages) {
          if (page.id === draggedId) {
            const checkChildren = (children: PageWithChildren[]): boolean => {
              for (const child of children) {
                if (child.id === targetId) return true;
                if (child.children && checkChildren(child.children)) return true;
              }
              return false;
            };
            return page.children ? checkChildren(page.children) : false;
          }
          if (page.children && isDescendant(page.children, targetId, draggedId)) {
            return true;
          }
        }
        return false;
      };

      // Prevent moving a page under itself or its descendants
      if (!isDescendant(pages, targetPageId, draggedId)) {
        onPageMove?.(draggedId, targetPageId);
      }
    }

    setDraggedPageId(null);
  };

  const handleDragEnd = () => {
    setDraggedPageId(null);
  };

  if (!pages || pages.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-sm text-muted-foreground', className)}>
        No pages yet. Create your first page to get started.
      </div>
    );
  }

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="space-y-1 p-2" onDragEnd={handleDragEnd}>
        {pages.map((page) => (
          <PageTreeItem
            key={page.id}
            page={page}
            level={0}
            selectedPageId={selectedPageId}
            onPageSelect={onPageSelect}
            onPageMove={onPageMove}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={draggedPageId === page.id}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
