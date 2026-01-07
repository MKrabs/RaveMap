import { createContext, useContext } from 'react';
import type { EventItem } from './DataProvider';

export interface InfiniteListContextType {
  items: EventItem[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  resetList: () => void;
}

export const InfiniteListContext = createContext<InfiniteListContextType>({
  items: [],
  hasMore: true,
  loading: false,
  loadMore: () => {},
  resetList: () => {},
});

export const useInfiniteList = () => useContext(InfiniteListContext);

