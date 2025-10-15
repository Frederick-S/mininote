import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import type { NotebookData } from '../../types/database';

interface NotebookDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebook: NotebookData | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function NotebookDeleteDialog({
  open,
  onOpenChange,
  notebook,
  onConfirm,
  isDeleting,
}: NotebookDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Notebook</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{notebook?.title}"? This will permanently delete the
            notebook and all its pages. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
