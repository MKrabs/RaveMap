import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { ThemeToggle } from './ThemeToggle';
import { useInfiniteList } from '../providers/InfiniteListContext';
import type { EventItem } from '../providers/DataProvider';
import { Input } from './ui/input';
import { Button } from './ui/button';
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
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  // Load more when sentinel comes into view
  useEffect(() => {
    if (inView) loadMore();
  }, [inView, loadMore]);

  const toggle = (id: string | number) => setOpenId((p) => (p === id ? null : id));

  const toLocalISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (from: string | null, to: string | null) => {
    setDateFrom(from);
    setDateTo(to);
    reload({ dateFrom: from, dateTo: to });
  };

  const presets = {
    today: () => {
      const now = new Date();
      handleDateChange(toLocalISODate(now), toLocalISODate(now));
    },
    thisWeek: () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const diffToSunday = day === 0 ? 0 : 7 - day;
      const sunday = new Date(now);
      sunday.setDate(now.getDate() + diffToSunday);
      handleDateChange(toLocalISODate(now), toLocalISODate(sunday));
    },
    nextWeekend: () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const daysUntilSat = day === 6 ? 7 : (6 - day + 7) % 7 || 7;
      const sat = new Date(now);
      sat.setDate(now.getDate() + daysUntilSat);
      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);
      handleDateChange(toLocalISODate(sat), toLocalISODate(sun));
    },
  };

  const formatGermanDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const fmt = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(d);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return `${get('day')}.${get('month')}.${get('year')} um ${get('hour')}:${get('minute')} Uhr`;
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
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom ?? ''}
              onChange={(e) => handleDateChange(e.target.value || null, dateTo)}
              className="h-8 text-xs"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <Input
              type="date"
              value={dateTo ?? ''}
              min={dateFrom || undefined}
              onChange={(e) => handleDateChange(dateFrom, e.target.value || null)}
              className="h-8 text-xs"
            />
            {(dateFrom || dateTo) && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer bg-transparent border-none p-0 shrink-0"
                onClick={() => handleDateChange(null, null)}
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={presets.today}>Today</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={presets.thisWeek}>This Week</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={presets.nextWeekend}>Next Weekend</Button>
          </div>
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
                      <div className="text-xs text-muted-foreground">{event.date ? formatGermanDate(event.date) : ''}</div>
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
