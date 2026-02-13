import React, { createContext, useContext, useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithOAuth: () => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh();
          setUser(pb.authStore.model as unknown as User);
        } catch (error) {
          pb.authStore.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Subscribe to auth changes
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser(model as User | null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loginWithOAuth = async () => {
    try {
      // Authenticate with Authentik OAuth2
      await pb.collection('users').authWithOAuth2({
        provider: 'oidc',
      }).then((authData) => {
        console.log(authData)

        // after the above you can also access the auth data from the authStore
        console.log(pb.authStore.isValid);
        console.log(pb.authStore.token);
        console.log(pb.authStore.record?.id);

      });
      // setUser(authData.record as unknown as User);
    } catch (error) {
      console.error('OAuth login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || false;

  return (
    <AuthContext.Provider value={{ user, loading, loginWithOAuth, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
