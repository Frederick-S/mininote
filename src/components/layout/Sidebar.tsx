import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, Menu, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { NotebookTree } from './NotebookTree.js';
import { useNotebooks } from '../../hooks/useNotebooks';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import type { NotebookData } from '../../types/database';

interface SidebarProps {
  className?: string;
  selectedNotebookId?: string;
  selectedPageId?: string;
}

export function Sidebar({ className, selectedNotebookId, selectedPageId }: SidebarProps) {
  const navigate = useNavigate();
  const { data: notebooks, isLoading } = useNotebooks() as { data: NotebookData[] | undefined; isLoading: boolean };
  const { user, signOut } = useAuthStore();

  const handleCreateNotebook = () => {
    navigate('/notebooks/new');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-lg font-semibold">My Notebooks</h2>
        </div>
      </div>

      <Separator />

      {/* Create Notebook Button */}
      <div className="p-4">
        <Button
          onClick={handleCreateNotebook}
          className="w-full"
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Notebook
        </Button>
      </div>

      <Separator />

      {/* Notebooks List */}
      <ScrollArea className="flex-1 px-4">
        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Loading notebooks...
          </div>
        ) : notebooks && notebooks.length > 0 ? (
          <div className="space-y-2 py-4">
            {notebooks.map((notebook) => (
              <NotebookTree
                key={notebook.id}
                notebook={notebook}
                selectedNotebookId={selectedNotebookId}
                selectedPageId={selectedPageId}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <p>No notebooks yet.</p>
            <p className="mt-2">Create your first notebook to get started!</p>
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* User Info & Sign Out */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 truncate text-sm">
            <p className="font-medium truncate">{user?.email}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="ml-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex md:w-64 lg:w-72 border-r bg-background',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
