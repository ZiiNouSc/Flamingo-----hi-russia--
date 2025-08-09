import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgency: boolean;
  token: string | null;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    setIsAuthLoading(true);
    if (token) {
      // Récupérer l'utilisateur courant depuis le backend
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.user) setCurrentUser(data.user);
          else setCurrentUser(null);
          setIsAuthLoading(false);
        })
        .catch(() => {
          setCurrentUser(null);
          setIsAuthLoading(false);
        });
    } else {
      setCurrentUser(null);
      setIsAuthLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        // On force la récupération du profil complet après login
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const meData = await meRes.json();
        setCurrentUser(meData.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';
  const isAgency = currentUser?.role === 'agency';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isAgency,
        token,
        isAuthLoading,
      }}
    >
      {isAuthLoading ? <div>Chargement de la session...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};