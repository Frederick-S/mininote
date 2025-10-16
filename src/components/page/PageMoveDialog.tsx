import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Move, Loader2 } from 'lucide-react';
import { useMovePage, usePagesHierarchy } from '@/hooks/usePages';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { PageData, PageWithChildren } from '@/types/database';

const moveSchema = z.object({
  parent_page_id: z.string().optional(),
});

type MoveFormData = z.infer<typeof moveSchema>;

interface PageMoveDialogProps {
  page: PageData;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function PageMoveDialog({
  page,
  onSuccess,
  trigger,
}: PageMoveDialogProps) {
  const [open, setOpen] = useState(false);
  const movePage = useMovePage();
  const { data: pages } = usePagesHierarchy(page.notebook_id);

  const form = useForm<MoveFormData>({
    resolver: zodResolver(moveSchema),
    defaultValues: {
      parent_page_id: page.parent_page_id || '',
    },
  });

  const handleSubmit = async (data: MoveFormData) => {
    try {
      await movePage.mutateAsync({
        id: page.id,
        parent_page_id: data.parent_page_id || null,
      });

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to move page:', error);
    }
  };

  // Flatten pages for select dropdown, excluding current page and its descendants
  const flattenPages = (
    pages: PageWithChildren[],
    level = 0,
    excludeId?: string
  ): Array<{ id: string; title: string; level: number }> => {
    const result: Array<{ id: string; title: string; level: number }> = [];

    pages.forEach((p) => {
      // Skip the current page and its descendants
      if (p.id === excludeId) {
        return;
      }

      result.push({ id: p.id, title: p.title, level });

      if (p.children && p.children.length > 0) {
        result.push(...flattenPages(p.children, level + 1, excludeId));
      }
    });

    return result;
  };

  // Check if a page is a descendant of the current page
  const isDescendant = (
    pages: PageWithChildren[],
    targetId: string,
    currentId: string
  ): boolean => {
    for (const p of pages) {
      if (p.id === currentId) {
        // Found the current page, check if target is in its descendants
        const checkChildren = (children: PageWithChildren[]): boolean => {
          for (const child of children) {
            if (child.id === targetId) return true;
            if (child.children && checkChildren(child.children)) return true;
          }
          return false;
        };
        return p.children ? checkChildren(p.children) : false;
      }
      if (p.children && isDescendant(p.children, targetId, currentId)) {
        return true;
      }
    }
    return false;
  };

  const flatPages = flattenPages(pages || [], 0, page.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Move className="mr-2 h-4 w-4" />
            Move
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Move Page</DialogTitle>
          <DialogDescription>
            Change the parent page of <strong>{page.title}</strong> to reorganize your notebook structure.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="parent_page_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Parent Page</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
                    value={field.value || '__none__'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent page" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None (Root Level)</SelectItem>
                      {flatPages.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span style={{ paddingLeft: `${p.level * 16}px` }}>
                            {p.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select where you want to move this page. You cannot move a page under itself or its descendants.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={movePage.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={movePage.isPending}>
                {movePage.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Move Page
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
