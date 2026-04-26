import React, { useState, useCallback, useRef } from 'react';
import { fetchItems } from './DataProvider';
import type { EventItem, BBox } from './DataProvider';
import { InfiniteListContext } from './InfiniteListContext';

export const InfiniteListProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const [items, setItems] = useState<EventItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Ref guard to prevent concurrent requests (setState is async)
  const loadingRef = useRef(false);
  const currentBBox = useRef<BBox | undefined>(undefined);
  const currentDateFrom = useRef<string | null>(null);
  const currentDateTo = useRef<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await fetchItems(page, limit, currentBBox.current, currentDateFrom.current, currentDateTo.current);

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

  const reload = useCallback(async (opts?: { bbox?: BBox; dateFrom?: string | null; dateTo?: string | null }) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    if (opts?.bbox !== undefined) currentBBox.current = opts.bbox;
    if (opts?.dateFrom !== undefined) currentDateFrom.current = opts.dateFrom;
    if (opts?.dateTo !== undefined) currentDateTo.current = opts.dateTo;

    setItems([]);
    setPage(1);
    setHasMore(true);

    try {
      const data = await fetchItems(1, limit, currentBBox.current, currentDateFrom.current, currentDateTo.current);
      const seen = new Set<string>();
      const filtered = data.filter((d) => {
        if (!d.id) return true;
        const id = String(d.id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      setItems(filtered);
      setHasMore(data.length === limit);
      setPage(2);
    } catch (err) {
      console.error('Error reloading items:', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [limit]);

  const resetList = () => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  };

  return (
    <InfiniteListContext.Provider
      value={{ items, hasMore, loading, loadMore, resetList, reload }}
    >
      {children}
    </InfiniteListContext.Provider>
  );
};

export { useInfiniteList } from './InfiniteListContext';
