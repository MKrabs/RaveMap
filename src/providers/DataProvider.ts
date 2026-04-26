export type EventItem = {
  id: string;
  name: string;
  date: string;
  description: string;
  latitude: number;
  longitude: number;
};

export type BBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

interface PocketBaseListResponse {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: EventItem[];
}

export const fetchItems = async (page: number, limit = 50, bbox?: BBox, dateFrom?: string | null, dateTo?: string | null): Promise<EventItem[]> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('perPage', String(limit));
  const filterParts: string[] = [];
  if (bbox) {
    filterParts.push(`latitude>=${bbox.south} && latitude<=${bbox.north} && longitude>=${bbox.west} && longitude<=${bbox.east}`);
  }
  if (dateFrom) {
    filterParts.push(`date>="${dateFrom}"`);
  }
  if (dateTo) {
    const end = new Date(dateTo);
    end.setDate(end.getDate() + 1);
    const endStr = end.toISOString().split('T')[0];
    filterParts.push(`date<"${endStr}"`);
  }
  if (filterParts.length > 0) {
    params.set('filter', filterParts.join(' && '));
  }
  const response = await fetch(`/api/collections/events/records?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as PocketBaseListResponse;
  return data.items;
};
