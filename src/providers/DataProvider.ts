export type EventItem = {
  id: string;
  name: string;
  date: string;
  description: string;
  latitude: number;
  longitude: number;
};

interface PocketBaseListResponse {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: EventItem[];
}

export const fetchItems = async (page: number, limit = 1): Promise<EventItem[]> => {
  const response = await fetch(`/api/collections/events/records?page=${page}&perPage=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as PocketBaseListResponse;
  return data.items;
};
