import { NotebookList } from '../components/notebook';
import { SearchDialog } from '../components/search/SearchDialog';

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
        <div className="flex items-center gap-2">
          <SearchDialog />
          <NotebookList showHeaderOnly />
        </div>
      </div>
      
      <NotebookList />
    </div>
  );
}
