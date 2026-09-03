import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import RepositoryAnalysis from './pages/RepositoryAnalysis';

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (
    <div className="app-container">
      {path === '/analysis' ? <RepositoryAnalysis /> : <Login />}
    </div>
  );
}

export default App;
