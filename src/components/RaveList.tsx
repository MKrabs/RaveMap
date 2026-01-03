import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteList } from '../providers/InfiniteListProvider';
import { List, ListItem, ListItemButton, ListItemContent, ListItemDecorator } from '@mui/joy';
import Home from '@mui/icons-material/Home';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const RaveList = () => {
  const { items, loadMore, hasMore, loading } = useInfiniteList();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) { 
        loadMore();
    }
  }, [inView, loadMore]);

  return (
        <List sx={{ width: '100%', height: '100vh', overflowY: 'auto' }}>
            {items.map((event, index) => (
                <ListItem key={index}>
                    <ListItemButton>
                        <ListItemDecorator>
                            <Home />
                        </ListItemDecorator>
                        <ListItemContent>
                            <div>{event.date}</div>
                            <div>{event.name}</div>
                            <div>{event.description}</div>
                        </ListItemContent>
                        <KeyboardArrowRight />
                    </ListItemButton>
                </ListItem>
            ))}
            <ListItem ref={ref}>
                <ListItemContent ref={ref}>
                    {loading && <p>Loading...</p>}
                    {!hasMore && <p>No more items.</p>}
                </ListItemContent>
            </ListItem>
        </List>
    );
};

export default RaveList;