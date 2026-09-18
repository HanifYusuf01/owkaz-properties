import { baseApi } from '../../store/baseApi';

export interface Location {
  id: string;
  name: string;
  imageUrl: string;
  order: number;
  createdAt: string;
  propertyCount: number;
}

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<Location[], void>({
      query: () => '/locations',
      providesTags: ['Location'],
    }),
    createLocation: builder.mutation<Location, Partial<Location>>({
      query: (body) => ({ url: '/locations', method: 'POST', body }),
      invalidatesTags: ['Location'],
    }),
    updateLocation: builder.mutation<Location, { id: string; data: Partial<Location> }>({
      query: ({ id, data }) => ({ url: `/locations/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Location'],
    }),
    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({ url: `/locations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Location'],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} = locationsApi;
