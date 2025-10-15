import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useNotebook, useUpdateNotebook } from '../../hooks/useNotebooks';
import type { NotebookData } from '../../types/database';

const notebookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

type NotebookFormData = z.infer<typeof notebookSchema>;

interface NotebookEditorProps {
  notebookId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NotebookEditor({ notebookId, onSuccess, onCancel }: NotebookEditorProps) {
  const navigate = useNavigate();
  const { data: notebook, isLoading, error } = useNotebook(notebookId) as {
    data: NotebookData | null | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  const updateNotebook = useUpdateNotebook();

  const form = useForm<NotebookFormData>({
    resolver: zodResolver(notebookSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Update form when notebook data loads
  useEffect(() => {
    if (notebook) {
      form.reset({
        title: notebook.title,
        description: notebook.description || '',
      });
    }
  }, [notebook, form]);

  const onSubmit = async (data: NotebookFormData) => {
    try {
      const submitData = {
        id: notebookId,
        title: data.title,
        description: data.description || undefined,
      };
      await updateNotebook.mutateAsync(submitData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/notebooks/${notebookId}`);
      }
    } catch (error) {
      console.error('Failed to update notebook:', error);
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to update notebook',
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/notebooks/${notebookId}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading notebook...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !notebook) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Notebook</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Notebook not found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/notebooks')}>
            Back to Notebooks
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <CardTitle>Edit Notebook</CardTitle>
        </div>
        <CardDescription>
          Update your notebook's title and description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Notebook"
                      {...field}
                      disabled={updateNotebook.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Give your notebook a descriptive title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of what this notebook contains..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      disabled={updateNotebook.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Add an optional description to help you remember what this notebook is for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="rounded-md bg-destructive/15 p-3">
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={updateNotebook.isPending}
                className="flex-1"
              >
                {updateNotebook.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updateNotebook.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
