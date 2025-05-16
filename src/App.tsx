import React from 'react';
import Map from './components/Map';
import { Sidebar } from './components/Sidebar';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1">
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App; 