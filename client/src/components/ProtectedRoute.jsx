import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { getCurrentAdmin } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        await getCurrentAdmin();
        setStatus('authenticated');
      } catch {
        setStatus('unauthenticated');
      }
    };

    verifyAuthentication();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;