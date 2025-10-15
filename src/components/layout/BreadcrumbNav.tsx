import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { useNotebook } from '../../hooks/useNotebooks';
import { usePage } from '../../hooks/usePages';
import type { NotebookData, PageData } from '../../types/database';

interface BreadcrumbNavProps {
  notebookId?: string;
  pageId?: string;
}

export function BreadcrumbNav({ notebookId, pageId }: BreadcrumbNavProps) {
  const { data: notebook } = useNotebook(notebookId) as { data: NotebookData | null | undefined };
  const { data: page } = usePage(pageId) as { data: PageData | null | undefined };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {notebook && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {page ? (
                <BreadcrumbLink asChild>
                  <Link to={`/notebooks/${notebook.id}`}>
                    {notebook.title}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{notebook.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {page && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{page.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
