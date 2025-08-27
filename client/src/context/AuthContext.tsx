import React, { createContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { type AuthContextType, type User, type DesignMode } from '@/types/auth';
import { createStore } from 'polotno/model/store';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [designMode, setDesignMode] = useState<DesignMode>('Design');
  const [polotnoMounted, setPolonoMounted] = useState<'mounted' | null | 'loading'>(null);

  const storeRef = useRef<ReturnType<typeof createStore> | null>(null);

  useEffect(()=> {
    if(!storeRef || !storeRef.current) {
      storeRef.current = createStore({ 
        key: import.meta.env.VITE_POLOTNO_KEY,
        showCredit: false, 
      });

    }
    setPolonoMounted('loading');
  }, [])

  const value = {
    user,
    setUser,
    designMode,
    setDesignMode,
    storeRef,
    polotnoMounted,
    setPolonoMounted
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};