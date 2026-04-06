import api from './api';
import type { SearchResults } from '@/types';

export const searchApi = {
  search: async (query: string) => {
    const res = await api.get<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
};
