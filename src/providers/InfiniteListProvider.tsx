import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchItems } from './DataProvider';

interface InfiniteListContextType {
  items: any[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  resetList: () => void;
}

const InfiniteListContext = createContext<InfiniteListContextType>({
  items: [],
  hasMore: true,
  loading: false,
  loadMore: () => {},
  resetList: () => {},
});

export const InfiniteListProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await fetchItems(page, );
      setItems((prev) => [...prev, ...data]);
      setHasMore(data.length === limit);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  const resetList = () => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  };

  return (
    <InfiniteListContext.Provider
      value={{ items, hasMore, loading, loadMore, resetList }}
    >
      {children}
    </InfiniteListContext.Provider>
  );
};

export const useInfiniteList = () => useContext(InfiniteListContext);