import { createContext, useContext } from 'react';
import type { EventItem, BBox } from './DataProvider';

export interface InfiniteListContextType {
  items: EventItem[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  resetList: () => void;
  reload: (opts?: { bbox?: BBox; dateFrom?: string | null; dateTo?: string | null }) => void;
}

export const InfiniteListContext = createContext<InfiniteListContextType>({
  items: [],
  hasMore: true,
  loading: false,
  loadMore: () => {},
  resetList: () => {},
  reload: () => {},
});

export const useInfiniteList = () => useContext(InfiniteListContext);

