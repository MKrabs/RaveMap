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

export const fetchItems = async (page: number, limit = 1, bbox?: BBox): Promise<EventItem[]> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('perPage', String(limit));
  if (bbox) {
    const filter = `latitude>=${bbox.south} && latitude<=${bbox.north} && longitude>=${bbox.west} && longitude<=${bbox.east}`;
    params.set('filter', filter);
  }
  const response = await fetch(`/api/collections/events/records?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as PocketBaseListResponse;
  return data.items;
};
