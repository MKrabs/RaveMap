import React, { useState, useCallback, useRef } from 'react';
import { fetchItems } from './DataProvider';
import type { EventItem } from './DataProvider';
import { InfiniteListContext } from './InfiniteListContext';

export const InfiniteListProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const [items, setItems] = useState<EventItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Ref guard to prevent concurrent requests (setState is async)
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await fetchItems(page, limit);

      // Append but avoid duplicates by id when possible
      setItems((prev) => {
        const seen = new Set(prev.map((i) => (i.id !== undefined ? String(i.id) : undefined)));
        const filtered = data.filter((d) => {
          const id = d.id !== undefined ? String(d.id) : undefined;
          if (id === undefined) return true; // can't dedupe items without id
          return !seen.has(id);
        });
        return [...prev, ...filtered];
      });

      setHasMore(data.length === limit);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, page, limit]);

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

export { useInfiniteList } from './InfiniteListContext';
