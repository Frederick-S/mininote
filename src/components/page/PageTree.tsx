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
  onPageMove?: (pageId: string, newParentId: string | null, position?: 'before' | 'after') => void;
  className?: string;
}

interface PageTreeItemProps {
  page: PageWithChildren;
  level: number;
  selectedPageId?: string;
  onPageSelect?: (pageId: string) => void;
  onPageMove?: (pageId: string, newParentId: string | null, position?: 'before' | 'after') => void;
  onDragStart?: (pageId: string) => void;
  onDragOver?: (e: React.DragEvent, pageId: string, position: 'before' | 'after' | 'child') => void;
  onDrop?: (e: React.DragEvent, targetPageId: string, position: 'before' | 'after' | 'child') => void;
  isDragging?: boolean;
  draggedPageId?: string | null;
  dropTarget?: { pageId: string; position: 'before' | 'after' | 'child' } | null;
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
  draggedPageId,
  dropTarget,
}: PageTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = page.children && page.children.length > 0;
  const isSelected = selectedPageId === page.id;
  const isDropTarget = dropTarget?.pageId === page.id;

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
    
    // Don't allow dropping on itself
    if (draggedPageId === page.id) {
      e.dataTransfer.dropEffect = 'none';
      console.log('Blocked drop on self:', page.title);
      return;
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    // Calculate position based on mouse Y position within the element
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'before' | 'after' | 'child';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'child';
    }
    
    // console.log('DragOver on', page.title, position, draggedPageId);
    onDragOver?.(e, page.id, position);
  };

  const handleDrop = (e: React.DragEvent) => {
    console.log('PageTreeItem handleDrop:', page.title);
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate position based on mouse Y position within the element
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'before' | 'after' | 'child';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'child';
    }
    
    // console.log('PageTreeItem handleDrop:', page.title);
    onDrop?.(e, page.id, position);
  };

  return (
    <div
      className={cn(
        'select-none',
        isDragging && 'opacity-50'
      )}
      style={{ paddingLeft: level > 0 ? `${level * 20}px` : '0' }}
    >
      <div className="relative">
        {/* Drop indicator - before */}
        {isDropTarget && dropTarget?.position === 'before' && (
          <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-primary z-10 pointer-events-none">
            <div className="absolute -top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded whitespace-nowrap">
              Drop as sibling (above)
            </div>
          </div>
        )}
        
        <div
          className={cn(
            'group flex items-center justify-start gap-1 py-1 px-2 rounded-md hover:bg-accent cursor-pointer transition-colors relative',
            isSelected && 'bg-accent',
            level > 0 && 'border-l-2 border-muted ml-2',
            isDropTarget && dropTarget?.position === 'child' && 'ring-2 ring-primary bg-primary/10'
          )}
          onClick={handleClick}
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDropTarget && dropTarget?.position === 'child' && (
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full whitespace-nowrap z-10 pointer-events-none">
              Drop as child
            </div>
          )}
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
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
          <div className="h-6 w-6 flex-shrink-0" />
        )}

        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
        </div>

        {/* Page Icon */}
        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        {/* Page Title */}
        <span className="flex-1 truncate text-sm">{page.title}</span>
      </div>
      
      {/* Drop indicator - after */}
      {isDropTarget && dropTarget?.position === 'after' && (
        <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary z-10 pointer-events-none">
          <div className="absolute -top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded whitespace-nowrap">
            Drop as sibling (below)
          </div>
        </div>
      )}
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
                draggedPageId={draggedPageId}
                dropTarget={dropTarget}
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
  const [dropTarget, setDropTarget] = useState<{ pageId: string; position: 'before' | 'after' | 'child' } | null>(null);

  const handleDragStart = (pageId: string) => {
    setDraggedPageId(pageId);
  };

  const handleDragOver = (_e: React.DragEvent, pageId: string, position: 'before' | 'after' | 'child') => {
    setDropTarget({ pageId, position });
  };

  const handleDrop = (e: React.DragEvent, targetPageId: string, position: 'before' | 'after' | 'child') => {
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
        if (position === 'child') {
          // Drop as child - set target as parent
          onPageMove?.(draggedId, targetPageId);
        } else {
          // Drop as sibling - need to find the parent
          // This makes the dragged page a sibling of the target
          // This makes the dragged page a sibling of the target
          const findParent = (pages: PageWithChildren[], targetId: string, parentId: string | null = null): string | null | undefined => {
            for (const page of pages) {
              if (page.id === targetId) return parentId;
              if (page.children) {
                const found = findParent(page.children, targetId, page.id);
                if (found !== undefined) return found;
              }
            }
            return undefined;
          };
          
          const targetParent = findParent(pages, targetPageId);
          
          if (targetParent !== undefined) {
            onPageMove?.(draggedId, targetParent, position);
          } else {
            console.warn('Could not find parent for target page:', targetPageId);
          }
        }
      }
    }

    setDraggedPageId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedPageId(null);
    setDropTarget(null);
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
      <div className="space-y-1 p-1" onDragEnd={handleDragEnd}>
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
            draggedPageId={draggedPageId}
            dropTarget={dropTarget}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
