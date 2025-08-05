import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Error refetching user data:', error);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const value = { user, loading, setUser, refetchUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;