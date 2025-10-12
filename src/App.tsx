function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Web Note App
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A personal note-taking application with hierarchical notebooks and rich markdown editing.
          </p>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Getting Started
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                This is the foundation setup for the Web Note App. The project is now configured with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>React with TypeScript and Vite</li>
                <li>Supabase client library for backend services</li>
                <li>Tailwind CSS for styling</li>
                <li>Organized folder structure for scalable development</li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> Configure your Supabase project credentials in a <code className="bg-blue-100 px-1 rounded">.env</code> file 
                  (see <code className="bg-blue-100 px-1 rounded">.env.example</code> for the template).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
