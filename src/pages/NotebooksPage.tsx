import { NotebookList } from '../components/notebook';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

export function NotebooksPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notebooks</h1>
          <p className="text-muted-foreground mt-1">
            Organize your notes into notebooks
          </p>
        </div>
        <Button onClick={() => navigate('/notebooks/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Notebook
        </Button>
      </div>
      
      <NotebookList />
    </div>
  );
}
