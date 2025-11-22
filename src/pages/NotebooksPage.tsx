import { NotebookList } from '../components/notebook';

export function NotebooksPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Notebooks</h1>
          <p className="text-muted-foreground mt-1">
            Organize your notes into notebooks
          </p>
        </div>
        <NotebookList showHeaderOnly />
      </div>
      
      <NotebookList />
    </div>
  );
}
