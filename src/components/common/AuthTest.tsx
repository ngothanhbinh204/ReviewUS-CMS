import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthTest: React.FC = () => {
  try {
    const { user, isAuthenticated } = useAuth();
    
    return (
      <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
        <h3 className="font-semibold text-yellow-800">Auth Test Component</h3>
        <p>Is Authenticated: {isAuthenticated ? 'YES' : 'NO'}</p>
        <p>User: {user ? user.displayName : 'None'}</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg border border-red-300">
        <h3 className="font-semibold text-red-800">Auth Test - ERROR</h3>
        <p className="text-red-700">{(error as Error).message}</p>
      </div>
    );
  }
};

export default AuthTest;
