import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useDeletePage, useChildPages } from '@/hooks/usePages';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface PageDeleteDialogProps {
  pageId: string;
  pageTitle: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PageDeleteDialog({
  pageId,
  pageTitle,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: PageDeleteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const deletePage = useDeletePage();
  const { data: childPages } = useChildPages(pageId);

  const hasChildren = childPages && childPages.length > 0;

  const handleDelete = async () => {
    try {
      await deletePage.mutateAsync(pageId);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Page
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>{pageTitle}</strong>?
            </p>
            {hasChildren && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warning: This page has {childPages.length} child page(s)
                </p>
                <p className="text-sm mt-2">
                  Deleting this page will also delete all of its child pages. This action cannot be undone.
                </p>
                <ul className="mt-2 text-sm list-disc list-inside">
                  {childPages.slice(0, 5).map((child: { id: string; title: string }) => (
                    <li key={child.id}>{child.title}</li>
                  ))}
                  {childPages.length > 5 && (
                    <li>...and {childPages.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
            {!hasChildren && (
              <p className="text-sm">
                This action cannot be undone. The page will be permanently deleted.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePage.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePage.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deletePage.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {hasChildren ? 'Delete Page and Children' : 'Delete Page'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
