import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2 } from 'lucide-react';
import { useUpdatePage } from '@/hooks/usePages';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { PageData } from '@/types/database';

const pageEditSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  content: z.string(),
});

type PageEditFormData = z.infer<typeof pageEditSchema>;

interface PageEditorProps {
  page: PageData;
  onSuccess?: () => void;
}

export function PageEditor({ page, onSuccess }: PageEditorProps) {
  const updatePage = useUpdatePage();

  const form = useForm<PageEditFormData>({
    resolver: zodResolver(pageEditSchema),
    defaultValues: {
      title: page.title,
      content: page.content,
    },
  });

  // Update form when page changes
  useEffect(() => {
    form.reset({
      title: page.title,
      content: page.content,
    });
  }, [page.id, page.title, page.content, form]);

  const handleSubmit = async (data: PageEditFormData) => {
    try {
      await updatePage.mutateAsync({
        id: page.id,
        title: data.title,
        content: data.content,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Failed to update page:', error);
    }
  };

  const isDirty = form.formState.isDirty;

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter page title"
                    className="text-2xl font-bold"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your content here..."
                    className="min-h-[400px] font-mono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            {isDirty && (
              <span className="text-sm text-muted-foreground self-center">
                Unsaved changes
              </span>
            )}
            <Button
              type="submit"
              disabled={updatePage.isPending || !isDirty}
            >
              {updatePage.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
