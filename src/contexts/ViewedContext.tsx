import React, { createContext, useContext, useState, useCallback } from 'react';

interface ViewedContextType {
  viewedPublicationIds: Set<string>;
  markPublicationViewed: (id: string) => void;
}

const ViewedContext = createContext<ViewedContextType>({
  viewedPublicationIds: new Set(),
  markPublicationViewed: () => {},
});

export function ViewedProvider({ children }: { children: React.ReactNode }) {
  const [viewedPublicationIds, setViewedPublicationIds] = useState<Set<string>>(new Set());

  const markPublicationViewed = useCallback((id: string) => {
    setViewedPublicationIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return (
    <ViewedContext.Provider value={{ viewedPublicationIds, markPublicationViewed }}>
      {children}
    </ViewedContext.Provider>
  );
}

export const useViewed = () => useContext(ViewedContext);
