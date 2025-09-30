import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { AuthGuard, AuthContainer } from './components';
import { useAuthStore } from './store';

// Configure Amplify
Amplify.configure(outputs);

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleAuthSuccess = () => {
    // This will be called when user successfully logs in
    console.log('User authenticated successfully');
  };

  return (
    <AuthGuard requireAuth={false}>
      {isAuthenticated ? (
        // Authenticated user view
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              Welcome to Web Note App
            </h1>
            <p style={{ margin: 0 }}>Hello, {user?.email}!</p>
            <p style={{ margin: 0 }}>You are successfully authenticated.</p>
            <button 
              onClick={logout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        // Authentication forms
        <AuthContainer onAuthSuccess={handleAuthSuccess} />
      )}
    </AuthGuard>
  );
}

export default App
