import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type Template } from '@/types/polotno';

export const PolotnoContext = createContext<{
   selectedPolotno: Template | null,
   setSelectedPolotno: React.Dispatch<React.SetStateAction<Template | null>>
} | undefined>(undefined);

interface PolotnoProviderProps {
  children: ReactNode;
}

export const PolotnoProvider: React.FC<PolotnoProviderProps> = ({ children }) => {

  const [ selectedPolotno, setSelectedPolotno ] = useState<Template | null>(null);

  const value = {
    selectedPolotno,
    setSelectedPolotno
  };

  return <PolotnoContext.Provider value={value}>{children}</PolotnoContext.Provider>;
};

export const usePolotnoContext = () => {
  const context = useContext(PolotnoContext);
  if (context === undefined) {
    throw new Error('usePolotnoContext must be used within an AuthProvider');
  }
  return context;
};