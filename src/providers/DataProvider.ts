export const fetchItems = async (page: number, limit = 1) => {
  const response = await fetch(`http://localhost:3000/event/list?page=${page}&limit=${limit}`);
  const data = await response.json();
  return data;
};