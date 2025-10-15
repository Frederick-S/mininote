import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BreadcrumbNav } from './BreadcrumbNav';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  notebookId?: string;
  pageId?: string;
  className?: string;
  showBreadcrumb?: boolean;
}

export function AppLayout({
  children,
  notebookId,
  pageId,
  className,
  showBreadcrumb = true,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar selectedNotebookId={notebookId} selectedPageId={pageId} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {showBreadcrumb && (notebookId || pageId) && (
          <div className="border-b bg-background px-6 py-3">
            <BreadcrumbNav notebookId={notebookId} pageId={pageId} />
          </div>
        )}
        
        <div className={cn('flex-1 overflow-auto', className)}>
          {children}
        </div>
      </main>
    </div>
  );
}
