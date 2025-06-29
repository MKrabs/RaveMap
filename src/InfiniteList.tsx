import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteList } from './InfiniteListProvider';

const InfiniteList = () => {
  const { items, loadMore, hasMore, loading } = useInfiniteList();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) loadMore();
  }, [inView, loadMore]);

  return (
    <div>
      {items.map((item, idx) => (
        <div key={idx} className="item">
          {item.name}
        </div>
      ))}

      <div ref={ref} />
      {loading && <p>Loading...</p>}
      {!hasMore && <p>No more items.</p>}
    </div>
  );
};

export default InfiniteList;