import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { ThemeToggle } from './ThemeToggle';
import { useInfiniteList } from '../providers/InfiniteListContext';
import type { EventItem } from '../providers/DataProvider';
import { Input } from './ui/input';
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
  const { items, loadMore, hasMore, loading, reload } = useInfiniteList();
  const { ref, inView } = useInView();
  const [openId, setOpenId] = React.useState<string | number | null>(null);
  const [dateValue, setDateValue] = useState<string | null>(null);

  // Load more when sentinel comes into view
  useEffect(() => {
    if (inView) loadMore();
  }, [inView, loadMore]);

  const toggle = (id: string | number) => setOpenId((p) => (p === id ? null : id));

  const handleDateChange = (value: string) => {
    const date = value || null;
    setDateValue(date);
    reload({ dateFilter: date });
  };

  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold">RaveMap</span>
            <span className="text-xs text-muted-foreground">Live events</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="date"
            value={dateValue ?? ''}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-8 text-xs"
          />
          {dateValue && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer bg-transparent border-none p-0 shrink-0"
              onClick={() => handleDateChange('')}
            >
              Clear
            </button>
          )}
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
                    <div className="px-3 pb-3 text-sm text-muted-foreground">
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
