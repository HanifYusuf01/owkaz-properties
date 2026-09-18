import { baseApi } from '../../store/baseApi';

interface PublicStats {
  activeListings: number;
  verifiedAgents: number;
  happyClients: number;
}

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicStats: builder.query<PublicStats, void>({
      query: () => '/stats/public',
    }),
  }),
});

export const { useGetPublicStatsQuery } = statsApi;
