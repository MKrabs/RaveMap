import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteList } from '../providers/InfiniteListContext';
import type { EventItem } from '../providers/DataProvider';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from './ui/sidebar';

const RaveList: React.FC = () => {
  const { items, loadMore, hasMore, loading } = useInfiniteList();
  const { ref, inView } = useInView();
  const [openId, setOpenId] = React.useState<string | number | null>(null);

  // Load initial items on mount
  useEffect(() => {
    if (items.length === 0) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When sentinel comes into view, load more
  useEffect(() => {
    if (inView) loadMore();
  }, [inView, loadMore]);

  const toggle = (id: string | number) => setOpenId((p) => (p === id ? null : id));

  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <div className="flex flex-col">
          <span className="font-semibold">RaveMap</span>
          <span className="text-xs text-muted-foreground">Live events</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Events</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((event: EventItem, idx: number) => (
                <SidebarMenuItem key={`${String(event.id ?? 'event')}-${idx}`}>
                  <SidebarMenuButton onClick={() => toggle(event.id ?? idx)}>
                    <div className="flex-1">
                      <div className="font-medium">{event.name ?? 'Untitled event'}</div>
                      <div className="text-xs text-muted-foreground">{event.date ?? ''}</div>
                    </div>
                    <div>{openId === (event.id ?? idx) ? '-' : '+'}</div>
                  </SidebarMenuButton>

                  {openId === (event.id ?? idx) && (
                    <div className="px-3 pb-3 text-sm text-gray-700 dark:text-gray-300">
                      {event.description ?? 'No description'}
                    </div>
                  )}
                </SidebarMenuItem>
              ))}

              <li ref={ref} className="text-center">
                {loading && <div className="text-sm">Loading...</div>}
                {!hasMore && !loading && items.length > 0 && (
                  <div className="text-sm text-muted-foreground">No more items</div>
                )}
              </li>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
};

export default RaveList;
