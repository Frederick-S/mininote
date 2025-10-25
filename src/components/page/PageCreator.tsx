import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Loader2 } from 'lucide-react';
import { useCreatePage, usePagesHierarchy } from '@/hooks/usePages';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PageWithChildren, PageData } from '@/types/database';

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  parent_page_id: z.string().optional(),
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageCreatorProps {
  notebookId: string;
  defaultParentId?: string;
  onSuccess?: (pageId: string) => void;
  trigger?: React.ReactNode;
}

export function PageCreator({
  notebookId,
  defaultParentId,
  onSuccess,
  trigger,
}: PageCreatorProps) {
  const [open, setOpen] = useState(false);
  const createPage = useCreatePage();
  const { data: pages } = usePagesHierarchy(notebookId);

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      parent_page_id: defaultParentId || '',
    },
  });

  const handleSubmit = async (data: PageFormData) => {
    try {
      const newPage: PageData = await createPage.mutateAsync({
        title: data.title,
        content: '',
        notebook_id: notebookId,
        parent_page_id: data.parent_page_id || undefined,
      });

      form.reset();
      setOpen(false);
      if (newPage?.id) {
        onSuccess?.(newPage.id);
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  // Flatten pages for select dropdown
  const flattenPages = (pages: PageWithChildren[], level = 0): Array<{ id: string; title: string; level: number }> => {
    const result: Array<{ id: string; title: string; level: number }> = [];
    
    pages.forEach(p => {
      result.push({ id: p.id, title: p.title, level });
      if (p.children && p.children.length > 0) {
        result.push(...flattenPages(p.children, level + 1));
      }
    });
    
    return result;
  };

  const flatPages = flattenPages(pages || []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            New Page
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Create a new page. You'll be able to add content using the rich editor after creation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter page title" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_page_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Page (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
                    value={field.value || '__none__'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent page (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None (Root Level)</SelectItem>
                      {flatPages.map((pageOption) => (
                        <SelectItem key={pageOption.id} value={pageOption.id}>
                          <span style={{ paddingLeft: `${pageOption.level * 16}px` }}>
                            {pageOption.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a parent page to create a nested structure
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
                disabled={createPage.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPage.isPending}>
                {createPage.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Page
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
