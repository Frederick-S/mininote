import { useParams, Navigate } from 'react-router-dom';
import { NotebookEditor } from '../components/notebook';

export function NotebookEditPage() {
  const { notebookId } = useParams<{ notebookId: string }>();

  if (!notebookId) {
    return <Navigate to="/notebooks" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <NotebookEditor notebookId={notebookId} />
    </div>
  );
}
