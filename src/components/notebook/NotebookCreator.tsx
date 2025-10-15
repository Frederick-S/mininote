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
import { useCreateNotebook } from '../../hooks/useNotebooks';
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

interface NotebookCreatorProps {
  onSuccess?: (notebookId: string) => void;
  onCancel?: () => void;
}

export function NotebookCreator({ onSuccess, onCancel }: NotebookCreatorProps) {
  const navigate = useNavigate();
  const createNotebook = useCreateNotebook();

  const form = useForm<NotebookFormData>({
    resolver: zodResolver(notebookSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: NotebookFormData) => {
    try {
      const submitData = {
        title: data.title,
        description: data.description || undefined,
      };
      const notebook = await createNotebook.mutateAsync(submitData) as NotebookData;
      
      if (onSuccess) {
        onSuccess(notebook.id);
      } else {
        navigate(`/notebooks/${notebook.id}`);
      }
    } catch (error) {
      console.error('Failed to create notebook:', error);
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to create notebook',
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/notebooks');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <CardTitle>Create New Notebook</CardTitle>
        </div>
        <CardDescription>
          Create a new notebook to organize your notes and pages.
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
                      disabled={createNotebook.isPending}
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
                      disabled={createNotebook.isPending}
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
                disabled={createNotebook.isPending}
                className="flex-1"
              >
                {createNotebook.isPending ? 'Creating...' : 'Create Notebook'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createNotebook.isPending}
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
