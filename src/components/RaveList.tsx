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

  const colors = ['#acf6f0ff', '#f9b5b5ff', '#f8eacbff', '#96c1c7ff', '#bdb6ddff'];

  return (
        <List sx={{ width: '100%', height: '100vh', overflowY: 'auto'}}>
            {items.map((event, index) => (
                <ListItem key={index}>
                    <ListItemButton>
                        {/* Eigentlich brauchen wir kein Haus-Icon vor jedem Listen-Eintrag @marc, wenn du das gut findest gerne das Snippet löschen (auch den Import dann nicht vergessen) */}
                        {/* <ListItemDecorator sx={{ color: colors[index % colors.length] }}>
                            <Home /> 
                        </ListItemDecorator> */}
                        <ListItemContent sx={{ color: colors[index % colors.length], '&:hover': { color: '#000' } }}>
                            <h2>{event.name}</h2>
                            <div>{event.date}</div>
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